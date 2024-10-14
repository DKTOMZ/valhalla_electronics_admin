import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import Currency from "@/lib/currenciesSchema";
import { CurrenciesType } from "@/models/currencies";
import { UtilService } from "@/services/utilService";
//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');
const utilService = BackendServices.get<UtilService>('UtilService');

export async function GET(req: NextRequest) {
    if(!process.env.NEXT_PUBLIC_COOKIE_NAME){
        throw new Error('Missing NEXT_PUBLIC_COOKIE_NAME property in env file');
    }

    const token = await getToken({ req, cookieName: process.env.NEXT_PUBLIC_COOKIE_NAME });

    if(!token) {
        return new Response(JSON.stringify({error:'Please login to access this service'}),{status:401,headers:{
            'Content-Type':'application/json'
        }})
    }

    return new Response(JSON.stringify({error:'GET Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

/**
* POST Request handler for /api/auth/signup route.
*/
export async function POST(req: NextRequest) {

    if(!process.env.NEXT_PUBLIC_COOKIE_NAME){
        throw new Error('Missing NEXT_PUBLIC_COOKIE_NAME property in env file');
    }

    const token = await getToken({ req, cookieName: process.env.NEXT_PUBLIC_COOKIE_NAME });

    if(!token) {
        return new Response(JSON.stringify({error:'Please login to access this service'}),{status:401,headers:{
            'Content-Type':'application/json'
        }})
    }

    const { _id, shortName ,name, symbol} = await req.json();

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err.message}),{status:503,headers:{
        'Content-Type':'application/json'
    }}))

    if (!_id) {
        return new Response(JSON.stringify({error:'_id key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }
    
    if (!name) {
        return new Response(JSON.stringify({error:'name key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!shortName) {
        return new Response(JSON.stringify({error:'shortName key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!symbol) {
        return new Response(JSON.stringify({error:'symbol key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    const currency = await Currency.findOne<CurrenciesType>({_id:_id})

    if (!currency) { return new Response(JSON.stringify({error:`Currency ${name} no longer exists`}),{status:409,headers:{
        'Content-Type':'application/json'
    }}) }

    else {
        try {
            await Currency.updateOne({_id:_id},{shortName:shortName, symbol:symbol, updated: utilService.getCurrentDateTime()});

            return new Response(JSON.stringify({success:true}),{status:200,headers:{
                'Content-Type':'application/json'
            }});

        } catch (error:any) {
            return new Response(JSON.stringify({error:error.message}),{status:503,headers:{
                'Content-Type':'application/json'
            }});
        }
    }

}
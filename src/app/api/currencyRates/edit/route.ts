import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import CurrencyRates from "@/lib/currencyRatesSchema";
import { CurrencyRateType } from "@/models/currencyRate";
import { CURRENT_DATE_TIME } from "@/utils/currentDateTime";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');

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

    const { _id, from ,to, rate} = await req.json();

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err.message}),{status:503,headers:{
        'Content-Type':'application/json'
    }}))

    if (!_id) {
        return new Response(JSON.stringify({error:'_id key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }
    
    if (!from) {
        return new Response(JSON.stringify({error:'from key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!to) {
        return new Response(JSON.stringify({error:'to key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!rate) {
        return new Response(JSON.stringify({error:'rate key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    const currencyRate = await CurrencyRates.findOne<CurrencyRateType>({_id:_id})

    if (!currencyRate) { return new Response(JSON.stringify({error:`CurrencyRate from ${from} to ${to} no longer exists`}),{status:409,headers:{
        'Content-Type':'application/json'
    }}) }

    else {
        try {
            await CurrencyRates.updateOne({_id:_id},{rate: rate, updated: CURRENT_DATE_TIME()});

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
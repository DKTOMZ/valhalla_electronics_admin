import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Product } from "@/models/products";
import Currency from "@/lib/currenciesSchema";
import { CurrenciesType } from "@/models/currencies";

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
* POST Request handler for /api/products/save route.
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

    const { name, shortName, symbol }:{name: string, shortName: string, symbol: Product} = await req.json();

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err.message}),{status:503,headers:{
        'Content-Type':'application/json'
    }}))

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
    
    try { 

        const existingCurrency = await Currency.findOne<CurrenciesType>({name:name});

        if (existingCurrency) {
            throw new Error('Currency already exists');
        }

        await Currency.create({ name: name, shortName: shortName, symbol: symbol});

        return new Response(JSON.stringify({success:true}),{status:201,headers:{
            'Content-Type':'application/json'
        }});
    } catch (error:any) {
        if (error.message === 'Currency already exists') {
            return new Response(JSON.stringify({error:error.message}), { status: 409, headers: {
                'Content-Type':'application/json'
            }});
        }
        return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
            'Content-Type':'application/json'
        }})
    }
}
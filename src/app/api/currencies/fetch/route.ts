import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import Currency from "@/lib/currenciesSchema";
import { CurrenciesType } from "@/models/currencies";
import mongoose from "mongoose";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');

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

    return new Response(JSON.stringify({error:'POST Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

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

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));

    let objectId: mongoose.Types.ObjectId;

    const id = req.nextUrl.searchParams.get('id');

    if(id){
        try {
            objectId = new mongoose.Types.ObjectId(id);
        } catch (error:any) {
            return new Response(JSON.stringify({'error':'Invalid currency id. Currency does not exist'}),{status:404,headers:{
                'Content-Type':'application/json'
            }});
        }
    
        try {
            const currency = await Currency.find<CurrenciesType>({_id:objectId});
    
            if(currency.length === 0) {
                return new Response(JSON.stringify({'error':'Currency does not exist'}),{status:200,headers:{
                    'Content-Type':'application/json'
                }});
            }
    
            return new Response(JSON.stringify(currency[0]),{status:200,headers:{
                'Content-Type':'application/json'
            }});
        } catch (error:any) {
            return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
                'Content-Type':'application/json'
            }})
        }
    }

    try {
        const currencies = await Currency.find<CurrenciesType>();

        return new Response(JSON.stringify(currencies),{status:200,headers:{
            'Content-Type':'application/json'
        }});
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
            'Content-Type':'application/json'
        }})
    }
}
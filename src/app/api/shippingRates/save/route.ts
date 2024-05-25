import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import ShippingRates from "@/lib/shippingRatesSchema";
import { ShippingRate as ShippingRateType } from "@/models/shippingRate";

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

    const { name, minimumDeliveryDays, maximumDeliveryDays, rate }:{name: string, minimumDeliveryDays: number, maximumDeliveryDays?: number, rate: number} = await req.json();

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err.message}),{status:503,headers:{
        'Content-Type':'application/json'
    }}))

    if (!name) {
        return new Response(JSON.stringify({error:'name key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!minimumDeliveryDays) {
        return new Response(JSON.stringify({error:'minimumDeliveryDays key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (rate == null) {
        return new Response(JSON.stringify({error:'rate key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }
    
    try { 

        const existingShippingRate = await ShippingRates.findOne<ShippingRateType>({name: name});

        if (existingShippingRate) {
            throw new Error('ShippingRate already exists');
        }

        if(maximumDeliveryDays){
            await ShippingRates.create({ name: name, minimumDeliveryDays: minimumDeliveryDays, maximumDeliveryDays: maximumDeliveryDays, rate: rate});
        } else {
            await ShippingRates.create({ name: name, minimumDeliveryDays: minimumDeliveryDays, rate: rate});
        }

        return new Response(JSON.stringify({success:true}),{status:201,headers:{
            'Content-Type':'application/json' 
        }});
    } catch (error:any) {
        if (error.message === 'ShippingRate already exists') {
            return new Response(JSON.stringify({error:error.message}), { status: 409, headers: {
                'Content-Type':'application/json'
            }});
        }
        return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
            'Content-Type':'application/json'
        }})
    }
}
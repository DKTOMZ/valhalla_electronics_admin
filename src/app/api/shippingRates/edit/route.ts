import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import ShippingRates from "@/lib/shippingRatesSchema";
import { ShippingRate as ShippingRateType } from "@/models/shippingRate";
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

    const { _id, name, minimumDeliveryDays, maximumDeliveryDays, rate }:{_id:string, name: string, minimumDeliveryDays: number, maximumDeliveryDays: number, rate: number} = await req.json();

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

    const shippingRate = await ShippingRates.findOne<ShippingRateType>({_id:_id})

    if (!shippingRate) { return new Response(JSON.stringify({error:`ShippingRate no longer exists`}),{status:409,headers:{
        'Content-Type':'application/json'
    }}) }

    else {
        try {

            if(maximumDeliveryDays > 0){
                await ShippingRates.updateOne({_id:_id},{minimumDeliveryDays: minimumDeliveryDays, maximumDeliveryDays: maximumDeliveryDays, rate: rate, updated: CURRENT_DATE_TIME()});
            } else {
                await ShippingRates.updateOne({_id:_id},{minimumDeliveryDays: minimumDeliveryDays, maximumDeliveryDays: null,  rate: rate, updated: CURRENT_DATE_TIME()});
            }

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
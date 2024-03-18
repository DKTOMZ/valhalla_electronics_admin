import {BackendServices} from "@/app/api/inversify.config";
import Product from "@/lib/productSchema";
import { DbConnService } from "@/services/dbConnService";
import { S3 } from "@aws-sdk/client-s3";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

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

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err}),{status:503,headers:{
        'Content-Type':'application/json'
    }})) 

    const body = await req.json();

    const { id, image }: {id:string, image:{Key: string, link: string}} = body;

    if (!body) { return new Response(JSON.stringify({error:'Request data/body is missing'}),{status:400,headers:{
        'Content-Type':'application/json'
    }}) }

    if (!id) { return new Response(JSON.stringify({error:'Id is missing'}),{status:400,headers:{
        'Content-Type':'application/json'
    }}) }

    if (!image) { return new Response(JSON.stringify({error:'Image to delete is missing'}),{status:400,headers:{
        'Content-Type':'application/json'
    }}) }

    const bucketName = process.env.S3_BUCKETNAME;
    const region = process.env.S3_REGION;

    if(!region || !bucketName || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_ACCESS_KEY) { 
        return new Response(JSON.stringify({error:'A credential/property is missing'}),{status:500, headers:{
            'Content-Type':'application/json'
        }})
    }

    const client = new S3({
        region: region,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY ?? '',
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? ''
        }
    });

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));

    try {
        await client.deleteObject({Bucket:bucketName,Key:image.Key});

        await Product.updateOne({_id:id},{$pull: {images: {Key: image.Key}}});

        return new Response(JSON.stringify({success:true}),{status:200,headers:{
            'Content-Type':'application/json'
        }});
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message ?? error}), { status: 503, headers: {
            'Content-Type':'application/json'
        }})
    }

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

    return new Response(JSON.stringify({error:'GET Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}
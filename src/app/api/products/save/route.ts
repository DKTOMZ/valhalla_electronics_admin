import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import Product from "@/lib/productSchema";
import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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

    const formData = await req.formData();

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err.message}),{status:503,headers:{
        'Content-Type':'application/json'
    }}))

    
    if (!formData.has('productName')) {
        return new Response(JSON.stringify({error:'productName key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!formData.has('productBrand')) {
        return new Response(JSON.stringify({error:'productBrand key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!formData.has('productDescription')) {
        return new Response(JSON.stringify({error:'productDescription key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!formData.has('productContents')) {
        return new Response(JSON.stringify({error:'productContents key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!formData.has('productPrice')) {
        return new Response(JSON.stringify({error:'productPrice key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!formData.has('categoryName')) {
        return new Response(JSON.stringify({error:'categoryName key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!formData.has('currentProperties')) {
        return new Response(JSON.stringify({error:'currentProperties key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!formData.has('discount')) {
        return new Response(JSON.stringify({error:'discount key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!formData.has('stock')) {
        return new Response(JSON.stringify({error:'stock key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    const name = formData.get('productName')?.toString();
    const brand = formData.get('productBrand')?.toString();
    const description = formData.get('productDescription')?.toString();
    const contents = formData.get('productContents')?.toString();
    const price = formData.get('productPrice')?.toString();
    const category = formData.get('categoryName')?.toString();
    const properties = JSON.parse(formData.get('currentProperties') as any);
    const discount = formData.get('discount')?.toString();
    const stock = formData.get('stock')?.toString();

    formData.delete('productName');
    formData.delete('productBrand');
    formData.delete('productDescription');
    formData.delete('productContents');
    formData.delete('productPrice');
    formData.delete('categoryName');
    formData.delete('currentProperties');
    formData.delete('discount');
    formData.delete('stock');

    const files: {name:string,body:Buffer}[] = [];

    for (const file of formData.entries()) {
        if (file[1] && (file[1] as File).type && (file[1] as File).type.includes('image')) {
            files.push({ name: (file[1] as File).name, body: Buffer.from(await (file[1] as File).arrayBuffer()) });
        }
    }

    if(files.length === 0) {
        return new Response(JSON.stringify({error:'Please upload at least one image'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }
    
    const bucketName = process.env.S3_BUCKETNAME;
    const region = process.env.S3_REGION;

    if(!region || !bucketName || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_ACCESS_KEY) { 
        return new Response(JSON.stringify({error:'A credential/property is missing'}),{status:500, headers:{
            'Content-Type':'application/json'
        }})
    }

    const client = new S3Client({
        region: region,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
        }
    });

    const imageLinks: { Key: string, link: string }[] = [];

    const saveFilesToS3 = async () => {
        for (const [, file] of files.entries()) {
          const extension = file.name.split('.').pop();
          const newFileName = `${Date.now()}.${extension}`;
            await client.send(
              new PutObjectCommand({
                Bucket: bucketName,
                Key: newFileName,
                ACL: 'public-read',
                Body: file.body,
              })
            );
            imageLinks.push(
                {
                    Key: newFileName,
                    link:`https://${bucketName}.s3.${region}.amazonaws.com/${newFileName}`
                }
            );
        }
    };

    try { 

        const existingProduct = await Product.findOne({name:name});

        if (existingProduct) {
            throw new Error('Product already exists');
        }

        await saveFilesToS3();

        await Product.create({ name, brand, description, contents, price, images:imageLinks, category, properties:properties, discount: discount, stock: stock});

        return new Response(JSON.stringify({success:true}),{status:201,headers:{
            'Content-Type':'application/json'
        }});
    } catch (error:any) {
        if (error.message === 'Product already exists') {
            return new Response(JSON.stringify({error:error.message}), { status: 409, headers: {
                'Content-Type':'application/json'
            }});
        }
        return new Response(JSON.stringify({error:error.message}), { status: 503, headers: {
            'Content-Type':'application/json'
        }})
    }
}
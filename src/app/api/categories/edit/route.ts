import Category from "@/lib/categorySchema";
import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { CategoryProperty, Category as categoryType } from "@/models/categories";
import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

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

    const formData = await req.formData();

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err.message}),{status:503,headers:{
        'Content-Type':'application/json'
    }}))

    if (!formData.has('id')) {
        return new Response(JSON.stringify({error:'id key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }
    
    if (!formData.has('name')) {
        return new Response(JSON.stringify({error:'name key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!formData.has('parentCategory')) {
        return new Response(JSON.stringify({error:'parentCategory key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if (!formData.has('properties')) {
        return new Response(JSON.stringify({error:'properties key is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    const name = formData.get('name')?.toString();
    const parentCategory = JSON.parse(formData.get('parentCategory') as any) as categoryType;
    const properties = JSON.parse(formData.get('properties') as string) as CategoryProperty[];

    formData.delete('id');
    formData.delete('name');
    formData.delete('parentCategory');
    formData.delete('properties');

    const files: {name:string,body:Buffer}[] = [];

    for (const file of formData.entries()) {
        if (file[1] && (file[1] as File).type && (file[1] as File).type.includes('image')) {
            files.push({ name: (file[1] as File).name, body: Buffer.from(await (file[1] as File).arrayBuffer()) });
        }
    }

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
              });
        }
    };

    const category = await Category.findOne<categoryType>({name:name})

    if (!category) { return new Response(JSON.stringify({error:`Category ${name} no longer exists`}),{status:409,headers:{
        'Content-Type':'application/json'
    }}) }

    if(category.images.length === 0 && files.length === 0) {
        return new Response(JSON.stringify({error:'Please upload at least one image. No image is saved'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    else {
        try {
            await saveFilesToS3();

            (files.length > 0 && category.images.length > 0) ? await client.deleteObject({Bucket:bucketName,Key:category.images[0].Key}) : null;

            if (Object.keys(parentCategory).length > 0) {
                await Category.updateOne({name:name},{name:name, parentCategory:parentCategory, properties:properties, images: files.length > 0 ? imageLinks : category.images, updated: new Date() });
            } else {
                await Category.updateOne({name:name},{name:name, parentCategory:{name:''}, properties:properties, images: files.length > 0 ? imageLinks : category.images, updated: new Date()});
            }

            await Category.updateOne({name:category.parentCategory['name']},{$pull: {childCategories: name}, updated: new Date()});

            await Category.updateOne({name:parentCategory ? parentCategory.name : ''},{$push: {childCategories: name}, updated: new Date()});

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
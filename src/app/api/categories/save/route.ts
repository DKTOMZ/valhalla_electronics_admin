import Category from "@/lib/categorySchema";
import { DbConnService } from "@/services/dbConnService";
import {BackendServices} from "@/app/api/inversify.config";
import { CategoryProperty, Category as categoryType } from "@/models/categories";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";
import { StorageService } from "@/services/storageService";


//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');
const storageService = BackendServices.get<StorageService>('StorageService');

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

    let mongooseInstance: mongoose.Connection;

    try {
        mongooseInstance = await dbConnService.mongooseConnect();
    }
    catch(error:any) {
        return    new Response(JSON.stringify({error:error}),{status:503,headers:{
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

    if(formData.get('parentCategory') == 'undefined' || formData.get('parentCategory') == null){
        return new Response(JSON.stringify({error:'parentCategory must have a non-null value'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    if(formData.get('properties') == 'undefined' || formData.get('properties') == null){
        return new Response(JSON.stringify({error:'properties must have a non-null value'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    const name = formData.get('name')?.toString();
    const parentCategory = JSON.parse(formData.get('parentCategory') as any) as categoryType;
    const properties = JSON.parse(formData.get('properties') as string) as CategoryProperty[];

    formData.delete('name');
    formData.delete('parentCategory');
    formData.delete('properties');

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

    const categoryExists = await Category.findOne<categoryType>({name:name})

    if (categoryExists) { return new Response(JSON.stringify({error:'Category already exists'}),{status:409,headers:{
        'Content-Type':'application/json'
    }}) }

    else {

        const session = await mongooseInstance.startSession();

        session.startTransaction();

        try {

            const imageLinks = await storageService.saveFilesToS3(files);

            if (Object.keys(parentCategory).length > 0) {
                await Category.create({
                    name:name,
                    parentCategory,
                    properties: properties,
                    images: imageLinks
                });
            } else {
                await Category.create({
                    name:name,
                    properties: properties,
                    images: imageLinks
                });
            }
            
            await Category.updateOne({name:parentCategory.name},{$push: {childCategories: name}});

            await session.commitTransaction();

            console.log("Commit: Save Category Transaction");

            return new Response(JSON.stringify({success:true}),{status:201,headers:{
                'Content-Type':'application/json'
            }});

        } catch (error:any) {

            await session.abortTransaction();

            console.log("Rollback: Save Category Transaction");

            return new Response(JSON.stringify({error:error.message}),{status:503,headers:{
                'Content-Type':'application/json'
            }});

        } finally {
            session.endSession();
        }
    }
}
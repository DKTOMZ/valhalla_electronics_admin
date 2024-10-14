import {BackendServices} from "@/app/api/inversify.config";
import { DbConnService } from "@/services/dbConnService";
import TokenBlacklist from "@/lib/tokenBlacklistSchema";
import Admin from "@/lib/adminSchema";
import { hash, compare } from "bcryptjs";
import { JWTService } from "@/services/jwtService";
import { TokenBlacklist as tokenBlacklistType } from "@/models/tokenBlacklist";
import { AdminServer } from "@/models/Admin";
import mongoose from "mongoose";
import { UtilService } from "@/services/utilService";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');
const jwtService = BackendServices.get<JWTService>('JWTService');
const utilService = BackendServices.get<UtilService>('UtilService');

export async function GET() {
    return new Response(JSON.stringify({error:'GET Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

/**
* POST Request handler for /api/auth/changepassword route.
*/
export async function POST(request: Request) {

    let mongooseInstance: mongoose.Connection;

    try {
        mongooseInstance = await dbConnService.mongooseConnect();
    }
    catch(error:any) {
        return    new Response(JSON.stringify({error:error}),{status:503,headers:{
            'Content-Type':'application/json'
        }})
    }

    const body = await request.json();

    if (!body) { return new Response(JSON.stringify({error:'Request data/body is missing'}),{status:400,headers:{
        'Content-Type':'application/json'
    }}) }

    const { password, token }: {password:string, token:string} = body;

    if (!password) { return new Response(JSON.stringify({error:'Password is missing'}),{status:400,headers:{
        'Content-Type':'application/json'
    }}) }

    if (!token) { return new Response(JSON.stringify({error:'Token is missing'}),{status:400,headers:{
        'Content-Type':'application/json'
    }}) }

    let adminId;

    const decodedToken = jwtService.decode(token);

    try {
        adminId = await jwtService.verify(token);

        const revokedToken = await TokenBlacklist.findOne<tokenBlacklistType>({tokenJti:decodedToken.jti});

        if (revokedToken) { return new Response(JSON.stringify({error:'Sorry. This link has already been used'})
        ,{status:400,headers:{
            'Content-Type':'application/json'
            }})
        }

    } catch (error: any) {
        if (error.message.includes('Invalid token')) {
            TokenBlacklist.deleteOne({tokenJti:decodedToken.jti})
        }
        return new Response(JSON.stringify({error:'Sorry. This link has expired'}),{status:400,headers:{
            'Content-Type':'application/json'
        }})
    }

    const admin = await Admin.findOne<AdminServer>({_id:adminId})

    if (!admin) { return new Response(JSON.stringify({error:'Admin does not exist anymore'}),{status:409,headers:{
        'Content-Type':'application/json'
    }}) }

    else {
        if (password.length < 6) { return new Response(JSON.stringify({error:'Password should be at least 6 characters long'}),{status:409,headers:{
            'Content-Type':'application/json'
        }}) }
        
        if (password.length > 20) { return new Response(JSON.stringify({error:'Password should be not be more than 20 characters long'}),{status:409,headers:{
            'Content-Type':'application/json'
        }})}

        if(!admin.password){
            return new Response(JSON.stringify({error:'Reset with the auth provider linked with this email'}),{status:400,headers:{
                'Content-Type':'application/json'
            }});
        }

        const isPasswordSame = await compare(password, admin.password);

        if(isPasswordSame){
            return new Response(JSON.stringify({error:'New password cannot be same as current password'}),{status:400,headers:{
                'Content-Type':'application/json'
            }});
        }

        const hashedPasword = await hash(password,12);

        const session = await mongooseInstance.startSession();

        session.startTransaction();

        try {

            await Admin.updateOne({ email:admin.email},{ password: hashedPasword, updated: utilService.getCurrentDateTime()});

            await TokenBlacklist.create({
                tokenJti: decodedToken.jti
            });

            await session.commitTransaction();

            console.log("Commit: Change Password Transaction");

            return new Response(JSON.stringify({success:true}),{status:201,headers:{
                'Content-Type':'application/json'
            }});

        } catch (error:any) {

            await session.abortTransaction();

            console.log("Rollback: Change Password Transaction");

            return new Response(JSON.stringify({error:error.message}),{status:503,headers:{
                'Content-Type':'application/json'
            }});

        } finally {
            session.endSession();
        }
    }
}
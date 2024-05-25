import { DbConnService } from "@/services/dbConnService";
import Admin from "@/lib/adminSchema";
import {BackendServices} from "@/app/api/inversify.config";
import { JWTService } from "@/services/jwtService";
import { AdminServer } from "@/models/Admin";
import { NextRequest } from "next/server";


//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');
const jwtService = BackendServices.get<JWTService>('JWTService');

export async function POST() {
    return new Response(JSON.stringify({error:'POST Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

export async  function GET(req: NextRequest) {

    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
        return new Response(JSON.stringify({error:'Invalid Link'}),{status:404,headers:{
            'Content-Type':'application/json'
        }});
    }

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err.message}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));

    let adminId;

    try {
        adminId = jwtService.verify(token);
    } catch (error) {
        return new Response(JSON.stringify({error:'Sorry. This link has already expired'}),{
            status:403, 
            headers: {'Content-Type':'application/json'}
        });
    }

    try {
        const admin = await Admin.findOne<AdminServer>({_id:adminId});

        if(!admin) {
            return new Response(JSON.stringify({error:"Sorry. Unfortunately this link is invalid."}),{
                status:403,
                headers: {'Content-Type':'application/json'}
            });
        }

        if ( admin && admin.emailVerified) { 
            return new Response(JSON.stringify({error:"Sorry. Unfortunately this link has already been used."}),{
                status:403,
                headers: {'Content-Type':'application/json'}
            });
        }
    
        await Admin.updateOne({ _id: adminId },{ emailVerified: true, updated: new Date()});
        
        return new Response(JSON.stringify({success:true}),{
            status:200,
            headers: {'Content-Type':'application/json'}
        });
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message? error.message : error}),{
            status:503,
            headers: {'Content-Type':'application/json'}
        });
    }
 }
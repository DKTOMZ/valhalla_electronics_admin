import {BackendServices} from "@/app/api/inversify.config";
import { DbConnService } from "@/services/dbConnService";
import TokenBlacklist from "@/lib/tokenBlacklistSchema";
import Admin from "@/lib/adminSchema";
import { hash } from "bcryptjs";
import { JWTService } from "@/services/jwtService";
import { TokenBlacklist as tokenBlacklistType } from "@/models/tokenBlacklist";
import { AdminServer } from "@/models/Admin";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');
const jwtService = BackendServices.get<JWTService>('JWTService');

export async function GET() {
    return new Response(JSON.stringify({error:'GET Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

/**
* POST Request handler for /api/auth/changepassword route.
*/
export async function POST(request: Request) {

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err}),{status:503,headers:{
        'Content-Type':'application/json'
    }}))

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
        adminId = jwtService.verify(token);

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

        const hashedPasword = await hash(password,12);

        try {

            await Admin.updateOne({ email:admin.email},{ password: hashedPasword, updated: new Date()});

            await TokenBlacklist.create({
                tokenJti: decodedToken.jti
            });

            return new Response(JSON.stringify({success:true}),{status:201,headers:{
                'Content-Type':'application/json'
            }});

        } catch (error:any) {

            return new Response(JSON.stringify({error:error.message}),{status:503,headers:{
                'Content-Type':'application/json'
            }});

        }
    }
}
import {BackendServices} from "@/app/api/inversify.config";
import TokenBlacklist from "@/lib/tokenBlacklistSchema";
import { DbConnService } from "@/services/dbConnService";
import { JWTService } from "@/services/jwtService";
import { TokenBlacklist as tokenBlacklistType } from "@/models/tokenBlacklist";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');
const jwtService = BackendServices.get<JWTService>('JWTService');

export async function POST() {
    return new Response(JSON.stringify({error:'POST Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

export async function GET({params}:{params: {token: string}}) {

    const token = params['token'].replace('token=','');

    if (!token) {
        return new Response(JSON.stringify({error:'Request data/body is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }});
    }

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err.message}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));

    const decodedToken = jwtService.decode(token);

    try {
        await jwtService.verify(token);

        const revokedToken = await TokenBlacklist.findOne<tokenBlacklistType>({tokenJti:decodedToken.jti});

        if (revokedToken) { return new Response(JSON.stringify({error:'Sorry. This link has already been used'})
        ,{status:400,headers:{
            'Content-Type':'application/json'
            }})
        }

    } catch (error: any) {
        if (error.message.includes('Invalid token')) {
            TokenBlacklist.deleteOne({tokenJti:decodedToken.jti});
        }
        return new Response(JSON.stringify({error:'Sorry. This link has already expired'}),{
            status:200, 
            headers: {'Content-Type':'application/json'}
        });
    }

        return new Response(JSON.stringify({success:true}),{
            status:200,
            headers: {'Content-Type':'application/json'}
        });

 }
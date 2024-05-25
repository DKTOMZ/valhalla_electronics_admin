import { DbConnService } from "@/services/dbConnService";
import { JWTService } from "@/services/jwtService";
import Admin from "@/lib/adminSchema";
import {BackendServices} from "@/app/api/inversify.config";
import { AdminServer } from "@/models/Admin";
import { JWTPurpose } from "@/models/JWTPurpose";
import { MailService } from "@/services/mailService";
import { GenericUserTemplate } from "@/models/genericUserTemplate";
import { MailTemplates } from "@/models/mailTemplates";
import { NextRequest } from "next/server";

//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');
const jwtService = BackendServices.get<JWTService>('JWTService');
const mailService = BackendServices.get<MailService>('MailService');

export async function POST() {
    return new Response(JSON.stringify({error:'POST Method not supported'}),{status:405,headers:{
        'Content-Type':'application/json'
    }});
}

export async function GET(req: NextRequest) {

    const email = req.nextUrl.searchParams.get('email');

    if (!email) {
        return new Response(JSON.stringify({error:'Email is missing'}),{status:400,headers:{
            'Content-Type':'application/json'
        }});
    }

    await dbConnService.mongooseConnect().catch(err => new Response(JSON.stringify({error:err.message}),{status:503,headers:{
        'Content-Type':'application/json'
    }}));


    try {
        const user = await Admin.findOne<AdminServer>({email: email});
        if (!user) { throw new Error('That email does not seem to exist'); }
        if (!user.password) { throw new Error('Reset with the auth provider linked to this email'); }
        const response = jwtService.generateJWT(user._id.toString(),JWTPurpose.RESET_PASSWORD);
        if (response.error) { throw new Error(response.error); }
        await mailService.sendMail<GenericUserTemplate>({
            to: user.email, 
            subject: 'Valhalla Gadgets - Password Reset for your account',
            template: MailTemplates.PASSWORD_RESET,
            context: {
                userName: user.name,
                verifyLink: response.success
            }
        });

        return new Response(JSON.stringify({success:true}),{status:201,headers:{
                'Content-Type':'application/json'
        }});
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message? error.message : error}),{
            status:503,
            headers: {'Content-Type':'application/json'}
        });
    }
 }
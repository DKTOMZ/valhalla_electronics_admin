import {MongoDBAdapter} from "@next-auth/mongodb-adapter";
import NextAuth, {NextAuthOptions, Session, User} from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import Admin from "@/lib/adminSchema";
import {compare} from "bcryptjs";
import {BackendServices} from "@/app/api/inversify.config";
import {DbConnService} from "@/services/dbConnService";
import {MailService} from "@/services/mailService";
import {AdminClient, AdminServer} from "@/models/Admin";
import {JWTService} from "@/services/jwtService";
import {JWTPurpose} from "@/models/JWTPurpose";


//Services
const dbConnService = BackendServices.get<DbConnService>('DbConnService');
const mailService = BackendServices.get<MailService>('MailService');
const jwtService = BackendServices.get<JWTService>('JWTService');

if(!process.env.NEXT_PUBLIC_COOKIE_NAME){
  throw new Error('Missing NEXT_PUBLIC_COOKIE_NAME property in env file');
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(dbConnService.mongoConnect(),{
    databaseName: 'Valhalla_ecomm',
    collections: {
      Accounts: 'adminAccounts',
      Users: 'admins',
    }
  }),
  cookies: {
    sessionToken: {
      name: process.env.NEXT_PUBLIC_COOKIE_NAME,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  },
  pages: {
    signIn: "/auth/login"
  },
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    jwt: async({token,user}:{token:any, user: User}) => {
      user && (token.user = user)
      return token;
    },
    session: async({session, token}:{session: Session, token:any}) => {
      session.user = token.user;
      return session;
    }
  },
  providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_ID??'',
        clientSecret: process.env.GOOGLE_SECRET??''
    }),
    GithubProvider({
        clientId: process.env.GITHUB_ID??'',
        clientSecret: process.env.GITHUB_SECRET??'',
    }),
    CredentialsProvider({
      credentials: {},
      async authorize(credentials: any): Promise<AdminClient> {
        await dbConnService.mongooseConnect().catch(err => { throw new Error(err); });

        const { email, password }: { email: string; password: string; } = credentials;

        if (!email) { throw new Error('email is not provided'); }

        if (!password) { throw new Error('password is not provided'); }

        const admin = await Admin.findOne<AdminServer>({ email: email });

        if (!admin) { throw new Error('Invalid username or password'); }

        if (!admin.password) { throw new Error('Login with the auth provider linked with this email'); }

        const isPasswordCorrect = await compare(password, admin.password);

        if (!isPasswordCorrect) { throw new Error('Invalid username or password'); }

        if (!admin.emailVerified) {
          try {
            const response = jwtService.generateJWT(admin._id.toString(), JWTPurpose.EMAIL);
            if (response.error) { throw new Error(response.error); }
            await mailService.sendMail({
              to: admin.email, subject: 'Valhalla Gadgets - Email verification for your account', text: '',
              html: `<div>
                    <h1>Verify your email</h1>
                    <p>Hi, ${admin.name}. Please click on the link below to verify your email<p>
                    <a href=${response.success}>
                        <p>Confirm Email</p>
                    </a>
                    <p>Please do not reply to this email as it is unattended.</p>
                    <br/>
                    <p>Warm regards.</p>
                    <br/>
                    <p>Valhalla Gadgets</p>
                </div>`
            });
          } catch (error: any) {
            throw new Error(error);
          }
          throw new Error('Confirmation email sent. Please confirm your email to login');
        }

        return { created: admin.created, updated: admin.updated, id: admin._id, name: admin.name, email: admin.email, image: admin.image };
      }
    })
  ],
}

/**
* POST and GET Request handlers for /api/auth/login route.
*/
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }
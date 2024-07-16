import {FrontendServices} from "@/lib/inversify.config";
import { injectable } from "inversify";
import { LoggerService } from "./LoggerService";
import { JWTPurpose } from "@/models/JWTPurpose";
import { nanoid } from "nanoid";
import {Secret} from "jsonwebtoken";

import jwt from 'jsonwebtoken';

/**
 * Service to handle generation and verification of jwt's
 */
@injectable()
export class JWTService {
    private devLogger: LoggerService;
    private readonly appSecret: Secret
    constructor() {
        this.devLogger = FrontendServices.get<LoggerService>('DevLoggerService');
        if(!process.env.NEXTAUTH_SECRET){
            throw new Error("Missing environment variable 'NEXTAUTH_SECRET'");
        }
        this.appSecret = process.env.NEXTAUTH_SECRET;
    }
    /**Synchronously sign the given payload into a JSON Web Token string payload - Payload to sign, could be an literal, buffer or string secretOrPrivateKey - Either the secret for HMAC algorithms, or the PEM encoded private key for RSA and ECDSA. [options] - Options for the signature returns - The JSON Web Token string*/
    generateJWT = (userId: string, purpose: JWTPurpose) => {
        try {
            const token = jwt.sign({
                    userId: userId,
                    jti: nanoid()
                },
                this.appSecret,
                {
                    expiresIn: '12h'
                },
            );
            const url = `${process.env.NEXT_PUBLIC_VALHALLA_URL}/${purpose===JWTPurpose.EMAIL ? 'pages/confirm' : 'pages/auth'}/${purpose===JWTPurpose.EMAIL ? 'email' : 'changepassword'}/?token=${token}`;
            return {success:url};
        } catch (error: any) {
            this.devLogger.log(error.message??error);
            return error.message ?? error;
        }
    };
    /**Asynchronously verify given token using a secret or a public key to get a decoded token token - JWT string to verify secretOrPublicKey - A string or buffer containing either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA. If jwt.verify is called asynchronous, secretOrPublicKey can be a function that should fetch the secret or public key [options] - Options for the verification callback - Callback to get the decoded token on */
    verify = (token: string) => {

        return new Promise<string>((resolve)=> {
            jwt.verify(token, this.appSecret, (error, decoded) => {
                if (error) {
                    throw new Error(JSON.stringify(error));
                }
                const decodedToken = decoded as { userId: string, jti: string };
                resolve(decodedToken.userId);
            });
        })
    }

    /**Returns the decoded payload without verifying if the signature is valid. token - JWT string to decode [options] - Options for decoding returns - The decoded Token */
    decode = (token: string) => {
        try {
            return jwt.decode(token) as { userId: string, jti: string };
        } catch (error:any) {
            this.devLogger.log(error.message??error);
            throw new Error(error);
        }
    }

}
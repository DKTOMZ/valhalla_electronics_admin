import { SendMailOptions, Transporter, createTransport } from "nodemailer";
import { injectable } from "inversify";
import { LoggerService } from "./LoggerService";
import {FrontendServices} from "@/lib/inversify.config";

/**
 * Service to handle sending of emails
 */
@injectable()
export class MailService {
    
    private transporter: Transporter;
    private devLogger: LoggerService;
    
    constructor() {
        this.transporter = createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NEXT_PUBLIC_VALHALLA_EMAIL,
                pass: process.env.NEXT_PUBLIC_VALHALLA_EMAIL_PASSWORD
            }
        });
        this.devLogger = FrontendServices.get<LoggerService>('DevLoggerService');
    }

/** Inititate mail sending */
sendMail = <T = any>(mailOptions: {
        to: string,
        subject: string,
        template: string,
        context?: T
    }) : Promise<void|any> => {

        const template = require(`../templates/${mailOptions.template}.handlebars`);
        const html = template(mailOptions.context);
        
        const options: SendMailOptions = {
            from: process.env.NEXT_PUBLIC_VALHALLA_EMAIL,
            to: mailOptions.to,
            subject: mailOptions.subject,
            html
        }

        try {
            return this.transporter.sendMail(options);
        } catch (error:any) {
            this.devLogger.log(error.message??error);
            throw error;
        }
    }
}
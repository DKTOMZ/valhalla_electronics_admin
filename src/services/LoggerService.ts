import { injectable } from "inversify";

/**
 * Service to handle console logging for dev environment
 */
@injectable()
export class LoggerService {
    private readonly nodeEnv: string | undefined;
    constructor(){
        this.nodeEnv = process.env.NODE_ENV;
    }
    log(output: any) {
        if(this.nodeEnv === 'DEV') {
            console.log(output);
        }
    }
}
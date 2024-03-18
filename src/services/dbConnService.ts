import {FrontendServices} from "@/lib/inversify.config";
import { injectable } from "inversify";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { DevLoggerService } from "@/services/devLoggerService";

/**
 * Service to handle connection to app database
 */
@injectable()
export class DbConnService {
    private readonly uri: string | undefined;
    private readonly dbName: string | undefined;
    private appName: string | undefined;
    private readonly nodeEnv: string | undefined;
    private mongoClient: MongoClient;
    private devLogger: DevLoggerService;
    constructor() {
        this.uri = process.env.NEXT_PUBLIC_MONGODB_URI;
        this.dbName = process.env.DB_NAME;
        this.nodeEnv = process.env.NODE_ENV;
        if (!this.uri) {
            throw new Error('Invalid/Missing environment variable: "NEXT_PUBLIC_MONGODB_URI"');
        }
        if (!this.dbName) {
            throw new Error('Invalid/Missing environment variable: "DB_NAME"');
        }
        if (!this.nodeEnv) {
            throw new Error('Invalid/Missing environment variable: "NODE_ENV"');
        }
        this.mongoClient = new MongoClient(this.uri,{appName: this.appName});
        this.devLogger = FrontendServices.get<DevLoggerService>('DevLoggerService');
    }

    async mongoConnect(){
        try {
            return await this.mongoClient.connect();
        } catch (error: any) {
            this.devLogger.log(error.message??error);
            throw new Error(`Error connecting to database`);
        }
    }

    async mongooseConnect(){
        if (!this.uri) {
            throw new Error('Invalid/Missing environment variable: "NEXT_PUBLIC_MONGODB_URI"');
        }
        try {
            return (await mongoose.connect(this.uri,{appName: this.appName, dbName: this.dbName})).connection.asPromise();
        } catch (error: any) {
            this.devLogger.log(error.message??error);
            throw new Error(`Error connecting to database`);
        }
    }
}
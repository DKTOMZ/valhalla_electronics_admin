import { FrontendServices } from "@/lib/inversify.config";
import { injectable } from "inversify";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { LoggerService } from "@/services/LoggerService";

/**
 * Service to handle connection to app database
 */
@injectable()
export class DbConnService {
  private readonly uri: string | undefined;
  private readonly dbName: string | undefined;
  private readonly appName: string | undefined;
  private mongoClient: MongoClient;
  private devLogger: LoggerService;
  private static mongoConnection: MongoClient | null = null;
  private static mongooseConnection: mongoose.Connection | null = null;

  constructor() {
    this.uri = process.env.NEXT_PUBLIC_MONGODB_URI;
    this.dbName = process.env.DB_NAME;
    this.appName = process.env.APP_NAME;
    if (!this.uri) {
      throw new Error('Invalid/Missing environment variable: "NEXT_PUBLIC_MONGODB_URI"');
    }
    if (!this.dbName) {
      throw new Error('Invalid/Missing environment variable: "DB_NAME"');
    }
    this.mongoClient = new MongoClient(this.uri, { appName: this.appName });
    this.devLogger = FrontendServices.get<LoggerService>('DevLoggerService');
  }

  async mongoConnect() {
    if (DbConnService.mongoConnection) {
      return DbConnService.mongoConnection;
    }

    try {
      DbConnService.mongoConnection = await this.mongoClient.connect();
      return DbConnService.mongoConnection;
    } catch (error: any) {
      this.devLogger.log(error.message ?? error);
      throw new Error(`Error connecting to MongoDB database`);
    }
  }

  async mongooseConnect() {
    if (DbConnService.mongooseConnection) {
      return DbConnService.mongooseConnection;
    }

    try {
      const mongooseConnection = await mongoose.connect(this.uri!, { appName: this.appName, dbName: this.dbName });
      DbConnService.mongooseConnection = mongooseConnection.connection;
      return DbConnService.mongooseConnection;
    } catch (error: any) {
      this.devLogger.log(error.message ?? error);
      throw new Error(`Error connecting to Mongoose database`);
    }
  }
}

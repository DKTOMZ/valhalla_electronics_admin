import "reflect-metadata";
import { Container } from "inversify";
import { MailService } from "@/services/mailService";
import { DbConnService } from "@/services/dbConnService";
import { JWTService } from "@/services/jwtService";
import { LoggerService } from "@/services/LoggerService";
import { StorageService } from "@/services/storageService";
import { UtilService } from "@/services/utilService";

const BackendServices = new Container();
BackendServices.bind<DbConnService>('DbConnService').to(DbConnService).inSingletonScope();
BackendServices.bind<MailService>('MailService').to(MailService).inSingletonScope();
BackendServices.bind<JWTService>('JWTService').to(JWTService).inSingletonScope();
BackendServices.bind<LoggerService>('DevLoggerService').to(LoggerService).inSingletonScope();
BackendServices.bind<StorageService>('StorageService').to(StorageService).inSingletonScope();
BackendServices.bind<UtilService>('UtilService').to(UtilService).inSingletonScope();

export {BackendServices};
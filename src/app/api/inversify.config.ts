import "reflect-metadata";
import { Container } from "inversify";
import { MailService } from "@/services/mailService";
import { DbConnService } from "@/services/dbConnService";
import { JWTService } from "@/services/jwtService";

const BackendServices = new Container();
BackendServices.bind<DbConnService>('DbConnService').to(DbConnService).inSingletonScope();
BackendServices.bind<MailService>('MailService').to(MailService).inSingletonScope();
BackendServices.bind<JWTService>('JWTService').to(JWTService).inSingletonScope();

export {BackendServices};
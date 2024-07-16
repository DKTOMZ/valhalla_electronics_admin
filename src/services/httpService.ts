import { HttpServiceResponse } from "@/models/httpServiceResponse";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { injectable } from "inversify";
import { LoggerService } from "./LoggerService";
import {FrontendServices} from "@/lib/inversify.config";

/**
 * Service to handle POST and GET http requests
 */
@injectable()
export class HttpService {
    private devLogger: LoggerService;
    constructor() {
        this.devLogger = FrontendServices.get<LoggerService>('DevLoggerService');
    }
    /** Make HTTP GET request */
    get = async<T = any>(url:string, config?: AxiosRequestConfig): Promise<HttpServiceResponse<T>> => {
        try {
            const response: AxiosResponse<T> = await axios.get(url,config);
            return {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                config: response.config
            }
        } catch (error:any) {
            //console.log(error.response);
            return { 
                data: error.response.data,
                status: error.response.status,
                statusText: error.response.statusText,
                headers: error.response.headers,
                config: error.response.config
            };
        }
    }

    /** Make HTTP POST request */
    post = async<T = any>(url:string, data: any, config?: AxiosRequestConfig): Promise<HttpServiceResponse<T>> => {
        try {
            const response: AxiosResponse<T> = await axios.post(url,data,config);
            return {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                config: response.config
            }
        } catch (error:any) {
            //console.log(error.response);
            return {
                data: error.response.data,
                status: error.response.status,
                statusText: error.response.statusText,
                headers: error.response.headers,
                config: error.response.config
            };
        }
    }
}
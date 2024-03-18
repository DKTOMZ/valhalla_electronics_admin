import { AxiosRequestConfig } from "axios";

export interface HttpServiceResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig
}
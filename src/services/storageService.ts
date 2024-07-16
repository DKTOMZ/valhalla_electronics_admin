// noinspection JSUnusedLocalSymbols

import { PutObjectCommand, S3Client, S3 } from "@aws-sdk/client-s3";
import { injectable } from "inversify";

/**
 * Service to handle browser local and session storage
 */
@injectable()
export class StorageService {

    private readonly bucketName: string | undefined;
    private readonly region: string | undefined;
    private readonly S3_ACCESS_KEY: string | undefined;
    private readonly S3_SECRET_ACCESS_KEY: string | undefined;
    private S3Client: S3Client;
    private S3: S3;

    constructor(){
        this.bucketName = process.env.S3_BUCKETNAME;
        this.region = process.env.S3_REGION;
        this.S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
        this.S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
        if(!this.region || !this.bucketName || !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_ACCESS_KEY) { 
            console.log("Verify Amazon S3 credentials in env properties");
        }
        this.S3Client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY??'',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY??''
            }
        });
        this.S3 = new S3({
            region: this.region,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY??'',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY??''
            }
        });
    }
    
    saveFilesToS3 = async (files: {name:string,body:Buffer}[]) => {
        for (const [, file] of files.entries()) {
          const extension = file.name.split('.').pop();
          const newFileName = `${Date.now()}.${extension}`;
            await this.S3Client.send(
              new PutObjectCommand({
                Bucket: this.bucketName,
                Key: newFileName,
                ACL: 'public-read',
                Body: file.body,
              })
            );

            const imageLinks: { Key: string, link: string }[] = [];

            imageLinks.push(
                {
                    Key: newFileName,
                    link:`https://${this.bucketName}.s3.${this.region}.amazonaws.com/${newFileName}`
                }
            );

            return imageLinks;
        }
    };

    deleteS3Item = async ({Key}:{Key: string}) => this.S3.deleteObject({Bucket: this.bucketName, Key});

    deleteS3Items = async({Objects}:{Objects: {Key: string}[]}) => this.S3.deleteObjects({Bucket: this.bucketName, Delete: {Objects}})

}
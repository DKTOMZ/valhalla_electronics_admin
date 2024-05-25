import { emailRegex } from "@/utils/regex";
import { injectable } from "inversify";
import React from "react";

// noinspection JSUnusedGlobalSymbols
/**
 * Service to handle validations
 */
@injectable()
export class ValidationService {

    async validateImage(file: File){
        if(!file['type'].includes('image')) {
            return `Upload failed. ${file['name']} is not an image` ;
        }
        return file;
    }

    async validateImages(files: FileList) {
        for(let i=0; i<files.length; i++) {
            if(!files[i]['type'].includes('image')) {
                return `Upload failed. ${files[i]['name']} is not an image` ;
            }
        }
        return Array.from(files);
    }

    /**
     * Validate email field of a form
     * @required @param email
     * Email string value
     * @required @param emailErrorElement
     * Element to show error for email validation
     */
    validateEmail(email: string,emailErrorElement: React.MutableRefObject<HTMLElement>): boolean {
        if (email.length === 0) {
            emailErrorElement.current.innerHTML = '';
            return false;
        }
        if (!emailRegex.test(email)){
            emailErrorElement.current.innerHTML = 'Invalid email format';
            return false;
        }
        emailErrorElement.current.innerHTML = '';
        return true;
    }

    /**
     * Validate password field of a form
     * @required @param password
     * Password string value
     * @required @param passwordErrorElement
     * Element to show error for email validation
     */
    validatePassword (password: string,passwordErrorElement: React.MutableRefObject<HTMLElement>): boolean {
        if (password.length === 0) { 
            passwordErrorElement.current.innerHTML = '';
            return false;
        }
        if (password.length<6 || password.length>20) {
            passwordErrorElement.current.innerHTML = 'Password must be between 6 and 20 characters';
            return false;
        }
        if (password.includes(' ')) {
            passwordErrorElement.current.innerHTML = 'Password cannot contain spaces';
            return false;
        }
        passwordErrorElement.current.innerHTML = '';
        return true;
    }

    /**
     * Compare password and confirm password fields of a form
     * @required @param password
     * Password string value
     * @required @param passwordErrorElement
     * Element to show error for password validation
     * @required @param confirmPassword
     * confirm Password string value
     * @required @param confirmPasswordErrorElement  
     * Element to show error for confirm password validation
     */
    comparePasswords(password: string,confirmPassword:string,passwordErrorElement:React.MutableRefObject<HTMLElement>,confirmPasswordErrorElement:React.MutableRefObject<HTMLElement>) : boolean {
        if (password.length === 0 || confirmPassword.length === 0) {
            passwordErrorElement.current.innerHTML = '';
            confirmPasswordErrorElement.current.innerHTML = '';
            return false;
        }
        if (confirmPassword.length<6 || confirmPassword.length>20) {
            confirmPasswordErrorElement.current.innerHTML = 'Password must be between 6 and 20 characters';
            return false;
        }
        if (confirmPassword.includes(' ')) {
            confirmPasswordErrorElement.current.innerHTML = 'Password cannot contain spaces';
            return false;
        }
        if (password !== confirmPassword) {
            confirmPasswordErrorElement.current.innerHTML = 'Passwords do not match';
            return false;
        }
        confirmPasswordErrorElement.current.innerHTML = '';
        return true;
    }
}
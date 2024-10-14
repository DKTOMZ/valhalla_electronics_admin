import { injectable } from "inversify";
import React from "react";

// noinspection JSUnusedGlobalSymbols
/**
 * Service to handle code utility operations
 */
@injectable()
export class UtilService {

    constructor(){
        
    }

    /**
     * Format a date time string
     * @required @param dateTimeStr
     * Date time string for formatting
     */
    formatDateTime(dateTimeStr: string): string {
        const date = new Date(dateTimeStr);
    
        // Pad single digit numbers with leading zeros
        const pad = (n: number) => n.toString().padStart(2, '0');
    
        const year = date.getUTCFullYear();
        const month = pad(date.getUTCMonth() + 1);
        const day = pad(date.getUTCDate());
        const hours = pad(date.getUTCHours());
        const minutes = pad(date.getUTCMinutes());
        const seconds = pad(date.getUTCSeconds());
    
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    /** Get regex for validating email address */
    getEmailRegex(): RegExp{
        return new RegExp(/(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i);
    }

    /**Get current datetime string for region where this app will be running */
    getCurrentDateTime(): string{
        return new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString();
    }

    /**show error related to an input field and scroll to the fiels
     * @required @param elementRef
     * Element reference that has an error
     * @required @param content
     * Error message to display
     */
    handleErrorInputField(
        elementRef: React.RefObject<HTMLElement>,
        content: string
      ) {
        if (elementRef.current) {
          // Set the innerHTML
          elementRef.current.innerHTML = content;
      
          // Scroll to the element
          elementRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}
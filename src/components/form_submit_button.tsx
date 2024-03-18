import Loading from "./loading";
import React from "react";

interface ButtonProps {
    text: string,
    disabled: boolean,
    callback?: Function
}

/**
 * Button used to submit a form
 * @param props
 * @param props.text
 * text to display on the button
 * @param props.disabled
 * disabled property of button
 * @param props.callback
 * (optional) Function to run when clicked
 */

export const FormSubmitButton: React.FC<ButtonProps> = ({ text, disabled, callback=null }) => {
    return (
        <button onClick={callback ? ()=>callback() : ()=>{}} type='submit' disabled={disabled} 
        className=' flex items-center justify-center gap-1 md:hover:bg-orange-500 max-md:active:bg-orange-500 rounded-md w-full sm:max-w-sm text-white bg-orange-600 h-9 disabled:bg-gray-500 disabled:hover:bg-gray-500'>{text}{disabled ? <Loading height="h-4" width="w-4" screen={false} /> : null}</button>
    );
};
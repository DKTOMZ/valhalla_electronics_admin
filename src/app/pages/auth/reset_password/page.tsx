'use client';
import LayoutAlt from "@/components/LayoutAlt";
import { FormSubmitButton } from "@/components/form_submit_button";
import Logo from "@/components/logo";
import Modal from "@/components/modal";
import {FrontendServices} from "@/lib/inversify.config";
import { GenericResponse } from "@/models/genericResponse";
import { HttpServiceResponse } from "@/models/httpServiceResponse";
import { HttpService } from "@/services/httpService";
import { ValidationService } from "@/services/validationService";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";

/**
 * Reset password component for user to reset password. 
 */
const ResetPassword = () => {

    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');
    const validationService = FrontendServices.get<ValidationService>('ValidationService');

    //State variables
    const [loadingSubmit,setLoadingSubmit] = useState(false);
    const [resetPasswordSuccess,setResetPasswordSuccess] = useState(false);
    const emailElement = useRef<HTMLInputElement>(null)
    const [email,setEmail] = useState('');

    //Element Refs
    const emailError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;
    const resetError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
        window.location.reload();
        };

        mediaQuery.addEventListener('change',handleChange);

        return () => {
        mediaQuery.removeEventListener('change',handleChange);
        };
    }, []);

    //handle form submission
    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validationService.validateEmail(email,emailError)) { 
            return;
        }

        setLoadingSubmit(true);

        const response: HttpServiceResponse<GenericResponse> = await http.get(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/confirm/resetpassword?email=${email}`);

        if (response.data.success) {
            setResetPasswordSuccess(response.data.success);
        } else {
            resetError.current.innerHTML = response.data.error || response.statusText;
        }

        setLoadingSubmit(false);
   }

    return (
        <LayoutAlt>
            <div className="h-screen flex flex-col items-center justify-center">
                <title>Valhalla - ResetPassword</title>
                <Logo height={120} width={120} />
                { resetPasswordSuccess ? <Modal title={'Success!'} body={'Please check your email for password reset link'} 
                callback={()=>{
                    setResetPasswordSuccess(false);
                    router.replace('/');
                }} />
                : null}
                <h2 className='sm:text-2xl text-lg text-center dark:text-white font-bold block my-10'>Reset password for admin account</h2>
                <form onSubmit={(e)=>handleSubmit(e)} className='space-y-6 sm:w-full sm:max-w-sm w-3/4'>
                    <div className='flex flex-col'>
                        <label htmlFor='reset-password-email' className='sm:text-base text-sm dark:text-white'>Email</label>
                        <input ref={emailElement} onBlur={()=>{
                            resetError.current.innerHTML = '';
                            validationService.validateEmail(email,emailError)
                        }} value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete='email' placeholder='john.doe@example.com' className='px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2' type='email' name='reset-password-email'/>
                        <div ref={emailError} className='text-red-500'></div>
                    </div>
                    <div ref={resetError} className='text-red-500 text-center'></div>
                    <FormSubmitButton text='Reset' disabled={loadingSubmit}/>
                </form>
                <div className='mt-10'>
                    <p className='inline dark:text-white'>Already have an account? </p>
                    <Link replace href={'/pages/auth/login'} className='font-semibold sm:text-base text-sm text-orange-500 md:hover:text-orange-400 max-md:active:text-orange-400'>Signin</Link>
                </div>
            </div>
        </LayoutAlt>
    );
};

export default ResetPassword;
'use client';
import LayoutAlt from '@/components/LayoutAlt';
import { FormSubmitButton } from '@/components/form_submit_button';
import Logo from '@/components/logo';
import Modal from '@/components/modal';
import {FrontendServices} from '@/lib/inversify.config';
import { GenericResponse } from '@/models/genericResponse';
import { HttpServiceResponse } from '@/models/httpServiceResponse';
import { HttpService } from '@/services/httpService';
import { UtilService } from '@/services/utilService';
import { ValidationService } from '@/services/validationService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';

/**
 * Sign up component for user registration.
 */
const SignUp = () => {

    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');
    const validationService = FrontendServices.get<ValidationService>('ValidationService');
    const util = FrontendServices.get<UtilService>('UtilService');

    //State variables
    const [signupEmail,setSignupEmail] = useState('');
    const [signupPassword,setSignupPassword] = useState('');
    const [signupConfirmPassword,setSignupConfirmPassword] = useState('');
    const [passwordVisible,setPasswordVisible] = useState(false);
    const [confirmPasswordVisible,setConfirmPasswordVisible] = useState(false);
    const [signupSuccess,setSignupSuccess] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    //Element refs
    const signupEmailElement = useRef<HTMLInputElement>(null);
    const signupPasswordElement = useRef<HTMLInputElement>(null);
    const signupConfirmPasswordElement = useRef<HTMLInputElement>(null);
    const emailError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;
    const passwordError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;
    const confirmPasswordError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;
    const signupError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;

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

        if (!validationService.validateEmail(signupEmail,emailError) ||
        !validationService.validatePassword(signupPassword,passwordError) ||
        !validationService.comparePasswords(signupPassword,signupConfirmPassword,passwordError,confirmPasswordError)) { 
            return;
        }

        setLoadingSubmit(true);

        const response: HttpServiceResponse<GenericResponse> = await http.post(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/auth/signup`, JSON.stringify({
            email: signupEmail,
            password: signupConfirmPassword 
        }), {headers: {'Content-Type': 'application/json'}});

        if (response.data.success) {
            setSignupSuccess(response.data.success);
        } else {
            util.handleErrorInputField(signupError,response.data.error || response.statusText);
        }

        setLoadingSubmit(false);
  
    }

    return (
        <LayoutAlt>
            <div className="h-screen mb-6 flex flex-col items-center justify-center">
                <title>Valhalla - Signup</title>
                <Logo height={120} width={120} />
                { signupSuccess ? <Modal title={'Success!'} body={'Please check your email for verification then login'} 
                callback={()=>{
                    setSignupSuccess(false);
                    router.replace('/pages/auth/login');
                }} />
                : null}
                <h2 className='sm:text-2xl text-lg dark:text-white font-bold block my-10'>Sign up for an admin account</h2>
                <form onSubmit={(e)=>handleSubmit(e)} className='space-y-6 sm:w-full sm:max-w-sm w-3/4'>
                    <div className='flex flex-col'>
                        <label htmlFor='signup-email' className='sm:text-base text-sm dark:text-white'>Email</label>
                        <input ref={signupEmailElement} onBlur={()=>{
                            signupError.current.innerHTML = '';
                            validationService.validateEmail(signupEmail,emailError)
                        }} value={signupEmail} onChange={(e)=>setSignupEmail(e.target.value)} required autoComplete='email' placeholder='john.doe@example.com' className='px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2' type='email' name='signup-email'/>
                        <div ref={emailError} className='text-red-500'></div>
                    </div>
                    <div className='flex flex-col'>
                        <label htmlFor='signup-password' className='sm:text-base text-sm dark:text-white'>Password</label>
                        <div className='relative'>
                            <input ref={signupPasswordElement} onBlur={()=>{
                                    signupError.current.innerHTML = '';
                                    if (validationService.validatePassword(signupPassword,passwordError)){
                                        validationService.comparePasswords(signupPassword,signupConfirmPassword,passwordError,confirmPasswordError);
                                    }
                                }
                                } value={signupPassword} onChange={(e)=>setSignupPassword(e.target.value)} placeholder='******' required autoComplete='current-password' className='px-2 outline-0 outline-orange-400 dark:bg-neutral-600 dark:text-white w-full rounded-md h-10 ring-1 ring-orange-400 border-0 focus:ring-2' type={passwordVisible ? 'text' : 'password'} name='signup-password'/>
                            { passwordVisible ? 
                                <i onClick={()=>setPasswordVisible(false)} className="cursor-pointer fa-regular fa-eye-slash fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                                : <i onClick={()=>setPasswordVisible(true)} className="cursor-pointer fa-regular fa-eye fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                            }
                        </div>
                        <div ref={passwordError} className='text-red-500 text-center'></div>
                    </div>
                    <div className='flex flex-col'>
                        <label htmlFor='signup-confirm-password' className='sm:text-base text-sm dark:text-white'>Confirm Password</label>
                        <div className='relative'>
                            <input ref={signupConfirmPasswordElement} onBlur={()=>{
                                signupError.current.innerHTML = '';
                                validationService.comparePasswords(signupPassword,signupConfirmPassword,passwordError,confirmPasswordError);
                            }} value={signupConfirmPassword} onChange={(e)=>setSignupConfirmPassword(e.target.value)} placeholder='******' required autoComplete='current-password' className='px-2 outline-0 outline-orange-400 dark:bg-neutral-600 dark:text-white w-full rounded-md h-10 ring-1 ring-orange-400 border-0 focus:ring-2' type={confirmPasswordVisible ? 'text' : 'password'} name='signup-confirm-password'/>
                            { confirmPasswordVisible ? 
                            <i onClick={()=>setConfirmPasswordVisible(false)} className="cursor-pointer fa-regular fa-eye-slash fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                            : <i onClick={()=>setConfirmPasswordVisible(true)} className="cursor-pointer fa-regular fa-eye fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                            }
                        </div>
                        <div ref={confirmPasswordError} className='text-red-500'></div>
                    </div>
                    <div ref={signupError} className='text-red-500 text-center'></div>
                    <FormSubmitButton text='Signup' disabled={loadingSubmit}/>
                </form>
                <div className='mt-10'>
                    <p className='inline dark:text-white'>Already have an account? </p>
                    <Link replace href={'/pages/auth/login'} className='font-semibold sm:text-base text-sm text-orange-500 md:hover:text-orange-400 max-md:active:text-orange-400'>Signin</Link>
                </div>
            </div>
        </LayoutAlt>
    );
};

export default SignUp;
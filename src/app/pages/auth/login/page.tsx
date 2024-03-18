'use client';
import { signIn, useSession } from 'next-auth/react'
import { FormSubmitButton } from '@/components/form_submit_button';
import Logo from '@/components/logo';
import Link from 'next/link';
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import { redirect, useSearchParams } from 'next/navigation';
import {FrontendServices} from '@/lib/inversify.config';
import { ValidationService } from '@/services/validationService';
import LayoutAlt from '@/components/LayoutAlt';
import Image from "next/image";
import Loading from '@/components/loading';

/**
 * Login component for user sign in.
 */
const Login: React.FC = () => {

    //Services
    const validationService = FrontendServices.get<ValidationService>('ValidationService');

    //Incoming params
    const oAuthError = useSearchParams().get('error');

    //State variables
    const [loginEmail,setLoginEmail] = useState('');
    const [loginPassword,setLoginPassword] = useState('');
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [passwordVisible,setPasswordVisible] = useState(false);

    //Element refs
    const loginEmailElement = useRef<HTMLInputElement>(null);
    const LoginPasswordElement = useRef<HTMLInputElement>(null);
    const emailError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;
    const passwordError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;
    const signinError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;

    useEffect(()=>{
        if (oAuthError === 'OAuthAccountNotLinked') {
            signinError.current.innerHTML = 'Your email is already linked with either Github or Google';
        }
    },[oAuthError]);

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

    /**
    * Handle submission of login form.
    */
    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        signinError.current.innerHTML = '';
        if (!validationService.validateEmail(loginEmail,emailError) || !validationService.validatePassword(loginPassword,passwordError)) { 
            return;
        }
        setLoadingSubmit(true);
        const response = await signIn('credentials', {
            email: loginEmail,
            password: loginPassword,
            redirect: false,
        });
        if (response && response.ok) {
            setLoadingSubmit(false);
            if (response.error) {
                signinError.current.innerHTML = response.error;
            } else {
                //router.replace('/pages/home');
            }
        }
    };

    const { data: session , status } = useSession();
    
    if (status === 'loading') {
      return (
        <Loading />
      );
    }

    if (session) {
        redirect('/pages/home');
    }

    return (
        <LayoutAlt>
            <title>Valhalla - Login</title>
            <div className="h-screen flex flex-col items-center justify-center">
                <Logo height={120} width={120}/>
                <h2 className='sm:text-2xl text-lg dark:text-white font-bold block my-10'>Sign in to your admin account</h2>
                <div className='flex sm:flex-row flex-col w-3/4 sm:w-full sm:max-w-sm justify-between mb-2'>
                    <button title='google sign-in' onClick={()=>signIn('google', {
                        callbackUrl: '/'
                    })} className='mb-2 sm:mb-0 dark:bg-neutral-700 md:dark:hover:bg-neutral-600 max-md:dark:active:bg-neutral-600 dark:text-white md:hover:bg-indigo-100 max-md:active:bg-indigo-100 h-full sm:max-h-10 flex flex-row sm:justify-between justify-center items-center rounded-md border-spacing-2 border p-1 border-indigo-500'>
                        <Image className='mr-1' src={'/google.png'} alt='Google' height={30} width={30}/>
                        <p>Google</p>
                    </button>
                    <button title='github sign-in' onClick={()=>signIn('github',{
                        callbackUrl: '/'
                    })} className=' dark:bg-neutral-700 md:dark:hover:bg-neutral-600 max-md:dark:active:bg-neutral-600 dark:text-white md:hover:bg-indigo-100 max-md:active:bg-indigo-100 h-full sm:max-h-10 flex flex-row sm:justify-between justify-center items-center rounded-md border-spacing-2 border p-1 border-indigo-500'>
                        <i className="fa-brands fa-github fa-xl mr-1"></i>
                        <p>Github</p>
                    </button>
                </div>
                <form onSubmit={(e)=>handleSubmit(e)} className='space-y-6 sm:w-full sm:max-w-sm w-3/4'>
                    <div className='flex flex-col'>
                        <label htmlFor='login-email' className='sm:text-base text-sm dark:text-white'>Email</label>
                        <input ref={loginEmailElement} onBlur={()=>{
                            signinError.current.innerHTML = '';
                            validationService.validateEmail(loginEmail,emailError);
                        }} value={loginEmail} onChange={(e)=>setLoginEmail(e.target.value)} required autoComplete='email' placeholder='john.doe@example.com' className='px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2' type='email' name='login-email'/>
                        <div ref={emailError} className='text-red-500'></div>
                    </div>
                    <div className='flex flex-col'>
                        <div className='flex justify-between'>
                            <label htmlFor='login-password' className='sm:text-base text-sm dark:text-white'>Password</label>
                            <Link replace href={'/pages/auth/reset_password'} className='font-semibold sm:text-base text-sm text-orange-500 md:hover:text-orange-400 max-md:active:text-orange-400'>Forgot Password?</Link>
                        </div>
                        <div className='relative'>
                            <input placeholder='******' onBlur={()=>{
                                signinError.current.innerHTML = '';
                                validationService.validatePassword(loginPassword,passwordError);
                            }} ref={LoginPasswordElement} value={loginPassword} onChange={(e)=>setLoginPassword(e.target.value)} required autoComplete='current-password' className='px-2 relative outline-0 outline-orange-400 dark:bg-neutral-600 dark:text-white w-full rounded-md h-10 ring-1 ring-orange-400 border-0 focus:ring-2' type={passwordVisible ? 'text' : 'password'} name='login-password'/>
                            { passwordVisible ? 
                            <i onClick={()=>setPasswordVisible(false)} className="cursor-pointer fa-regular fa-eye-slash fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                            : <i onClick={()=>setPasswordVisible(true)} className="cursor-pointer fa-regular fa-eye fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                            }
                        </div>
                        <div ref={passwordError} className='text-red-500'></div>
                    </div>
                    <div ref={signinError} className='text-red-500 text-center'></div>
                    <FormSubmitButton text='Signin' disabled={loadingSubmit}/>
                </form>
                <div className='mt-10'>
                    <p className='inline dark:text-white'>Not a member? </p>
                    <Link href={'/pages/auth/signup'} className='font-semibold sm:text-base text-sm text-orange-500 md:hover:text-orange-400 max-md:active:text-orange-400'>Sign Up</Link>
                </div>
            </div>
        </LayoutAlt>
    );
};

export default Login;
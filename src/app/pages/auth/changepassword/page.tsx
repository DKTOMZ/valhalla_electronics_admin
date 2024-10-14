'use client'
import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/loading";
import ErrorPage from "@/components/error";
import { FormSubmitButton } from "@/components/form_submit_button";
import Logo from "@/components/logo";
import Modal from "@/components/modal";
import {FrontendServices} from "@/lib/inversify.config";
import { HttpService } from "@/services/httpService";
import { HttpServiceResponse } from "@/models/httpServiceResponse";
import { GenericResponse } from "@/models/genericResponse";
import { ValidationService } from "@/services/validationService";
import { useRouter } from "next/navigation";
import LayoutAlt from "@/components/LayoutAlt";
import { UtilService } from "@/services/utilService";

const ChangePassword: React.FC = () => {
    
  //Services
  const router = useRouter();
  const http = FrontendServices.get<HttpService>('HttpService');
  const util = FrontendServices.get<UtilService>('UtilService');
  const validationService = FrontendServices.get<ValidationService>('ValidationService');

  //token
    const [token,setToken] = useState(useSearchParams().get("token"));

  //Http request handling
  const [loadingSubmit,setLoadingSubmit] = useState(false);
  const [verificationResponse, setverificationResponse] = useState<GenericResponse>();

  //State variables
  const [loading,setLoading] = useState(true);
  const [password,setpassword] = useState('');
  const [confirmPassword,setconfirmPassword] = useState('');
  const [passwordVisible,setPasswordVisible] = useState(false);
  const [confirmPasswordVisible,setConfirmPasswordVisible] = useState(false);
  const [changePasswordSuccess,setchangePasswordSuccess] = useState(false);

  //Element Refs
  const passwordElement = useRef<HTMLInputElement>(null);
  const confirmPasswordElement = useRef<HTMLInputElement>(null);
  const passwordError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;
  const confirmPasswordError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;
  const resetError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;

  //handle verificationResponse fetching
  useEffect(()=>{
    const fetchVerificationResponse = async () => {
      return await http.get(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/confirm/resetpassword/verify?token=${token}`);
    }
    fetchVerificationResponse().then(response => {
          setverificationResponse(response.data);
          setLoading(false);
    });
  },[token]);

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

    if (!validationService.validatePassword(password,passwordError) || !validationService.comparePasswords(password,confirmPassword,passwordError,confirmPasswordError)) { 
        return;
    }

    setLoadingSubmit(true);

    const response: HttpServiceResponse<GenericResponse> = await http.post(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/auth/changepassword`, JSON.stringify({
      password: confirmPassword,
      token: token
    }), {headers: {'Content-Type': 'application/json'}});

    if (response.data.success) {
      setchangePasswordSuccess(response.data.success);
    } else {
      util.handleErrorInputField(resetError,response.data.error || response.statusText);
    }

    setLoadingSubmit(false);
  
  }

  if(!token) {
    return <ErrorPage title="Error: 404" error="Invalid link." />;
  }


  if (loading) {
    return <Loading />
  }

  if (verificationResponse && verificationResponse.success) {
    return <LayoutAlt>
      <div className="h-screen flex flex-col items-center justify-center">
          <title>Valhalla - Change Password</title>
          <Logo />
          { changePasswordSuccess ? <Modal title={'Success!'} body={'Your can now proceed to login with your new password.'} 
              callback={()=>{
                setchangePasswordSuccess(false);
                router.replace('/');
              }} />
          : null}
          <h2 className='sm:text-2xl text-lg dark:text-white font-bold block my-10'>Enter your new password</h2>
          <form onSubmit={(e)=>handleSubmit(e)} className='space-y-6 sm:w-full sm:max-w-sm w-3/4'>
                  <div className='flex flex-col'>
                      <label htmlFor='reset-password' className='sm:text-base text-sm dark:text-white'>Password</label>
                      <div className='relative'>
                          <input ref={passwordElement} onBlur={()=>{
                                  resetError.current ? resetError.current.innerHTML = '' : null;
                                  if (validationService.validatePassword(password,passwordError)){
                                    validationService.comparePasswords(password,confirmPassword,passwordError,confirmPasswordError);
                                  }
                              }
                              } value={password} onChange={(e)=>setpassword(e.target.value)} placeholder='******' required autoComplete='current-password' className='px-2 outline-0 outline-orange-400 dark:bg-neutral-600 dark:text-white w-full rounded-md h-10 ring-1 ring-orange-400 border-0 focus:ring-2' type={passwordVisible ? 'text' : 'password'} name='reset-password'/>
                          { passwordVisible ? 
                              <i onClick={()=>setPasswordVisible(false)} className="cursor-pointer fa-regular fa-eye-slash fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                              : <i onClick={()=>setPasswordVisible(true)} className="cursor-pointer fa-regular fa-eye fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                          }
                      </div>
                      <div ref={passwordError} className='text-red-500 text-center'></div>
                  </div>
                  <div className='flex flex-col'>
                      <label htmlFor='reset-confirm-password' className='sm:text-base text-sm dark:text-white'>Confirm Password</label>
                      <div className='relative'>
                          <input ref={confirmPasswordElement} onBlur={()=>{
                              resetError.current ? resetError.current.innerHTML = '' : null;
                              validationService.comparePasswords(password,confirmPassword,passwordError,confirmPasswordError);
                          }} value={confirmPassword} onChange={(e)=>setconfirmPassword(e.target.value)} placeholder='******' required className='px-2 outline-0 outline-orange-400 dark:bg-neutral-600 dark:text-white w-full rounded-md h-10 ring-1 ring-orange-400 border-0 focus:ring-2' type={confirmPasswordVisible ? 'text' : 'password'} name='reset-confirm-password'/>
                          { confirmPasswordVisible ? 
                          <i onClick={()=>setConfirmPasswordVisible(false)} className="cursor-pointer fa-regular fa-eye-slash fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                          : <i onClick={()=>setConfirmPasswordVisible(true)} className="cursor-pointer fa-regular fa-eye fa-lg absolute bottom-5 right-2 dark:text-white"></i>
                          }
                      </div>
                      <div ref={confirmPasswordError} className='text-red-500'></div>
                  </div>
                  <div ref={resetError} className='text-red-500 text-center'></div>
                  <FormSubmitButton text='Reset Password' disabled={loadingSubmit}/>
              </form>
      </div>
    </LayoutAlt>
  }

  if (verificationResponse && verificationResponse.error) {
    return <ErrorPage title={`Error`} error={verificationResponse.error}/>
  }
 
}

export default ChangePassword;

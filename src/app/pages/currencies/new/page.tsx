'use client'
import Layout from "@/components/Layout";
import Loading from "@/components/loading";
import Modal from "@/components/modal";
import {FrontendServices} from "@/lib/inversify.config";
import { GenericResponse } from "@/models/genericResponse";
import { HttpService } from "@/services/httpService";
import { ValidationService } from "@/services/validationService";
import { useRouter } from "next/navigation";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";

const NewCurrency: React.FC = () => {

    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');
    FrontendServices.get<ValidationService>('ValidationService');
//State variables
    const [currencyName,setCurrencyName] = useState('');
    const [currencySymbol,setCurrencySymbol] = useState('');
    const [saveSuccess,setSaveSuccess] = useState(false);
    const [loadingSave,setLoadingSave] = useState(false);

    //Element refs
    const saveError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;

    useEffect(()=>{
        if(!saveSuccess && loadingSave) { 
            setLoadingSave(false);
            router.push('/pages/currencies'); 
        }
    },[saveSuccess])

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        setLoadingSave(true);
        const response = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currencies/save/`, 
            {
                name: currencyName,
                symbol: currencySymbol
            }
        );
    
        if (response.data.success) {
            setSaveSuccess(true);
        } else {
            saveError.current.innerHTML = response.data.error || response.statusText;
            setLoadingSave(false);
        }

    };

    return (
        <Layout>
            <title>Valhalla - New Currency</title>
            { saveSuccess ? <Modal key={'Save-Currency'} callback={()=>setSaveSuccess(false)} body="Your currency has been saved successfully!" title={'Success!'}/> : null}
            <form onSubmit={(e)=>handleSubmit(e)} className="flex flex-col gap-4">
                <h2 className="text-black dark:text-white text-lg">Add a new currency below</h2>
                <div>
                    <label htmlFor='Currency-Name' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>Name *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''} type="text" required name="Currency-Name" placeholder="Currency Name" value={currencyName}
                    onChange={(e)=>setCurrencyName(e.target.value)}
                    className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>

                <div>
                    <label htmlFor='Currency-Symbol' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>Symbol *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''} type="text" required name="Currency-Symbol" placeholder="Currency Symbol" value={currencySymbol}
                    onChange={(e)=>setCurrencySymbol(e.target.value)}
                    className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>

                <div ref={saveError} className='text-red-500 text-center'></div>
                <button className="bg-orange-600 md:hover:bg-orange-500 max-md:active:bg-orange-500 p-2 rounded-lg text-lg text-white disabled:bg-gray-500 disabled:hover:bg-gray-500"
                type="submit" disabled={loadingSave}>
                    <div className="flex justify-center gap-1">
                        {loadingSave ? 'Creating' : 'Create'}
                        {loadingSave ? <Loading height="h-6" width="w-6" screen={false}/> : null}
                    </div>
                </button>
            </form>
        </Layout>
    );
};

export default NewCurrency;
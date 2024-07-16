'use client'
import Layout from "@/components/Layout";
import Loading from "@/components/loading";
import Modal from "@/components/modal";
import {FrontendServices} from "@/lib/inversify.config";
import { GenericResponse } from "@/models/genericResponse";
import { HttpService } from "@/services/httpService";
import { CURRENT_DATE_TIME } from "@/utils/currentDateTime";
import { useRouter } from "next/navigation";
import React, { FormEvent, MutableRefObject, useEffect, useRef, useState } from "react";

const NewPromocode: React.FC = () => {

    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if needed
    const day = currentDate.getDate().toString().padStart(2, '0'); // Add leading zero if needed
    const hours = currentDate.getHours().toString().padStart(2, '0'); // Add leading zero if needed
    const minutes = currentDate.getMinutes().toString().padStart(2, '0'); // Add leading zero if needed
    
    // Create the formattedDateTime string in the required format (YYYY-MM-DDTHH:MM)
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    

    //State variables
    const [promocode,setPromocode] = useState('');
    const [validUntil,setValidUntil] = useState(formattedDateTime);
    const [discountPercent,setDiscountPercent] = useState<number>(1);
    const [saveSuccess,setSaveSuccess] = useState(false);
    const [loadingSave,setLoadingSave] = useState(false);

    //Element refs
    const saveError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;

    useEffect(()=>{
        if(!saveSuccess && loadingSave) { 
            setLoadingSave(false);
            router.push('/pages/promocodes'); 
        }
    },[saveSuccess])

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoadingSave(true);
        const response = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/promocodes/save/`, 
            {
                code: promocode,
                validUntil: validUntil,
                discountPercent: discountPercent
            }
        );
    
        if (response.data.success) {
            setSaveSuccess(true);
        } else {
            saveError.current.innerHTML = response.data.error || response.statusText;
            setLoadingSave(false);
        }

    };

    const handleInputChange = (event: FormEvent<HTMLInputElement>) => {
        const value =  parseInt(event.currentTarget.value, 10);

        if(value >= 1 && value <= 100) {
            event.currentTarget.valueAsNumber = value;
        } else if(isNaN(value)){
            event.currentTarget.valueAsNumber = 1;
        } else {
            event.currentTarget.valueAsNumber = discountPercent;
        }
    }

    return (
        <Layout>
            <title>Valhalla - New Promocode</title>
            { saveSuccess ? <Modal key={'Save-Promocode'} callback={()=>setSaveSuccess(false)} body="Your promocode has been saved successfully!" title={'Success!'}/> : null}
            <form onSubmit={(e)=>handleSubmit(e)} className="flex flex-col gap-4">
                <h2 className="text-black dark:text-white text-lg">Add a new promocode below</h2>
                <div>
                    <label htmlFor='Promocode' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>Code *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''} type="text" required name="Promocode" placeholder="Promocode" value={promocode}
                    onChange={(e)=>setPromocode(e.target.value)}
                    className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>

                <div>
                    <label htmlFor='validUntil' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>ValidUntil *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''} onClick={(e)=>e.currentTarget.showPicker()} value={validUntil} type="datetime-local" required name="validUntil"
                    onChange={(e)=>setValidUntil(e.target.value)}
                    className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>

                <div>
                    <label htmlFor='discountPercent' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>Discount (%) *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''} type="number" min={1} max={100} required name="discountPercent" placeholder="discountPercent"
                    onInput={(e)=>handleInputChange(e)}
                    onChange={(e)=>setDiscountPercent(e.target.valueAsNumber)}
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

export default NewPromocode;
'use client'
import Layout from "@/components/Layout";
import Loading from "@/components/loading";
import Modal from "@/components/modal";
import {FrontendServices} from "@/lib/inversify.config";
import { GenericResponse } from "@/models/genericResponse";
import { HttpService } from "@/services/httpService";
import { ValidationService } from "@/services/validationService";
import { useRouter } from "next/navigation";
import React, { FormEvent, MutableRefObject, useEffect, useRef, useState } from "react";

const NewShippingRate: React.FC = () => {

    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');
    FrontendServices.get<ValidationService>('ValidationService');
    
    //State variables
    const [name,setName] = useState('');
    const [minimumDeliveryDays,setMinimumDeliveryDays] = useState(1);
    const [maximumDeliveryDays,setMaximumDeliveryDays] = useState(minimumDeliveryDays);
    const [shippingRate,setShippingRate] = useState(0);
    const [saveSuccess,setSaveSuccess] = useState(false);
    const [loadingSave,setLoadingSave] = useState(false);
    const [includeMaxDays, setIncludeMaxDays] = useState(false);

    //Element refs
    const saveError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;

    useEffect(()=>{
        if(!saveSuccess && loadingSave) { 
            setLoadingSave(false);
            router.push('/pages/shippingRates'); 
        }
    },[loadingSave, router, saveSuccess])

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoadingSave(true);
        const data: {
            name: string
            minimumDeliveryDays: number,
            maximumDeliveryDays?: number,
            rate: number
        } = {
            name: name,
            minimumDeliveryDays: minimumDeliveryDays,
            rate: shippingRate
        };

        if(includeMaxDays){
            data.maximumDeliveryDays = maximumDeliveryDays;
        }

        const response = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/shippingRates/save/`, 
            data
        );
    
        if (response.data.success) {
            setSaveSuccess(true);
        } else {
            saveError.current.innerHTML = response.data.error || response.statusText;
            setLoadingSave(false);
        }

    };

    const handleInputChange = (event: FormEvent<HTMLInputElement>) => {
        const value =  parseFloat(event.currentTarget.value);

        if(value >= 1 && value <= 100) {
            event.currentTarget.valueAsNumber = value;
        } else if(isNaN(value)){
            event.currentTarget.valueAsNumber = 0;
        } else {
            event.currentTarget.valueAsNumber = shippingRate;
        }
    }

    return (
        <Layout>
            <title>Valhalla - New ShippingRate</title>
            { saveSuccess ? <Modal key={'Save-ShippingRate'} callback={()=>setSaveSuccess(false)} body="Your shippingRate has been saved successfully!" title={'Success!'}/> : null}
            <form onSubmit={(e)=>handleSubmit(e)} className="flex flex-col gap-4">
                <h2 className="text-black dark:text-white text-lg">Add a new shippingRate below</h2>

                <div>
                    <label htmlFor='Name' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>Name *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''} type="text" required name="Name" placeholder="Name" value={name}
                    onChange={(e)=>setName(e.target.value)}
                    className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>

                <div>
                    <label htmlFor='Min-Days' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>Minimum Delivery Days *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''} type="number" required min={1} max={10} name="Min-Days" placeholder="Min Days" value={minimumDeliveryDays}
                    onChange={(e)=>{
                        if(maximumDeliveryDays <= minimumDeliveryDays){
                            setMaximumDeliveryDays(e.target.valueAsNumber);
                        }
                        setMinimumDeliveryDays(e.target.valueAsNumber)
                    }}
                    className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>

                <label>
                    <input type="checkbox" onChange={()=>setIncludeMaxDays(!includeMaxDays)} checked={includeMaxDays} />
                    <p className="text-black dark:text-white inline ml-2 text-sm">Include Maximum Day to create a range</p>
                </label>  

                {includeMaxDays ?
                    <div>
                        <label htmlFor='Max-Days' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>Maximum Delivery Days <span className="text-xs">optional</span></label>
                        <input onBlur={()=>saveError.current.innerHTML = ''} type="number" min={minimumDeliveryDays} max={10} name="Max-Days" placeholder="Max Days" value={maximumDeliveryDays}
                        onChange={(e)=>setMaximumDeliveryDays(e.target.valueAsNumber)}
                        className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                    </div>
                : null}

                <div>
                    <label htmlFor='Shipping-Rate' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>Rate (%) *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''} type="number" min={0} max={100} required name="Shipping-Rate" placeholder="Shipping Rate" value={shippingRate}
                    onInput={(e)=>handleInputChange(e)}
                    onChange={(e)=>setShippingRate(e.target.valueAsNumber)}
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

export default NewShippingRate;
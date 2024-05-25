'use client'
import Layout from "@/components/Layout";
import Loading from "@/components/loading";
import Modal from "@/components/modal";
import {FrontendServices} from "@/lib/inversify.config";
import { CurrenciesType } from "@/models/currencies";
import { GenericResponse } from "@/models/genericResponse";
import { HttpService } from "@/services/httpService";
import { ValidationService } from "@/services/validationService";
import { useRouter } from "next/navigation";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";

const NewCurrencyRate: React.FC = () => {

    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');
    FrontendServices.get<ValidationService>('ValidationService');
//State variables
    const [currencyFrom,setCurrencyFrom] = useState('Select Currency');
    const [currencyTo,setCurrencyTo] = useState('Select Currency');
    const [currencyRate,setCurrencyRate] = useState(0);
    const [currencies, setCurrencies] = useState<CurrenciesType[]>([]);
    const [currenciesFrom, setCurrenciesFrom] = useState<CurrenciesType[]>([]);
    const [currenciesTo, setCurrenciesTo] = useState<CurrenciesType[]>([]);
    const [saveSuccess,setSaveSuccess] = useState(false);
    const [loading,setLoading] = useState(true);
    const [loadingSave,setLoadingSave] = useState(false);
    const [currenciesExist,setCurrenciesExist] = useState(true);

    //Element refs
    const saveError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;

    useEffect(()=>{
        if(!saveSuccess && loadingSave) { 
            setLoadingSave(false);
            router.push('/pages/currencyRates'); 
        }
    },[loadingSave, router, saveSuccess])

    useEffect(()=>{ 
        const fetchData = async() => {
            return await http.get<CurrenciesType[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currencies/fetch`);
        };
        loading && fetchData().then(response => {
            if (response.status >= 200 && response.status<=299 && response.data) {
                setCurrenciesFrom(response.data);
                setCurrenciesTo(response.data);
                setCurrencies(response.data);
            }

            if(response.data.length == 0){
                setCurrenciesExist(false);
            }
            setLoading(false);
        }); 
    },[ http, loading]);

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(currencyFrom == 'Select Currency'){
            saveError.current.innerHTML = 'Please select a from currency';
            return;
        }
        if(currencyTo == 'Select Currency'){
            saveError.current.innerHTML = 'Please select a to currency';
            return;
        }
        setLoadingSave(true);
        const response = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currencyRates/save/`, 
            {
                from: currencyFrom,
                to: currencyTo,
                rate: currencyRate
            }
        );
    
        if (response.data.success) {
            setSaveSuccess(true);
        } else {
            saveError.current.innerHTML = response.data.error || response.statusText;
            setLoadingSave(false);
        }

    };

    if(loading) {
        return <Loading />
    }

    if(!currenciesExist) {
        return <Layout>
            <title>Valhalla - New CurrencyRate</title>
            <h2 className="text-black dark:text-white text-lg">Add a currency first in order to add a currencyRate</h2>
        </Layout>
    }

    return (
        <Layout>
            <title>Valhalla - New CurrencyRate</title>
            { saveSuccess ? <Modal key={'Save-CurrencyRate'} callback={()=>setSaveSuccess(false)} body="Your currencyRate has been saved successfully!" title={'Success!'}/> : null}
            <form onSubmit={(e)=>handleSubmit(e)} className="flex flex-col gap-4">
                <h2 className="text-black dark:text-white text-lg">Add a new currencyRate below</h2>

                <div>
                    <label htmlFor='CurrencyRate-From' className='block sm:text-base font-bold text-sm dark:text-white'>From currency *</label>
                    <select value={currencyFrom} onChange={(e)=>{
                        setCurrenciesTo(currencies.filter((currency)=>currency.shortName!=e.target.value))
                        setCurrencyFrom(e.target.value)
                        }} name="CurrencyRate-From" className="p-2 ring-0 outline-none rounded-lg text-black dark:text-white bg-gray-100 dark:bg-neutral-600">
                        <option value={'Select Currency'}>{'Select Currency'}</option>
                        {currenciesFrom.length > 0 ? currenciesFrom.map((currency,index)=>{
                            return <option key={currency._id+index} value={currency.shortName}>{currency.shortName}</option>
                        }) : null}
                    </select>
                </div>

                <div>
                    <label htmlFor='CurrencyRate-To' className='block sm:text-base font-bold text-sm dark:text-white'>To Currency *</label>
                    <select value={currencyTo} onChange={(e)=>{
                        setCurrenciesFrom(currencies.filter((currency)=>currency.shortName!=e.target.value))
                        setCurrencyTo(e.target.value)
                        }} name="CurrencyRate-To" className="p-2 ring-0 outline-none rounded-lg text-black dark:text-white bg-gray-100 dark:bg-neutral-600">
                        <option value={'Select Currency'}>{'Select Currency'}</option>
                        {currenciesTo.length > 0 ? currenciesTo.map((currency,index)=>{
                            return <option key={currency._id+index} value={currency.shortName}>{currency.shortName}</option>
                        }) : null}
                    </select>
                </div>

                <div>
                    <label htmlFor='Currency-Rate' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>Rate *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''} type="number" required name="Currency-Rate" placeholder="Currency Rate" value={currencyRate}
                    onChange={(e)=>setCurrencyRate(e.target.valueAsNumber||0)}
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

export default NewCurrencyRate;
'use client'
import Layout from "@/components/Layout";
import ErrorPage from "@/components/error";
import Loading from "@/components/loading";
import Modal from "@/components/modal";
import {FrontendServices} from "@/lib/inversify.config";
import { CurrenciesType } from "@/models/currencies";
import { CurrencyRateType } from "@/models/currencyRate";
import { GenericResponse } from "@/models/genericResponse";
import { HttpService } from "@/services/httpService";
import { UtilService } from "@/services/utilService";
import { ValidationService } from "@/services/validationService";
import { useRouter, useSearchParams } from "next/navigation";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";

const EditCurrencyRate: React.FC = () => {
    
    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');
    FrontendServices.get<ValidationService>('ValidationService');
    const util = FrontendServices.get<UtilService>('UtilService');
//State variables
    const [currencyFrom,setCurrencyFrom] = useState('');
    const [currencyTo,setCurrencyTo] = useState('');
    const [currencyRate,setCurrencyRate] = useState(0);
    const [currencies, setCurrencies] = useState<CurrenciesType[]>([]);
    const [currenciesFrom, setCurrenciesFrom] = useState<CurrenciesType[]>([]);
    const [currenciesTo, setCurrenciesTo] = useState<CurrenciesType[]>([]);
    const [saveSuccess,setSaveSuccess] = useState(false);
    const [loadingSave,setLoadingSave] = useState(false);
    const [loading,setLoading] = useState(true);
    const [currencyRateId] = useState(useSearchParams().get('id'));
    const [currencyRateExists,setCurrencyRateExists] = useState(true);
    const [currenciesExist,setCurrenciesExist] = useState(true);

    //Element refs
    const saveError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;

    useEffect(()=>{
        if(!saveSuccess && loadingSave) { 
            setLoadingSave(false);
            router.push('/pages/currencyRates'); 
        }
    },[saveSuccess])

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
    },[]);

    useEffect(()=>{ 
        const fetchData = async() => {
            return await http.get<CurrencyRateType>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currencyRates/fetch?id=${currencyRateId}`);
        };
        loading && fetchData().then(response => {
            if (response.status >= 200 && response.status<=299 && response.data) {
                setCurrencyFrom(response.data.from);
                setCurrencyTo(response.data.to);
                setCurrencyRate(response.data.rate);
            }

            if(!response){
                setCurrencyRateExists(false);
            }
            setLoading(false);
        }); 
    },[http, loading, currencyRateId]);

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        setLoadingSave(true);
        const response = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currencyRates/edit/`, 
            {
                _id: currencyRateId,
                from: currencyFrom,
                to: currencyTo,
                rate: currencyRate
            }
        );
    
        if (response.data.success) {
            setSaveSuccess(true);
        } else {
            util.handleErrorInputField(saveError,response.data.error||response.statusText);
            setLoadingSave(false);
        }

    };

    if(!currencyRateId || !currencyRateExists) {
        return <ErrorPage title="Error: 404" error="Missing currencyRate Id. This currencyRate may not exist anymore." />;
    }

    if(!currenciesExist) {
        return <Layout>
            <title>Valhalla - New CurrencyRate</title>
            <h2 className="text-black dark:text-white text-lg">Add a currency first in order to add a currencyRate</h2>
        </Layout>
    }

    if (loading) { return <div>
        <title>Valhalla - Edit CurrencyRate</title>
        <Layout><Loading screen={false} /></Layout>
    </div>
    }

    return (
        <Layout>
            <title>Valhalla - Edit Currency</title>
            { saveSuccess ? <Modal key={'Save-CurrencyRate'} callback={()=>{
                setSaveSuccess(false);
            }} body="Your currencyRate has been saved successfully!" title={'Success!'}/> : null}
            <form onSubmit={(e)=>handleSubmit(e)} className="flex flex-col gap-4 xl:w-2/3 2xl:w-1/2 w-full mx-auto">
                <h2 className="text-black dark:text-white text-lg">Edit currencyRate below</h2>
                <div>
                    <label htmlFor='CurrencyRate-From' className='block sm:text-base font-bold text-sm dark:text-white'>From currency *</label>
                    <input type="text" readOnly value={currencyFrom} onBlur={()=>saveError.current.innerHTML = ''}
                    className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                    {/* <select value={currencyFrom} onChange={(e)=>{
                        setCurrenciesTo(currencies.filter((currency)=>currency.shortName!=e.target.value))
                        setCurrencyFrom(e.target.value)
                        }} name="CurrencyRate-From" className="p-2 ring-0 outline-none rounded-lg text-black dark:text-white bg-gray-100 dark:bg-neutral-600">
                        <option value={'Select Currency'}>{'Select Currency'}</option>
                        {currenciesFrom.length > 0 ? currenciesFrom.map((currency,index)=>{
                            return <option key={currency._id+index} value={currency.shortName}>{currency.shortName}</option>
                        }) : null}
                    </select> */}
                </div>

                <div>
                    <label htmlFor='CurrencyRate-To' className='block sm:text-base font-bold text-sm dark:text-white'>To Currency *</label>
                    <input type="text" readOnly value={currencyTo} onBlur={()=>saveError.current.innerHTML = ''}
                    className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                    {/* <select value={currencyTo} onChange={(e)=>{
                        setCurrenciesFrom(currencies.filter((currency)=>currency.shortName!=e.target.value))
                        setCurrencyTo(e.target.value)
                        }} name="CurrencyRate-To" className="p-2 ring-0 outline-none rounded-lg text-black dark:text-white bg-gray-100 dark:bg-neutral-600">
                        <option value={'Select Currency'}>{'Select Currency'}</option>
                        {currenciesTo.length > 0 ? currenciesTo.map((currency,index)=>{
                            return <option key={currency._id+index} value={currency.shortName}>{currency.shortName}</option>
                        }) : null}
                    </select> */}
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
                        {loadingSave ? 'Updating' : 'Update'}
                        {loadingSave ? <Loading height="h-6" width="w-6" screen={false}/> : null}
                    </div>
                </button>
            </form>
        </Layout>
    );
};

export default EditCurrencyRate;
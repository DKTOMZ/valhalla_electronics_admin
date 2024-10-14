'use client'
import { default as Layout } from "@/components/Layout";

import Loading from "@/components/loading";
import Modal from "@/components/modal";
import {FrontendServices} from "@/lib/inversify.config";
import { ShippingRate as ShippingRateType } from "@/models/shippingRate";
import { GenericResponse } from "@/models/genericResponse";
import { HttpServiceResponse } from "@/models/httpServiceResponse";
import { HttpService } from "@/services/httpService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

/**
* ShippingRates component
*/
const ShippingRates: React.FC = () => {

    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');

    //State variables
    const [shippingRates,setShippingRates] = useState<ShippingRateType[]>([]);
    const [tempShippingRates, setTempShippingRates] = useState<ShippingRateType[]>([]);
    const [loading,setLoading] = useState(true);
    const [loadingDelete,setLoadingDelete] = useState(false);
    const [isModalVisible,setIsModalVisible] = useState(false);
    const [isModalFailVisible,setIsModalFailVisible] = useState(false);
    const [currentShippingRateId,setCurrentShippingRateId] = useState('');
    const [searchText, setSearchText] = useState('');
    const pageLength = 10;
    const [pages,setPages] = useState(1);
    const [currentPage,setCurrentPage] = useState(1);
    const [minPage] = useState(1);
    const [pageElements,setPageElements] = useState<React.JSX.Element[]>([]);
    const [pageElementsCopy,setPageElementsCopy] = useState<React.JSX.Element[]>([]);
    const pagesBox = useRef<HTMLDivElement>(null);
    
    useEffect(()=>{
        const fetchData = async() => {
            return await http.get<ShippingRateType[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/shippingRates/fetch`);
        };
        loading && fetchData().then(response => {
            if (response.status >= 200 && response.status<=299 && response.data) {
                let limit = Math.ceil(response.data.length/pageLength);
                let elements = [];
                for (let i = minPage; i <= limit; i++) {
                    elements.push(<button onClick={()=>setCurrentPage(i)} key={i}>{i}</button>);
                }
                setPageElements([...elements]);
                setPageElementsCopy([...elements]);
                setPages(limit);
                setShippingRates([...response.data]);
                setTempShippingRates([...response.data]);
            }
            setLoading(false)
        });
        },[loading]);

    const searchShippingRates = () => {
        setTempShippingRates(shippingRates.filter((shippingRate)=>shippingRate.name.toLowerCase().includes(searchText.toLowerCase())));
    };

    useEffect(()=>{
        searchText === '' ? setTempShippingRates(shippingRates) : null;
    },[searchText])

    return (
        <Layout>
            <title>Valhalla - ShippingRates</title>
            { isModalVisible ?
             <Modal title="Delete Action" body="Are you sure you want to delete this shippingRate?" key={'DeleteShippingRate-Modal'}
                decision={{
                    yes: {
                        text: 'Yep', callback: async () => {
                            setIsModalVisible(false);
                            setLoadingDelete(true);

                            const response: HttpServiceResponse<GenericResponse> = await http.get(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/shippingRates/delete?id=${currentShippingRateId}`);

                            if (response.data.error) {
                                setIsModalFailVisible(true);
                            }

                            setLoadingDelete(false);
                            setLoading(true);
                        }
                    },
                    no: { text: 'Nope', callback: () => setIsModalVisible(false) }
                }} callback={()=>{}}             />
             : null}
            { isModalFailVisible ?
             <Modal body="Failed to delete shippingRate. Please check connection and try again" title="Failed to Delete" callback={
                ()=>{ setIsModalFailVisible(false);}
             }/>
             : null
            }
            <div className="xl:w-2/3 2xl:w-1/2 w-full mx-auto">
                <div>
                    <div className={`flex max-sm:w-full flex-row mb-2 w-96 items-center h-11 shadow-md shadow-zinc-600 dark:shadow-none focus-within:dark:shadow-sm focus-within:dark:shadow-orange-400  focus-within:shadow-orange-700 rounded-md`}>
                        <input type="search" placeholder="Search..." value={searchText} onChange={(e)=>setSearchText(e.target.value)} className={`search-bar h-full w-5/6 max-sm:w-3/4 rounded-s-md p-2 dark:text-white dark:bg-zinc-700 text-black outline-none`} />
                        <button className="custom-search-icon h-full w-16 px-3 bg-orange-600 md:hover:bg-orange-500 max-md:active:bg-orange-500 text-white rounded-e-md" title="search" onClick={()=>searchShippingRates()}>
                            <i className="fa-solid fa-magnifying-glass fa-xl"></i>
                        </button>
                    </div>
                </div>                
                <button className="bg-orange-600 mb-4  md:hover:bg-orange-500 max-md:active:bg-orange-500 p-2 rounded-lg text-sm text-white"
                    onClick={()=>{ router.push('/pages/shippingRates/new') }}>
                        Add New Shipping Rate
                    </button>
                    {loading || loadingDelete ? <Loading screen={false} />:
                        shippingRates.length > 0 ? 
                        <table className="w-full ring-1 ring-slate-500 dark:ring-0"> 
                            <thead className="bg-slate-200 dark:bg-slate-600">
                                <tr>
                                    <td className="text-black d p-1 dark:text-white font-bold text-sm">Shipping Rate</td>
                                    <td className="text-black text-sm font-bold dark:text-white">Actions</td>
                                </tr>
                            </thead>
                            <tbody>
                                {tempShippingRates.filter((_item,index)=>(index >= (currentPage-1) * pageLength && index < currentPage * pageLength)).map((shippingRate)=>{
                                    return <tr key={shippingRate._id}>
                                        <td className="text-black dark:text-white text-sm">{shippingRate.name}</td>
                                        <td>
                                            <div className="flex flex-row gap-4">
                                                <Link className="bg-orange-600 flex md:hover:bg-orange-500 max-md:active:bg-orange-500 text-white text-sm rounded p-1" href={`/pages/shippingRates/edit?id=${shippingRate._id}`}>
                                                    <span className="hidden sm:inline"><i className="fa-regular fa-pen-to-square"></i></span> Edit
                                                </Link>
                                                <button className="bg-orange-600 flex md:hover:bg-orange-500 max-md:active:bg-orange-500 text-white text-sm rounded p-1"
                                                onClick={()=>{
                                                    setCurrentShippingRateId(shippingRate._id);
                                                    setIsModalVisible(true);
                                                }
                                                }>
                                                    <span className="hidden sm:inline"><i className="fa-regular fa-trash-can"></i></span> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                        : 
                        <div className="text-black text-lg dark:text-white">Add some shippingRates to see them here</div>
                    }
            </div>
            <div className="flex flex-row gap-x-2 mt-2 xl:w-2/3 2xl:w-1/2 w-full mx-auto">
                <button onClick={()=>{
                    const lastTwoDigits = currentPage-1 % 100;
                    if(lastTwoDigits % 4 === 0){
                        currentPage-1 >= 1  ? setPageElementsCopy(pageElements.slice(currentPage-5 > 0 ? currentPage-5: 0,currentPage-1)) : null;
                    }
                    currentPage-1 >= 1 ? setCurrentPage(currentPage-1) : null
                    }} disabled={currentPage===1}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3.0" stroke="currentColor" className={`transition-all rotate-90 w-5 h-5 ${currentPage === 1 ? 'dark:text-gray-400 text-zinc-400' : 'dark:text-white text-zinc-800'}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
                <div ref={pagesBox} style={{maxWidth:'155px'}} className="flex text-ellipsis whitespace-nowrap dark:text-white text-black flex-row overflow-hidden border-orange-500 gap-x-2">
                    {pageElementsCopy.map((e,i)=>{
                        return <div style={{borderRadius:'50%'}} key={i} className={`${currentPage == e.key ? 'bg-orange-600 text-white' : 'text-yellow-200 dark:text-white'} flex flex-row items-center justify-center h-8 w-8`}>
                            {e}
                        </div>
                    })}
                </div>
                    <button onClick={()=>{
                    const lastTwoDigits = currentPage % 100;
                    if(lastTwoDigits % 4 === 0){
                        currentPage+1 <= pages  ? setPageElementsCopy(pageElements.slice(currentPage)) : null;
                    }
                        currentPage+1 <= pages ? setCurrentPage(currentPage+1) : null
                        }} disabled={currentPage===pages}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3.0" stroke="currentColor" className={`transition-all -rotate-90 w-5 h-5 ${currentPage === pages ? 'dark:text-gray-400 text-zinc-400' : 'dark:text-white text-zinc-800'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                </div>
        </Layout>
    );
};

export default ShippingRates;
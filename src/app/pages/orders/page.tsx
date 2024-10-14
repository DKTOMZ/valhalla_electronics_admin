'use client'
import { default as Layout } from "@/components/Layout";
import Loading from "@/components/loading";
import {FrontendServices} from "@/lib/inversify.config";
import { OrderType } from "@/models/order";
import { HttpService } from "@/services/httpService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

/**
* Orders component
*/
const Orders: React.FC = () => {

    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');

    //State variables
    const [orders,setOrders] = useState<OrderType[]>([]);
    const [tempOrders, setTempOrders] = useState<OrderType[]>([]);
    const [loading,setLoading] = useState(true);
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
            return await http.get<[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/orders/fetch`);
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
                setOrders([...response.data]);
                setTempOrders([...response.data]);
            }
            setLoading(false)
        });
        },[loading]);

    const searchOrders = () => {
        setTempOrders(orders.filter((order)=>order.orderId.toLowerCase().includes(searchText.toLowerCase())));
    };

    useEffect(()=>{
        searchText === '' ? setTempOrders(orders) : null;
    },[searchText])

    return (
        <Layout>
            <title>Valhalla - Orders</title>
            <div className="xl:w-2/3 2xl:w-1/2 w-full mx-auto">
                <div className="mb-3">
                    <div className={`flex max-sm:w-full flex-row mb-2 w-96 items-center h-11 shadow-md shadow-zinc-600 dark:shadow-none focus-within:dark:shadow-sm focus-within:dark:shadow-orange-400  focus-within:shadow-orange-700 rounded-md`}>
                        <input type="search" placeholder="Search..." value={searchText} onChange={(e)=>setSearchText(e.target.value)} className={`search-bar h-full w-5/6 max-sm:w-3/4 rounded-s-md p-2 dark:text-white dark:bg-zinc-700 text-black outline-none`} />
                        <button className="custom-search-icon h-full w-16 px-3 bg-orange-600 md:hover:bg-orange-500 max-md:active:bg-orange-500 text-white rounded-e-md" title="search" onClick={()=>searchOrders()}>
                            <i className="fa-solid fa-magnifying-glass fa-xl"></i>
                        </button>
                    </div>
                </div>                
                    {loading ? <Loading screen={false} />:
                        orders.length > 0 ? 
                        <table className="w-full ring-1 ring-slate-500 dark:ring-0"> 
                            <thead className="bg-slate-200 dark:bg-slate-600">
                                <tr>
                                    <td className="text-black d p-1 dark:text-white font-bold text-sm">Order No.</td>
                                    <td className="text-black text-sm font-bold dark:text-white">Actions</td>
                                </tr>
                            </thead>
                            <tbody>
                                {tempOrders.filter((_item,index)=>(index >= (currentPage-1) * pageLength && index < currentPage * pageLength)).map((order)=>{
                                    return <tr key={order._id}>
                                        <td className="text-black dark:text-white text-sm">{order.orderId}</td>
                                        <td>
                                            <div className="flex flex-row gap-4">
                                                <Link className="bg-orange-600 flex md:hover:bg-orange-500 max-md:active:bg-orange-500 text-white text-sm rounded p-1" href={`/pages/orders/view?id=${order._id}`}>
                                                    <span className="hidden sm:inline"><i className="fa-regular fa-eye"></i></span> View
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                        : 
                        <div className="text-black text-lg dark:text-white">No customer orders were found</div>
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

export default Orders;
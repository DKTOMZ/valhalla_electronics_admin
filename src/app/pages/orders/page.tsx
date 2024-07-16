'use client'
import { default as Layout } from "@/components/Layout";
import Loading from "@/components/loading";
import {FrontendServices} from "@/lib/inversify.config";
import { OrderType } from "@/models/order";
import { HttpService } from "@/services/httpService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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
    
    useEffect(()=>{
        const fetchData = async() => {
            return await http.get<[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/orders/fetch`);
        };
        loading && fetchData().then(response => {
            if (response.status >= 200 && response.status<=299 && response.data) {
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
            <div>
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
                                {tempOrders.map((order)=>{
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
        </Layout>
    );
};

export default Orders;
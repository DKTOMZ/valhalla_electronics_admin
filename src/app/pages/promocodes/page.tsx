'use client'
import { default as Layout } from "@/components/Layout";
import Loading from "@/components/loading";
import Modal from "@/components/modal";
import {FrontendServices} from "@/lib/inversify.config";
import { GenericResponse } from "@/models/genericResponse";
import { HttpServiceResponse } from "@/models/httpServiceResponse";
import { PromocodeType } from "@/models/promocode";
import { HttpService } from "@/services/httpService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

/**
* Promocodes component
*/
const Promocodes: React.FC = () => {

    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');

    //State variables
    const [promocodes,setPromocodes] = useState<PromocodeType[]>([]);
    const [tempPromocodes, setTempPromocodes] = useState<PromocodeType[]>([]);
    const [loading,setLoading] = useState(true);
    const [loadingDelete,setLoadingDelete] = useState(false);
    const [isModalVisible,setIsModalVisible] = useState(false);
    const [isModalFailVisible,setIsModalFailVisible] = useState(false);
    const [currentPromocodeId,setCurrentPromocodeId] = useState('');
    const [searchText, setSearchText] = useState('');
    
    useEffect(()=>{
        const fetchData = async() => {
            return await http.get<PromocodeType[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/promocodes/fetch`);
        };
        loading && fetchData().then(response => {
            if (response.status >= 200 && response.status<=299 && response.data) {
                setPromocodes([...response.data]);
                setTempPromocodes([...response.data]);
            }
            setLoading(false);
        });
        },[http,loading]);

    const searchPromocodes = () => {
        setTempPromocodes(promocodes.filter((promocode)=>promocode.code.toLowerCase().includes(searchText.toLowerCase())));
    };

    useEffect(()=>{
        searchText === '' ? setTempPromocodes(promocodes) : null;
    },[searchText])

    return (
        <Layout>
            <title>Valhalla - Promocodes</title>
            { isModalVisible ?
             <Modal title="Delete Action" body="Are you sure you want to delete this promocode?" key={'DeletePromocode-Modal'}
                decision={{
                    yes: {
                        text: 'Yep', callback: async () => {
                            setIsModalVisible(false);
                            setLoadingDelete(true);

                            const response: HttpServiceResponse<GenericResponse> = await http.get(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/promocodes/delete/id=${currentPromocodeId}`);

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
             <Modal body="Failed to delete promocode. Please check connection and try again" title="Failed to Delete" callback={
                ()=>{ setIsModalFailVisible(false);}
             }/>
             : null
            }
            <div>
                <div>
                    <div className={`flex max-sm:w-full flex-row mb-2 w-96 items-center h-11 shadow-md shadow-zinc-600 dark:shadow-none focus-within:dark:shadow-sm focus-within:dark:shadow-orange-400  focus-within:shadow-orange-700 rounded-md`}>
                        <input type="search" placeholder="Search..." value={searchText} onChange={(e)=>setSearchText(e.target.value)} className={`search-bar h-full w-5/6 max-sm:w-3/4 rounded-s-md p-2 dark:text-white dark:bg-slate-700 text-black outline-none`} />
                        <button className="custom-search-icon h-full w-16 px-3 bg-orange-500 md:hover:bg-orange-400 max-md:active:bg-orange-400 text-white rounded-e-md" title="search" onClick={()=>searchPromocodes()}>
                            <i className="fa-solid fa-magnifying-glass fa-xl"></i>
                        </button>
                    </div>
                </div>                
                <button className="bg-orange-600 mb-4  md:hover:bg-orange-500 max-md:active:bg-orange-500 p-2 rounded-lg text-sm text-white"
                    onClick={()=>{ router.push('/pages/promocodes/new') }}>
                        Add New Promocode
                    </button>
                    {loading || loadingDelete ? <Loading screen={false} />:
                        promocodes.length > 0 ? 
                        <table className="w-full ring-1 ring-slate-500 dark:ring-0"> 
                            <thead className="bg-slate-100 dark:bg-slate-600">
                                <tr>
                                    <td className="text-black d p-1 dark:text-white font-bold text-sm">Promocode</td>
                                    <td className="text-black text-sm font-bold dark:text-white">Actions</td>
                                </tr>
                            </thead>
                            <tbody>
                                {tempPromocodes.map((promocode)=>{
                                    return <tr key={promocode._id}>
                                        <td className="text-black dark:text-white text-sm">{promocode.code}</td>
                                        <td>
                                            <div className="flex flex-row gap-4">
                                                <Link className="bg-orange-600 flex md:hover:bg-orange-500 max-md:active:bg-orange-500 text-white text-sm rounded p-1" href={`/pages/promocodes/edit?id=${promocode._id}`}>
                                                    <span className="hidden sm:inline"><i className="fa-regular fa-pen-to-square"></i></span> Edit
                                                </Link>
                                                <button className="bg-orange-600 flex md:hover:bg-orange-500 max-md:active:bg-orange-500 text-white text-sm rounded p-1"
                                                onClick={()=>{
                                                    setCurrentPromocodeId(promocode._id);
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
                        <div className="text-black text-lg dark:text-white">Add some promocodes to see them here</div>
                    }
            </div>
        </Layout>
    );
};

export default Promocodes;
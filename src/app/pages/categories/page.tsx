'use client'
import { default as Layout } from "@/components/Layout";

import Loading from "@/components/loading";
import Modal from "@/components/modal";
import {FrontendServices} from "@/lib/inversify.config";
import { Category } from "@/models/categories";
import { GenericResponse } from "@/models/genericResponse";
import { HttpServiceResponse } from "@/models/httpServiceResponse";
import { HttpService } from "@/services/httpService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

/**
* Categories component
*/
const Categories: React.FC = () => {

    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');

    //State variables
    const [categories,setCategories] = useState<Category[]>([]);
    const [tempCategories, setTempCategories] = useState<Category[]>([]);
    const [loading,setLoading] = useState(true);
    const [loadingDelete,setLoadingDelete] = useState(false);
    const [isModalVisible,setIsModalVisible] = useState(false);
    const [isModalFailVisible,setIsModalFailVisible] = useState(false);
    const [currentCategoryId,setCurrentCategoryId] = useState('');
    const [currentCategoryImages, setCurrentCategoryImages] = useState<{Key: string, link: string}[]>([]);
    const [searchText, setSearchText] = useState('');

    useEffect(()=>{
        const fetchData = async() => {
            return await http.get(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/categories/fetch`);
        };
        loading && fetchData().then(response => {
            if (response.status >= 200 && response.status<=299 && response.data) {
                setCategories([...response.data]);
                setTempCategories([...response.data]);
            }
            setLoading(false)
        });
    },[loading]);

    const searchCategories = () => {
        setTempCategories(categories.filter((category)=>category.name.toLowerCase().includes(searchText.toLowerCase())));
    };

    useEffect(()=>{
        searchText === '' ? setTempCategories(categories) : null;
    },[searchText])

    return (
        <Layout>
            <title>Valhalla - Categories</title>
            { isModalVisible ?
             <Modal title="Delete Action" body="Are you sure you want to delete this category?" key={'DeleteCategory-Modal'}
                decision={{
                    yes: {
                        text: 'Yep', callback: async () => {
                            setIsModalVisible(false);
                            setLoadingDelete(true);

                            const response: HttpServiceResponse<GenericResponse> = await http.get(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/categories/delete?id=${currentCategoryId}`);

                            if (response.data.success && currentCategoryImages.length > 0){
                                const response = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/images/delete`, JSON.stringify({
                                    images: currentCategoryImages
                                })
                                );
                                if (response.data.error) {
                                    setIsModalFailVisible(true);
                                }
                            }

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
             <Modal body="Failed to delete category or its image(s). Please check connection and try again" title="Failed to Delete" callback={
                ()=>{ setIsModalFailVisible(false);}
             }/>
             : null
            }
            <div>
                <div>
                    <div className={`flex max-sm:w-full flex-row mb-2 w-96 items-center h-11 shadow-md shadow-zinc-600 dark:shadow-none focus-within:dark:shadow-sm focus-within:dark:shadow-orange-400  focus-within:shadow-orange-700 rounded-md`}>
                        <input type="search" placeholder="Search..." value={searchText} onChange={(e)=>setSearchText(e.target.value)} className={`search-bar h-full w-5/6 max-sm:w-3/4 rounded-s-md p-2 dark:text-white dark:bg-zinc-700 text-black outline-none`} />
                        <button className="custom-search-icon h-full w-16 px-3 bg-orange-600 md:hover:bg-orange-500 max-md:active:bg-orange-500 text-white rounded-e-md" title="search" onClick={()=>searchCategories()}>
                            <i className="fa-solid fa-magnifying-glass fa-xl"></i>
                        </button>
                    </div>
                </div>                
                <button className="bg-orange-600 mb-4  md:hover:bg-orange-500 max-md:active:bg-orange-500 p-2 rounded-lg text-sm text-white"
                    onClick={()=>{ router.push('/pages/categories/new') }}>
                        Add New Category
                    </button>
                    {loading || loadingDelete ? <Loading screen={false} />:
                        categories.length > 0 ? 
                        <table className="w-full ring-1 ring-slate-500 dark:ring-0"> 
                            <thead className="bg-slate-200 dark:bg-slate-600">
                                <tr>
                                    <td className="text-black p-1 dark:text-white font-bold text-sm">Category</td>
                                    <td className="text-black text-sm font-bold dark:text-white">Actions</td>
                                </tr>
                            </thead>
                            <tbody>
                                {tempCategories.map((category)=>{
                                    return <tr key={category._id}>
                                        <td className="text-black dark:text-white text-sm">{category.name}</td>
                                        <td>
                                            <div className="flex flex-row gap-4">
                                                <Link className="bg-orange-600 flex md:hover:bg-orange-500 max-md:active:bg-orange-500 text-white text-sm rounded p-1" href={`/pages/categories/edit?id=${category._id}`}>
                                                    <span className="hidden sm:inline"><i className="fa-regular fa-pen-to-square"></i></span> Edit
                                                </Link>
                                                <button className="bg-orange-600 flex md:hover:bg-orange-500 max-md:active:bg-orange-500 text-white text-sm rounded p-1"
                                                onClick={()=>{
                                                    setCurrentCategoryId(category._id);
                                                    setCurrentCategoryImages(category.images);
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
                        <div className="text-black text-lg dark:text-white">Add some categories to see them here</div>
                    }
            </div>
        </Layout>
    );
};

export default Categories;
'use client'

import Loading from "@/components/loading";
import Modal from "@/components/modal";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { default as Layout } from "@/components/Layout";
import { Product } from "@/models/products";
import {FrontendServices} from "@/lib/inversify.config";
import { HttpService } from "@/services/httpService";
import { HttpServiceResponse } from "@/models/httpServiceResponse";
import { GenericResponse } from "@/models/genericResponse";
import { useRouter } from "next/navigation";

const Products: React.FC = () => {

    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');

    //State variables
    const [products,setProducts] = useState<Product[]>([]);
    const [tempProducts, setTempProducts] = useState<Product[]>([]);
    const [loading,setLoading] = useState(true);
    const [loadingDelete,setLoadingDelete] = useState(false); 
    const [isModalVisible,setIsModalVisible] = useState(false);
    const [isModalFailVisible,setIsModalFailVisible] = useState(false);
    const [currentProductId,setCurrentProductId] = useState('');
    const [currentProductImages, setCurrentProductImages] = useState<{Key: string, link: string}[]>([]);
    const [searchText, setSearchText] = useState('');

    useEffect(()=>{
        const fetchData = async() => {
            return await http.get<Product[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/products/fetch`);
        };
        loading && fetchData().then(response => {
            if (response.status >= 200 && response.status<=299 && response.data) {
                setProducts([...response.data]);
                setTempProducts([...response.data]);
            }
            setLoading(false);
        });
    },[http, loading]);

    const searchProducts = () => {
        setTempProducts(products.filter((category)=>category.name.toLowerCase().includes(searchText.toLowerCase())));
    };

    useEffect(()=>{
        searchText === '' ? setTempProducts(products) : null;
    },[products, searchText])
    
    return (
        <Layout>
            <title>Valhalla - Products</title>
            { isModalVisible ?
             <Modal title="Delete Action" body="Are you sure you want to delete this product?" key={'DeleteProduct-Modal'}
                decision={{
                    yes: {
                        text: 'Yep', callback: async () => {
                            setIsModalVisible(false);
                            setLoadingDelete(true);

                            const response: HttpServiceResponse<GenericResponse> = await http.get(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/products/delete/id=${currentProductId}`);

                            if (response.data.success){
                                const response = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/images/delete`, JSON.stringify({
                                    images: currentProductImages
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
                    no: { text: 'Nope', callback : () => setIsModalVisible(false) }
                }} callback={()=>{}}             />
             : null}
             { isModalFailVisible ?
             <Modal body="Failed to delete product. Please check connection and try again" title="Failed to Delete" callback={
                ()=>{ setIsModalFailVisible(false);}
             }/>
             : null
             }
            <div>
                <div>
                    <div className={`flex max-sm:w-full w-96 flex-row mb-2 items-center h-11 shadow-md shadow-zinc-600 dark:shadow-none focus-within:dark:shadow-sm focus-within:dark:shadow-orange-400  focus-within:shadow-orange-700 rounded-md`}>
                        <input type="search" placeholder="Search..." value={searchText} onChange={(e)=>setSearchText(e.target.value)} className={`search-bar h-full w-5/6 max-sm:w-3/4 rounded-s-md p-2 dark:text-white dark:bg-zinc-700 text-black outline-none`} />
                        <button className=" h-full w-16 px-3 bg-orange-500 md:hover:bg-orange-400 max-md:active:bg-orange-400 text-white rounded-e-md" title="search" onClick={()=>searchProducts()}>
                            <i className="fa-solid fa-magnifying-glass fa-xl"></i>
                        </button>
                    </div>
                </div> 
                <button className="bg-orange-600 mb-4  md:hover:bg-orange-500 max-md:active:bg-orange-500 p-2 rounded-lg text-sm text-white"
                onClick={()=>{ router.push('/pages/products/new') }}>
                    Add New Product
                </button>
                {loading || loadingDelete ? <Loading screen={false} />:
                    products.length > 0 ? 
                    <table className="w-full ring-1 ring-slate-500 dark:ring-0"> 
                        <thead className="bg-slate-100 dark:bg-slate-600">
                            <tr>
                                <td className="text-black d p-1 dark:text-white font-bold text-sm">Product Name</td>
                                <td className="text-black text-sm font-bold dark:text-white">Actions</td>
                            </tr>
                        </thead>
                        <tbody>
                            {tempProducts.map((product)=>{
                                return <tr key={product._id}>
                                    <td className="text-black dark:text-white text-sm">{product.name}</td>
                                    <td>
                                        <div className="flex flex-row gap-4">
                                            <Link className="bg-orange-600 flex md:hover:bg-orange-500 max-md:active:bg-orange-500 text-white text-sm rounded p-1" href={`/pages/products/edit?id=${product._id}`}>
                                                <span className="hidden sm:inline"><i className="fa-regular fa-pen-to-square"></i></span> Edit
                                            </Link>
                                            <button className="bg-orange-600 flex md:hover:bg-orange-500 max-md:active:bg-orange-500 text-white text-sm rounded p-1"
                                            onClick={()=>{
                                                setCurrentProductId(product._id);
                                                setCurrentProductImages(product.images);
                                                setIsModalVisible(true);
                                            }
                                            }>
                                                <span className="hidden sm:inline"><i className="fa-regular fa-trash-can text-sm"></i></span> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            })}
                        </tbody>
                    </table>
                    : 
                    <div className="text-black text-base dark:text-white">Add some products to see them here</div>
                }
            </div>
        </Layout>
    );
};

export default Products;
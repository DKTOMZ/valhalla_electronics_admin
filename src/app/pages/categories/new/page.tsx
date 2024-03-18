'use client'
import Layout from "@/components/Layout";
import Loading from "@/components/loading";
import Modal from "@/components/modal";
import {FrontendServices} from "@/lib/inversify.config";
import { Category, CategoryProperty } from "@/models/categories";
import { GenericResponse } from "@/models/genericResponse";
import { HttpService } from "@/services/httpService";
import { ValidationService } from "@/services/validationService";
import { useRouter } from "next/navigation";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";

const NewCategory: React.FC = () => {

    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');
    const validationService = FrontendServices.get<ValidationService>('ValidationService');

    //State variables
    const [categoryName,setCategoryName] = useState('');
    const [properties,setProperties] = useState<CategoryProperty[]>([]);
    const [categories,setCategories] = useState<Category[]>([]);
    const [parentCategory,setParentCategory] = useState('No Parent Category');
    const [saveSuccess,setSaveSuccess] = useState(false);
    const [loadingSave,setLoadingSave] = useState(false);
    const [loading,setLoading] = useState(true);
    const [dragActive,setDragActive] = useState(false);
    const [tempImages,setTempImages] = useState<File[]>([]);
    const [uploading,setUploading] = useState(false);
    
    //Element refs
    const saveError = useRef<HTMLElement>(null) as MutableRefObject<HTMLDivElement>;
    const imageBox = useRef<HTMLLabelElement>() as MutableRefObject<HTMLLabelElement>;
    const imageError = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;
    const imageField = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>;

    useEffect(()=>{
        if(!saveSuccess && loadingSave) { 
            setLoadingSave(false);
            router.push('/pages/categories'); 
        }
    },[saveSuccess])

    useEffect(()=>{ 
        const fetchData = async() => {
            return await http.get<Category[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/categories/fetch`);
        };
        loading && fetchData().then(response => {
            if (response.status >= 200 && response.status<=299 && response.data) {
                setCategories([...response.data]);
            }
            setLoading(false);
        });
    },[http, loading]);

    const handleDrop = async(e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files) {
            await uploadImage(e.dataTransfer.files);
        }
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const uploadImage = async(files: FileList | null) => {

        imageError.current.innerHTML = '';

        if(!files){ return; }

        if ((tempImages.length) >= 1) {
            imageError.current.innerHTML = 'Only a max of 1 image is allowed';
            imageBox.current.focus();
            return;
        }

        const validation = await validationService.validateImages(files);

        if (files.length > 0 && Array.isArray(validation)) {
            setUploading(true);
            setTempImages([...tempImages,...validation]);
            setUploading(false);
        } else {
            imageField.current.value = typeof validation === 'string' ? validation : '';
        }

        imageField.current.value = "";
        imageError.current.innerHTML = '';

    };

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        setLoadingSave(true);
        e.preventDefault();
        if (tempImages.length === 0) {
            imageError.current.innerHTML = 'Please upload at least 1 image';
            imageBox.current.focus();
            return;
        }

        if (tempImages.length > 1) {
            imageError.current.innerHTML = 'Only a max of 1 image is allowed';
            imageBox.current.focus();
            return;
        }
        
        const postData = new FormData();
        tempImages.forEach((file,index)=>postData.append('image'+index,file));
        postData.append('name',categoryName);
        postData.append('parentCategory',parentCategory === 'No Parent Category' ? JSON.stringify({}) : JSON.stringify(categories.filter(category=>category.name === parentCategory)[0]));
        postData.append('properties', JSON.stringify(properties));

        const response = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/categories/save/`, 
            postData
        );
    
        if (response.data.success) {
            setSaveSuccess(true);
        } else {
            saveError.current.innerHTML = response.data.error || response.statusText;
            setLoadingSave(false);
        }

    };

    const handlePropertyAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setProperties([...properties,{name:'',value:''}]);
    };

    const handlePropertyRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if(properties.length > 0) {
            setProperties([...properties.slice(0,properties.length-1)]);
        }
    };

    if (loading) { return <div>
        <title>Valhalla - New Category</title>
        <Layout><Loading screen={false} /></Layout>
    </div>
    }

    return (
        <Layout>
            <title>Valhalla - New Category</title>
            { saveSuccess ? <Modal key={'Save-Category'} callback={()=>setSaveSuccess(false)} body="Your category has been saved successfully!" title={'Success!'}/> : null}
            <form onSubmit={(e)=>handleSubmit(e)} className="flex flex-col gap-4">
                <h2 className="text-black dark:text-white text-lg">Add a new category below</h2>
                <div>
                    <label htmlFor='Category-Name' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>Name *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''} type="text" required name="Category-Name" placeholder="Category Name" value={categoryName}
                    onChange={(e)=>setCategoryName(e.target.value)}
                    className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>

                <div>
                    <label htmlFor='Parent-Category' className='block sm:text-base font-bold text-sm dark:text-white'>Parent Category</label>
                    <select value={parentCategory} onChange={(e)=>setParentCategory(e.target.value)} name="Parent-Category" className="p-2 ring-0 outline-none rounded-lg text-black dark:text-white bg-gray-100 dark:bg-neutral-600">
                        <option className="dark:text-neutral-300" value={'No Parent Category'}>No Parent Category</option>
                        {categories.length > 0 ? categories.map((category)=>{
                            return <option key={category._id} value={category.name}>{category.name}</option>
                        }) : null}
                    </select>
                </div>

                <label className="text-black sm:text-base font-bold mb-0 pb-0 text-sm dark:text-white">Photos *</label>
                <div onDragEnter={handleDrag} onDrop={handleDrop} onDragLeave={handleDrag} onDragOver={handleDrag} className="mb-2 mt-0">
                    { tempImages.length > 0 ? 
                    <div className="flex gap-2 flex-wrap mb-4">
                        { tempImages.map((image,index)=>{
                            return <div key={`${index}`} className="relative w-40 h-40">
                                <img className="object-cover w-full h-full" src={`${URL.createObjectURL(image)}`} alt="category-image" />
                                <button title="Delete" onClick={()=>setTempImages([...tempImages.slice(0,index),...tempImages.slice(index+1)])} className="absolute -top-5 -right-5 bg-white dark:bg-zinc-800 "><i className="fa-regular fa-circle-xmark fa-xl text-orange-500"></i></button>
                            </div>
                        })}
                    </div>
                    : <div className="text-black dark:text-white text-base">No Images for this category</div>
                    }
                    <label ref={imageBox} className={`w-40 h-40 focus:ring-2 ring-1 ring-orange-500 text-black rounded-md cursor-pointer dark:text-white ${dragActive ? 'bg-slate-100 dark:bg-neutral-700' : 'bg-slate-50 dark:bg-neutral-600'} text-center flex items-center justify-center text-sm gap-1`}>
                        { uploading ? 
                            <div>
                                <Loading height="h-8" width="w-8" />
                            </div> 
                            :
                            <>
                                <i className="fa-solid fa-upload"></i>
                                {dragActive ? <div>Drop Here</div>
                                : <div>Upload</div>}
                                <input ref={imageField} multiple={true} accept="image/png, image/jpeg, .jpeg, .png" type="file" className="hidden" onChange={(e)=>{
                                    uploadImage(e.target.files)
                                }}/>
                            </>
                        }
                    </label>
                    <div ref={imageError} className="text-red-500"></div>
                    { uploading ? 
                        <div className="text-black dark:text-white text-base">Uploading...</div>
                    :
                        <div className="text-black dark:text-white text-base">Click or drag and drop to upload an image</div>
                    }
  
                </div>

                <div>
                    <label htmlFor="Categories" className="block sm:text-base font-bold text-sm dark:text-white">Properties</label>
                    <button onClick={(e)=>handlePropertyAdd(e)} className="bg-orange-600 mb-3 md:hover:bg-orange-500 max-md:active:bg-orange-500 p-2 rounded-lg text-sm text-white disabled:bg-gray-500">
                        Add new property
                    </button>
                    { properties.length > 0 ?
                    properties.map((_property,index)=>{
                        return <div key={`prop${index}`} className="mb-4">
                            <h3 className="text-black dark:text-white text-base">Property {index+1}</h3>
                            <input onBlur={()=>saveError.current.innerHTML = ''} type="text" required name="Property-Name" placeholder="Name"
                            onChange={(e)=>setProperties([...properties.slice(0,index),{name:e.target.value,value:properties[index].value}, ...properties.slice(index+1)])}
                            className="px-2 outline-0 mb-2 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>

                            <input onBlur={()=>saveError.current.innerHTML = ''} type="text" required name="Property-Value" placeholder="Values (comma separated)"
                            onChange={(e)=>setProperties([...properties.slice(0,index),{name:properties[index].name,value:e.target.value}, ...properties.slice(index+1)])}
                            className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                        </div>
                    })
                    : null}
                    {properties.length > 0 ?
                        <button onClick={(e)=>handlePropertyRemove(e)} className="bg-orange-600 mb-3 md:hover:bg-orange-500 max-md:active:bg-orange-500 p-2 rounded-lg text-sm text-white disabled:bg-gray-500">
                            Remove last property
                        </button>
                    : null}
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

export default NewCategory;
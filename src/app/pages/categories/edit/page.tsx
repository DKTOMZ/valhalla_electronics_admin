'use client'
import Layout from "@/components/Layout";
import ErrorPage from "@/components/error";
import { FormSubmitButton } from "@/components/form_submit_button";
import Loading from "@/components/loading";
import Modal from "@/components/modal";
import {FrontendServices} from "@/lib/inversify.config";
import { Category, CategoryProperty } from "@/models/categories";
import { GenericResponse } from "@/models/genericResponse";
import { HttpService } from "@/services/httpService";
import { UtilService } from "@/services/utilService";
import { ValidationService } from "@/services/validationService";
import { useRouter, useSearchParams } from "next/navigation";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";

const EditCategory: React.FC = () => {

    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');
    const validationService = FrontendServices.get<ValidationService>('ValidationService');
    const util = FrontendServices.get<UtilService>('UtilService');

    //State variables
    const [categoryName,setCategoryName] = useState('');
    const [properties,setProperties] = useState<CategoryProperty[]>([]);
    const [categories,setCategories] = useState<Category[]>([]);
    const [parentCategory,setParentCategory] = useState('No Parent Category');
    const [saveSuccess,setSaveSuccess] = useState(false);
    const [,setLoadingDelete] = useState(false);
    const [loadingSave,setLoadingSave] = useState(false);
    const [loading,setLoading] = useState(true);
    const [Images,setImages] = useState<{Key: string, link: string}[]>([]);
    const [uploading,setUploading] = useState(false);
    const [dragActive,setDragActive] = useState(false);
    const [tempImages,setTempImages] = useState<File[]>([]);
    const [categoryId] = useState(useSearchParams().get('id'));
    const [categoryExists,setCategoryExists] = useState(true);

    //Element refs
    const saveError = useRef<HTMLElement>() as MutableRefObject<HTMLDivElement>;
    const imageBox = useRef<HTMLLabelElement>() as MutableRefObject<HTMLLabelElement>;
    const imageError = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;
    const imageField = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>;
    const savedImageError = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;

    useEffect(()=>{
        if(!saveSuccess && loadingSave) { 
            setLoadingSave(false);
            router.push('/pages/categories'); 
        }
    },[saveSuccess])

    useEffect(()=>{
        const fetchData = async() => {
            return await http.get<{category:Category,categories:Category[]}>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/categories/fetch?id=${categoryId}`);
        };

        loading && fetchData().then(response => {
            if (response.status >= 200 && response.status<=299 && response.data) {
                const categories = response.data.categories;
                const thisCategory = response.data.category;
                setCategories(categories.filter((category)=>(category._id != categoryId && !thisCategory['childCategories'].includes(category.name))));
                setCategoryName(thisCategory.name);
                thisCategory.parentCategory['name'] ? setParentCategory(thisCategory.parentCategory['name']) : null;
                setProperties(thisCategory.properties);
                setImages(thisCategory.images);
            }

            if(!response) {
                setCategoryExists(false);
            }

            setLoading(false);
        });
    },[http, loading, categoryId]);

    const handleDrop = async(e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        imageError.current.innerHTML = '';
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

        if(savedImageError.current) {
            savedImageError.current.innerHTML = '';
        }

        saveError.current.innerHTML = '';

        if(!files){ return; }

        if (files.length > 1 || tempImages.length >= 1) {
            util.handleErrorInputField(imageError,'Only a max of 1 image is allowed');
            imageBox.current.focus();
            return;
        }

        const validation = await validationService.validateImages(files);

        if (files.length > 0 && Array.isArray(validation)) {
            setUploading(true);
            setTempImages([...tempImages,...validation]);
            setUploading(false);
        } else {
            util.handleErrorInputField(imageError,typeof validation === 'string' ? validation : '');
        }
        imageError.current.innerHTML = "";
    };

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoadingSave(true);
        imageError.current.innerHTML = '';
        if(savedImageError.current) {
            savedImageError.current.innerHTML = '';
        }
        saveError.current.innerHTML = '';
        if (tempImages.length+Images.length === 0) {
            util.handleErrorInputField(imageError,'Please upload at least 1 image');
            imageBox.current.focus();
            return;
        }

        if (tempImages.length > 1) {
            util.handleErrorInputField(imageError,'Only a max of 1 image is allowed');
            imageBox.current.focus();
            return;
        }

        const postData = new FormData();
        tempImages.forEach((file,index)=>postData.append('image'+index,file));
        postData.append('id',categoryId??'');
        postData.append('name',categoryName);
        //console.log(parentCategory);
        postData.append('parentCategory',parentCategory === 'No Parent Category' ? JSON.stringify({}) : JSON.stringify(categories.filter(category=>category.name === parentCategory)[0]));
        properties.forEach((p)=>{
            if(!p.value){
                p.custom = true;
            }
        })
        postData.append('properties', JSON.stringify(properties));

        const response = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/categories/edit/`,
            postData
        );
    
        if (response.data.success) {
            setTempImages([]);
            setSaveSuccess(true);
        } else {
            util.handleErrorInputField(saveError,response.data.error || response.statusText);
            setLoadingSave(false);
        }
    };

    const handlePropertyAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
        imageError.current.innerHTML = '';
        if(savedImageError.current) {
            savedImageError.current.innerHTML = '';
        }
        saveError.current.innerHTML = '';
        e.preventDefault();
        setProperties([...properties,{name:'',value:'',custom:false}]);
    };

    const handlePropertyRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
        imageError.current.innerHTML = '';
        if(savedImageError.current) {
            savedImageError.current.innerHTML = '';
        }
        saveError.current.innerHTML = '';
        e.preventDefault();
        if(properties.length > 0) {
            setProperties([...properties.slice(0,properties.length-1)]);
        }
    };

    const handleImageDeletion = async(e: React.MouseEvent<HTMLButtonElement>, image: {Key: string, link: string}) => {
        imageError.current.innerHTML = '';
        if(savedImageError.current) {
            savedImageError.current.innerHTML = '';
        }
        saveError.current.innerHTML = '';
        e.preventDefault();
        if (Images.length === 1) { return util.handleErrorInputField(savedImageError,'There should be at least 1 image saved');}
                                        
        setLoadingDelete(true);
        const response = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/image/delete/`, {
            id: encodeURIComponent(categoryId??''),
            image: image
        })

        if (response.data.error) { 
            setLoadingDelete(false);
            return util.handleErrorInputField(savedImageError,response.data.error || response.statusText);
        }

        setLoading(true);
    };

    const handleTempImageDeletion = async(e: React.MouseEvent<HTMLButtonElement>, index: number) => {
        imageError.current.innerHTML = '';
        if(savedImageError.current) {
            savedImageError.current.innerHTML = '';
        }
        saveError.current.innerHTML = '';
        e.preventDefault();
        setTempImages([...tempImages.slice(0,index),...tempImages.slice(index+1)]);
    }

    if(!categoryId || !categoryExists) {
        return <ErrorPage title="Error: 404" error="Missing category Id. This category may not exist anymore." />;
    }


    if (loading) { return <div>
        <title>Valhalla - Edit Category</title>
        <Layout><Loading screen={false} /></Layout>
    </div>
    }

    return (
        <Layout>
            <title>Valhalla - Edit Category</title>
            { saveSuccess ? <Modal key={'Save-Category'} callback={()=>{
                setSaveSuccess(false);
            }} body="Your category has been updated successfully!" title={'Success!'}/> : null}
            <form onSubmit={(e)=>handleSubmit(e)} className="flex flex-col gap-4 xl:w-2/3 2xl:w-1/2 w-full mx-auto">
                <h2 className="text-black dark:text-white text-lg">Edit category below</h2>
                <div>
                    <label htmlFor='Category-Name' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>Name *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''} type="text" required name="Category-Name" placeholder="Category Name" readOnly={true} value={categoryName}
                    onChange={(e)=>setCategoryName(e.target.value)}
                    className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>

                <div>
                    <label htmlFor='Parent-Category' className='block sm:text-base font-bold text-sm dark:text-white'>Parent Category</label>
                    <select value={parentCategory} onChange={(e)=>setParentCategory(e.target.value)} name="Parent-Category" className="p-2 ring-0 outline-none rounded-lg text-black dark:text-white bg-gray-100 dark:bg-neutral-600">
                        <option value={'No Parent Category'}>{'No Parent Category'}</option>
                        {categories.length > 0 ? categories.map((category)=>{
                            return <option key={category._id} value={category.name}>{category.name}</option>
                        }) : null}
                    </select>
                </div>

                <label className="text-black sm:text-base font-bold mb-0 pb-0 text-sm dark:text-white">Photos *</label>
                <div onDragEnter={handleDrag} onDrop={handleDrop} onDragLeave={handleDrag} onDragOver={handleDrag} className="mb-2 mt-0">
                    { Images.length > 0 ? 
                    <>
                        <div className="text-base italic text-black dark:text-white">Saved images</div>
                        <div ref={savedImageError} className="text-red-500 mt-4 mb-4"></div>
                        <div className="flex gap-2 flex-wrap mb-4">
                            { Images.map((image,index)=>{
                                return <div key={index} className="relative w-40 h-40 lg:w-52 lg:h-52">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img className="object-cover w-full h-full" src={`${image.link}`} alt="category-image" />
                                    <button type="button" title="Delete" onClick={(e)=>handleImageDeletion(e,image)} className="absolute -top-5 -right-5 bg-white dark:bg-zinc-800 "><i className="fa-regular fa-circle-xmark fa-xl text-orange-500"></i></button>
                                </div>
                            })}
                        </div>
                        <br />
                    </>
                    :null
                    }
                    { tempImages.length > 0 ? 
                    <>  
                        <div className="text-xl text-black dark:text-white mb-4">Unsaved images</div>
                        <div className="flex gap-2 flex-wrap mb-4">
                            { tempImages.map((image,index)=>{
                                return <div key={`${index}-${image.name}`} className="relative w-40 h-40 lg:w-52 lg:h-52">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img className="object-cover w-full h-full" src={`${URL.createObjectURL(image)}`} alt="category-image" />
                                    <button type="button" title="Delete" onClick={(e)=>handleTempImageDeletion(e,index)} className="absolute -top-5 -right-5 bg-white dark:bg-zinc-800 "><i className="fa-regular fa-circle-xmark fa-xl text-orange-500"></i></button>
                                </div>
                            })}
                        </div>
                    </>
                    :null
                    }
                    { tempImages.length === 0 && Images.length === 0 ? 
                        <div className="text-black dark:text-white text-base">No Images for this category</div>
                    :null}
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
                                <input ref={imageField} multiple={false} accept="image/png, image/jpeg, .jpeg, .png" type="file" className="hidden" onChange={(e)=>uploadImage(e.target.files)}/>
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
                    { properties.length > 0 ?
                    properties.map((property,index)=>{
                        return <div key={`prop${index}`} className="mb-4">
                            <h3 className="text-black dark:text-white text-sm italic">Property {index+1}</h3>
                            <input value={property.name} onBlur={()=>saveError.current.innerHTML = ''} type="text" required name="Property-Name" placeholder="Name"
                            onChange={(e)=>setProperties([...properties.slice(0,index),{name:e.target.value,value:properties[index].value}, ...properties.slice(index+1)])}
                            className="px-2 outline-0 mb-2 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>

                            <input value={property.value} onBlur={()=>saveError.current.innerHTML = ''} type="text" name="Property-Value" placeholder="Values (comma separated)"
                            onChange={(e)=>setProperties([...properties.slice(0,index),{name:properties[index].name,value:e.target.value}, ...properties.slice(index+1)])}
                            className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                        </div>
                    })
                    : null}
                    <div className="sm:flex sm:flex-row max-sm:flex-col sm:gap-x-2 items-center">
                        <button onClick={(e)=>handlePropertyAdd(e)} className="bg-orange-600 mb-3 md:hover:bg-orange-500 max-md:active:bg-orange-500 p-2 rounded-lg text-sm text-white disabled:bg-gray-500">
                            Add new property
                        </button>
                        {properties.length > 0 ?
                        <button onClick={(e)=>handlePropertyRemove(e)} className="bg-orange-600 mb-3 md:hover:bg-orange-500 max-md:active:bg-orange-500 p-2 rounded-lg text-sm text-white disabled:bg-gray-500">
                            Remove last property
                        </button>
                    : null}
                    </div>
                </div>

                <div ref={saveError} className='text-red-500 text-center'></div>
                <FormSubmitButton disabled={loadingSave} text={loadingSave ? 'Updating' : 'Update'} className="!ml-auto !w-fit !p-5"/>
            </form>
        </Layout>
    );
};

export default EditCategory;
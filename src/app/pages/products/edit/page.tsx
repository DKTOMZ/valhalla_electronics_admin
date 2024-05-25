'use client'
import Layout from "@/components/Layout";
import Loading from "@/components/loading";
import Modal from "@/components/modal";
import {FrontendServices} from "@/lib/inversify.config";
import { Category, CategoryProperty } from "@/models/categories";
import { Product } from "@/models/products";
import { HttpService } from "@/services/httpService";
import { ValidationService } from "@/services/validationService";
import { useSearchParams } from "next/navigation";
import React, { FormEvent, MutableRefObject, useEffect, useRef, useState } from "react";
import ErrorPage from "@/components/error";
import { GenericResponse } from "@/models/genericResponse";

const EditProduct: React.FC = () => {

    //Services
    const http = FrontendServices.get<HttpService>('HttpService');
    const validationService = FrontendServices.get<ValidationService>('ValidationService');

    //State variables
    const [productName,setProductName] = useState('');
    const [productBrand,setProductBrand] = useState('');
    const [productDesc,setProductDesc] = useState('');
    const [productContents,setProductContents] = useState('');
    const [categories,setCategories] = useState<Category[]>([]);
    const [,setCurrentCategory] = useState<Category>();
    const [categoryName,setCategoryName] = useState('Select Category');
    const [currentProperties,setCurrentProperties] = useState<any>({});
    const [productPrice,setProductPrice] = useState(0);
    const [productDiscountPercent,setProductDiscountPercent] = useState(0);
    const [productStock,setProductStock] = useState(0);
    const [tempImages,setTempImages] = useState<File[]>([]);
    const [saveSuccess,setSaveSuccess] = useState(false);
    const [loading,setLoading] = useState(true);
    const [uploading,setUploading] = useState(false);
    const [dragActive,setDragActive] = useState(false);
    const [allProps,setAllProps] = useState<CategoryProperty[]>([]);
    const [loadingSave,setLoadingSave] = useState(false);
    const [Images,setImages] = useState<{Key: string, link: string}[]>([]);
    const [,setLoadingDeleteImage] = useState(false);
    const productId = useSearchParams().get('id');
    const [productExists,setProductExists] = useState(true);

    //Element regs
    const saveError = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>;
    const imageBox = useRef<HTMLLabelElement>() as MutableRefObject<HTMLLabelElement>;
    const imageError = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;
    const imageField = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>;
    const propsError = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;
    const categoryError = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;
    const savedImageError = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;

    useEffect(() => {
        const fetchData = async() => {
            return {responseProduct: await http.get<Product>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/products/fetch/id=${productId}`),
            responseCategories: await http.get<Category[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/categories/fetch`)};
        }

        if(loading && productId){
            fetchData().then(({responseProduct, responseCategories}) => {
                if (responseCategories.status >= 200 && responseCategories.status<=299 && responseCategories.data) {
                    setCategories([...responseCategories.data]);
                }

                if (responseProduct.status >= 200 && responseProduct.status<=299 && responseProduct.data) {
                    const product = responseProduct.data;
                    setProductName(product.name);
                    setProductDesc(product.description);
                    setProductPrice(product.price);
                    setCategoryName(product.category);
                    setProductBrand(product.brand);
                    setProductContents(product.contents);
                    setCurrentCategory([...responseCategories.data].filter(category=>category.name === product.category)[0]);
                    const currentCategoryProps = responseCategories.data.filter(category=>category.name === product.category)
                    currentCategoryProps && currentCategoryProps[0] && currentCategoryProps[0].properties ? setAllProps(responseCategories.data.filter(category=>category.name === product.category)[0]?.properties)
                        : null;
                    setCurrentProperties(product.properties);
                    product.images ? setImages([...product.images]) : setImages([]);
                    setProductStock(product.stock);
                    setProductDiscountPercent(product.discount);
                }

                if(!responseCategories && !responseProduct) {
                    setProductExists(false);
                }

                setLoading(false);
            });
        }

    },[http, loading, productId]);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files) {
            uploadImage(e.dataTransfer.files);
        }
    }

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }

    const uploadImage = async(files: FileList | null) => {

        if(!files){ return; }

        if(savedImageError.current) {
            savedImageError.current.innerHTML = '';
        }

        imageError.current.innerHTML = '';
        if ((files.length+Images.length) > 3) {
            imageError.current.innerHTML = 'Only a max of 3 images is allowed';
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
    }

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoadingSave(true);
        if(savedImageError.current) {
            savedImageError.current.innerHTML = '';
        }
        if (categoryName === 'Select Category') {
            categoryError.current.innerHTML = 'Category is not selected';
            return setLoadingSave(false);
        }
        if (Object.keys(currentProperties).length != allProps.length) {
            propsError.current.innerHTML = 'One or more of the property values is not selected';
            return setLoadingSave(false);
        }
        if ((tempImages.length+Images.length) > 3) {
            imageError.current.innerHTML = 'Only a max of 3 images is allowed';
            imageBox.current.focus();
            return setLoadingSave(false);
        }

        const postData = new FormData();
        tempImages.forEach((file,index)=>postData.append('image'+index,file));
        postData.append('productId', productId??'');
        postData.append('productName', productName);
        postData.append('productBrand', productBrand);
        postData.append('productDescription', productDesc);
        postData.append('productContents', productContents);
        postData.append('productPrice', productPrice.toString());
        postData.append('categoryName', categoryName);
        postData.append('currentProperties', JSON.stringify(currentProperties));
        postData.append('discount', productDiscountPercent.toString());
        postData.append('stock', productStock.toString());

        const response = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/products/edit/`,
            postData
        );

        if (response.data.success ) {
            setSaveSuccess(true);
			setTempImages([]);
        } else {
            saveError.current.innerHTML = response.data.error ?? response.statusText;
            setSaveSuccess(false);
            setLoadingSave(false);
        }
    }

    const handleImageDeletion = async(e: React.MouseEvent<HTMLButtonElement>, image: {Key: string, link: string}) => {
        imageError.current.innerHTML = '';
        if(savedImageError.current) {
            savedImageError.current.innerHTML = '';
        }
        saveError.current.innerHTML = '';
        e.preventDefault();
        if (Images.length === 1) { return savedImageError.current.innerHTML = 'There should be at least 1 image saved'}

        setLoadingDeleteImage(true);
        const response = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/image/delete/`, {
            id: encodeURIComponent(productId??''),
            image: image
        })
        if (response.data.error) {
            return savedImageError.current.innerHTML = response.data.error || response.statusText;
        }

        setLoadingDeleteImage(false);
        setLoading(true);
    }

    const handleTempImageDeletion = async(e: React.MouseEvent<HTMLButtonElement>, index: number) => {
        imageError.current.innerHTML = '';
        if(savedImageError.current) {
            savedImageError.current.innerHTML = '';
        }
        saveError.current.innerHTML = '';
        e.preventDefault();
        setTempImages([...tempImages.slice(0,index),...tempImages.slice(index+1)]);
    }

    const handleInputChange = (event: FormEvent<HTMLInputElement>) => {
        const value =  parseInt(event.currentTarget.value, 10);

        if(value >= 0 && value <= 100) {
            event.currentTarget.valueAsNumber = value;
        } else if(isNaN(value)){
            event.currentTarget.valueAsNumber = 1;
        } else {
            event.currentTarget.valueAsNumber = productDiscountPercent;
        }
    }

    if(!productId || !productExists) {
        return <ErrorPage title="Error: 404" error="Missing product Id. This product may not exist anymore." />;
    }

    if(loading) {
        return <div>
            <title>Valhalla - Edit Product</title>
            <Layout><Loading screen={false} /></Layout>
        </div>
    }

    return (
        <Layout>
            <title>Valhalla - Edit Product</title>
            <form onSubmit={(e)=>handleSubmit(e)} className="flex flex-col gap-4">
            { saveSuccess ? <Modal key={'Edit-Product'} callback={()=>{
                setSaveSuccess(false);
                setLoadingSave(false);
                setLoading(true);
            }} body="Your product has been updated successfully!" title={'Success!'}/> : null}
                <h2 className="text-black dark:text-white text-lg">Edit product below</h2>

                <div>
                    <label htmlFor='Product-Name' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>Name *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''} readOnly type="text" required name="Product-Name" placeholder="Name" value={productName}
                    
                    className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>

                <div>
                    <label htmlFor='Product-Brand' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>Brand *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''} type="text" required name="Product-Brand" placeholder="Brand" value={productBrand}
                    onChange={(e)=>setProductBrand(e.target.value)}
                    className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>

                <div>
                    <label htmlFor='Current-Category' className='block sm:text-base font-bold text-sm dark:text-white'>Category *</label>
                    <div ref={categoryError} className='text-red-500'></div>
                    <select onBlur={()=>categoryError.current.innerHTML = ''} value={categoryName} onChange={(e)=>
                        {
                            setCurrentProperties({});
                            let curr = categories.filter(category=>category.name === e.target.value)[0];
                            setCategoryName(curr.name)
                            setCurrentCategory(curr)
                            setAllProps([...curr.properties])
                            while (curr['parentCategory']._id) {
                                setAllProps([...allProps,...categories.filter(category=>category.name === e.target.value)[0].properties]);
                                curr = curr.parentCategory;
                            }
                        }} name="Current-Category" className="p-2 ring-0 outline-none rounded-lg text-black dark:text-white bg-gray-100 dark:bg-neutral-600">
                        <option className="dark:text-neutral-300" value='Select Category' disabled>{'Select Category'}</option>
                        {categories.length > 0 ? categories.map((category)=>{
                            return <option key={category._id} value={category.name}>{category.name}</option>
                        }) : null}
                    </select>
                    { allProps.length > 0 ?
                    <>
                    <h3 className="text-black mt-3 dark:text-white text-base font-bold">Properties</h3>
                    <div ref={propsError} className='text-red-500'></div>
                    {allProps.map((property,index)=>{
                        return <div key={index+property.name}>
                            <label htmlFor={property.name} className='block sm:text-sm italic text-sm dark:text-white'>{property.name} *</label>
                            <select key={categoryName+property.name} defaultValue={currentProperties[property.name] || 'Select Value'} onBlur={()=>propsError.current.innerHTML = ''} name={property.name} className="p-2 block mb-3 ring-0 outline-none rounded-lg text-black dark:text-white bg-gray-100 dark:bg-neutral-600"
                            onChange={(e)=>setCurrentProperties({...currentProperties,[property.name]:e.target.value})}>
                                <option className="dark:text-neutral-300" value='Select Value' disabled>{'Select Value'}</option>
                                {
                                    property['value'].split(',').map((value,index)=><option key={index+value} value={value}>{value}</option>)
                                }
                            </select>
                        </div>
                    })}
                    </>
                    : null}
                </div>

                <label className="text-black sm:text-base font-bold mb-0 pb-0 text-sm dark:text-white">Photos *</label>
                <div onDragEnter={(e)=>handleDrag(e)} onDrop={(e)=>handleDrop(e)} onDragLeave={(e)=>handleDrag(e)} onDragOver={(e)=>handleDrag(e)} className="mb-2 mt-0">
                    { Images.length > 0 ?
                    <>
                        <div className="text-base italic text-black dark:text-white">Saved images</div>
                        <div ref={savedImageError} className="text-red-500 mt-4 mb-4"></div>
                        <div className="flex gap-2 flex-wrap mb-4">
                            { Images.map((image,index)=>{
                                return <div key={index} className="relative w-40 h-40 mr-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img className="object-cover w-full h-full" src={`${image.link}`} alt="product-image" />
                                    <button type="button" title="Delete" onClick={(e)=>handleImageDeletion(e,image)} className="absolute -top-5 -right-5 bg-white dark:bg-zinc-800"><i className="fa-regular fa-circle-xmark fa-xl text-orange-500"></i></button>
                                </div>
                            })}
                        </div>
                        <br />
                    </>
                    :null
                    }
                    { tempImages.length > 0 ?
                    <>
                        <div className="text-xl text-black dark:text-white">Unsaved images</div>
                        <div className="flex gap-2 flex-wrap mb-4">
                            { tempImages.map((image,index)=>{
                                return <div key={`${index}-${image.name}`} className="relative w-40 h-40 mr-5">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img className="object-cover w-full h-full" src={`${URL.createObjectURL(image)}`} alt="product-image" />
                                    <button type="button" title="Delete" onClick={(e)=>handleTempImageDeletion(e,index)} className="absolute cursor-pointer -top-5 -right-5 bg-white dark:bg-zinc-800"><i className="fa-regular fa-circle-xmark fa-xl text-orange-500"></i></button>
                                </div>
                            })}
                        </div>
                    </>
                    :null
                    }
                    { tempImages.length === 0 && Images.length === 0 ?
                        <div className="text-black dark:text-white text-base">No Images for this product</div>
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
                    <label htmlFor='Product-Desc' className='sm:text-base font-bold text-sm dark:text-white'>Description *</label>
                    <textarea onBlur={()=>saveError.current.innerHTML = ''}  required placeholder="Description" name="Product-Desc" value={productDesc}
                    onChange={(e)=>setProductDesc(e.target.value)}
                    className="px-2 outline-0 w-full rounded-md h-32 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2">
                    </textarea>
                </div>

                <div className="flex flex-col">
                    <label htmlFor='Product-Contents' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>Contents *</label>
                    <textarea onBlur={()=>{
                        saveError.current.innerHTML = '';
                    }} required name="Product-Contents" placeholder="Product contents (comma separated)" value={productContents}
                    onChange={(e)=>setProductContents(e.target.value)}
                    className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>

                <div>
                    <label htmlFor='Product-Price' className='sm:text-base font-bold text-sm dark:text-white'>Price (Ksh) *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''}  type="number" required name="Product-Price" placeholder="Price" value={productPrice}
                    onChange={(e)=>setProductPrice(e.target.value ? e.target.valueAsNumber : 0)}
                    className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>

                <div>
                    <label htmlFor='Product-Discount' className='sm:text-base font-bold text-sm dark:text-white'>Discount (%) *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''}  type="number" required name="Discount" min={0} max={100} placeholder="Discount" value={productDiscountPercent}
                    onInput={(e)=>handleInputChange(e)}
                    onChange={(e)=>setProductDiscountPercent(e.target.value ? e.target.valueAsNumber : 0)}
                    className="px-2  outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>
                
                <div>
                    <label htmlFor='Product-Stock' className='sm:text-base font-bold text-sm dark:text-white'>Stock *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''}  type="number" required min={0} name="Stock" placeholder="Stock" value={productStock}
                    onChange={(e)=>setProductStock(e.target.value ? e.target.valueAsNumber : 0)}
                    className="px-2  outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
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

export default EditProduct;
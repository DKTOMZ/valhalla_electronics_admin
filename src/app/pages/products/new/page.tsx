'use client'
import { FormSubmitButton } from "@/components/form_submit_button";
import Layout from "@/components/Layout";
import Loading from "@/components/loading";
import Modal from "@/components/modal";
import {FrontendServices} from "@/lib/inversify.config";
import { Category, CategoryProperty } from "@/models/categories";
import { CurrenciesType } from "@/models/currencies";
import { GenericResponse } from "@/models/genericResponse";
import { HttpService } from "@/services/httpService";
import { UtilService } from "@/services/utilService";
import { ValidationService } from "@/services/validationService";
import { useRouter } from "next/navigation";
import React, { FormEvent, MutableRefObject, useEffect, useRef, useState } from "react";

const NewProduct: React.FC = () => {

    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');
    const validationService = FrontendServices.get<ValidationService>('ValidationService');
    const util = FrontendServices.get<UtilService>('UtilService');
    
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
    const [productCurrency,setProductCurrency] = useState('');
    const [productDiscountPercent,setProductDiscountPercent] = useState(0);
    const [productStock,setProductStock] = useState(0);
    const [tempImages,setTempImages] = useState<File[]>([]);
    const [saveSuccess,setSaveSuccess] = useState(false);
    const [loading,setLoading] = useState(false);
    const [loadingFetch,setLoadingFetch] = useState(true);
    const [uploading,setUploading] = useState(false);
    const [currencies, setCurrencies] = useState<CurrenciesType[]>([]);
    // const [isModalVisible,setIsModalVisible] = useState(false);
    const [dragActive,setDragActive] = useState(false);
    const [allProps,setAllProps] = useState<CategoryProperty[]>([]);
    
    //Element regs
    const saveError = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>;
    const imageBox = useRef<HTMLLabelElement>() as MutableRefObject<HTMLLabelElement>;
    const imageError = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;
    const imageField = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>;
    const propsError = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;
    const categoryError = useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;

    useEffect(()=>{
        if(!saveSuccess && loading) { 
            setLoading(false);
            router.push('/pages/products'); 
        }
    },[saveSuccess]);

    useEffect(()=>{ 
        const fetchCurrencies = async() => {
            return await http.get<CurrenciesType[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currencies/fetch`);
        };

        const fetchCategories = async() => {
            return await http.get<Category[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/categories/fetch`);
        };

        loadingFetch && fetchCurrencies().then(response => {
            if (response.status >= 200 && response.status<=299 && response.data) {
                setCurrencies(response.data);
                const first = response.data.at(0);
                if(first){
                    setProductCurrency(first.shortName);
                }
            }

            fetchCategories().then(response => {
                if (response.status >= 200 && response.status<=299 && response.data) {
                    setCategories([...response.data]);
                }
                setLoadingFetch(false);
            });
            
        }); 
    },[]);

    // useEffect(()=>{
    //     const fetchData = async() => {
    //         return await http.get<Category[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/categories/fetch`);
    //     };
    //     loadingFetch && fetchData().then(response => {
    //         if (response.status >= 200 && response.status<=299 && response.data) {
    //             setCategories([...response.data]);
    //         }
    //         setLoadingFetch(false);
    //     });
    // },[]);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files) {
            uploadImage(e.dataTransfer.files);
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

        if(!files){ return; }

        imageError.current.innerHTML = '';
        if ((files.length) > 3) {
            util.handleErrorInputField(imageError,'Only a max of 3 images is allowed');
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
        
        setLoading(true);

        if (categoryName === 'Select Category') {
            util.handleErrorInputField(categoryError,'Category is not selected');
            return setLoading(false);
        }
        
        if (Object.keys(currentProperties).length != allProps.length) {
            util.handleErrorInputField(propsError,'One or more of the property values is not selected');
            return setLoading(false);
        }
        
        if (tempImages.length < 3) {
            util.handleErrorInputField(imageError,'Please upload 3 images');
            imageBox.current.focus();
            return setLoading(false);
        }

        if (tempImages.length > 3) {
            util.handleErrorInputField(imageError,'Only a max of 3 images is allowed');
            imageBox.current.focus();
            return setLoading(false);
        }
        
        const postData = new FormData();
        tempImages.forEach((file,index)=>postData.append('image'+index,file));
        postData.append('productName', productName);
        postData.append('productBrand', productBrand);
        postData.append('productDescription', productDesc);
        postData.append('productContents', productContents);
        postData.append('productPrice', productPrice.toString());
        postData.append('categoryName', categoryName);
        postData.append('currentProperties', JSON.stringify(currentProperties));
        postData.append('discount', productDiscountPercent.toString());
        postData.append('stock', productStock.toString());
        postData.append('currency', productCurrency.toString());


        const response = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/products/save/`,
            postData
        );

        if (response.data.success ) {
            setSaveSuccess(true);
        } else {
            util.handleErrorInputField(saveError,response.data.error ?? response.statusText);
            setLoading(false);
        }
    };

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

    if (loadingFetch) { return <div>
        <title>Valhalla - New Product</title>
        <Layout><Loading screen={false} /></Layout>
    </div> }

    return (
        <Layout>
            <title>Valhalla - New Product</title>
            { saveSuccess ? <Modal key={'Save-Product'} callback={()=>setSaveSuccess(false)} body="Your product has been saved successfully!" title='Success'/> : null}
            <form onSubmit={(e)=>handleSubmit(e)} className="flex flex-col gap-4 xl:w-2/3 2xl:w-1/2 w-full mx-auto">
                <h2 className="text-black dark:text-white text-lg">Fill the form below to add a new product</h2>
                <div>
                    <label htmlFor='Product-Name' className='sm:text-base font-bold mb-0 text-sm dark:text-white'>Name *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''} type="text" required name="Product-Name" placeholder="Name" value={productName}
                    onChange={(e)=>setProductName(e.target.value)}
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
                            setCategoryName(curr.name);
                            setCurrentCategory(curr);
                            setAllProps([...curr.properties]);
                            while (curr['parentCategory']._id) {
                                setAllProps([...curr.properties,...curr['parentCategory'].properties]);
                                curr = curr.parentCategory;
                            }
                        }} name="Current-Category" className="p-2 ring-0 outline-none rounded-lg text-black dark:text-white bg-gray-100 dark:bg-neutral-600 border-orange-400 border">
                        <option className="dark:text-neutral-300" value='Select Category' disabled>{'Select Category'}</option>
                        {categories.length > 0 ? categories.map((category)=>{
                            return <option key={category._id} value={category.name}>{category.name}</option>
                        }) : null}
                    </select>
                    { allProps.length > 0 ? 
                    <>
                    <h3 className="text-black mt-3 dark:text-white text-base font-bold">Properties</h3>
                    <div ref={propsError} className='text-red-500'></div>
                    {allProps.length>0 ? allProps.map((property,index)=>{
                        if(property.custom){
                            return <div key={index+property.name}>
                                <label htmlFor={property.name} className='block sm:text-sm italic text-sm dark:text-white'>{property.name} *</label> 
                                <input key={categoryName+property.name} onBlur={()=>saveError.current.innerHTML = ''} type="text" required placeholder="Enter custom value" name={property.name}  value={currentProperties[property.name]}
                                    onChange={(e)=>{
                                        setCurrentProperties({...currentProperties, [property.name]:e.target.value});
                                    }}
                                    className="px-2 outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                            </div>
                        }
                        return <div key={index+property.name}>
                            <label htmlFor={property.name} className='block sm:text-sm font-bold text-sm dark:text-white'>{property.name} *</label> 
                            <select key={categoryName+property.name} defaultValue={'Select Value'} onBlur={()=>propsError.current.innerHTML = ''} name={property.name} className="p-2 block mb-3 ring-0 outline-none rounded-lg text-black dark:text-white bg-gray-100 dark:bg-neutral-600"
                            onChange={(e)=>setCurrentProperties({...currentProperties,[property.name]:e.target.value})}>
                                <option className="dark:text-neutral-300" value='Select Value' disabled>{'Select Value'}</option>
                                {
                                    property['value']?.split(',').map((value,index)=><option key={index+value} value={value}>{value}</option>) 
                                }
                            </select>
                        </div>
                    }): null}
                    </>
                    : null}
                </div>

                <label className="text-black sm:text-base font-bold mb-0 pb-0 text-sm dark:text-white">Photos *</label>
                <div onDragEnter={handleDrag} onDrop={handleDrop} onDragLeave={handleDrag} onDragOver={handleDrag} className="mb-2 mt-0">
                    { tempImages.length > 0 ? 
                    <div className="flex gap-2 flex-wrap mb-4">
                        { tempImages.map((image,index)=>{
                            return <div key={index} className="relative w-40 h-40 lg:w-52 lg:h-52 mr-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img className="object-cover w-full h-full" src={`${URL.createObjectURL(image)}`} alt="product-image" />
                                <button title="Delete" onClick={()=>setTempImages([...tempImages.slice(0,index),...tempImages.slice(index+1)])} className="absolute -top-5 -right-5 bg-white dark:bg-zinc-800"><i className="fa-regular fa-circle-xmark fa-xl text-orange-500"></i></button>
                            </div>
                        })}
                    </div>
                    : <div className="text-black dark:text-white text-base">No Images for this product</div>
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
                    <label htmlFor='Product-Price' className='sm:text-base font-bold text-sm dark:text-white'>Price *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''}  type="number" required name="Product-Price" placeholder="Price" value={productPrice}
                    onChange={(e)=>setProductPrice(e.target.value ? e.target.valueAsNumber : 0)}
                    className="px-2  outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>

                <div>
                    <label htmlFor='ProductCurrency' className='block sm:text-base font-bold text-sm dark:text-white'>Currency *</label>
                    <select value={productCurrency} onChange={(e)=>{setProductCurrency(e.target.value)
                        }} name="ProductCurrency" className="p-2 w-full ring-0 outline-none rounded-lg text-black dark:text-white bg-gray-100 dark:bg-neutral-600 border-orange-400 border">
                        {currencies.length > 0 ? currencies.map((currency,index)=>{
                            return <option key={currency._id+index} value={currency.shortName}>{currency.shortName}</option>
                        }) : null}
                    </select>
                </div>

                <div>
                    <label htmlFor='Product-Discount' className='sm:text-base font-bold text-sm dark:text-white'>Discount (%) *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''}  type="number" required name="Discount" min={productDiscountPercent} max={100} placeholder="Discount" value={productDiscountPercent}
                    onInput={(e)=>handleInputChange(e)}
                    onChange={(e)=>setProductDiscountPercent(e.target.value ? e.target.valueAsNumber : 0)}
                    className="px-2  outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>
 
                <div>
                    <label htmlFor='Product-Stock' className='sm:text-base font-bold text-sm dark:text-white'>Stock *</label>
                    <input onBlur={()=>saveError.current.innerHTML = ''}  type="number" min={0} required name="Stock" placeholder="Stock" value={productStock}
                    onChange={(e)=>setProductStock(e.target.value ? e.target.valueAsNumber : 0)}
                    className="px-2  outline-0 w-full rounded-md h-10 ring-1 dark:bg-neutral-600 dark:text-white ring-orange-400 outline-orange-400 focus:ring-2"/>
                </div>
                <div ref={saveError} className='text-red-500 text-center'></div>
                <FormSubmitButton disabled={loading} text={loading ? 'Creating' : 'Create'} className="!ml-auto !w-fit !p-5"/>
            </form>
        </Layout>
    );
};

export default NewProduct;
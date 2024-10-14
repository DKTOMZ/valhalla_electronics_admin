'use client'
import Layout from "@/components/Layout";
import { Collapse } from "@/components/collapse";
import ErrorPage from "@/components/error";
import { FormSubmitButton } from "@/components/form_submit_button";
import Loading from "@/components/loading";
import Modal from "@/components/modal";
import {FrontendServices} from "@/lib/inversify.config";
import { DeliveryStatus } from "@/models/deliveryStatus";
import { OrderType } from "@/models/order";
import { PaymentStatus } from "@/models/paymentStatusEnum";
import { HttpService } from "@/services/httpService";
import { UtilService } from "@/services/utilService";
import { useRouter, useSearchParams } from "next/navigation";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";

const ViewOrder: React.FC = () => {

    //Services
    const router = useRouter();
    const http = FrontendServices.get<HttpService>('HttpService');
    const util = FrontendServices.get<UtilService>('UtilService');

    //State variables
    const [saveSuccess,setSaveSuccess] = useState(false);
    const [loadingSave,setLoadingSave] = useState(false);
    const [loading,setLoading] = useState(true);
    const [orderExists,setOrderExists] = useState(true);
    const [orderId] = useState(useSearchParams().get('id'));
    const [order,setOrder] = useState<OrderType>();

    const commonFieldsStyle = "border-b mt-4 border-bottom dark:border-zinc-500 border-zinc-700 flex flex-row items-end";
    const commonKeyStyle = "font-bold w-2/5";
    const commonValueStyle = "dark:text-zinc-100 w-3/5 text-zinc-700 text-sm break-words";

    //Element refs
    const saveError = useRef<HTMLElement>() as MutableRefObject<HTMLDivElement>;

    useEffect(()=>{
        if(!saveSuccess && loadingSave) { 
            setLoadingSave(false);
            router.push('/pages/orders'); 
        }
    },[saveSuccess])

    useEffect(()=>{
        const fetchData = async() => {
            return await http.get<OrderType>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/orders/fetch?id=${orderId}`);
        };

        loading && fetchData().then(response => {
            if (response.status >= 200 && response.status<=299 && response.data) {
                setOrder(response.data);
            }

            if(!response) {
                setOrderExists(false);
            }

            setLoading(false);
        });
    },[http, loading, orderId]);

    const handleDispatch = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoadingSave(true);
    };

    
    if(!orderId || !orderExists) {
        return <ErrorPage title="Error: 404" error="Missing order Id. This order may not exist anymore." />;
    }


    if (loading) { return <div>
        <title>Valhalla - View Order</title>
        <Layout><Loading screen={false} /></Layout>
    </div>
    }

    return (
        <Layout>
            <title>Valhalla - View Order</title>
            { saveSuccess ? <Modal key={'Save-Category'} callback={()=>{
                setSaveSuccess(false);
            }} body="Your order has been dispatched successfully!" title={'Success!'}/> : null}
            {order ? <form onSubmit={(e)=>{handleDispatch(e)}} className="flex flex-col gap-4 xl:w-2/3 2xl:w-1/2 w-full mx-auto">
                <h2 className="text-black dark:text-white text-lg">View Order below</h2>

                <div className="flex mb-4 pb-4 pt-4 text-black dark:text-white flex-col w-full border rounded-md dark:border-gray-400 border-zinc-800 px-4 overflow-hidden">
                    <div className="rounded-2xl max-md:rounded-xl max-sm:h-6 max-sm:w-6 border-4 dark:border-zinc-300 border-zinc-700 h-8 w-8 mx-auto"></div>
                    <h2 className="text-black text-lg dark:text-white mt-4 mx-auto">ORDER INFORMATION</h2>
                    <div className="mx-2">
                        <div className={commonFieldsStyle}>
                            <div className={commonKeyStyle}>Date:</div>
                            <div className={commonValueStyle}>{util.formatDateTime(order.created?.toString()??'')}</div>
                        </div>
                        <div className={commonFieldsStyle}>
                            <div className={commonKeyStyle}>Order Number:</div>
                            <div className={commonValueStyle}>{order.orderId}</div>
                        </div>
                        <div className={commonFieldsStyle}>
                            <div className={commonKeyStyle}>Payment Method:</div>
                            <div className={commonValueStyle}>{order.paymentMethod.toUpperCase()}</div>
                        </div>
                        <div className={commonFieldsStyle}>
                            <div className={commonKeyStyle}>Receipt Number:</div>
                            <div className={commonValueStyle}>{order.paymentId}</div>
                        </div>
                        <div className={commonFieldsStyle}>
                            <div className={commonKeyStyle}>Payment Status:</div>
                            <div className={`${commonValueStyle} ${order.paymentStatus == PaymentStatus.PAID ? '!text-green-500' : order.paymentStatus == PaymentStatus.UNPAID ? '!text-red-500': ''}`}>{order.paymentStatus.toUpperCase()}</div>
                        </div>
                        <div className={commonFieldsStyle}>
                            <div className={commonKeyStyle}>Number of items bought:</div>
                            <div className={commonValueStyle}>{order.products.length}</div>
                        </div>
                        <div className={`border-b mt-4 border-bottom dark:border-zinc-500 border-zinc-700`}>
                            {order.products.map((p,i)=>{
                                return  <div key={i} className={`${commonFieldsStyle} !border-b-0`}>
                                <div className={commonKeyStyle}>Item{order.products.length>1 ? ' '+i+1: ''}:</div>
                                <div className={commonValueStyle}>{p.name}</div>
                            </div>
                            })}
                        </div>
                        <div className={commonFieldsStyle}>
                            <div className={commonKeyStyle}>Subtotal:</div>
                            <div className={commonValueStyle}>{order.currency + ' ' + order.subTotal}</div>
                        </div>
                        <div className={commonFieldsStyle}>
                            <div className={commonKeyStyle}>Shipping:</div>
                            <div className={commonValueStyle}>{order.shippingRate}</div>
                        </div>
                        <div className={commonFieldsStyle}>
                            <div className={commonKeyStyle}>Total:</div>
                            <div className={commonValueStyle}>{order.currency + ' ' + order.total}</div>
                        </div>
                    </div>
                </div>

                {order.deliveryStatus == DeliveryStatus.PENDING ? 
                    <Collapse title="Dispatch" className="w-full" key={'Dispatch-Collapse'}>
                        <div ref={saveError} className='text-red-500 text-center'></div>
                        <FormSubmitButton disabled={loadingSave} text={loadingSave ? 'Dispatching' : 'Dispatch'} className="!ml-auto !w-fit !p-5"/>
                    </Collapse>
                :
                order.deliveryStatus == DeliveryStatus.DISPATCHED ?
                    <Collapse title="Update to Delivered" className="w-full" key={'Deliver-Collapse'}>
                        <div ref={saveError} className='text-red-500 text-center'></div>
                        <FormSubmitButton disabled={loadingSave} text={loadingSave ? 'Update to Delivered' : 'Updating'} className="!ml-auto !w-fit !p-5"/>
                    </Collapse>
                : null
                }
            </form> : null}
        </Layout>
    );
};

export default ViewOrder;
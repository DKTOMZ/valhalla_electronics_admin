'use client'
import React, { useState } from "react";

interface ModalProps {
    title: string,
    body: string,
    callback: Function,
    decision?: { 
        yes: {text: string, callback: Function},
        no: {text: string, callback: Function}
    }
}

/**
 * Modal component to show user information
 * @param props
 * @param props.title
 * Title of the modal
 * @param props.body
 * Body of the modal
 * @param props.callback
 * Function to close/dismiss the modal
 * @param props.decision
 * (Optional) include if you want 2 buttons for yes and no decision.
 */
const Modal: React.FC<ModalProps> = ({title,body,callback,decision=null}) => {
    
    const [isZoomed,setIsZoomed] = useState(false);

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            setIsZoomed(!isZoomed);
            setTimeout(() => {
                setIsZoomed(false);
            }, 2000);
        }
    };
    return (
        <>
                <div className="fixed inset-0 flex pointer-events-none items-center justify-center z-20">
                    <div onClick={(e)=>handleBackdropClick(e)} className="fixed pointer-events-auto inset-0 bg-neutral-700 opacity-20 dark:bg-gray-500"></div>
                        <div className={`bg-gray-100 ${isZoomed && 'animate-wiggle'} pointer-events-auto dark:bg-zinc-800 rounded-lg p-4 relative z-20`}>
                            <h2 className="text-lg text-black dark:text-white font-bold mb-4">{title}</h2>
                            <p className="mb-6 text-black dark:text-gray-200">{body}</p>
                            { decision ?
                                <div className="flex justify-center items-center">
                                    <button
                                        className="bg-green-600 md:hover:bg-green-500 max-md:active:bg-green-500 mr-3 text-white font-bold py-1 px-2 rounded"
                                        onClick={()=>{
                                            decision['yes'].callback();
                                        }}
                                    >
                                        {decision['yes'].text}
                                    </button>
                                    <button
                                        className="bg-orange-600 md:hover:bg-orange-500 max-md:active:bg-orange-500 text-white font-bold py-1 px-2 rounded"
                                        onClick={()=>{
                                            decision['no'].callback();
                                        }}
                                    >
                                        {decision['no'].text}
                                    </button>
                                </div> 
                            : 
                                <div className="flex justify-center items-center">
                                    <button
                                        className="bg-orange-600 md:hover:bg-orange-500 max-md:active:bg-orange-500 text-white font-bold py-1 px-2 rounded"
                                        onClick={()=>{
                                            callback();
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            }
                        </div>
                </div>
        </>
    );
};

export default Modal;
import React from "react";

interface LoadingProps {
    height?: string,
    width?: string,
    screen?: boolean
}   

/**
 * Loading component
 * @param props
 * @param props.height
 * Height of the modal
 * @param props.width
 * Width of the modal
 * @param props.screen
 * Whether to set modal to occupy full screen (default true)
 */
const Loading: React.FC<LoadingProps> = ({height='h-48',width='w-48',screen=true}) => {
    return (
        <div className={`flex justify-center items-center ${screen ? 'h-screen' : ''} `}>
            <div
                className={`inline-block ${height} ${width} animate-spin rounded-full border-4 border-solid border-current
                 border-r-transparent align-[-0.125em] text-orange-400 
                 motion-reduce:animate-[spin_1.5s_linear_infinite]`}
                role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0
                 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
        </div>
    );
};

export default Loading;
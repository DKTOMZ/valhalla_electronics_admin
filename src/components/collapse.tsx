import { MutableRefObject, ReactNode, useEffect, useRef, useState } from "react";

interface CollapseOptions {
    title: string,
    children: ReactNode,
    className?: string
}

/** Collapse component */
export const Collapse: React.FC<CollapseOptions> = ({title, children, className}) => {
    const [show, setShow] = useState(false);
    const [height, setHeight] = useState<string | number>('48px');
    const contentRef = useRef<HTMLDivElement>(null) as MutableRefObject<HTMLDivElement>;

    useEffect(() => {
        if (contentRef.current) {
            if (show) {
                // When opening, set the height to the scrollHeight to trigger the transition
                setHeight(contentRef.current.scrollHeight + 68);
            } else {
                // When closing, set the height to 0 to trigger the transition
                setHeight('48px');
            }
        }
    }, [show, children]);

    // To handle dynamic content changes inside the collapse
    useEffect(() => {
        if (show && contentRef.current) {
            const handleResize = () => {
                setHeight(contentRef.current.scrollHeight+68);
            };

            const observer = new MutationObserver(handleResize);
            observer.observe(contentRef.current, {
                childList: true,
                subtree: true,
            });

            // Initial height calculation
            handleResize();

            return () => observer.disconnect();
        }
    }, [show, children]);

    return (
        <div
            style={{ height }}
            className={`mb-4 flex ${className} flex-col gap-y-1 border rounded-md dark:border-gray-400 border-zinc-800 overflow-hidden transition-height duration-300 ease-in-out`}
        >
            <button type="button"
                id="collapse-button"
                style={{ borderBottomWidth: '1px' }}
                className="w-full border-black dark:border-white flex flex-row justify-between items-center outline-none p-3 transition-all duration-300"
                onClick={() => setShow(!show)}
            >
                <p className="text-base text-zinc-800 dark:text-gray-200">{title}</p>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className={` ${show ? 'rotate-180 duration-300' : ''} transition-all duration-500 w-6 h-6 text-zinc-800 dark:text-gray-200`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
            <div id="collapse-content" ref={contentRef} className="px-4 mb-4 mt-2">
                {children}
            </div>
        </div>
    );
};

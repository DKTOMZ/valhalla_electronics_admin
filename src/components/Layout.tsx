import React, { useEffect, useRef, useState } from "react";
import Nav from "./Nav";

interface LayoutProps {
    children: React.ReactNode
}

const Layout: React.FC<LayoutProps>  = ({ children }) => {
    const navRef = useRef(null);
    const [showNav,setShowNav] = useState(false);
    const [showNavLg,setShowNavLg] = useState(false);

    useEffect(() => {
        function handleResize() {
          window.innerWidth >=1024 && setShowNavLg(true);
          window.innerWidth < 1024 && setShowNavLg(false);
        }
    
        // Initial check on component mount
        handleResize();
    
        // Add event listener for window resize
        window.addEventListener('resize', handleResize);
    
        // Remove event listener on component unmount
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);

    return (
        <div className="bg-gray-100 dark:bg-zinc-900">
            <div className="fixed lg:hidden dark:bg-zinc-900 bg-gray-100 w-full py-2 px-4 z-10">
                <div className="flex flex-row justify-between items-center">
                    <div className="text-black dark:text-white text-lg"><i className="fa-solid fa-display"></i> VALHALLA ADMIN</div>
                    <button onClick={()=>setShowNav(!showNav)} className="dark:text-white text-black text-right">{<i className="fa-solid fa-bars fa-xl"></i>}</button>
                </div>
            </div>
            <div className="min-h-screen flex bg-gray-100 dark:bg-zinc-900">
                <div ref={navRef} style={{height:'inherit'}} className={`${showNav ? 'w-full ': 'overflow-hidden w-0'} z-10 ${ showNavLg ? 'overflow-auto w-auto lg:w-80 xl:w-80' : 'transition-width duration-300'}`}><Nav showNav setShowNav={setShowNav}/></div>
                <div className={`flex-grow ${showNav ? 'hidden': 'block'} lg:block p-7 bg-gray-100 dark:bg-zinc-900 rounded-lg mr-2 mt-8`}>
                    { children }
                </div>
            </div>
        </div>
    );
};

export default Layout;
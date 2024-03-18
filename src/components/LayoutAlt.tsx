import React, { useEffect, useState } from "react";
import Loading from "./loading";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {AppTheme} from "@/app/appTheme";

interface LayoutProps {
    children: React.ReactNode
}

const LayoutAlt: React.FC<LayoutProps>  = ({ children }) => {
    const [appTheme, setAppTheme] = useState<AppTheme | null>();

    const setDarkTheme = () => {
        if (!document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme',AppTheme.DARK);
            setAppTheme(AppTheme.DARK);
        }
    }

    const setLightTheme = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme',AppTheme.LIGHT);
            setAppTheme(AppTheme.LIGHT);
        }
    }

    const setDeviceTheme = () => {
        localStorage.removeItem('theme');
        const systemThemeDark = window.matchMedia('(prefers-color-scheme: dark)');
        if (systemThemeDark.matches) {
            document.documentElement.classList.add('dark');
            setAppTheme(AppTheme.DARK);
        } else {
            document.documentElement.classList.remove('dark');
            setAppTheme(AppTheme.LIGHT);
        }
    }

    useEffect(()=>{
        if (typeof window !== 'undefined') {
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
                setAppTheme(AppTheme.DARK);
            } else {
                document.documentElement.classList.remove('dark');
                setAppTheme(AppTheme.LIGHT);
            }
        }
    },[]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleMediaChange = () => {
            if (!('theme' in localStorage)) {
                if(mediaQuery.matches) {
                    document.documentElement.classList.add('dark');
                    setAppTheme(AppTheme.DARK);
                } else {
                    document.documentElement.classList.remove('dark');
                    setAppTheme(AppTheme.LIGHT)
                }
            }
        };
        mediaQuery.addEventListener('change', handleMediaChange);
        return () => {
          mediaQuery.removeEventListener('change', handleMediaChange);
        };
      }, []);

      const { data: session , status } = useSession();
    
      if (status === 'loading') {
        return (
          <Loading />
        );
      }

      return (
        <div>
            <div className="mt-2 flex flex-col gap-y-2">
                <div className="flex-row gap-x-2 flex h-10 w-full justify-end items-center pr-2">
                    <button className="dark:text-gray-200 text-black" onClick={()=>setDeviceTheme()} >{<i title="Use Device Theme" className="fa-solid fa-circle-half-stroke fa-xl"></i>}</button>
                    <button className={`dark:text-gray-200 text-black ${appTheme === AppTheme.DARK && 'hidden'}`} onClick={()=>setDarkTheme()}>{<i title="Toggle Dark Mode" className="fa-regular fa-moon fa-xl"></i>}</button>
                    <button className={`dark:text-gray-200 text-black ${appTheme === AppTheme.LIGHT && 'hidden'}`} onClick={()=>setLightTheme()}>{<i title="Toggle Light Mode" className="fa-regular fa-sun fa-xl"></i>}</button>
                </div>
            </div>
            {children}
        </div>
      );
}

export default LayoutAlt;
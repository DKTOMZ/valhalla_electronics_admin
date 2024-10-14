'use client'
import {default as Layout} from "@/components/Layout";
import React, {useEffect, useState} from "react";
import {AppTheme} from "@/app/appTheme";

const Settings: React.FC = () => {
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
      
    return (
        <Layout>
            <title>Valhalla - Settings</title>
            <div className="xl:w-2/3 2xl:w-1/2 w-full mx-auto">
                <p className="text-black text-lg dark:text-white mb-6">
                    Settings
                </p>
                <div className="flex flex-col gap-y-5 items-start">
                    <button className="dark:text-white text-base text-black md:hover:text-orange-500 max-md:active:text-orange-500" onClick={()=>setDeviceTheme()} >{<i className="fa-solid fa-circle-half-stroke fa-xl"></i>} Use Device Theme</button>
                    <button className={`dark:text-white text-base text-black md:hover:text-orange-500 max-md:active:text-orange-500 ${appTheme === AppTheme.DARK && 'hidden'}`} onClick={()=>setDarkTheme()}>{<i className="fa-regular fa-moon fa-xl"></i>} Toggle Dark Mode</button>
                    <button className={`dark:text-white text-base text-black md:hover:text-orange-500 max-md:active:text-orange-500 ${appTheme === AppTheme.LIGHT && 'hidden'}`} onClick={()=>setLightTheme()}>{<i className="fa-regular fa-sun fa-xl"></i>} Toggle Light Mode</button>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
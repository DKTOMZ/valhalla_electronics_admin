'use client'
import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { redirect, RedirectType, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Loading from "@/components/loading";
import { useRouter } from "next/navigation";

/**
* Home component for an authenticated user.
*/
const AdminHome: React.FC = () => {
    //Get current user session
    const { data: session, status } = useSession();
    const router = useRouter();
    //Incoming params
    const [oAuthError,setOAuthError] = useState(useSearchParams().get("error"));

    if(status === 'loading') {
        return <Loading />;
    }

    if(!session && status==='unauthenticated'){
        oAuthError ? redirect(`/pages/auth/login?error=${oAuthError}`,RedirectType.replace)
        : redirect(`/pages/auth/login`, RedirectType.replace);
    }

    return (
        <Layout>
            <title>Valhalla - Home</title>
            <div className="xl:w-2/3 2xl:w-1/2 w-full mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className="text-black dark:text-white text-lg">
                        Welcome Admin
                    </p>
                    {
                    <div>
                        {session && session.user && session.user.image ? <Image className="inline rounded-full" height={30} width={30} referrerPolicy="no-referrer" src={session.user.image} alt="Avatar"/>
                        :<i className="fa-solid fa-user fa-lg text-black dark:text-white"></i>
                        }
                        {session && session.user && session.user.name ? 
                        <p className="font-bold inline text-lg text-orange-600 pl-2">{ session.user.name }</p>
                        : null}
                    </div>
                    }
                </div>
                <p className="text-sm hidden md:block text-black dark:text-white">{new Date(Date.now()).toDateString()}</p>
            </div>
        </Layout>
    );
};

export default AdminHome;
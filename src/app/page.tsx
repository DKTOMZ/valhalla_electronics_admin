'use client'
import { useSession } from 'next-auth/react'
import Loading from '@/components/loading';
import { redirect } from 'next/navigation';
import {useEffect} from "react";
import AdminHome from './pages/home/page';
import Login from './pages/auth/login/page';

/**
 * Home component of the application.
 */
const Home = () => {

  return <Login />

}

export default Home;

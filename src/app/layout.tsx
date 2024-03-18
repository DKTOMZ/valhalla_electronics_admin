'use client'
import { SessionProvider } from 'next-auth/react'
import './globals.css'
import { ABeeZee } from 'next/font/google'
import Script from 'next/script'
import { Session } from 'next-auth'
import { useEffect, useState } from 'react'

const inter = ABeeZee({ subsets: ['latin'], weight: '400' })

enum AppTheme {
  DARK = 'dark',
  LIGHT = 'light',
}

export default function RootLayout({ children, session }: {children: React.ReactNode, session: Session}) {
  const [appTheme, setAppTheme] = useState<AppTheme | null>();
  
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

  return (
    <html lang="en">
      <Script src='https://kit.fontawesome.com/086823c0ac.js' crossOrigin='anonymous'></Script>
      <body className={inter.className + ' bg-gray-100 dark:bg-zinc-900'}>
        <div className='bg-gray-100 dark:bg-zinc-900 h-full'>
          <SessionProvider session={session}>
            {children}
          </SessionProvider> 
        </div>
      </body>
    </html>
  )
}

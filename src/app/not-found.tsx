'use client';
import LayoutAlt from "@/components/LayoutAlt";

const NotFound: React.FC = () => {
    return (
        <LayoutAlt>
            <title>404 - Not Found</title>
            <div className="flex flex-col items-center justify-start pt-8 h-screen bg-gray-100 dark:bg-zinc-900">
                <img src="/not-found.svg" className={`dark:hidden`} height={200} width={200} />
                <img src="/not-found_dark.svg" className={`dark:block hidden`} height={200} width={200} />
                <h3 className="text-lg text-black dark:text-white">Oops! | This page could not be found</h3>
            </div>
        </LayoutAlt>
    );
}

export default NotFound;
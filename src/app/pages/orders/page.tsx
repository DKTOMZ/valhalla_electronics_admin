'use client'
import { default as Layout } from "@/components/Layout";
import React from "react";

const Orders: React.FC = () => {
    return (
        <Layout>
            <title>Valhalla - Orders</title>
            <p className="text-black text-lg dark:text-white">
                Orders
            </p>
        </Layout>
    );
};

export default Orders;
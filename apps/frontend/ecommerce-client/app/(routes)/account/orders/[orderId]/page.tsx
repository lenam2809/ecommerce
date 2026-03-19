"use client"

import { OrderDetails } from "@/components/account/order-details";
import { useOrder } from "@/hooks/use-orders";
import { useParams } from "next/navigation";
import React from "react";

export default function OrderDetailPage() {
    const params = useParams()
    const orderId = params.orderId as string

    // Fetch product data
    const { data: order, isLoading, error } = useOrder(orderId)

    if (error) return <div>Lỗi khi tải đơn hàng</div>;

    return (
        <div>
            <OrderDetails order={order} isLoading={isLoading} />
        </div>
    );
}
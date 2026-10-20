"use client"

import { OrderDetails } from "@/components/account/order-details"
import { useOrder } from "@/hooks/use-orders"
import { useParams } from "next/navigation"
import React from "react"

export default function OrderDetailPage() {
    const params = useParams()
    const orderId = params.orderId as string

    const { data: order, isLoading } = useOrder(orderId)

    return (
        <div>
            <OrderDetails order={order} isLoading={isLoading} />
        </div>
    )
}

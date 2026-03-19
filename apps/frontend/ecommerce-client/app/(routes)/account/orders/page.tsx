"use client"

import { OrdersTab } from "@/components/account/orders-tab"
import { useMyOrders } from "@/hooks/use-orders"

export default function OrderPage() {
    const { data: orders, isLoading: isLoadingOrders } = useMyOrders()
    return (
        <>
            <OrdersTab orders={orders} isLoadingOrders={isLoadingOrders} />
        </>
    )
}
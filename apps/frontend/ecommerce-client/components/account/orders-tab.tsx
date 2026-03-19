"use client"

import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { OrderItem } from "./order-item"
import Link from "next/link"
import { Order } from "@/types/order"

export function OrdersTab({ orders, isLoadingOrders }: {
    orders: Order[] | undefined
    isLoadingOrders: boolean
}) {
    return (
        <div className="glass-card rounded-3xl p-8 border-border/50 min-h-[500px]">
            <h2 className="text-2xl font-bold tech-heading mb-6 pl-2 border-l-4 border-primary/50 flex items-center">
                Đơn hàng của tôi
            </h2>

            <div className="mt-2">
                {isLoadingOrders ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : orders && orders.length > 0 ? (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <OrderItem key={order.id} order={order} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 flex flex-col items-center">
                        <div className="h-24 w-24 rounded-full bg-secondary/30 flex items-center justify-center mb-6">
                            <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 tech-heading">Chưa có đơn hàng nào</h3>
                        <p className="text-muted-foreground mb-8 max-w-sm">
                            Bạn chưa có đơn hàng nào. Hãy khám phá các sản phẩm công nghệ mới nhất ngay!
                        </p>
                        <Button
                            className="btn-glow rounded-full px-8 py-6 text-base"
                            asChild
                        >
                            <Link href="/products">Mua sắm ngay</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
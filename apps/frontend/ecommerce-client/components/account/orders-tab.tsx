"use client"

import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { OrderItem } from "./order-item"
import Link from "next/link"
import { Order } from "@/types/order"

/**
 * OrdersTab — Editorial Minimal
 */
export function OrdersTab({ orders, isLoadingOrders }: {
    orders: Order[] | undefined
    isLoadingOrders: boolean
}) {
    return (
        <div className="rounded-3xl border border-line bg-card p-6 md:p-8 shadow-xs min-h-[500px]">
            <div className="mb-6">
                <p className="text-tiny font-bold uppercase tracking-widest text-brand mb-1">Lịch sử giao dịch</p>
                <h2 className="text-h2 font-bold tracking-tight text-ink">Đơn hàng của tôi</h2>
                <p className="text-small text-ink-soft mt-1">Theo dõi trạng thái và lịch sử tất cả các đơn hàng</p>
            </div>

            <div className="mt-2">
                {isLoadingOrders ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    </div>
                ) : orders && orders.length > 0 ? (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <OrderItem key={order.id} order={order} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 flex flex-col items-center">
                        <div className="h-24 w-24 rounded-full bg-surface flex items-center justify-center mb-6">
                            <Package className="h-10 w-10 text-ink-faint" />
                        </div>
                        <h3 className="text-h3 font-semibold text-ink mb-2">Chưa có đơn hàng nào</h3>
                        <p className="text-ink-soft mb-8 max-w-sm">
                            Bạn chưa có đơn hàng nào. Hãy khám phá các sản phẩm công nghệ mới nhất ngay!
                        </p>
                        <Button
                            className="rounded-full px-8 h-12 bg-brand text-white hover:bg-brand-hover text-small font-semibold"
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

"use client"

import { useState } from "react"
import { OrderItem } from "./order-item"
import { Order } from "@/types/order"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function OrdersTab({
    orders = [],
    isLoadingOrders,
}: {
    orders?: Order[]
    isLoadingOrders?: boolean
}) {
    const [filterStatus, setFilterStatus] = useState<string>("all")

    const orderList = orders || []

    const filteredOrders =
        filterStatus === "all"
            ? orderList
            : orderList.filter((o) => {
                  const s = String(o.status || "").toLowerCase()
                  if (filterStatus === "shipping") {
                      return s === "shipping" || s === "shipped" || s === "2"
                  }
                  if (filterStatus === "delivered") {
                      return s === "delivered" || s === "3"
                  }
                  if (filterStatus === "pending") {
                      return s === "pending" || s === "processing" || s === "0" || s === "1"
                  }
                  return s === filterStatus.toLowerCase()
              })

    const countShipping = orderList.filter((o) => {
        const s = String(o.status || "").toLowerCase()
        return s === "shipping" || s === "shipped" || s === "2"
    }).length

    const countDelivered = orderList.filter((o) => {
        const s = String(o.status || "").toLowerCase()
        return s === "delivered" || s === "3"
    }).length

    return (
        <div className="space-y-6">
            {/* Header & Status Filter Tabs */}
            <div className="rounded-2xl border border-line bg-card p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-widest text-tech-blue mb-1">
                            Lịch sử giao dịch &amp; Bảo hành điện tử 2026
                        </p>
                        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-ink">
                            Quản lý &amp; Chi tiết đơn hàng ({orderList.length})
                        </h2>
                        <p className="text-xs text-ink-soft mt-1">
                            Tra cứu hành trình giao nhận, thông tin bảo hành thiết bị và hóa đơn điện tử GTGT
                        </p>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { key: "all", label: `Tất cả đơn (${orderList.length})` },
                        { key: "shipping", label: `Đang giao hàng (${countShipping})` },
                        { key: "delivered", label: `Đã hoàn tất (${countDelivered})` },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setFilterStatus(tab.key)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                filterStatus === tab.key
                                    ? "bg-tech-blue text-white shadow-xs"
                                    : "bg-surface text-ink-soft hover:text-ink hover:bg-surface-2"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Order List / Skeleton / Empty State */}
            {isLoadingOrders ? (
                <div className="space-y-4">
                    <Skeleton className="h-44 rounded-2xl w-full" />
                    <Skeleton className="h-44 rounded-2xl w-full" />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-line bg-card">
                    <div className="w-14 h-14 rounded-2xl bg-tech-blue/10 text-tech-blue flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="h-7 w-7" />
                    </div>
                    <h3 className="text-base font-bold text-ink mb-1">
                        Chưa có đơn hàng nào
                    </h3>
                    <p className="text-xs text-ink-soft max-w-md mx-auto mb-6 leading-relaxed">
                        Quý khách chưa có đơn hàng nào trong mục này. Hãy khám phá hệ sinh thái sản phẩm công nghệ chính hãng tại ShopViet.
                    </p>
                    <Button
                        asChild
                        className="rounded-xl bg-tech-blue text-white hover:bg-tech-blue/90 text-xs font-bold h-10 px-6 shadow-xs"
                    >
                        <Link href="/products">
                            Khám phá sản phẩm
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <OrderItem key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    )
}

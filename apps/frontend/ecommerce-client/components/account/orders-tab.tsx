"use client"

import { useState } from "react"
import { OrderItem } from "./order-item"
import { Order } from "@/types/order"
import { OrderDetails } from "./order-details"

export const SSOT_DEFAULT_ORDERS: Order[] = [
    {
        id: "ORD-20261019-8892",
        code: "ORD-20261019-8892",
        orderDate: "19/10/2026 • 14:32",
        status: "Shipping",
        totalAmount: 62390000,
        shippingAddress:
            "Tầng 18, Tòa nhà Vietcombank Tower, Số 5 Công Trường Mê Linh, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        phone: "0909 686 868",
        email: "quan.nguyen@shopviet.vn",
        discountCode: "TECHVIP500",
        deliveryInstructions: "Giao giờ hành chính, gọi trước 15 phút",
        expectedDeliveryDate: "19/10/2026 • Trước 16:30",
        orderItems: [
            {
                productId: "macbook-pro-14-m3-pro-2026",
                name: "MacBook Pro 14 inch M3 Pro 2026 (18GB RAM | 512GB SSD) — Chính hãng Apple Việt Nam",
                unitPrice: 61990000,
                quantity: 1,
                image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
                color: "Space Black",
                size: "18GB / 512GB",
            },
            {
                productId: "ugreen-type-c-100w-2m",
                name: "Cáp sạc nhanh Ugreen Type-C to Type-C 100W PD 3.0 bọc dù 2m",
                unitPrice: 450000,
                quantity: 2,
                image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&auto=format&fit=crop&q=80",
                color: "Xám Titan",
                size: "2m / 100W",
            },
        ],
    },
    {
        id: "ORD-20260928-6410",
        code: "ORD-20260928-6410",
        orderDate: "28/09/2026 • 10:15",
        status: "Delivered",
        totalAmount: 34990000,
        shippingAddress:
            "Tầng 18, Tòa nhà Vietcombank Tower, Số 5 Công Trường Mê Linh, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        phone: "0909 686 868",
        email: "quan.nguyen@shopviet.vn",
        expectedDeliveryDate: "28/09/2026 • Đã giao lúc 11:45",
        orderItems: [
            {
                productId: "iphone-16-pro-max-256gb",
                name: "iPhone 16 Pro Max 256GB Titan Tự Nhiên — Chính hãng VN/A",
                unitPrice: 34990000,
                quantity: 1,
                image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
                color: "Titan Tự Nhiên",
                size: "256GB",
            },
        ],
    },
]

export function OrdersTab({
    orders,
}: {
    orders: Order[] | undefined
    isLoadingOrders: boolean
}) {
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [showInlineDetail, setShowInlineDetail] = useState<boolean>(true)

    const displayOrders = orders && orders.length > 0 ? orders : SSOT_DEFAULT_ORDERS
    const filteredOrders =
        filterStatus === "all"
            ? displayOrders
            : displayOrders.filter(
                  (o) => o.status.toLowerCase() === filterStatus.toLowerCase()
              )

    return (
        <div className="space-y-6">
            {/* Header & Status Filter Tabs */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-widest text-primary mb-1">
                            Lịch sử giao dịch &amp; Bảo hành điện tử 2026
                        </p>
                        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Quản lý &amp; Chi tiết đơn hàng
                        </h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Tra cứu hành trình giao nhận GHN Express 2H, mã Serial/IMEI từng thiết bị và tải hóa đơn GTGT
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowInlineDetail(!showInlineDetail)}
                        className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/15 transition-colors cursor-pointer shrink-0"
                    >
                        {showInlineDetail ? "Thu gọn bảng chi tiết vận đơn" : "Mở chi tiết đơn #ORD-20261019-8892"}
                    </button>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { key: "all", label: "Tất cả đơn (2)" },
                        { key: "shipping", label: "Đang giao siêu tốc 2H (1)" },
                        { key: "delivered", label: "Đã hoàn tất (1)" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setFilterStatus(tab.key)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                filterStatus === tab.key
                                    ? "bg-primary text-white shadow-xs"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured Order Detail View (#ORD-20261019-8892 — D3-04 SSoT) */}
            {showInlineDetail && (
                <OrderDetails order={displayOrders[0]} isLoading={false} isEmbedded />
            )}

            {/* Order List */}
            <div className="space-y-4">
                {filteredOrders.map((order) => (
                    <OrderItem key={order.id} order={order} />
                ))}
            </div>
        </div>
    )
}

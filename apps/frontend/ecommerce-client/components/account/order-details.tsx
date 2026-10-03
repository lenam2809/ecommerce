"use client"

import { formatDate, formatPrice } from "@/lib/contants"
import { Order } from "@/types/order"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Package } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "./status-badge"
import { OrderDetailsSkeleton } from "./order-details-skeleton"
import { Check } from "lucide-react"
import Image from "next/image"

/**
 * OrderDetails — Editorial Tech Minimalism
 */
export function OrderDetails({ order, isLoading }: { order: Order | undefined, isLoading: boolean }) {
    if (isLoading || !order) {
        return <OrderDetailsSkeleton />
    }

    const normalizedStatus = String(order.status || "").toLowerCase()
    let currentStep = 1
    if (normalizedStatus === "processing" || normalizedStatus === "1") currentStep = 2
    else if (normalizedStatus === "shipping" || normalizedStatus === "shipped" || normalizedStatus === "2") currentStep = 3
    else if (normalizedStatus === "delivered" || normalizedStatus === "3") currentStep = 4
    else if (normalizedStatus === "cancelled" || normalizedStatus === "4") currentStep = -1

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="rounded-full text-ink-soft hover:text-brand px-3">
                    <Link href="/account/orders" className="flex items-center">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Quay lại danh sách đơn hàng
                    </Link>
                </Button>
            </div>

            <div className="bg-card rounded-3xl border border-line overflow-hidden shadow-xs">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-line/60">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-h2 font-bold tracking-tight text-ink">Đơn hàng #{order.code}</h1>
                                <StatusBadge status={order.status} />
                            </div>
                            <p className="text-small text-ink-soft mt-1">
                                Đặt vào lúc {formatDate(order.orderDate)} • Cập nhật tự động
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" disabled={order.status === "Cancelled" || currentStep > 2} className="rounded-full border-line text-ink hover:bg-surface text-tiny font-semibold h-10 px-5">
                                Hủy đơn hàng
                            </Button>
                            <Button asChild className="rounded-full bg-brand text-white hover:bg-brand-hover text-tiny font-semibold h-10 px-5 shadow-xs">
                                <Link href="/products">Mua lại</Link>
                            </Button>
                        </div>
                    </div>

                    {/* 4-Step Shipment Timeline */}
                    {currentStep !== -1 && (
                        <div className="mt-8 pt-6 border-t border-line/60">
                            <div className="grid grid-cols-4 gap-2 relative">
                                <div className="absolute top-4 left-[12%] right-[12%] h-0.5 bg-line -z-0">
                                    <div
                                        className="h-full bg-brand transition-all duration-500"
                                        style={{ width: `${Math.max(0, Math.min(100, ((currentStep - 1) / 3) * 100))}%` }}
                                    />
                                </div>

                                {[
                                    { label: "Đặt hàng", desc: "Đã ghi nhận", step: 1 },
                                    { label: "Đóng gói", desc: "Chuẩn bị hàng", step: 2 },
                                    { label: "Đang giao", desc: "Shipper đang giao", step: 3 },
                                    { label: "Hoàn tất", desc: "Giao thành công", step: 4 },
                                ].map((item) => {
                                    const isPassed = currentStep > item.step
                                    const isCurrent = currentStep === item.step
                                    return (
                                        <div key={item.step} className="flex flex-col items-center text-center relative z-10">
                                            <div
                                                className={`h-8 w-8 rounded-full flex items-center justify-center text-tiny font-bold transition-all duration-300 ${
                                                    isPassed
                                                        ? "bg-emerald-600 text-white shadow-xs"
                                                        : isCurrent
                                                        ? "bg-brand text-white shadow-xs ring-4 ring-brand/15"
                                                        : "bg-surface-2 border border-line text-ink-faint"
                                                }`}
                                            >
                                                {isPassed ? <Check className="h-4 w-4" /> : item.step}
                                            </div>
                                            <span className={`text-tiny font-semibold mt-2 ${isCurrent ? "text-brand" : "text-ink"}`}>
                                                {item.label}
                                            </span>
                                            <span className="text-[11px] text-ink-faint hidden sm:block mt-0.5">
                                                {item.desc}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-small font-semibold text-ink">Danh sách sản phẩm ({order.orderItems.length})</h2>
                            <div className="border border-line/70 rounded-2xl divide-y divide-line/60 overflow-hidden">
                                {order.orderItems.map((item) => (
                                    <div key={`${item.productId}-${item.color}-${item.size}`} className="p-4">
                                        <div className="flex gap-4">
                                            <div className="relative w-16 h-16 bg-surface rounded-xl overflow-hidden flex-shrink-0 border border-line">
                                                {item.image ? (
                                                    <Image
                                                        src={item.image || "/placeholder.svg"}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-ink-faint">
                                                        <Package className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-ink">{item.name}</h3>
                                                <div className="text-small text-ink-faint mt-1">
                                                    {item.color && <span>Màu: {item.color}</span>}
                                                    {item.size && <span className="ml-2">Size: {item.size}</span>}
                                                </div>
                                                <div className="text-small text-ink-faint mt-1">
                                                    Số lượng: {item.quantity}
                                                </div>
                                            </div>
                                            <div className="font-medium text-ink">
                                                {formatPrice(item.unitPrice * item.quantity)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-h3 font-semibold text-ink">Thông tin vận chuyển</h2>
                            <div className="border border-line rounded-2xl p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium text-ink">Địa chỉ giao hàng</h3>
                                        <p className="text-ink-soft text-small mt-1">
                                            {order.shippingAddress}
                                        </p>
                                        {order.deliveryInstructions && (
                                            <p className="text-ink-soft text-small mt-2">
                                                <span className="font-medium">Ghi chú: </span>
                                                {order.deliveryInstructions}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-ink">Thông tin liên hệ</h3>
                                        <p className="text-ink-soft text-small mt-1">
                                            {order.phone}
                                        </p>
                                        <p className="text-ink-soft text-small mt-1">
                                            {order.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="border border-line rounded-2xl p-4">
                            <h2 className="text-h3 font-semibold text-ink mb-4">Tóm tắt đơn hàng</h2>

                            <div className="space-y-3 text-small">
                                <div className="flex justify-between">
                                    <span className="text-ink-soft">Tạm tính</span>
                                    <span className="text-ink">
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                </div>

                                {order.discountCode && (
                                    <div className="flex justify-between">
                                        <span className="text-ink-soft">Mã giảm giá ({order.discountCode})</span>
                                        <span className="text-brand">-{formatPrice(0)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span className="text-ink-soft">Phí vận chuyển</span>
                                    <span className="text-ink">{formatPrice(0)}</span>
                                </div>

                                <div className="border-t border-line pt-3 mt-3 flex justify-between">
                                    <span className="font-medium text-ink">Tổng cộng</span>
                                    <span className="font-bold text-lg text-ink tracking-tight">
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-line rounded-2xl p-4">
                            <h2 className="text-h3 font-semibold text-ink mb-4">Thông tin bổ sung</h2>
                            <div className="space-y-2">
                                <div>
                                    <h3 className="font-medium text-ink">Phương thức thanh toán</h3>
                                    <p className="text-ink-soft text-small">Thanh toán khi nhận hàng (COD)</p>
                                </div>
                                {order.expectedDeliveryDate && (
                                    <div>
                                        <h3 className="font-medium text-ink">Dự kiến giao hàng</h3>
                                        <p className="text-ink-soft text-small">
                                            {formatDate(order.expectedDeliveryDate)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

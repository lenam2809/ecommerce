"use client"

import { formatPrice } from "@/lib/contants"
import { Order } from "@/types/order"
import { Button } from "@/components/ui/button"
import {
    ChevronLeft,
    Package,
    Check,
    PhoneCall,
    ShieldCheck,
    Download,
    Star,
    RotateCcw,
    Truck,
    Receipt,
} from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "./status-badge"
import Image from "next/image"
import { formatImageUrl } from "@/lib/utils"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export function OrderDetails({
    order,
    isLoading = false,
    isEmbedded = false,
}: {
    order?: Order
    isLoading?: boolean
    isEmbedded?: boolean
}) {
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48 rounded-xl" />
                <div className="bg-card rounded-2xl border border-line p-6 space-y-6">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="bg-card rounded-2xl border border-line p-12 text-center max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-tech-blue/10 text-tech-blue flex items-center justify-center mx-auto mb-4">
                    <Package className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-1">
                    Không tìm thấy thông tin đơn hàng
                </h3>
                <p className="text-xs text-ink-soft mb-6">
                    Đơn hàng có thể đã bị xóa hoặc quý khách không có quyền truy cập.
                </p>
                <Button asChild className="rounded-xl bg-tech-blue text-white hover:bg-tech-blue/90 text-xs font-bold">
                    <Link href="/account/orders">Quay lại danh sách đơn hàng</Link>
                </Button>
            </div>
        )
    }

    const normalizedStatus = String(order.status || "pending").toLowerCase()
    let currentStep = 1
    if (normalizedStatus === "pending" || normalizedStatus === "0") currentStep = 1
    else if (normalizedStatus === "processing" || normalizedStatus === "1") currentStep = 2
    else if (normalizedStatus === "shipping" || normalizedStatus === "shipped" || normalizedStatus === "2") currentStep = 3
    else if (normalizedStatus === "delivered" || normalizedStatus === "3") currentStep = 4
    else if (normalizedStatus === "cancelled" || normalizedStatus === "4") currentStep = -1

    const displayDate = order.orderDate
        ? new Date(order.orderDate).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "—"

    const items = order.orderItems || []
    const subtotal =
        order.subtotal ||
        items.reduce((acc, item) => acc + (item.unitPrice || item.price || 0) * item.quantity, 0)
    const discount = order.discountAmount || 0
    const shippingCost = order.shippingCost ?? (subtotal >= 500000 ? 0 : 30000)

    return (
        <div className="space-y-6">
            {!isEmbedded && (
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        asChild
                        className="rounded-xl text-ink-soft hover:text-tech-blue px-3 font-bold text-xs"
                    >
                        <Link href="/account/orders" className="flex items-center">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Quay lại danh sách đơn hàng
                        </Link>
                    </Button>
                </div>
            )}

            <div className="bg-card rounded-2xl border border-line overflow-hidden shadow-xs">
                {/* Header */}
                <div className="p-6 border-b border-line bg-surface/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h2 className="text-lg md:text-xl font-extrabold tracking-tight text-ink font-mono tabular-nums">
                                    Chi tiết đơn hàng #{order.code || order.id}
                                </h2>
                                <StatusBadge status={order.status} />
                                {order.transactionId && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-tech-blue/10 border border-tech-blue/20 text-tech-blue text-xs font-bold font-mono tabular-nums">
                                        Mã GD: {order.transactionId}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-ink-soft mt-1 font-mono tabular-nums">
                                Đặt ngày <strong className="text-ink">{displayDate}</strong> • {order.deliveryMethod || "Giao hàng Siêu tốc ShopViet"}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    toast.success("Đang chuẩn bị Hóa đơn điện tử GTGT (PDF) — Đơn #" + (order.code || order.id))
                                }
                                className="rounded-xl border-tech-blue/30 text-tech-blue hover:bg-tech-blue/5 text-xs font-bold h-9 px-4 cursor-pointer"
                            >
                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                Tải hóa đơn VAT (PDF)
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    toast.success("Đã mở khung đánh giá chất lượng sản phẩm!")
                                }
                                className="rounded-xl border-line text-ink text-xs font-bold h-9 px-4 cursor-pointer"
                            >
                                <Star className="h-3.5 w-3.5 mr-1.5 text-amber-500 fill-amber-400" />
                                Đánh giá
                            </Button>
                            <Button
                                asChild
                                className="rounded-xl bg-tech-blue text-white hover:bg-tech-blue/90 text-xs font-bold h-9 px-4 shadow-xs"
                            >
                                <Link href="/products">
                                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                                    Mua lại
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* 4-Step Shipment Timeline */}
                    {currentStep !== -1 && (
                        <div className="mt-6 pt-6 border-t border-line">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: "1. Đặt hàng", desc: displayDate, step: 1 },
                                    { label: "2. Xử lý & Đóng gói", desc: "Kiểm tra Serial/IMEI", step: 2 },
                                    { label: "3. Đang giao hàng", desc: "Vận chuyển hỏa tốc", step: 3 },
                                    { label: "4. Giao thành công", desc: "Bàn giao khách hàng", step: 4 },
                                ].map((stepItem) => {
                                    const isPassed = currentStep > stepItem.step
                                    const isCurrent = currentStep === stepItem.step
                                    return (
                                        <div
                                            key={stepItem.step}
                                            className={`rounded-xl p-3 border ${
                                                isPassed
                                                    ? "border-emerald-500/30 bg-emerald-500/10"
                                                    : isCurrent
                                                    ? "border-tech-blue bg-tech-blue/10 ring-2 ring-tech-blue/20"
                                                    : "border-line bg-card opacity-60"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-extrabold text-ink">
                                                    {stepItem.label}
                                                </span>
                                                {isPassed && <Check className="h-4 w-4 text-emerald-600" />}
                                                {isCurrent && (
                                                    <span className="h-2.5 w-2.5 rounded-full bg-tech-blue animate-ping" />
                                                )}
                                            </div>
                                            <span className="text-[11px] text-ink-soft font-mono tabular-nums block">
                                                {stepItem.desc}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Delivery & Shipper Note Strip */}
                    <div className="mt-4 rounded-xl bg-card border border-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-tech-blue/10 text-tech-blue flex items-center justify-center shrink-0">
                                <Truck className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-extrabold text-ink">
                                        Phương thức: {order.deliveryMethod || "Giao hàng tiêu chuẩn"}
                                    </span>
                                </div>
                                <p className="text-xs text-ink-soft mt-0.5">
                                    {order.deliveryInstructions || "Giao giờ hành chính, gọi trước khi giao."}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                    toast.success("Đang kết nối tới tổng đài CSKH 1800 6868...")
                                }
                                className="h-9 px-3.5 rounded-xl bg-tech-blue text-white hover:bg-tech-blue/90 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                                <PhoneCall className="h-3.5 w-3.5" />
                                <span>Hotline CSKH</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Body Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                    <div className="lg:col-span-2 space-y-5">
                        <div>
                            <h3 className="text-sm font-extrabold text-ink mb-3">
                                Danh sách thiết bị &amp; Bảo hành điện tử ({items.length})
                            </h3>
                            <div className="border border-line rounded-xl divide-y divide-line overflow-hidden">
                                {items.map((item, idx) => {
                                    const serials = item.assignedSerials || []

                                    return (
                                        <div key={`${item.productId}-${idx}`} className="p-4 space-y-3">
                                            <div className="flex gap-4">
                                                <div className="relative w-16 h-16 bg-surface rounded-xl overflow-hidden shrink-0 border border-line p-1">
                                                    {item.image || item.imageUrl ? (
                                                        <Image
                                                            src={formatImageUrl(item.image || item.imageUrl)}
                                                            alt={item.name || item.productName || "Product"}
                                                            fill
                                                            className="object-contain p-1"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-ink-faint">
                                                            <Package className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm text-ink leading-snug">
                                                        {item.name || item.productName}
                                                    </h4>
                                                    <div className="text-xs text-ink-soft mt-1 flex flex-wrap gap-2">
                                                        {item.color && <span>Màu: {item.color}</span>}
                                                        {item.size && <span>• Cấu hình: {item.size}</span>}
                                                        {item.addOnName && (
                                                            <span className="text-tech-blue font-semibold">
                                                                • Kèm: {item.addOnName} (+{formatPrice(item.addOnPrice || 0)})
                                                            </span>
                                                        )}
                                                        <span className="font-bold text-ink font-mono tabular-nums">
                                                            • SL: {item.quantity}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-xs text-ink-soft block font-mono tabular-nums whitespace-nowrap">
                                                        {formatPrice(item.unitPrice || item.price || 0)} × {item.quantity}
                                                    </span>
                                                    <span className="font-extrabold text-sm text-ink font-mono tabular-nums whitespace-nowrap">
                                                        {formatPrice((item.unitPrice || item.price || 0) * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Serial Numbers if available */}
                                            {serials.length > 0 && (
                                                <div className="rounded-xl bg-surface border border-line p-3 space-y-1.5">
                                                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-tech-blue flex items-center gap-1.5">
                                                        <ShieldCheck className="h-3.5 w-3.5" />
                                                        <span>Chứng nhận Serial / IMEI &amp; Bảo hành điện tử</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {serials.map((s, sIdx) => (
                                                            <div
                                                                key={s.serialNumber || sIdx}
                                                                className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-card border border-line text-xs font-mono tabular-nums"
                                                            >
                                                                <span className="font-bold text-ink">
                                                                    SN: <strong className="text-tech-blue">{s.serialNumber}</strong>
                                                                </span>
                                                                {s.warrantyExpiresAt && (
                                                                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                                        BH: {new Date(s.warrantyExpiresAt).toLocaleDateString("vi-VN")}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column Summary */}
                    <div className="space-y-4">
                        <div className="border border-line rounded-xl p-4 bg-surface/50 space-y-3">
                            <h3 className="text-sm font-extrabold text-ink">
                                Tổng kết thanh toán
                            </h3>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-ink-soft">Tạm tính ({items.length} sản phẩm)</span>
                                    <span className="font-bold text-ink font-mono tabular-nums whitespace-nowrap">
                                        {formatPrice(subtotal)}
                                    </span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-ink-soft">Giảm giá {order.discountCode ? `(${order.discountCode})` : ""}</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums whitespace-nowrap">
                                            -{formatPrice(discount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-ink-soft">Phí vận chuyển</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums whitespace-nowrap">
                                        {shippingCost === 0 ? "Miễn phí (0₫)" : formatPrice(shippingCost)}
                                    </span>
                                </div>
                                <div className="border-t border-line pt-2.5 mt-2 flex justify-between items-baseline">
                                    <span className="font-extrabold text-sm text-ink">
                                        Tổng tiền thanh toán
                                    </span>
                                    <span className="font-extrabold text-lg text-brand tracking-tight font-mono tabular-nums whitespace-nowrap">
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address & Contact */}
                        <div className="border border-line rounded-xl p-4 space-y-2 text-xs bg-card">
                            <h3 className="text-sm font-extrabold text-ink">
                                Địa chỉ giao nhận
                            </h3>
                            <p className="font-bold text-ink">
                                {order.userName || order.guestName || "Khách hàng"} •{" "}
                                <span className="font-mono tabular-nums">{order.phone}</span>
                            </p>
                            <p className="text-ink-soft leading-relaxed">
                                {order.shippingAddress}
                            </p>
                        </div>

                        {/* VAT Invoice Details if required */}
                        {(order.requireInvoice || order.invoice?.requireInvoice) && (
                            <div className="border border-line rounded-xl p-4 space-y-2 text-xs bg-card">
                                <div className="flex items-center gap-1.5 text-tech-blue font-bold">
                                    <Receipt className="h-4 w-4" />
                                    <span>Hóa đơn điện tử GTGT</span>
                                </div>
                                <p className="font-semibold text-ink">
                                    {order.invoice?.companyName || "Tên công ty"}
                                </p>
                                <p className="text-ink-soft font-mono tabular-nums">
                                    MST: {order.invoice?.taxCode || "—"}
                                </p>
                                {order.invoice?.companyAddress && (
                                    <p className="text-ink-soft">{order.invoice.companyAddress}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

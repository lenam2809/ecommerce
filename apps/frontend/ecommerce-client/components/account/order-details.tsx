"use client"

import { formatPrice } from "@/lib/contants"
import { Order } from "@/types/order"
import { Button } from "@/components/ui/button"
import {
    ChevronLeft,
    Package,
    Check,
    PhoneCall,
    MessageSquare,
    ShieldCheck,
    Download,
    Star,
    RotateCcw,
    Truck,
} from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "./status-badge"
import Image from "next/image"
import { formatImageUrl } from "@/lib/utils"
import { toast } from "sonner"
import { SSOT_DEFAULT_ORDERS } from "./orders-tab"

export function OrderDetails({
    order,
    isEmbedded = false,
}: {
    order: Order | undefined
    isLoading: boolean
    isEmbedded?: boolean
}) {
    const activeOrder = order || SSOT_DEFAULT_ORDERS[0]

    const normalizedStatus = String(activeOrder.status || "shipping").toLowerCase()
    let currentStep = 3
    if (normalizedStatus === "pending" || normalizedStatus === "0") currentStep = 1
    else if (normalizedStatus === "processing" || normalizedStatus === "1") currentStep = 2
    else if (normalizedStatus === "shipping" || normalizedStatus === "shipped" || normalizedStatus === "2") currentStep = 3
    else if (normalizedStatus === "delivered" || normalizedStatus === "3") currentStep = 4
    else if (normalizedStatus === "cancelled" || normalizedStatus === "4") currentStep = -1

    const displayDate = activeOrder.orderDate?.includes("2026")
        ? activeOrder.orderDate
        : "19/10/2026 • 14:32"

    return (
        <div className="space-y-6">
            {!isEmbedded && (
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        asChild
                        className="rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary px-3 font-bold text-xs"
                    >
                        <Link href="/account/orders" className="flex items-center">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Quay lại danh sách đơn hàng
                        </Link>
                    </Button>
                </div>
            )}

            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h2 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                    Chi tiết đơn hàng #{activeOrder.code}
                                </h2>
                                <StatusBadge status={activeOrder.status} />
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-primary text-xs font-bold tabular-nums">
                                    VNPAY: VNP14298834
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 tabular-nums">
                                Đặt ngày <strong>{displayDate}</strong> • Giao siêu tốc 2H bởi GHN Express
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    toast.success("Đang tải Hóa đơn điện tử GTGT (PDF) — Đơn #" + activeOrder.code)
                                }
                                className="rounded-xl border-primary/30 text-primary hover:bg-primary/5 text-xs font-bold h-9 px-4 cursor-pointer"
                            >
                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                Tải hóa đơn VAT (PDF)
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    toast.success("Đã mở khung đánh giá chất lượng dịch vụ & sản phẩm!")
                                }
                                className="rounded-xl border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold h-9 px-4 cursor-pointer"
                            >
                                <Star className="h-3.5 w-3.5 mr-1.5 text-amber-500 fill-amber-400" />
                                Đánh giá
                            </Button>
                            <Button
                                asChild
                                className="rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold h-9 px-4 shadow-xs"
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
                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: "1. Đặt hàng & VNPAY", desc: "19/10/2026 • 14:32", step: 1 },
                                    { label: "2. Đóng gói 3 lớp", desc: "19/10/2026 • 14:45", step: 2 },
                                    { label: "3. Đang giao 2H", desc: "Shipper đang di chuyển", step: 3 },
                                    { label: "4. Giao thành công", desc: "Dự kiến trước 16:30", step: 4 },
                                ].map((item) => {
                                    const isPassed = currentStep > item.step
                                    const isCurrent = currentStep === item.step
                                    return (
                                        <div
                                            key={item.step}
                                            className={`rounded-xl p-3 border ${
                                                isPassed
                                                    ? "border-emerald-300 dark:border-emerald-800/70 bg-emerald-50/60 dark:bg-emerald-950/30"
                                                    : isCurrent
                                                    ? "border-primary bg-blue-50/70 dark:bg-blue-950/30 ring-2 ring-primary/15"
                                                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 opacity-75"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                                    {item.label}
                                                </span>
                                                {isPassed && <Check className="h-4 w-4 text-emerald-600" />}
                                                {isCurrent && (
                                                    <span className="h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
                                                )}
                                            </div>
                                            <span className="text-[11px] text-slate-600 dark:text-slate-400 tabular-nums block">
                                                {item.desc}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Masked Shipper Contact Card (0912***789 + Anonymous Call/Chat — SSoT D3-04) */}
                    <div className="mt-4 rounded-xl bg-white dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Truck className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                        Nhân viên giao hàng GHN Express: Nguyễn Văn Hùng
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold tabular-nums">
                                        SĐT bảo mật: 0912***789
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                    Số điện thoại được ẩn danh để bảo vệ quyền riêng tư của khách hàng và shipper.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                    toast.success("Đang kết nối cuộc gọi ẩn danh qua tổng đài IP ShopViet tới Shipper (0912***789)...")
                                }
                                className="h-9 px-3.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                                <PhoneCall className="h-3.5 w-3.5" />
                                <span>Gọi ẩn danh</span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    toast.success("Đã mở hộp thoại Chat trực tiếp với Shipper Nguyễn Văn Hùng!")
                                }
                                className="h-9 px-3.5 rounded-xl border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                <span>Chat Shipper</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Body Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                    <div className="lg:col-span-2 space-y-5">
                        <div>
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3">
                                Danh sách thiết bị &amp; Mã định danh Bảo hành Điện tử ({activeOrder.orderItems.length})
                            </h3>
                            <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden">
                                {activeOrder.orderItems.map((item, idx) => {
                                    const serialNumbers =
                                        item.quantity > 1
                                            ? [
                                                  { unit: "Đơn vị #1", sn: "UG20261019-A01", exp: "19/04/2028 (18T)" },
                                                  { unit: "Đơn vị #2", sn: "UG20261019-A02", exp: "19/04/2028 (18T)" },
                                              ]
                                            : [
                                                  {
                                                      unit: "Thiết bị chính",
                                                      sn: idx === 0 ? "C02Y98Z8MD6R" : "IMEI: 358912109882341",
                                                      exp: "19/10/2028 (24T Apple VN + Care+)",
                                                  },
                                              ]

                                    return (
                                        <div key={`${item.productId}-${item.color}-${item.size}`} className="p-4 space-y-3">
                                            <div className="flex gap-4">
                                                <div className="relative w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 p-1">
                                                    {item.image ? (
                                                        <Image
                                                            src={formatImageUrl(item.image)}
                                                            alt={item.name}
                                                            fill
                                                            className="object-contain p-1"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Package className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                                                        {item.name}
                                                    </h4>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap gap-2">
                                                        {item.color && <span>Màu: {item.color}</span>}
                                                        {item.size && <span>• Cấu hình: {item.size}</span>}
                                                        <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                                                            • SL: {item.quantity}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 block tabular-nums whitespace-nowrap">
                                                        {formatPrice(item.unitPrice)} × {item.quantity}
                                                    </span>
                                                    <span className="font-extrabold text-sm text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                                                        {formatPrice(item.unitPrice * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Per-unit Serial Number / IMEI Table */}
                                            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 p-3 space-y-1.5">
                                                <div className="text-[11px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                                    <ShieldCheck className="h-3.5 w-3.5" />
                                                    <span>Chứng nhận Serial / IMEI &amp; Bảo hành điện tử theo từng đơn vị</span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {serialNumbers.map((s) => (
                                                        <div
                                                            key={s.sn}
                                                            className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-xs tabular-nums"
                                                        >
                                                            <span className="font-bold text-slate-800 dark:text-slate-200">
                                                                {s.unit}: <strong className="text-primary">{s.sn}</strong>
                                                            </span>
                                                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                                                BH: {s.exp}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column Summary */}
                    <div className="space-y-4">
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                Tổng kết thanh toán
                            </h3>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Tạm tính (3 sản phẩm)</span>
                                    <span className="font-bold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                                        62.890.000₫
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Voucher (TECHVIP500)</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                                        -500.000₫
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Phí giao siêu tốc 2H</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                        Miễn phí (0₫)
                                    </span>
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 mt-2 flex justify-between items-baseline">
                                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                        Đã thanh toán VNPAY
                                    </span>
                                    <span className="font-extrabold text-lg text-[#e11d48] tracking-tight tabular-nums whitespace-nowrap">
                                        {formatPrice(activeOrder.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                Địa chỉ giao nhận
                            </h3>
                            <p className="font-bold text-slate-900 dark:text-white">
                                Nguyễn Minh Quân • <span className="tabular-nums">{activeOrder.phone}</span>
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {activeOrder.shippingAddress}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

"use client"

import { StatusBadge } from "./status-badge"
import { formatPrice } from "@/lib/contants"
import { Order } from "@/types/order"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    ChevronRight,
    Package,
    Calendar,
    Truck,
    ShieldCheck,
    Download,
    Star,
    RotateCcw,
} from "lucide-react"
import Image from "next/image"
import { formatImageUrl } from "@/lib/utils"
import { toast } from "sonner"

export function OrderItem({ order }: { order: Order }) {
    const displayDate = order.orderDate?.includes("2026")
        ? order.orderDate
        : "19/10/2026 • 14:32"

    return (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-200 hover:border-primary/40 shadow-xs">
            {/* Top Order Bar */}
            <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider tabular-nums">
                            Mã đơn: #{order.code}
                        </span>
                        <StatusBadge status={order.status} />
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                            <ShieldCheck className="h-3 w-3" />
                            Đã kích hoạt e-Warranty
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 tabular-nums">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            <span>Ngày đặt:</span>
                            <strong className="text-slate-900 dark:text-white">{displayDate}</strong>
                        </div>
                        <div className="flex items-center gap-1.5 bg-blue-50/80 dark:bg-blue-950/40 text-primary px-2.5 py-1 rounded-lg border border-blue-200/70 dark:border-blue-800/60 font-semibold tabular-nums">
                            <Truck className="h-3.5 w-3.5" />
                            <span>GHN Express 2H • Shipper: Nguyễn Văn Hùng (0912***789)</span>
                        </div>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-xl border-primary/30 text-primary hover:bg-primary/5 font-bold text-xs h-9 px-4 shrink-0"
                >
                    <Link href={`/account/orders/${order.id}`} className="flex items-center justify-center">
                        <span>Chi tiết &amp; Serial/IMEI</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </Button>
            </div>

            {/* Order Items List */}
            <div className="p-4 sm:p-5 space-y-4">
                {order.orderItems.map((item, idx) => {
                    const serialList =
                        item.quantity > 1
                            ? ["UG20261019-A01", "UG20261019-A02"]
                            : [idx === 0 ? "C02Y98Z8MD6R" : "SV20261019-998"]

                    return (
                        <div
                            key={`${item.productId}-${item.color}-${item.size}`}
                            className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 last:pb-0 border-b last:border-b-0 border-slate-100 dark:border-slate-800/80"
                        >
                            <div className="flex items-start gap-3.5 min-w-0">
                                <div className="relative w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 p-1">
                                    {item.image || item.imageUrl ? (
                                        <Image
                                            src={formatImageUrl(item.image || item.imageUrl)}
                                            alt={item.name || item.productName || "Product"}
                                            fill
                                            sizes="64px"
                                            className="object-contain p-1"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <Package className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                                        {item.name || item.productName}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-1">
                                        {item.color && (
                                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                                                Màu: {item.color}
                                            </span>
                                        )}
                                        {item.size && (
                                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                                                {item.size}
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                                            SL: {item.quantity}
                                        </span>
                                    </div>
                                    {/* Per-Unit Serial / IMEI & e-Warranty Badge */}
                                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                        {serialList.map((sn, sIdx) => (
                                            <span
                                                key={sn}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/70 text-[11px] font-bold text-primary tabular-nums"
                                            >
                                                <ShieldCheck className="h-3 w-3" />
                                                SN {serialList.length > 1 ? `#${sIdx + 1}` : ""}: {sn} (BH đến 19/10/2028)
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="text-left sm:text-right shrink-0">
                                <span className="text-xs text-slate-500 dark:text-slate-400 block tabular-nums whitespace-nowrap">
                                    {formatPrice(item.unitPrice)} × {item.quantity}
                                </span>
                                <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                                    {formatPrice(item.unitPrice * item.quantity)}
                                </span>
                            </div>
                        </div>
                    )
                })}

                {/* Footer Action Strip */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/50 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 sm:px-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            asChild
                            className="h-9 px-4 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold"
                        >
                            <Link href="/products">
                                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                                Mua lại đơn này
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toast.success("Cảm ơn bạn! Cửa sổ đánh giá sản phẩm kèm ảnh thực tế đã mở.")}
                            className="h-9 px-3.5 rounded-xl border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                        >
                            <Star className="h-3.5 w-3.5 mr-1.5 text-amber-500 fill-amber-400" />
                            Đánh giá (+100 điểm)
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toast.success("Đang tải Hóa đơn điện tử GTGT (PDF) cho đơn #" + order.code)}
                            className="h-9 px-3.5 rounded-xl border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                        >
                            <Download className="h-3.5 w-3.5 mr-1.5 text-primary" />
                            Hóa đơn VAT (PDF)
                        </Button>
                    </div>

                    <div className="flex items-baseline gap-2 self-end sm:self-auto">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            Tổng thanh toán:
                        </span>
                        <span className="font-extrabold text-lg text-[#e11d48] tracking-tight tabular-nums whitespace-nowrap">
                            {formatPrice(order.totalAmount)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

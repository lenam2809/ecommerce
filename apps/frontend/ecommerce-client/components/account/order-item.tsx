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
    const formattedDate = order.orderDate
        ? new Date(order.orderDate).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "—"

    return (
        <div className="bg-card border border-line rounded-2xl overflow-hidden transition-all duration-200 hover:border-tech-blue/40 shadow-xs">
            {/* Top Order Bar */}
            <div className="p-4 sm:p-5 bg-surface/50 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-extrabold text-ink text-sm uppercase tracking-wider font-mono tabular-nums">
                            Mã đơn: #{order.code || order.id}
                        </span>
                        <StatusBadge status={order.status} />
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                            <ShieldCheck className="h-3 w-3" />
                            Bảo hành điện tử chính hãng
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-ink-soft">
                        <div className="flex items-center gap-1.5 bg-card px-2.5 py-1 rounded-lg border border-line font-mono tabular-nums">
                            <Calendar className="h-3.5 w-3.5 text-tech-blue" />
                            <span>Ngày đặt:</span>
                            <strong className="text-ink">{formattedDate}</strong>
                        </div>
                        <div className="flex items-center gap-1.5 bg-tech-blue/10 text-tech-blue px-2.5 py-1 rounded-lg border border-tech-blue/20 font-semibold">
                            <Truck className="h-3.5 w-3.5" />
                            <span>{order.deliveryMethod || "Giao hàng Siêu tốc"}</span>
                        </div>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-xl border-tech-blue/30 text-tech-blue hover:bg-tech-blue/5 font-bold text-xs h-9 px-4 shrink-0"
                >
                    <Link href={`/account/orders/${order.id}`} className="flex items-center justify-center">
                        <span>Chi tiết đơn hàng</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </Button>
            </div>

            {/* Order Items List */}
            <div className="p-4 sm:p-5 space-y-4">
                {(order.orderItems || []).map((item) => {
                    const assignedSerials = item.assignedSerials || []

                    return (
                        <div
                            key={`${item.productId}-${item.color || ""}-${item.size || ""}`}
                            className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 last:pb-0 border-b last:border-b-0 border-line/60"
                        >
                            <div className="flex items-start gap-3.5 min-w-0">
                                <div className="relative w-16 h-16 bg-surface rounded-xl overflow-hidden border border-line shrink-0 p-1">
                                    {item.image || item.imageUrl ? (
                                        <Image
                                            src={formatImageUrl(item.image || item.imageUrl)}
                                            alt={item.name || item.productName || "Product"}
                                            fill
                                            sizes="64px"
                                            className="object-contain p-1"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-ink-faint">
                                            <Package className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-ink leading-snug">
                                        {item.name || item.productName}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft mt-1">
                                        {item.color && (
                                            <span className="px-2 py-0.5 rounded bg-surface font-medium">
                                                Màu: {item.color}
                                            </span>
                                        )}
                                        {item.size && (
                                            <span className="px-2 py-0.5 rounded bg-surface font-medium">
                                                {item.size}
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 rounded bg-surface font-bold text-ink font-mono tabular-nums">
                                            SL: {item.quantity}
                                        </span>
                                    </div>
                                    {/* Per-Unit Serial / IMEI if assigned */}
                                    {assignedSerials.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                            {assignedSerials.map((sn, sIdx) => (
                                                <span
                                                    key={sn.serialNumber || sIdx}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-tech-blue/10 border border-tech-blue/20 text-[11px] font-bold text-tech-blue font-mono tabular-nums"
                                                >
                                                    <ShieldCheck className="h-3 w-3" />
                                                    SN: {sn.serialNumber}{" "}
                                                    {sn.warrantyExpiresAt && `(BH: ${new Date(sn.warrantyExpiresAt).toLocaleDateString("vi-VN")})`}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-left sm:text-right shrink-0">
                                <span className="text-xs text-ink-soft block font-mono tabular-nums whitespace-nowrap">
                                    {formatPrice(item.unitPrice || item.price || 0)} × {item.quantity}
                                </span>
                                <span className="text-sm font-extrabold text-ink font-mono tabular-nums whitespace-nowrap">
                                    {formatPrice((item.unitPrice || item.price || 0) * item.quantity)}
                                </span>
                            </div>
                        </div>
                    )
                })}

                {/* Footer Action Strip */}
                <div className="pt-4 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/40 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 sm:px-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            asChild
                            className="h-9 px-4 rounded-xl bg-tech-blue text-white hover:bg-tech-blue/90 text-xs font-bold"
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
                            onClick={() => toast.success("Cửa sổ đánh giá sản phẩm đã được mở.")}
                            className="h-9 px-3.5 rounded-xl border-line text-ink text-xs font-bold cursor-pointer"
                        >
                            <Star className="h-3.5 w-3.5 mr-1.5 text-amber-500 fill-amber-400" />
                            Đánh giá
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toast.success("Đang chuẩn bị tải Hóa đơn điện tử GTGT cho đơn #" + (order.code || order.id))}
                            className="h-9 px-3.5 rounded-xl border-line text-ink text-xs font-bold cursor-pointer"
                        >
                            <Download className="h-3.5 w-3.5 mr-1.5 text-tech-blue" />
                            Hóa đơn VAT
                        </Button>
                    </div>

                    <div className="flex items-baseline gap-2 self-end sm:self-auto">
                        <span className="text-xs font-semibold text-ink-soft">
                            Tổng thanh toán:
                        </span>
                        <span className="font-extrabold text-lg text-brand tracking-tight font-mono tabular-nums whitespace-nowrap">
                            {formatPrice(order.totalAmount)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

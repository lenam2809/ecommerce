"use client"

import { useState } from "react"
import { formatPrice } from "@/lib/contants"
import { HelpCircle, CheckCircle2, Ticket, Sparkles } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface OrderTotalsProps {
    subtotal: number
    shippingCost: number
    discount?: number
    total: number
}

const FREE_SHIPPING_THRESHOLD = 500000 // 500.000₫ for free shipping

export function OrderTotals({
    subtotal,
    shippingCost,
    discount = 500000,
    total,
}: OrderTotalsProps) {
    const [showShippingInfo, setShowShippingInfo] = useState(false)
    const isFreeShipping = shippingCost === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
    const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
    const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))

    return (
        <div className="space-y-3.5 pt-1">
            {/* Active Voucher Badge */}
            <div className="rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/70 p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                        <Ticket className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white tracking-wide">
                                TECHVIP500
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                                Đang áp dụng
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                            Ưu đãi thành viên VIP Diamond
                        </p>
                    </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                    -{formatPrice(discount)}
                </span>
            </div>

            {/* Free shipping status bar */}
            <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 p-3 border border-emerald-200/80 dark:border-emerald-800/50">
                <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {isFreeShipping ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                    Đủ điều kiện Freeship Hỏa tốc 2H (Mốc 500.000₫)
                                </span>
                            </>
                        ) : (
                            <span>Tiến độ miễn phí vận chuyển (500.000₫)</span>
                        )}
                    </span>
                    {!isFreeShipping && (
                        <span className="text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                            Thiếu <strong className="text-primary font-bold">{formatPrice(remainingForFreeShipping)}</strong>
                        </span>
                    )}
                </div>
                <div className="h-1.5 w-full bg-emerald-200/70 dark:bg-emerald-900/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Breakdown rows */}
            <div className="space-y-2.5 pt-1 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Tạm tính</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                        {formatPrice(subtotal)}
                    </span>
                </div>

                {discount > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Mã giảm giá (TECHVIP500)</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                            -{formatPrice(discount)}
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-600 dark:text-slate-400">Phí vận chuyển (GHN Express 2H)</span>
                        <Popover open={showShippingInfo} onOpenChange={setShowShippingInfo}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                                    aria-label="Thông tin phí vận chuyển"
                                >
                                    <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-slate-700 transition-colors" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent side="left" className="max-w-xs rounded-xl border-slate-200 dark:border-slate-800">
                                <div className="space-y-2 text-xs">
                                    <p className="font-bold text-slate-900 dark:text-white">Chính sách vận chuyển ShopViet 2026</p>
                                    <p className="text-slate-600 dark:text-slate-300">
                                        • Miễn phí giao hàng toàn quốc cho đơn hàng từ 500.000₫.
                                    </p>
                                    <p className="text-slate-600 dark:text-slate-300">
                                        • Giao siêu tốc 2H tại Hà Nội, TP.HCM & Đà Nẵng.
                                    </p>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        • Bảo hiểm hàng hóa 100% và đồng kiểm tra niêm phong.
                                    </p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <span className={`font-bold tabular-nums whitespace-nowrap ${isFreeShipping ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                        {isFreeShipping ? "Miễn phí (0₫)" : formatPrice(shippingCost)}
                    </span>
                </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

            <div className="flex justify-between items-baseline gap-2">
                <div>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white block">
                        Tổng thanh toán
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                        Đã bao gồm thuế GTGT (10% VAT)
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-extrabold text-[#e11d48] tracking-tight tabular-nums whitespace-nowrap block">
                        {formatPrice(total)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary mt-0.5">
                        <Sparkles className="h-3 w-3" />
                        Tích lũy +620 điểm VIP Diamond
                    </span>
                </div>
            </div>
        </div>
    )
}

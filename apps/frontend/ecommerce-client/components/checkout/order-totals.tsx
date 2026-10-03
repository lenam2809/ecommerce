"use client"

import { useState } from "react"
import { formatPrice } from "@/lib/contants"
import { HelpCircle, CheckCircle2 } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface OrderTotalsProps {
    subtotal: number
    shippingCost: number
    total: number
}

const FREE_SHIPPING_THRESHOLD = 500000 // ₫500,000 for free shipping

export function OrderTotals({ subtotal, shippingCost, total }: OrderTotalsProps) {
    const [showShippingInfo, setShowShippingInfo] = useState(false)
    const isFreeShipping = shippingCost === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
    const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
    const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))

    return (
        <div className="space-y-3 pt-2">
            {/* Free shipping status bar */}
            <div className="rounded-xl bg-surface-2/70 p-3 border border-line/60">
                <div className="flex items-center justify-between text-tiny mb-1.5">
                    <span className="font-medium text-ink flex items-center gap-1.5">
                        {isFreeShipping ? (
                            <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Miễn phí vận chuyển toàn quốc</span>
                            </>
                        ) : (
                            <span>Đạt miễn phí vận chuyển</span>
                        )}
                    </span>
                    {!isFreeShipping && (
                        <span className="text-ink-soft">
                            Thiếu <strong className="text-brand font-semibold">{formatPrice(remainingForFreeShipping)}</strong>
                        </span>
                    )}
                </div>
                <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                    <div
                        className="h-full bg-brand rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            <div className="space-y-2 pt-1 text-small">
                <div className="flex justify-between">
                    <span className="text-ink-soft">Tạm tính</span>
                    <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                        <span className="text-ink-soft">Phí vận chuyển</span>
                        <Popover open={showShippingInfo} onOpenChange={setShowShippingInfo}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                                    aria-label="Thông tin phí vận chuyển"
                                >
                                    <HelpCircle className="h-3.5 w-3.5 text-ink-faint hover:text-ink transition-colors" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent side="left" className="max-w-xs rounded-2xl border-line">
                                <div className="space-y-2 text-tiny">
                                    <p className="font-semibold text-ink">Chính sách vận chuyển ShopViet</p>
                                    <p className="text-ink-soft">
                                        • Miễn phí giao hàng tiêu chuẩn cho đơn từ ₫500.000.
                                    </p>
                                    <p className="text-ink-soft">
                                        • Giao siêu tốc 2H tại Hà Nội & TP.HCM (phụ phí tính theo khu vực).
                                    </p>
                                    <p className="text-ink-faint">
                                        • Đồng kiểm tra khi nhận hàng trước khi thanh toán.
                                    </p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <span className={`font-semibold ${isFreeShipping ? "text-emerald-700 dark:text-emerald-400" : "text-ink"}`}>
                        {isFreeShipping ? "Miễn phí" : formatPrice(shippingCost)}
                    </span>
                </div>
            </div>

            <div className="h-px bg-line/80 my-2" />

            <div className="flex justify-between items-baseline">
                <div>
                    <span className="text-base font-semibold text-ink block">Tổng thanh toán</span>
                    <span className="text-[11px] text-ink-faint">Đã bao gồm thuế VAT (nếu có)</span>
                </div>
                <span className="text-2xl font-bold text-brand tracking-tight">
                    {formatPrice(total)}
                </span>
            </div>
        </div>
    )
}


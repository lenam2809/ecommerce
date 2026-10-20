"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Lock, ArrowRight, RotateCcw, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react"
import { OrderItem } from "./order-item"
import { OrderTotals } from "./order-totals"
import { CartItem } from "@/types/cart"

interface OrderSummaryProps {
    cartItems: CartItem[]
    subtotal: number
    shippingCost: number
    discount?: number
    total: number
    isSubmitting: boolean
    isEmpty: boolean
    isSubmitDisabled?: boolean
    submitButtonText?: string
}

export function OrderSummary({
    cartItems,
    subtotal,
    shippingCost,
    discount = 500000,
    total,
    isSubmitting,
    isEmpty,
    isSubmitDisabled = false,
    submitButtonText = "Thanh toán qua VNPAY • 62.390.000₫",
}: OrderSummaryProps) {
    const [isMobileCollapsed, setIsMobileCollapsed] = useState<boolean>(false)
    const totalUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <div className="bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-24 shadow-sm">
            {/* Step 3 Accordion Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                        3
                    </span>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Tóm tắt đơn hàng
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Kiểm tra chi tiết sản phẩm & ưu đãi
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tabular-nums">
                        {totalUnits} sản phẩm
                    </span>
                    <button
                        type="button"
                        onClick={() => setIsMobileCollapsed(!isMobileCollapsed)}
                        className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        aria-expanded={!isMobileCollapsed}
                        aria-controls="order-summary-items"
                        aria-label="Thu gọn hoặc mở rộng tóm tắt đơn hàng"
                    >
                        {isMobileCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className="p-5 md:p-6 space-y-5">
                {/* Cart items list (collapsible on mobile) */}
                <div id="order-summary-items" className={`${isMobileCollapsed ? "hidden lg:block" : "block"} space-y-1 max-h-80 overflow-y-auto pr-1 divide-y divide-slate-200/70 dark:divide-slate-800`}>
                    {cartItems.map((item) => (
                        <OrderItem key={`${item.productId}-${item.color}-${item.size}`} item={item} />
                    ))}
                </div>

                {isEmpty && (
                    <div className="text-center py-6 text-slate-600 dark:text-slate-400 text-sm">
                        Giỏ hàng của bạn đang trống
                    </div>
                )}

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                {/* Price Breakdown */}
                <OrderTotals
                    subtotal={subtotal}
                    shippingCost={shippingCost}
                    discount={discount}
                    total={total}
                />

                {/* Submit button — Tech Crimson (#E11D48) exclusively for Checkout/Purchase CTA */}
                <Button
                    type="submit"
                    className="w-full h-13 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-sm font-extrabold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 group cursor-pointer tabular-nums"
                    disabled={isSubmitting || isEmpty || isSubmitDisabled}
                >
                    {isSubmitting ? (
                        <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Đang xử lý giao dịch bảo mật...</span>
                        </>
                    ) : (
                        <>
                            <span className="truncate">{submitButtonText}</span>
                            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </>
                    )}
                </Button>

                {/* Trust guarantee micro badges */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary shrink-0" />
                        <span>Bảo mật VNPAY / SSL</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4 text-primary shrink-0" />
                        <span>1 đổi 1 trong 30 ngày</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Cam kết chính hãng 100% • Bảo hành 24 tháng tại 45 Showroom</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

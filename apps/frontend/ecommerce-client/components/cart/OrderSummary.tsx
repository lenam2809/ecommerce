"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ShoppingBag, ArrowRight, Tag, ShieldCheck, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/contants"

export type PromoCodeError = {
    response?: { data?: { message?: string } }
    message?: string
}

function getPromoCodeErrorMessage(error: unknown) {
    const maybeError = error as PromoCodeError
    return maybeError.response?.data?.message || maybeError.message || "Mã giảm giá không hợp lệ"
}

type OrderSummaryProps = {
    subtotal: number
    shippingCost: number
    discount: number
    total: number
    itemCount: number
    appleCareTotal?: number
    onApplyPromoCode: (code: string) => void
    isApplyingPromoCode: boolean
    promoCodeError?: unknown
}

/**
 * OrderSummary (Cart) — Hybrid Premium Tech (SSoT 2026)
 * - Clean white surface (#FFFFFF) on Light Mode, #111827 on Dark Mode
 * - Voucher TECHVIP500 active badge ("Đang sử dụng" -500.000₫)
 * - Crimson (#E11D48) "Tiến hành thanh toán" CTA
 * - Mobile Sticky Bottom Bar so checkout is always accessible
 */
const OrderSummary = ({
    subtotal,
    shippingCost,
    discount,
    itemCount,
    onApplyPromoCode,
    isApplyingPromoCode,
    promoCodeError,
}: OrderSummaryProps) => {
    const [promoCode, setPromoCode] = useState("")

    const effectiveDiscount = discount > 0 ? discount : 0
    const isFreeShipping = shippingCost === 0 || subtotal >= 500000
    const effectiveTotal = Math.max(
        0,
        subtotal + (isFreeShipping ? 0 : shippingCost || 30000) - effectiveDiscount
    )

    const handleApplyPromoCode = () => {
        const trimmed = promoCode.trim().toUpperCase()
        if (!trimmed) return
        onApplyPromoCode(trimmed)
    }

    return (
        <>
            <aside className="bg-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-24 shadow-sm">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-card/50">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        <h3 className="text-small font-bold text-slate-900 dark:text-white">
                            Tóm tắt đơn hàng
                        </h3>
                    </div>
                    <span className="text-tiny font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                        {itemCount} sản phẩm
                    </span>
                </div>

                <div className="p-5 md:p-6 space-y-5">
                    {/* Promo Code Input */}
                    <div className="bg-slate-50 dark:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <h4 className="text-tiny font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                                <Tag className="h-3.5 w-3.5 text-primary" />
                                <span>Mã ưu đãi ShopViet</span>
                            </h4>
                            {effectiveDiscount > 0 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                                    <Check className="h-3 w-3 stroke-[3]" />
                                    Đang sử dụng
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Nhập mã ưu đãi..."
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-tiny font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-primary/30"
                                disabled={isApplyingPromoCode}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleApplyPromoCode}
                                disabled={!promoCode.trim() || isApplyingPromoCode}
                                className="h-10 px-4 rounded-xl border-primary/30 text-primary hover:bg-primary hover:text-white text-tiny font-bold shrink-0"
                            >
                                {isApplyingPromoCode ? "..." : "Áp dụng"}
                            </Button>
                        </div>

                        {Boolean(promoCodeError) && (
                            <p className="text-tiny text-destructive flex items-center gap-1.5 bg-destructive/10 px-3 py-1.5 rounded-xl">
                                <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                                {getPromoCodeErrorMessage(promoCodeError)}
                            </p>
                        )}
                    </div>

                    {/* Price breakdown */}
                    <div className="space-y-3 text-small">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-400">Tạm tính ({itemCount} món)</span>
                            <span className="font-semibold text-slate-900 dark:text-white font-mono tabular-nums whitespace-nowrap">
                                {formatPrice(subtotal)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-400">Phí vận chuyển (Giao 2H)</span>
                            <span className="font-medium">
                                {isFreeShipping ? (
                                    <span className="text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-tiny">
                                        Miễn phí (Đơn ≥ 500k)
                                    </span>
                                ) : (
                                    <span className="text-slate-900 dark:text-white font-mono tabular-nums whitespace-nowrap">
                                        {formatPrice(shippingCost || 30000)}
                                    </span>
                                )}
                            </span>
                        </div>

                        {effectiveDiscount > 0 && (
                            <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
                                <span className="flex items-center gap-1 font-semibold">
                                    <Tag className="w-3.5 h-3.5" /> Mã ưu đãi
                                </span>
                                <span className="font-bold font-mono tabular-nums whitespace-nowrap">
                                    -{formatPrice(effectiveDiscount)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-slate-800" />

                    {/* Total */}
                    <div className="flex justify-between items-baseline">
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                            Tổng thanh toán
                        </span>
                        <div className="text-right">
                            <span className="block text-2xl font-extrabold text-brand font-mono tracking-tight tabular-nums whitespace-nowrap">
                                {formatPrice(effectiveTotal)}
                            </span>
                            <span className="text-tiny text-slate-500 dark:text-slate-400 mt-0.5 block">
                                (Đã bao gồm 10% thuế VAT)
                            </span>
                        </div>
                    </div>

                    {/* Checkout CTA Button — Exclusively Tech Crimson */}
                    <div className="space-y-3.5 pt-1">
                        <Button
                            className="w-full h-12 rounded-xl bg-brand text-white hover:bg-brand/90 text-small font-bold transition-all shadow-md active:scale-[0.99]"
                            asChild
                        >
                            <Link href="/checkout" className="flex items-center justify-center gap-2">
                                <span>Tiến hành thanh toán</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>

                        {/* Trust guarantee */}
                        <div className="flex items-center justify-center gap-2 text-tiny text-slate-600 dark:text-slate-400 text-center">
                            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Bảo mật SSL 256-bit • Hỗ trợ trả góp 0% tại bước sau</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Sticky Checkout Summary Bar (z-50 — Prevents overlap with 120px bottom padding) */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
                <div className="container-app py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        {effectiveDiscount > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                <Check className="h-3 w-3" />
                                <span>Ưu đãi (-{formatPrice(effectiveDiscount)})</span>
                            </div>
                        )}
                        <p className="text-lg font-extrabold text-brand font-mono tabular-nums whitespace-nowrap">
                            {formatPrice(effectiveTotal)}
                        </p>
                    </div>
                    <Button
                        className="h-11 px-5 rounded-xl bg-brand text-white hover:bg-brand/90 text-tiny font-bold shadow-sm shrink-0"
                        asChild
                    >
                        <Link href="/checkout" className="flex items-center gap-1.5">
                            <span>Thanh toán ({itemCount})</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    )
}

export default OrderSummary

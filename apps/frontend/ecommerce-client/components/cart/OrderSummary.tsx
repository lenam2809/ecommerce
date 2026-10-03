"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ShoppingBag, ArrowRight, Tag, ShieldCheck, Check, Sparkles } from "lucide-react"
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
    onApplyPromoCode: (code: string) => void
    isApplyingPromoCode: boolean
    promoCodeError?: unknown
}

const OrderSummary = ({
    subtotal,
    shippingCost,
    discount,
    total,
    itemCount,
    onApplyPromoCode,
    isApplyingPromoCode,
    promoCodeError,
}: OrderSummaryProps) => {
    const [promoCode, setPromoCode] = useState("")

    const handleApplyPromoCode = () => {
        if (promoCode.trim()) {
            onApplyPromoCode(promoCode.trim())
        }
    }

    const isFreeShipping = shippingCost === 0 || subtotal >= 500000

    return (
        <aside className="bg-card rounded-3xl border border-line overflow-hidden sticky top-28 shadow-xs">
            <div className="p-5 border-b border-line/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-brand" />
                    <h3 className="text-small font-semibold text-ink">Tóm tắt đơn hàng</h3>
                </div>
                <span className="text-tiny font-medium text-ink-faint">
                    {itemCount} sản phẩm
                </span>
            </div>

            <div className="p-5 md:p-6 space-y-5">
                {/* Price breakdown */}
                <div className="space-y-3 text-small">
                    <div className="flex justify-between items-center">
                        <span className="text-ink-soft">Tạm tính</span>
                        <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-ink-soft">Phí vận chuyển</span>
                        <span className="font-medium">
                            {isFreeShipping ? (
                                <span className="text-brand font-semibold px-2 py-0.5 rounded-full bg-brand-soft text-tiny">
                                    Miễn phí
                                </span>
                            ) : (
                                <span className="text-ink">{formatPrice(shippingCost || 30000)}</span>
                            )}
                        </span>
                    </div>

                    {discount > 0 && (
                        <div className="flex justify-between items-center text-brand">
                            <span className="flex items-center gap-1 font-medium">
                                <Tag className="w-3.5 h-3.5" /> Giảm giá voucher
                            </span>
                            <span className="font-bold">-{formatPrice(discount)}</span>
                        </div>
                    )}
                </div>

                <div className="h-px bg-line/60" />

                {/* Total */}
                <div className="flex justify-between items-baseline">
                    <span className="text-base font-semibold text-ink">Tổng cộng</span>
                    <div className="text-right">
                        <span className="block text-2xl font-bold text-ink tracking-tight">
                            {formatPrice(total)}
                        </span>
                        <span className="text-tiny text-ink-faint mt-0.5 block">
                            (Đã bao gồm VAT 10%)
                        </span>
                    </div>
                </div>

                {/* Promo Code Box */}
                <div className="bg-surface-2/60 rounded-2xl border border-line/70 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <h4 className="text-tiny font-semibold text-ink flex items-center gap-1.5 uppercase tracking-wider">
                            <Tag className="h-3.5 w-3.5 text-brand" />
                            <span>Mã giảm giá</span>
                        </h4>
                        <button
                            type="button"
                            onClick={() => {
                                setPromoCode("TECHVIP500")
                                onApplyPromoCode("TECHVIP500")
                            }}
                            className="text-[11px] text-brand hover:underline font-medium inline-flex items-center gap-1"
                        >
                            <Sparkles className="h-3 w-3" />
                            Gợi ý: TECHVIP500
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder="Nhập mã ưu đãi..."
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="h-10 rounded-full border-line bg-background text-tiny text-ink placeholder:text-ink-faint focus-visible:ring-brand/40"
                            disabled={isApplyingPromoCode}
                        />
                        <Button
                            variant="outline"
                            onClick={handleApplyPromoCode}
                            disabled={!promoCode.trim() || isApplyingPromoCode}
                            className="h-10 px-5 rounded-full border-line text-ink hover:bg-surface text-tiny font-semibold shrink-0"
                        >
                            {isApplyingPromoCode ? "..." : "Áp dụng"}
                        </Button>
                    </div>

                    {discount > 0 && (
                        <p className="text-tiny text-brand font-medium flex items-center gap-1.5 bg-brand-soft px-3 py-1.5 rounded-full">
                            <Check className="h-3 w-3" />
                            Đã áp dụng mã giảm giá thành công!
                        </p>
                    )}

                    {Boolean(promoCodeError) && (
                        <p className="text-tiny text-destructive flex items-center bg-destructive/5 px-3 py-1.5 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-destructive mr-2 shrink-0" />
                            {getPromoCodeErrorMessage(promoCodeError)}
                        </p>
                    )}
                </div>

                {/* Checkout CTA Button */}
                <div className="space-y-4 pt-1">
                    <Button
                        className="w-full h-12 rounded-full bg-brand text-white hover:bg-brand-hover text-small font-semibold transition-all shadow-sm hover:shadow-md focus-ring"
                        asChild
                    >
                        <Link href="/checkout" className="flex items-center justify-center gap-2">
                            <span>Tiến hành thanh toán</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>

                    {/* Trust guarantee */}
                    <div className="flex items-center justify-center gap-2 text-tiny text-ink-faint text-center">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Thanh toán an toàn, mã hóa SSL 256-bit</span>
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default OrderSummary

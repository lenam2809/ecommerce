"use client"

import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/contants"
import { HelpCircle } from "lucide-react"
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
    const isFreeShipping = shippingCost === 0
    const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD

    const shippingTooltip = qualifiesForFreeShipping && isFreeShipping
        ? "Bạn đã đủ điều kiện miễn phí vận chuyển! 🎉"
        : qualifiesForFreeShipping
        ? "Thêm ₫" + formatPrice(FREE_SHIPPING_THRESHOLD - subtotal) + " để được miễn phí vận chuyển"
        : `Thêm ₫${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} để được miễn phí vận chuyển`

    return (
        <>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Phí vận chuyển</span>
                        <Popover open={showShippingInfo} onOpenChange={setShowShippingInfo}>
                            <PopoverTrigger asChild>
                                <button 
                                    className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                                    aria-label="Shipping fee information"
                                >
                                    <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent side="left" className="max-w-xs">
                                <div className="space-y-2">
                                    <p className="font-semibold">Thông tin vận chuyển</p>
                                    <p className="text-sm">{shippingTooltip}</p>
                                    <p className="text-xs text-muted-foreground/80">
                                        • Miễn phí vận chuyển cho đơn hàng từ ₫500.000
                                    </p>
                                    <p className="text-xs text-muted-foreground/80">
                                        • Thời gian giao dự kiến: 2-3 ngày làm việc
                                    </p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <span className={`font-medium ${isFreeShipping ? "text-green-600 dark:text-green-400" : ""}`}>
                        {isFreeShipping ? "Miễn phí" : formatPrice(shippingCost)}
                    </span>
                </div>

                {!isFreeShipping && !qualifiesForFreeShipping && (
                    <p className="text-xs text-muted-foreground text-right">
                        Thêm {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} để được miễn phí vận chuyển
                    </p>
                )}
            </div>

            <Separator />

            <div className="flex justify-between font-bold">
                <span>Tổng cộng</span>
                <span className="text-lg">{formatPrice(total)}</span>
            </div>
        </>
    )
}

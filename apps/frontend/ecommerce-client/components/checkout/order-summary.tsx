import { Button } from "@/components/ui/button"
import { Lock, ArrowRight, RotateCcw } from "lucide-react"
import { OrderItem } from "./order-item"
import { OrderTotals } from "./order-totals"
import { CartItem } from "@/types/cart"

interface OrderSummaryProps {
    cartItems: CartItem[]
    subtotal: number
    shippingCost: number
    total: number
    isSubmitting: boolean
    isEmpty: boolean
    isSubmitDisabled?: boolean
    submitButtonText?: string
}

/**
 * OrderSummary (checkout) — Editorial Tech Minimalism
 */
export function OrderSummary({
    cartItems,
    subtotal,
    shippingCost,
    total,
    isSubmitting,
    isEmpty,
    isSubmitDisabled = false,
    submitButtonText = "Hoàn tất đơn hàng",
}: OrderSummaryProps) {
    return (
        <div className="bg-card text-card-foreground rounded-3xl border border-line overflow-hidden sticky top-24 shadow-xs">
            <div className="p-5 border-b border-line/60 flex items-center justify-between">
                <div>
                    <h3 className="text-small font-semibold text-ink">Đơn hàng của bạn</h3>
                    <p className="text-tiny text-ink-faint mt-0.5">Kiểm tra thông tin chi tiết</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-brand-soft text-brand text-tiny font-bold">
                    {cartItems.length} món
                </span>
            </div>

            <div className="p-5 md:p-6 space-y-5">
                {/* Cart items list */}
                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1 divide-y divide-line/40">
                    {cartItems.map((item) => (
                        <OrderItem key={`${item.productId}-${item.color}-${item.size}`} item={item} />
                    ))}
                </div>

                {isEmpty && (
                    <div className="text-center py-6 text-ink-soft text-small">
                        Giỏ hàng của bạn đang trống
                    </div>
                )}

                <div className="h-px bg-line/80" />

                {/* Price Breakdown */}
                <OrderTotals subtotal={subtotal} shippingCost={shippingCost} total={total} />

                {/* Submit button */}
                <Button
                    type="submit"
                    className="w-full h-12 rounded-full bg-brand text-white hover:bg-brand-hover text-small font-semibold shadow-xs hover:shadow-brand-glow transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    disabled={isSubmitting || isEmpty || isSubmitDisabled}
                >
                    {isSubmitting ? (
                        <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Đang xử lý đơn hàng...</span>
                        </>
                    ) : (
                        <>
                            <span>{submitButtonText}</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                    )}
                </Button>

                {/* Trust guarantee micro badges */}
                <div className="pt-2 border-t border-line/60 grid grid-cols-2 gap-3 text-tiny text-ink-faint">
                    <div className="flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5 text-brand shrink-0" />
                        <span>Bảo mật thanh toán 100%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <RotateCcw className="h-3.5 w-3.5 text-brand shrink-0" />
                        <span>Đổi trả 30 ngày nếu lỗi</span>
                    </div>
                </div>
            </div>
        </div>
    )
}


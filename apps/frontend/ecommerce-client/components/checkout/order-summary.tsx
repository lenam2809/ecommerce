import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ShieldCheck, CreditCard, AlertCircle } from "lucide-react"
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
}

export function OrderSummary({
    cartItems,
    subtotal,
    shippingCost,
    total,
    isSubmitting,
    isEmpty,
}: OrderSummaryProps) {
    return (
        <div className="bg-card text-card-foreground rounded-lg border border-border/20 overflow-hidden sticky top-20">
            <div className="p-4 bg-muted border-b border-border/20">
                <h3 className="font-medium text-foreground">Đơn hàng của bạn ({cartItems.length} sản phẩm)</h3>
            </div>

            <div className="p-4">
                <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {cartItems.map((item) => (
                            <OrderItem key={`${item.productId}-${item.color}-${item.size}`} item={item} />
                        ))}
                    </div>

                    {isEmpty && (
                        <div className="text-center py-4 text-muted-foreground">
                            Giỏ hàng trống
                        </div>
                    )}

                    <Separator />

                    <OrderTotals subtotal={subtotal} shippingCost={shippingCost} total={total} />

                    <div className="bg-muted border border-border/20 rounded-lg p-3 flex items-start">
                        <AlertCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                            Bằng cách đặt hàng, bạn đồng ý với các điều khoản và điều kiện của chúng tôi.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12"
                        disabled={isSubmitting || isEmpty}
                    >
                        {isSubmitting ? "Đang xử lý..." : "Hoàn tất đơn hàng"}
                    </Button>

                    <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                            <ShieldCheck className="h-4 w-4 mr-1" />
                            <span>Bảo mật</span>
                        </div>
                        <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-1" />
                            <span>Thanh toán an toàn</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
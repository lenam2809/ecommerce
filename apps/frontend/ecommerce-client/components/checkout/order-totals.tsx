import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/contants"

interface OrderTotalsProps {
    subtotal: number
    shippingCost: number
    total: number
}

export function OrderTotals({ subtotal, shippingCost, total }: OrderTotalsProps) {
    return (
        <>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span>{shippingCost === 0 ? "Miễn phí" : formatPrice(shippingCost)}</span>
                </div>
            </div>

            <Separator />

            <div className="flex justify-between font-bold">
                <span>Tổng cộng</span>
                <span className="text-lg">{formatPrice(total)}</span>
            </div>
        </>
    )
}
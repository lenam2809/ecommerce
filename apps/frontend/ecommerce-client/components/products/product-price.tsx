import { formatPrice } from "@/lib/contants"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCard } from "lucide-react"

interface ProductPriceProps {
    isLoading: boolean
    price: number
    salePrice?: number
}

/**
 * ProductPrice — Editorial Tech Minimalism
 * Large high-contrast price display, ruby red discount pill badge, and 0% installment note
 */
export function ProductPrice({ isLoading, price, salePrice }: ProductPriceProps) {
    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-10 w-48 rounded-xl" />
                <Skeleton className="h-4 w-32 rounded-full" />
            </div>
        )
    }

    const currentPrice = salePrice ?? price
    const discountPercentage = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0
    const monthlyInstallment = Math.round(currentPrice / 12)

    return (
        <div className="p-4 rounded-2xl bg-surface-2/60 border border-line/60 space-y-2.5">
            <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                    {formatPrice(currentPrice)}
                </span>
                {salePrice && (
                    <>
                        <span className="text-small text-ink-faint line-through">
                            {formatPrice(price)}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-brand text-white text-tiny font-bold tracking-tight shadow-xs">
                            -{discountPercentage}%
                        </span>
                    </>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-tiny text-ink-soft">
                <span>Giá đã bao gồm thuế VAT</span>
                <span className="text-ink-faint">·</span>
                <span className="inline-flex items-center gap-1 font-medium text-ink">
                    <CreditCard className="h-3 w-3 text-brand" />
                    Trả góp 0% chỉ từ {formatPrice(monthlyInstallment)}/tháng
                </span>
            </div>
        </div>
    )
}

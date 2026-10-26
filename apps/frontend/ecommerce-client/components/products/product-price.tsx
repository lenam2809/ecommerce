import { formatPrice } from "@/lib/contants"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCard, ShieldPlus } from "lucide-react"

interface ProductPriceProps {
    isLoading: boolean
    price: number
    salePrice?: number
    appleCarePlusPrice?: number
    includeAppleCare?: boolean
}

/**
 * ProductPrice — Hybrid Premium Tech (SSoT 2026)
 * Large tabular-nums whitespace-nowrap price display, Crimson discount badge (-XX%), and 0% installment note
 */
export function ProductPrice({
    isLoading,
    price,
    salePrice,
    appleCarePlusPrice = 0,
    includeAppleCare = false,
}: ProductPriceProps) {
    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-10 w-48 rounded-xl" />
                <Skeleton className="h-4 w-32 rounded-full" />
            </div>
        )
    }

    const baseCurrentPrice = salePrice ?? price
    const totalCurrentPrice = baseCurrentPrice + (includeAppleCare ? appleCarePlusPrice : 0)
    const discountPercentage = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0
    const monthlyInstallment = Math.round(totalCurrentPrice / 12)

    return (
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-2/70 dark:bg-card border border-line/80 space-y-2.5">
            <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink dark:text-white font-mono tabular-nums whitespace-nowrap">
                    {formatPrice(totalCurrentPrice)}
                </span>
                {salePrice && (
                    <>
                        <span className="text-small text-ink-faint line-through font-mono tabular-nums whitespace-nowrap">
                            {formatPrice(price + (includeAppleCare ? appleCarePlusPrice : 0))}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-brand text-white text-tiny font-bold tracking-tight shadow-xs font-mono tabular-nums whitespace-nowrap">
                            -{discountPercentage}%
                        </span>
                    </>
                )}
            </div>

            {includeAppleCare && appleCarePlusPrice > 0 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-tiny font-semibold text-primary tabular-nums">
                    <ShieldPlus className="h-3.5 w-3.5 shrink-0" />
                    <span>Đã bao gồm gói bảo hành mở rộng AppleCare+ (+{formatPrice(appleCarePlusPrice)})</span>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-tiny text-ink-soft pt-0.5">
                <span>Giá đã bao gồm 10% VAT</span>
                <span className="text-ink-faint">·</span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary font-mono tabular-nums whitespace-nowrap">
                    <CreditCard className="h-3.5 w-3.5 text-primary" />
                    Trả góp 0% chỉ từ {formatPrice(monthlyInstallment)}/tháng (12 kỳ)
                </span>
            </div>
        </div>
    )
}

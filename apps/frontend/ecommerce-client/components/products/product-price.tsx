import { formatPrice } from "@/lib/contants"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductPriceProps {
    isLoading: boolean
    price: number
    salePrice?: number
}

export function ProductPrice({ isLoading, price, salePrice }: ProductPriceProps) {
    if (isLoading) {
        return <Skeleton className="h-12 w-1/2 rounded-2xl" />
    }

    const discountPercentage = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0

    return (
        <div className="mb-6">
            {salePrice ? (
                <div className="flex flex-wrap items-baseline gap-3 tracking-tight">
                    <span className="text-4xl font-bold text-primary drop-shadow-sm">
                        {formatPrice(salePrice)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through decoration-2 decoration-muted-foreground/50 opacity-70">
                        {formatPrice(price)}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold leading-none bg-destructive/10 text-destructive border border-destructive/20 ml-1 translate-y-[-4px]">
                        -{discountPercentage}%
                    </span>
                </div>
            ) : (
                <span className="text-4xl font-bold text-primary drop-shadow-sm tracking-tight">
                    {formatPrice(price)}
                </span>
            )}
        </div>
    )
}
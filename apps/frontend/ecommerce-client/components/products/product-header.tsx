import { Skeleton } from "@/components/ui/skeleton"
import { Star, ShieldCheck, Store } from "lucide-react"

interface ProductHeaderProps {
    isLoading: boolean
    name?: string
    categoryName?: string
    sku?: string
    rating?: number
    reviewCount?: number
}

/**
 * ProductHeader — Hybrid Premium Tech (SSoT 2026)
 * Electric Blue category tag + H1 product title + Star rating & SSoT 24T warranty badge
 */
export function ProductHeader({
    isLoading,
    name,
    categoryName,
    sku,
    rating = 0,
    reviewCount = 0,
}: ProductHeaderProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-4 w-28 rounded-full" />
                <Skeleton className="h-10 w-full max-w-lg rounded-xl" />
                <Skeleton className="h-5 w-48 rounded-full" />
            </div>
        )
    }

    const displayRating = rating > 0 ? rating.toFixed(1) : "4.9"

    return (
        <div className="space-y-2.5">
            {/* Category tag & SKU */}
            <div className="flex flex-wrap items-center gap-2">
                {categoryName && (
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-tiny font-bold uppercase tracking-wider">
                        {categoryName}
                    </span>
                )}
                <span className="text-tiny text-ink-faint font-medium tabular-nums">
                    SKU: {sku || "MBP14-M3P-36-1TB"}
                </span>
            </div>

            {/* Main Product Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-ink leading-tight">
                {name}
            </h1>

            {/* Rating & Trust Badges Row */}
            <div className="flex flex-wrap items-center gap-3 pt-0.5 text-small">
                <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-ink tabular-nums">{displayRating}</span>
                    <span className="text-ink-faint text-tiny tabular-nums">
                        ({reviewCount > 0 ? reviewCount : 128} đánh giá)
                    </span>
                </div>

                <span className="h-3.5 w-px bg-line/80" />

                <div className="flex items-center gap-1 text-tiny font-semibold text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Bảo hành 24 tháng (12T Apple + 12T ShopViet)</span>
                </div>

                <span className="h-3.5 w-px bg-line/80 hidden sm:inline-block" />

                <div className="hidden sm:flex items-center gap-1 text-tiny font-medium text-emerald-600 dark:text-emerald-400">
                    <Store className="h-3.5 w-3.5" />
                    <span>Sẵn hàng tại 45 Showroom</span>
                </div>
            </div>
        </div>
    )
}

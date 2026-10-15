import { Skeleton } from "@/components/ui/skeleton"
import { Star, ShieldCheck } from "lucide-react"

interface ProductHeaderProps {
    isLoading: boolean
    name?: string
    categoryName?: string
    rating?: number
    reviewCount?: number
}

/**
 * ProductHeader — Editorial Tech Minimalism
 * Category micro-label + H1 product title + Star rating & verification badge
 */
export function ProductHeader({
    isLoading,
    name,
    categoryName,
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

    const displayRating = rating > 0 ? rating.toFixed(1) : "5.0"

    return (
        <div className="space-y-2.5">
            {/* Category tag */}
            {categoryName && (
                <div className="inline-flex items-center gap-2">
                    <span className="text-tiny font-bold uppercase tracking-wider text-brand">
                        {categoryName}
                    </span>
                    <span className="text-ink-faint">·</span>
                    <span className="text-tiny text-ink-faint font-medium">Flagship Series</span>
                </div>
            )}

            {/* Main Product Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold tracking-tight text-ink leading-tight">
                {name}
            </h1>

            {/* Rating & Trust Badges Row */}
            <div className="flex flex-wrap items-center gap-3 pt-0.5 text-small">
                <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>
                    <span className="font-semibold text-ink">{displayRating}</span>
                    <span className="text-ink-faint text-tiny">
                        {reviewCount > 0 ? `(${reviewCount} đánh giá)` : "(Đã kiểm định)"}
                    </span>
                </div>

                <span className="h-3.5 w-px bg-line/80" />

                <div className="flex items-center gap-1 text-tiny font-medium text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Chính Hãng VN/A</span>
                </div>
            </div>
        </div>
    )
}

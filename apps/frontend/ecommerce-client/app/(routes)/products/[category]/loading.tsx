import { Skeleton } from "@/components/ui/skeleton"
import ProductCardSkeleton from "@/components/product-card-skeleton"

export default function Loading() {
    return (
        <div className="container-app py-8 md:py-12">
            {/* Header Skeleton */}
            <div className="mb-8">
                <Skeleton className="h-3 w-24 rounded-full mb-2" />
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-24" />
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Filter Skeleton */}
                <div className="hidden md:block w-72 flex-shrink-0">
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-32 mb-4" />
                        <Skeleton className="h-40 w-full rounded-2xl" />
                        <Skeleton className="h-8 w-32 mb-4" />
                        <Skeleton className="h-40 w-full rounded-2xl" />
                    </div>
                </div>

                {/* Grid Skeleton */}
                <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {Array(8).fill(0).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

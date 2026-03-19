import { Skeleton } from "@/components/ui/skeleton"
import ProductCardSkeleton from "@/components/product-card-skeleton"

export default function Loading() {
    return (
        <div className="container mx-auto py-8">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-[180px]" />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Filter Skeleton */}
                <div className="hidden md:block w-64 flex-shrink-0">
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-32 mb-4" />
                        <Skeleton className="h-40 w-full rounded-lg" />
                        <Skeleton className="h-8 w-32 mb-4" />
                        <Skeleton className="h-40 w-full rounded-lg" />
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

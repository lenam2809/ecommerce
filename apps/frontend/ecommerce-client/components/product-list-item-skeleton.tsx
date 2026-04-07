import { Skeleton } from "@/components/ui/skeleton"

export default function ProductListItemSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border/50 overflow-hidden flex flex-col md:flex-row gap-4 p-4 transition-all duration-300">
      {/* Image placeholder */}
      <div className="h-48 md:h-32 md:w-40 w-full flex-shrink-0 bg-secondary/20 rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {/* Product name skeleton - 2 lines */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
        </div>

        {/* Category and stock skeleton */}
        <div className="flex items-center gap-4 text-sm">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>

        {/* Description skeleton - 2 lines (hidden on mobile) */}
        <div className="space-y-1 hidden md:block mt-auto">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-4/5 rounded-md" />
        </div>

        {/* Price and actions skeleton */}
        <div className="flex items-center justify-between gap-3 mt-auto md:mt-2">
          <Skeleton className="h-6 w-28 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}


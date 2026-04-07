import { Skeleton } from "@/components/ui/skeleton"

export default function ProductCardSkeleton() {
  return (
    <div className="group relative flex flex-col h-full bg-card rounded-2xl border border-border/50 overflow-hidden transition-all duration-300">
      {/* Image placeholder with proper aspect ratio */}
      <div className="relative aspect-square overflow-hidden bg-secondary/20 flex-shrink-0">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      <div className="p-4 flex flex-col flex-grow gap-3">
        {/* Title skeleton - 2 lines */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
        </div>

        {/* Rating skeleton */}
        <div className="flex items-center gap-1 mt-auto">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>

        {/* Price section skeleton */}
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>

        {/* Button skeleton */}
        <Skeleton className="h-10 w-full rounded-lg mt-auto" />
      </div>
    </div>
  )
}


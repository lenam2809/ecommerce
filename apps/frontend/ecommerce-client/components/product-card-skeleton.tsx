import { Skeleton } from "@/components/ui/skeleton"

export default function ProductCardSkeleton() {
  return (
    <div className="group relative flex flex-col h-full bg-card dark:bg-[#111827] rounded-2xl border border-border/80 dark:border-white/[0.08] overflow-hidden shadow-xs dark:shadow-none transition-all duration-300">
      {/* Image placeholder matching aspect-square */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-[#182234] flex-shrink-0">
        <Skeleton className="w-full h-full rounded-none bg-slate-200/60 dark:bg-white/5" />
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

        {/* Bottom price + cart button skeleton */}
        <div className="flex items-center justify-between pt-2 mt-auto">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  )
}


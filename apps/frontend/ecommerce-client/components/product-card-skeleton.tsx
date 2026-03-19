import { Skeleton } from "@/components/ui/skeleton"

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-white/5 overflow-hidden">
      <Skeleton className="relative aspect-square sm:aspect-[4/5] bg-secondary/30 w-full rounded-none" />
      <div className="p-4 flex flex-col flex-grow gap-3 bg-card">
        <Skeleton className="h-5 w-3/4 bg-secondary/30" />
        <Skeleton className="h-4 w-12 mt-auto bg-secondary/30" />
        <div className="flex items-end justify-between gap-2 h-8">
          <Skeleton className="h-6 w-24 bg-secondary/30" />
        </div>
      </div>
    </div>
  )
}


// components/wishlist/wishlist-loading.tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function WishlistLoading() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array(8).fill(0).map((_, i) => (
                <div key={i} className="rounded-2xl border border-line overflow-hidden">
                    <Skeleton className="aspect-[4/5] w-full rounded-none" />
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-10 w-full rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    )
}

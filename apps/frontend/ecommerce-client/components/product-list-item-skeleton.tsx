import { Skeleton } from "@/components/ui/skeleton"

export default function ProductListItemSkeleton() {
    return (
        <div className="bg-card rounded-2xl border border-white/5 overflow-hidden flex flex-col md:flex-row h-full w-full">
            <Skeleton className="h-48 md:h-auto md:w-48 w-full bg-secondary/30 rounded-none shrink-0" />

            <div className="flex-1 p-5 flex flex-col bg-card">
                <div className="mb-3 space-y-2">
                    <Skeleton className="h-6 w-3/4 bg-secondary/30" />
                    <Skeleton className="h-4 w-1/2 bg-secondary/30" />
                </div>

                <Skeleton className="h-16 w-full mb-4 bg-secondary/30 hidden md:block" />

                <div className="flex items-center justify-between mt-auto">
                    <Skeleton className="h-7 w-24 bg-secondary/30" />

                    <div className="flex space-x-2">
                        <Skeleton className="h-9 w-10 md:w-20 bg-secondary/30" />
                        <Skeleton className="h-9 w-24 md:w-32 bg-secondary/30" />
                    </div>
                </div>
            </div>
        </div>
    )
}


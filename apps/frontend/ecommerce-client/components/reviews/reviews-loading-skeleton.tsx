import { Skeleton } from "@/components/ui/skeleton"

export function ReviewsLoadingSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex flex-col items-center justify-center">
                    <Skeleton className="h-16 w-16 mb-2" />
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="col-span-2 space-y-2">
                    {Array(5)
                        .fill(0)
                        .map((_, index) => (
                            <div key={index} className="flex items-center">
                                <Skeleton className="h-4 w-20 mr-2" />
                                <Skeleton className="h-2 flex-1 mr-2" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                        ))}
                </div>
            </div>

            <Skeleton className="h-40 w-full mb-8" />

            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-40" />
            </div>

            {Array(3)
                .fill(0)
                .map((_, index) => (
                    <div key={index} className="border-b pb-6 mb-6">
                        <div className="flex items-start">
                            <Skeleton className="h-10 w-10 rounded-full mr-3" />
                            <div className="flex-1">
                                <Skeleton className="h-5 w-40 mb-1" />
                                <Skeleton className="h-4 w-60 mb-2" />
                                <Skeleton className="h-20 w-full mb-3" />
                                <div className="flex space-x-4">
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-8 w-20" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    )
}
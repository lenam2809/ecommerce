import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface PageSkeletonProps {
    hasHeader?: boolean
    hasBreadcrumb?: boolean
    hasActions?: boolean
    contentType?: "table" | "form" | "cards" | "custom"
    className?: string
}

export function PageSkeleton({
    hasHeader = true,
    hasBreadcrumb = true,
    hasActions = true,
    contentType = "table",
    className,
}: PageSkeletonProps) {
    return (
        <div className={cn("space-y-6 p-6", className)}>
            {/* Breadcrumb */}
            {hasBreadcrumb && (
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                </div>
            )}

            {/* Header */}
            {hasHeader && (
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-72" />
                    </div>
                    {hasActions && (
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            {contentType === "table" && <TableContentSkeleton />}
            {contentType === "form" && <FormContentSkeleton />}
            {contentType === "cards" && <CardsContentSkeleton />}
        </div>
    )
}

function TableContentSkeleton() {
    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Table */}
            <div className="rounded-md border">
                {/* Header */}
                <div className="flex border-b p-4 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-4 flex-1" />
                    ))}
                </div>
                {/* Rows */}
                {[1, 2, 3, 4, 5].map((row) => (
                    <div key={row} className="flex border-b p-4 gap-4">
                        {[1, 2, 3, 4, 5].map((col) => (
                            <Skeleton key={col} className="h-4 flex-1" />
                        ))}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                </div>
            </div>
        </div>
    )
}

function FormContentSkeleton() {
    return (
        <div className="max-w-2xl space-y-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
            <div className="flex gap-3 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-20" />
            </div>
        </div>
    )
}

function CardsContentSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-lg border p-4 space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                </div>
            ))}
        </div>
    )
}

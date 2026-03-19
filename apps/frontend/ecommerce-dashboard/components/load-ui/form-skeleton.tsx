import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface FormSkeletonProps {
    fields?: number
    hasTitle?: boolean
    hasActions?: boolean
    className?: string
}

export function FormSkeleton({
    fields = 4,
    hasTitle = true,
    hasActions = true,
    className
}: FormSkeletonProps) {
    return (
        <Card className={cn("w-full", className)}>
            {hasTitle && (
                <CardHeader className="space-y-2">
                    <Skeleton className="h-7 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
            )}
            <CardContent className="space-y-6">
                {/* Form Fields */}
                {Array(fields)
                    .fill(0)
                    .map((_, i) => (
                        <div key={i} className="space-y-2">
                            {/* Label */}
                            <Skeleton className="h-4 w-24" />
                            {/* Input */}
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}

                {/* Action Buttons */}
                {hasActions && (
                    <div className="flex gap-3 pt-4">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-20" />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

interface FormRowSkeletonProps {
    hasLabel?: boolean
    inputWidth?: "full" | "half" | "third"
}

export function FormRowSkeleton({ hasLabel = true, inputWidth = "full" }: FormRowSkeletonProps) {
    const widthClass = {
        full: "w-full",
        half: "w-1/2",
        third: "w-1/3",
    }[inputWidth]

    return (
        <div className="space-y-2">
            {hasLabel && <Skeleton className="h-4 w-24" />}
            <Skeleton className={cn("h-10", widthClass)} />
        </div>
    )
}

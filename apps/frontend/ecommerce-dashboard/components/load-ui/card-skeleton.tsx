import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface CardSkeletonProps {
    hasHeader?: boolean
    hasFooter?: boolean
    contentItems?: number
}

export function CardSkeleton({ hasHeader = true, hasFooter = false, contentItems = 3 }: CardSkeletonProps) {
    return (
        <Card>
            {hasHeader && (
                <CardHeader className="gap-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
            )}
            <CardContent className="flex flex-col gap-3">
                {Array(contentItems)
                    .fill(0)
                    .map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                    ))}
            </CardContent>
            {hasFooter && (
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            )}
        </Card>
    )
}

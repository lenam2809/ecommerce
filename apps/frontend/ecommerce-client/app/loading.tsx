import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center justify-center gap-4">
                {/* Polished skeleton-based loader */}
                <div className="relative w-16 h-16">
                    <Skeleton className="absolute inset-0 rounded-full" />
                    <div className="absolute inset-1 bg-background rounded-full animate-pulse" />
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Đang tải...</p>
            </div>
        </div>
    )
}

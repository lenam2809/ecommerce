import { Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductHeaderProps {
    isLoading: boolean
    name?: string
    rating?: number
    reviewCount?: number
}

export function ProductHeader({ isLoading, name, rating = 0, reviewCount = 0 }: ProductHeaderProps) {
    if (isLoading) {
        return <Skeleton className="h-10 w-3/4 rounded-2xl" />
    }

    return (
        <div className="space-y-4">
            <h1 className="tech-heading text-3xl sm:text-4xl leading-snug font-bold text-foreground tracking-tight">{name}</h1>
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-secondary/30 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-border/50">
                    <div className="flex items-center mr-2">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm font-semibold text-foreground/90">
                        {rating.toFixed(1)} <span className="text-muted-foreground ml-1 font-medium">({reviewCount} đánh giá)</span>
                    </span>
                </div>
                <div className="flex items-center px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-semibold">
                    Còn hàng
                </div>
            </div>
        </div>
    )
}
import { Star } from "lucide-react"
import { RatingDistribution } from "@/types/product"

interface RatingSummaryProps {
    rating: number
    reviewCount: number
    ratingDistribution: RatingDistribution[]
}

export function RatingSummary({ rating, reviewCount, ratingDistribution }: RatingSummaryProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="flex flex-col items-center justify-center p-6 bg-card border border-line rounded-2xl">
                <div className="text-6xl font-bold mb-3 text-ink font-mono tracking-tighter">{rating.toFixed(1)}</div>
                <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`h-6 w-6 ${i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "fill-line text-line"}`}
                        />
                    ))}
                </div>
                <div className="text-small font-medium text-ink-soft">{reviewCount} lượt đánh giá</div>
            </div>

            <div className="col-span-2 flex flex-col justify-center space-y-3 pl-4">
                {ratingDistribution.map((item) => (
                    <div key={item.stars} className="flex items-center gap-4">
                        <div className="flex items-center w-12 font-medium text-ink">
                            <span className="mr-1">{item.stars}</span>
                            <Star className="h-4 w-4 fill-ink/30 text-ink/30" />
                        </div>
                        <div className="flex-1 h-2.5 bg-surface-2 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-400 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${item.percentage}%` }}
                            />
                        </div>
                        <div className="w-12 text-right text-small text-ink-faint tabular-nums">{item.percentage}%</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
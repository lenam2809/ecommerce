import Image from "next/image"
import { Star, ThumbsUp, MessageSquare } from "lucide-react"
import { Review } from "@/types/product"
import { formatDate } from "@/lib/contants"

interface ReviewItemProps {
    review: Review
    onLike: (reviewId: string) => void
}

export function ReviewItem({ review, onLike }: ReviewItemProps) {
    return (
        <div className="bg-card border border-line p-6 rounded-2xl mb-6 hover:border-ink/30 transition-colors border-l-4 border-l-brand/60">
            <div className="flex items-start gap-4">
                <div className="relative">
                    <Image
                        src={review.userAvatar || "/placeholder.svg"}
                        alt={review.userName}
                        width={48}
                        height={48}
                        className="rounded-full relative z-10 border-2 border-background ring-2 ring-line"
                    />
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="font-bold text-h3 text-ink">{review.userName}</h4>
                            <div className="flex items-center gap-3 text-small text-ink-soft">
                                {review.isVerified && (
                                    <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-tiny font-medium border border-emerald-500/20">
                                        Đã mua hàng
                                    </span>
                                )}
                                <span>{formatDate(review.date)}</span>
                            </div>
                        </div>
                        <div className="flex bg-surface px-3 py-1 rounded-full border border-line">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-line text-line"}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="py-2">
                        <p className="text-ink leading-relaxed">{review.content}</p>
                    </div>

                    {review.imageUrls && review.imageUrls.length > 0 && (
                        <div className="flex space-x-3 my-4 overflow-x-auto pb-2 scrollbar-hide">
                            {review.imageUrls.map((image, index) => (
                                <div key={index} className="relative h-24 w-24 rounded-lg overflow-hidden border border-line cursor-pointer hover:scale-105 transition-transform">
                                    <Image
                                        src={image || "/placeholder.svg"}
                                        alt={`Review image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-4 mt-2">
                        <button
                            className="flex items-center gap-1.5 text-small text-ink-soft hover:text-brand transition-colors px-3 py-1.5 rounded-full hover:bg-surface-2"
                            onClick={() => onLike(review.id)}
                        >
                            <ThumbsUp className={`h-4 w-4 ${review.likes > 0 ? "fill-brand/20 text-brand" : ""}`} />
                            <span className="font-medium">Hữu ích ({review.likes})</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-small text-ink-soft hover:text-brand transition-colors px-3 py-1.5 rounded-full hover:bg-surface-2">
                            <MessageSquare className="h-4 w-4" />
                            <span className="font-medium">Trả lời ({review.replies})</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

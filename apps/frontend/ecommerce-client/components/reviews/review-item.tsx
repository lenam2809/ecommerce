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
        <div className="glass-card-subtle p-6 rounded-2xl mb-6 hover:bg-secondary/10 transition-colors border-l-4 border-l-primary/50">
            <div className="flex items-start gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-50"></div>
                    <Image
                        src={review.userAvatar || "/placeholder.svg"}
                        alt={review.userName}
                        width={48}
                        height={48}
                        className="rounded-full relative z-10 border-2 border-background ring-2 ring-border/20"
                    />
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="font-bold text-lg">{review.userName}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                {review.isVerified && (
                                    <span className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-xs font-medium border border-green-500/20">
                                        Đã mua hàng
                                    </span>
                                )}
                                <span>{formatDate(review.date)}</span>
                            </div>
                        </div>
                        <div className="flex bg-secondary/50 px-3 py-1 rounded-full border border-white/5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground/30"}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="py-2">
                        <p className="text-foreground/90 leading-relaxed">{review.content}</p>
                    </div>

                    {review.imageUrls && review.imageUrls.length > 0 && (
                        <div className="flex space-x-3 my-4 overflow-x-auto pb-2 scrollbar-hide">
                            {review.imageUrls.map((image, index) => (
                                <div key={index} className="relative h-24 w-24 rounded-lg overflow-hidden border border-white/10 shadow-sm cursor-pointer hover:scale-105 transition-transform">
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
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary/50"
                            onClick={() => onLike(review.id)}
                        >
                            <ThumbsUp className={`h-4 w-4 ${review.likes > 0 ? "fill-primary/20 text-primary" : ""}`} />
                            <span className="font-medium">Hữu ích ({review.likes})</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary/50">
                            <MessageSquare className="h-4 w-4" />
                            <span className="font-medium">Trả lời ({review.replies})</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

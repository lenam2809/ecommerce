"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ReviewFormProps {
    onSubmit: (rating: number, content: string) => void
    isAuthenticated: boolean
    onLoginRequest: () => void
}

export function ReviewForm({ onSubmit, isAuthenticated, onLoginRequest }: ReviewFormProps) {
    const [selectedRating, setSelectedRating] = useState<number | null>(null)
    const [reviewText, setReviewText] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedRating && reviewText.trim()) {
            onSubmit(selectedRating, reviewText.trim())
            setSelectedRating(null)
            setReviewText("")
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="mb-10 p-8 bg-card border border-dashed border-line rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-brand-soft flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-brand" />
                </div>
                <h3 className="text-h3 font-semibold text-ink mb-2">Bạn đã sử dụng sản phẩm này?</h3>
                <p className="text-ink-soft mb-6 max-w-md">Hãy chia sẻ trải nghiệm của bạn để giúp những người khác đưa ra quyết định mua hàng tốt hơn.</p>
                <Button onClick={onLoginRequest} className="bg-brand text-white hover:bg-brand-hover rounded-full px-8 h-11 text-small font-semibold">
                    Đăng nhập để đánh giá
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="mb-10 p-6 md:p-8 bg-card border border-line rounded-2xl">
            <h3 className="text-h3 font-semibold text-ink mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-brand rounded-full"></span>
                Gửi đánh giá của bạn
            </h3>

            <div className="mb-6">
                <label className="block mb-3 text-small font-medium text-ink-faint uppercase tracking-wider">Mức độ hài lòng</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setSelectedRating(star)}
                            className="group relative focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star
                                className={`h-8 w-8 transition-all duration-200 ${selectedRating && star <= selectedRating
                                    ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                                    : "fill-transparent text-muted-foreground/30 group-hover:text-yellow-400/50"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="review-text" className="block mb-3 text-small font-medium text-ink-faint uppercase tracking-wider">
                    Nội dung đánh giá
                </label>
                <Textarea
                    id="review-text"
                    placeholder="Sản phẩm này tuyệt vời như thế nào? Chia sẻ trải nghiệm của bạn..."
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full bg-surface border-line focus:border-brand/50 focus:ring-brand/20 resize-none min-h-[120px] rounded-xl text-base"
                />
            </div>

            <Button
                type="submit"
                className="bg-brand text-white hover:bg-brand-hover h-12 rounded-full px-8 text-small font-semibold transition-colors disabled:opacity-50"
                disabled={!selectedRating || !reviewText.trim()}
            >
                Gửi đánh giá
            </Button>
        </form>
    )
}
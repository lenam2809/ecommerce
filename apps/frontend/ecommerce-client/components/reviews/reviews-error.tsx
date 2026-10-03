import { Button } from "@/components/ui/button"

interface ReviewsErrorProps {
    onRetry: () => void
}

export function ReviewsError({ onRetry }: ReviewsErrorProps) {
    return (
        <div className="p-6 text-center">
            <p className="text-destructive mb-4">Không thể tải đánh giá sản phẩm</p>
            <Button onClick={onRetry} className="rounded-full bg-brand text-white hover:bg-brand-hover h-10 px-6 text-small font-semibold">Thử lại</Button>
        </div>
    )
}
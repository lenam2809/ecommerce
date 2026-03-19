import { Button } from "@/components/ui/button"

interface ReviewsErrorProps {
    onRetry: () => void
}

export function ReviewsError({ onRetry }: ReviewsErrorProps) {
    return (
        <div className="p-6 text-center">
            <p className="text-red-500 mb-4">Không thể tải đánh giá sản phẩm</p>
            <Button onClick={onRetry}>Thử lại</Button>
        </div>
    )
}
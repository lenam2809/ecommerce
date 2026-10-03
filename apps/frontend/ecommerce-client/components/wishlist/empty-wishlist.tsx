// components/wishlist/empty-wishlist.tsx
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EmptyWishlist() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-soft text-brand mb-6">
                <Heart className="h-10 w-10" />
            </div>
            <h2 className="text-h2 font-semibold text-ink mb-3">Danh sách yêu thích của bạn trống</h2>
            <p className="text-ink-soft max-w-md mb-8">
                Các sản phẩm bạn thêm vào danh sách yêu thích sẽ xuất hiện ở đây. Hãy bắt đầu tìm kiếm và thêm sản phẩm yêu thích của bạn!
            </p>
            <Button asChild className="h-12 px-8 rounded-full bg-brand text-white hover:bg-brand-hover text-small font-semibold transition-colors">
                <Link href="/products">Xem sản phẩm</Link>
            </Button>
        </div>
    )
}

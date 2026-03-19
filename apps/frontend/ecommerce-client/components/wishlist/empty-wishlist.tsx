// components/wishlist/empty-wishlist.tsx
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EmptyWishlist() {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-muted rounded-full p-6 mb-6">
                <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Danh sách yêu thích của bạn trống</h2>
            <p className="text-muted-foreground max-w-md mb-6">
                Các sản phẩm bạn thêm vào danh sách yêu thích sẽ xuất hiện ở đây. Hãy bắt đầu tìm kiếm và thêm sản phẩm yêu thích của bạn!
            </p>
            <Button asChild>
                <Link href="/products">Xem sản phẩm</Link>
            </Button>
        </div>
    )
}
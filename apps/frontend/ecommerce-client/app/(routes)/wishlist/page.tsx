import WishlistClient from "@/components/wishlist/wishlist-client"

export const metadata = {
    title: "Danh sách sản phẩm yêu thích | ShopViet",
    description: "Xem và quản lý các mục trong danh sách sản phẩm yêu thích của bạn",
}

export default function WishlistPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Danh sách sản phẩm yêu thích của bạn</h1>
            <WishlistClient />
        </div>
    )
}

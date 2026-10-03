import WishlistClient from "@/components/wishlist/wishlist-client"

export const metadata = {
    title: "Danh sách sản phẩm yêu thích | ShopViet",
    description: "Xem và quản lý các mục trong danh sách sản phẩm yêu thích của bạn",
}

export default function WishlistPage() {
    return (
        <div className="container-app py-8 md:py-12">
            <div className="section-heading">
                <p className="section-label">Yêu thích</p>
                <h1 className="section-title">Danh sách sản phẩm yêu thích của bạn</h1>
            </div>
            <WishlistClient />
        </div>
    )
}

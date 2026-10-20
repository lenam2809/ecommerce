import WishlistClient from "@/components/wishlist/wishlist-client"

export const metadata = {
    title: "Sản phẩm yêu thích & Lưu trữ | ShopViet Công Nghệ",
    description: "Quản lý danh sách thiết bị công nghệ yêu thích, so sánh thông số và chuyển nhanh vào giỏ hàng tại ShopViet.",
}

export default function WishlistPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] py-8 md:py-10">
            <div className="container-app">
                <WishlistClient />
            </div>
        </div>
    )
}

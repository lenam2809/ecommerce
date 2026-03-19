// components/wishlist/wishlist-error.tsx
export default function WishlistError() {
    return (
        <div className="bg-destructive/10 p-6 rounded-lg text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">Lỗi khi tải danh sách yêu thích</h2>
            <p className="text-muted-foreground">Vui lòng thử lại sau</p>
        </div>
    )
}
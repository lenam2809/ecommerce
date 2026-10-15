// components/wishlist/wishlist-error.tsx
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WishlistError() {
    return (
        <div className="bg-destructive/5 border border-destructive/20 p-10 rounded-2xl text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <h2 className="text-h3 font-semibold text-ink mb-2">Lỗi khi tải danh sách yêu thích</h2>
            <p className="text-ink-soft mb-6">Vui lòng thử lại sau</p>
            <Button
                onClick={() => window.location.reload()}
                className="h-11 px-6 rounded-full bg-brand text-white hover:bg-brand-hover text-small font-semibold"
            >
                Thử lại
            </Button>
        </div>
    )
}

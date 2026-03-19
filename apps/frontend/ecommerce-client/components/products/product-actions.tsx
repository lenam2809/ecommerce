import { ShoppingCart, Share2, ShieldCheck, Truck, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import AddToWishlistButton from "../add-to-wishlist-button"

interface ProductActionsProps {
    productId: string;
    isLoading: boolean
    isAddingToCart: boolean
    onAddToCart: () => void
}

export function ProductActions({ productId, isLoading, isAddingToCart, onAddToCart }: ProductActionsProps) {
    if (isLoading) {
        return (
            <div className="flex space-x-3 mb-6">
                <Skeleton className="h-12 flex-1 rounded-2xl" />
                <Skeleton className="h-12 flex-1 rounded-2xl" />
            </div>
        )
    }

    return (
        <div className="pt-2">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Primary CTA - Mua ngay */}
                <Button
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.3)] h-14 rounded-2xl text-[17px] font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_30px_rgba(59,130,246,0.5)]"
                >
                    Mua Ngay
                </Button>

                {/* Secondary CTA - Thêm vào giỏ hàng */}
                <Button
                    variant="outline"
                    className="flex-1 glass-card bg-secondary/20 border-border/50 hover:bg-secondary/40 h-14 rounded-2xl text-[17px] transition-all duration-300 hover:-translate-y-1 group"
                    onClick={onAddToCart}
                    disabled={isAddingToCart}
                >
                    <ShoppingCart className="h-5 w-5 mr-2.5 text-foreground/80 group-hover:text-primary transition-colors" />
                    {isAddingToCart ? "Đang xử lý..." : "Thêm Giỏ Hàng"}
                </Button>
            </div>
            
            {/* Auxiliary actions */}
            <div className="flex items-center justify-center sm:justify-start space-x-8 mb-8 pb-8 border-b border-border/40">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="p-2.5 rounded-full bg-secondary/40 group-hover:bg-primary/10 transition-colors">
                        <AddToWishlistButton
                            productId={productId}
                            className="bg-transparent hover:bg-transparent shadow-none p-0 h-auto"
                        />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Thêm vào yêu thích</span>
                </div>

                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="p-2.5 rounded-full bg-secondary/40 group-hover:bg-primary/10 transition-colors">
                        <Share2 className="h-4 w-4 text-foreground/70 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Chia sẻ</span>
                </div>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-secondary/10 border border-border/30">
                    <Truck className="h-6 w-6 text-primary mb-2" />
                    <h5 className="text-sm font-semibold text-foreground">Giao hàng miễn phí</h5>
                    <p className="text-xs text-center sm:text-left text-muted-foreground mt-1">Nội thành TP.HCM & HN</p>
                </div>
                <div className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-secondary/10 border border-border/30">
                    <ShieldCheck className="h-6 w-6 text-primary mb-2" />
                    <h5 className="text-sm font-semibold text-foreground">Bảo hành 1 năm</h5>
                    <p className="text-xs text-center sm:text-left text-muted-foreground mt-1">Chính hãng 100%</p>
                </div>
                <div className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-secondary/10 border border-border/30">
                    <RotateCcw className="h-6 w-6 text-primary mb-2" />
                    <h5 className="text-sm font-semibold text-foreground">Đổi trả 30 ngày</h5>
                    <p className="text-xs text-center sm:text-left text-muted-foreground mt-1">Lỗi do nhà sản xuất</p>
                </div>
            </div>
        </div>
    )
}
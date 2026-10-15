"use client"

import { ShoppingCart, Zap, Truck, ShieldCheck, RotateCcw, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import AddToWishlistButton from "../add-to-wishlist-button"
import { toast } from "sonner"

interface ProductActionsProps {
    productId: string
    isLoading: boolean
    isAddingToCart: boolean
    onAddToCart: () => void
    onBuyNow?: () => void
    productName?: string
    price?: number
    categoryName?: string
}

/**
 * ProductActions — Editorial Tech Minimalism
 * Dual CTA: Add to cart (carbon black pill) + Buy now (ruby red pill)
 * Trust guarantees and wishlist action
 */
export function ProductActions({
    productId,
    isLoading,
    isAddingToCart,
    onAddToCart,
    onBuyNow,
    productName,
    price,
    categoryName,
}: ProductActionsProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex gap-3">
                    <Skeleton className="h-12 flex-1 rounded-full" />
                    <Skeleton className="h-12 flex-1 rounded-full" />
                </div>
                <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
        )
    }

    const handleShare = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href)
            toast.success("Đã sao chép liên kết sản phẩm!")
        }
    }

    return (
        <div className="space-y-6 pt-2">
            {/* Dual Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Secondary CTA - Thêm vào giỏ */}
                <Button
                    onClick={onAddToCart}
                    disabled={isAddingToCart}
                    className="flex-1 h-12 rounded-full bg-ink text-background hover:bg-brand hover:text-white dark:hover:text-white text-small font-semibold transition-all duration-200 shadow-xs focus-ring"
                >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ"}
                </Button>

                {/* Primary CTA - Mua ngay */}
                <Button
                    onClick={onBuyNow || onAddToCart}
                    disabled={isAddingToCart}
                    className="flex-1 h-12 rounded-full bg-brand text-white hover:bg-brand-hover text-small font-semibold transition-all duration-200 shadow-sm hover:shadow-md focus-ring"
                >
                    <Zap className="h-4 w-4 mr-2" />
                    Mua ngay
                </Button>
            </div>

            {/* Utility row: Wishlist & Share */}
            <div className="flex items-center justify-between text-small border-y border-line/60 py-3">
                <div className="flex items-center gap-2">
                    <AddToWishlistButton
                        productId={productId}
                        productName={productName}
                        price={price}
                        category={categoryName}
                        className="h-8.5 w-8.5 p-1.5 rounded-full bg-surface-2 hover:bg-surface text-ink border border-line shadow-xs transition-all hover:scale-105"
                    />
                    <span className="text-tiny font-medium text-ink-soft">
                        Lưu vào danh sách yêu thích
                    </span>
                </div>

                <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 text-tiny font-medium text-ink-soft hover:text-ink transition-colors p-1"
                >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Chia sẻ</span>
                </button>
            </div>

            {/* 3-Column Trust Guarantees */}
            <div className="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-surface/60 border border-line/60 text-center">
                <div className="flex flex-col items-center gap-1.5">
                    <span className="p-2 rounded-full bg-brand-soft text-brand shrink-0">
                        <Truck className="h-4 w-4" />
                    </span>
                    <span className="text-tiny font-semibold text-ink">Giao siêu tốc 2H</span>
                    <span className="text-[11px] text-ink-faint">Toàn quốc</span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                    <span className="p-2 rounded-full bg-brand-soft text-brand shrink-0">
                        <ShieldCheck className="h-4 w-4" />
                    </span>
                    <span className="text-tiny font-semibold text-ink">Bảo hành 24T</span>
                    <span className="text-[11px] text-ink-faint">Chính hãng 100%</span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                    <span className="p-2 rounded-full bg-brand-soft text-brand shrink-0">
                        <RotateCcw className="h-4 w-4" />
                    </span>
                    <span className="text-tiny font-semibold text-ink">1 đổi 1 30 ngày</span>
                    <span className="text-[11px] text-ink-faint">Nếu lỗi NSX</span>
                </div>
            </div>
        </div>
    )
}

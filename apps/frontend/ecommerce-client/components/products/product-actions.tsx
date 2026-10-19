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
 * ProductActions — Hybrid Premium Tech (SSoT 2026)
 * Dual CTA:
 * - "Thêm vào giỏ": Electric Blue (#2563EB / bg-primary)
 * - "Mua ngay": Tech Crimson (#E11D48 / bg-[#e11d48])
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
                    <Skeleton className="h-12 flex-1 rounded-xl" />
                    <Skeleton className="h-12 flex-1 rounded-xl" />
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
        <div className="space-y-5 pt-1">
            {/* Dual Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Secondary CTA - Thêm vào giỏ (Electric Blue #2563EB) */}
                <Button
                    onClick={onAddToCart}
                    disabled={isAddingToCart}
                    className="flex-1 h-12 rounded-xl bg-primary text-white hover:bg-primary/90 text-small font-bold transition-all duration-200 shadow-xs focus-ring cursor-pointer"
                >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ"}
                </Button>

                {/* Primary Purchase CTA - Mua ngay (Tech Crimson #E11D48) */}
                <Button
                    onClick={onBuyNow || onAddToCart}
                    disabled={isAddingToCart}
                    className="flex-1 h-12 rounded-xl bg-[#e11d48] text-white hover:bg-[#be123c] text-small font-bold transition-all duration-200 shadow-sm hover:shadow-md focus-ring cursor-pointer"
                >
                    <Zap className="h-4 w-4 mr-2" />
                    Mua ngay
                </Button>
            </div>

            {/* SSoT Apple Official Warranty Policy Box */}
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-tiny leading-relaxed text-ink-soft">
                    <span className="font-bold text-ink">Chính sách bảo hành chính hãng: </span>
                    12 tháng chính hãng Apple + 12 tháng mở rộng độc quyền ShopViet (Tổng 24 tháng). Hỗ trợ kỹ thuật 1800 6869.
                </div>
            </div>

            {/* Utility row: Wishlist & Share */}
            <div className="flex items-center justify-between text-small border-y border-line/60 py-3">
                <div className="flex items-center gap-2">
                    <AddToWishlistButton
                        productId={productId}
                        productName={productName}
                        price={price}
                        category={categoryName}
                        className="h-9 w-9 p-1.5 rounded-full bg-surface-2 hover:bg-surface text-ink border border-line shadow-xs transition-all hover:scale-105"
                    />
                    <span className="text-tiny font-medium text-ink-soft">
                        Lưu vào danh sách yêu thích
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 text-tiny font-medium text-ink-soft hover:text-primary transition-colors p-1"
                >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Chia sẻ</span>
                </button>
            </div>

            {/* 3-Column Trust Guarantees */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-surface/60 border border-line/60 text-center">
                <div className="flex flex-col items-center gap-1">
                    <span className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                        <Truck className="h-4 w-4" />
                    </span>
                    <span className="text-tiny font-semibold text-ink">Giao hỏa tốc 2H</span>
                    <span className="text-[11px] text-ink-faint tabular-nums">Freeship từ 500.000đ</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <span className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                        <ShieldCheck className="h-4 w-4" />
                    </span>
                    <span className="text-tiny font-semibold text-ink">Bảo hành 24T</span>
                    <span className="text-[11px] text-ink-faint">12T Apple + 12T SV</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <span className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                        <RotateCcw className="h-4 w-4" />
                    </span>
                    <span className="text-tiny font-semibold text-ink">1 đổi 1 30 ngày</span>
                    <span className="text-[11px] text-ink-faint">Tại 45 Showroom</span>
                </div>
            </div>
        </div>
    )
}

"use client"

import { useState } from "react"
import { Trash2, Star, CheckCircle2, ArrowLeftRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { formatPrice } from "@/lib/contants"
import { formatImageUrl } from "@/lib/utils"
import AddToCartButton from "../add-to-cart-button"

export interface WishlistProductItem {
    productId: string
    productName: string
    price: number
    originalPrice?: number
    imageUrl: string
    slug: string
    category?: string
    specs?: string
    inStock?: boolean
    rating?: number
}

interface WishlistItemProps {
    product: WishlistProductItem
    isSelected?: boolean
    onToggleSelect?: (id: string) => void
    onRemove: (id: string) => void
    onCompare?: (product: WishlistProductItem) => void
}

export default function WishlistItem({
    product,
    isSelected = false,
    onToggleSelect,
    onRemove,
    onCompare,
}: WishlistItemProps) {
    const [open, setOpen] = useState(false)
    const [imgSrc, setImgSrc] = useState(() => formatImageUrl(product.imageUrl))

    const discountPercent =
        product.originalPrice && product.originalPrice > product.price
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0

    return (
        <div
            className={`group relative flex flex-col h-full bg-card rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                isSelected
                    ? "border-tech-blue ring-2 ring-tech-blue/20"
                    : "border-line hover:border-tech-blue/50"
            }`}
        >
            {/* Top Bar: Checkbox + Discount Badge + Trash2 Delete Button */}
            <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {onToggleSelect && (
                        <button
                            type="button"
                            onClick={() => onToggleSelect(product.productId)}
                            aria-label={`Chọn ${product.productName}`}
                            className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                                isSelected
                                    ? "bg-tech-blue border-tech-blue text-white"
                                    : "bg-card/95 border-line text-transparent hover:border-tech-blue"
                            }`}
                        >
                            <span className="text-xs font-extrabold">✓</span>
                        </button>
                    )}
                    {discountPercent > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-brand text-white text-[11px] font-extrabold font-mono tabular-nums shadow-xs">
                            -{discountPercent}%
                        </span>
                    )}
                </div>

                {/* Trash2 Remove Button */}
                <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl bg-card/95 hover:bg-rose-500/10 text-ink-soft hover:text-brand border border-line shadow-xs transition-all cursor-pointer"
                            aria-label={`Xóa ${product.productName} khỏi danh sách yêu thích`}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl border border-line bg-card shadow-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-ink font-bold">
                                Xóa sản phẩm khỏi danh sách yêu thích?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-ink-soft">
                                Bạn có chắc muốn xóa{" "}
                                <span className="font-bold text-ink">
                                    {product.productName}
                                </span>{" "}
                                khỏi danh sách lưu trữ yêu thích không?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl border-line text-ink">
                                Giữ lại
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="rounded-xl bg-brand text-white hover:bg-brand/90 font-bold"
                                onClick={() => onRemove(product.productId)}
                            >
                                Xác nhận xóa
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Product Image */}
            <Link
                href={`/product/${product.slug}`}
                className="block relative aspect-[4/3] overflow-hidden bg-surface/50 p-6 border-b border-line"
                aria-label={product.productName}
            >
                <Image
                    src={imgSrc}
                    alt={product.productName}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    onError={() => setImgSrc("/placeholder.svg")}
                />
            </Link>

            {/* Product Info */}
            <div className="p-4 flex flex-col flex-grow gap-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold uppercase tracking-wider text-tech-blue truncate">
                        {product.category || "Chính hãng VN/A"}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Sẵn hàng</span>
                    </span>
                </div>

                <Link href={`/product/${product.slug}`} className="block">
                    <h3 className="text-sm font-bold leading-snug text-ink line-clamp-2 group-hover:text-tech-blue transition-colors min-h-[2.5rem]">
                        {product.productName}
                    </h3>
                </Link>

                {product.specs && (
                    <p className="text-xs text-ink-soft bg-surface px-2.5 py-1 rounded-lg font-medium truncate font-mono tabular-nums">
                        {product.specs}
                    </p>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                    {typeof product.rating === "number" && product.rating > 0 ? (
                        <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-ink font-mono tabular-nums">
                                {product.rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-ink-soft">• Bảo hành 24T</span>
                        </div>
                    ) : (
                        <span className="text-xs text-ink-soft">Bảo hành 24T chính hãng</span>
                    )}

                    {onCompare && (
                        <button
                            type="button"
                            onClick={() => onCompare(product)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-tech-blue hover:underline cursor-pointer"
                        >
                            <ArrowLeftRight className="h-3.5 w-3.5" />
                            <span>So sánh</span>
                        </button>
                    )}
                </div>

                {/* Price Block */}
                <div className="mt-auto pt-2 flex items-baseline gap-2 flex-wrap">
                    <span className="text-lg font-extrabold text-brand font-mono tabular-nums whitespace-nowrap">
                        {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs font-medium text-ink-faint line-through font-mono tabular-nums whitespace-nowrap">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>

                {/* Add to Cart Button */}
                <AddToCartButton
                    productId={product.productId}
                    productName={product.productName}
                    price={product.price}
                    className="w-full mt-2 h-11 rounded-xl bg-tech-blue hover:bg-tech-blue/90 text-white font-bold border-0 shadow-xs transition-all cursor-pointer"
                />
            </div>
        </div>
    )
}

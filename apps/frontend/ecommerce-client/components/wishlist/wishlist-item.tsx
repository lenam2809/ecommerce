// components/wishlist/wishlist-item.tsx
"use client"
import { useState } from "react"
import { Trash2, Star } from "lucide-react"
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
import AddToCartButton from "../add-to-cart-button"

interface WishlistItemProps {
    product: {
        productId: string
        productName: string
        price: number
        imageUrl: string,
        slug: string
    }
    onRemove: (id: string) => void
}

/**
 * WishlistItem — Editorial Minimal
 * - Bỏ glass + gradient overlay
 * - Nút xóa LUÔN hiển thị (mobile-friendly)
 * - Nút Thêm vào giỏ luôn hiển thị
 */
export default function WishlistItem({ product, onRemove }: WishlistItemProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className="group relative flex flex-col h-full bg-card rounded-2xl border border-line overflow-hidden transition-colors duration-200 hover:border-ink/30">
            {/* Remove button — luôn hiển thị */}
            <div className="absolute top-2.5 right-2.5 z-20">
                <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full bg-background/90 hover:bg-background text-ink-faint hover:text-brand border border-line shadow-sm transition-all"
                            aria-label={`Xóa ${product.productName} khỏi danh sách yêu thích`}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl border border-line shadow-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-ink">Xóa khỏi danh sách yêu thích?</AlertDialogTitle>
                            <AlertDialogDescription className="text-ink-soft">
                                Bạn có chắc muốn xóa{" "}
                                <span className="font-semibold text-ink">
                                    {product.productName}
                                </span>{" "}
                                khỏi danh sách yêu thích không? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-full border-line text-ink">Hủy</AlertDialogCancel>
                            <AlertDialogAction
                                className="rounded-full bg-destructive text-white hover:bg-destructive/90"
                                onClick={() => onRemove(product.productId)}
                            >
                                Xóa
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Image */}
            <Link
                href={`/product/${product.slug}`}
                className="block relative aspect-[4/5] overflow-hidden bg-surface"
                aria-label={product.productName}
            >
                <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.productName}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </Link>

            {/* Info */}
            <div className="p-4 flex flex-col flex-grow gap-2">
                <Link href={`/product/${product.slug}`} className="block">
                    <h3 className="text-h3 font-medium leading-snug text-ink line-clamp-2 group-hover:text-brand transition-colors">
                        {product.productName}
                    </h3>
                </Link>

                <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-tiny text-ink-faint">4.5</span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className="text-lg font-bold text-ink">
                        {formatPrice(product.price)}
                    </span>
                </div>

                <AddToCartButton
                    productId={product.productId}
                    productName={product.productName}
                    price={product.price}
                    className="w-full mt-2 h-11 rounded-full bg-ink text-background hover:bg-brand dark:text-foreground dark:hover:text-white hover:text-white border-0 transition-colors"
                />
            </div>
        </div>
    )
}

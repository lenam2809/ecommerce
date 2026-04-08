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

export default function WishlistItem({ product, onRemove }: WishlistItemProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className="group relative h-full glass-card hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-3xl overflow-hidden border-white/5 dark:border-white/5">
            {/* Remove from Wishlist button positioned in the top-right corner */}
            <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-black/20 dark:bg-white/20 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white text-white backdrop-blur-xl border-0 transition-all"
                            aria-label={`Xóa ${product.productName} khỏi danh sách yêu thích`}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl border border-border/60 shadow-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Xóa khỏi danh sách yêu thích?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bạn có chắc muốn xóa{" "}
                                <span className="font-semibold text-foreground">
                                    {product.productName}
                                </span>{" "}
                                khỏi danh sách yêu thích không? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
                            <AlertDialogAction
                                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => onRemove(product.productId)}
                            >
                                Xóa
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-secondary/20">
                <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.productName}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
            </Link>

            <div className="absolute bottom-0 left-0 right-0 p-5 pt-12 bg-gradient-to-t from-background via-background/95 to-transparent">
                <Link href={`/product/${product.slug}`} className="block mb-2">
                    <h3 className="text-base font-semibold leading-tight text-foreground line-clamp-2 md:text-lg group-hover:text-primary transition-colors">
                        {product.productName}
                    </h3>
                </Link>

                <div className="flex items-end justify-between gap-2">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium text-muted-foreground">4.5</span>
                        </div>
                        <span className="text-lg font-bold text-foreground">
                            {formatPrice(product.price)}
                        </span>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                        <AddToCartButton
                            productId={product.productId}
                            productName={product.productName}
                            price={product.price}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
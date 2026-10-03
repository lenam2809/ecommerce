"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Product } from "@/types/product"
import { formatPrice } from "@/lib/contants"
import AddToCartButton from "./add-to-cart-button"
import AddToWishlistButton from "./add-to-wishlist-button"
import AddToComparison from "./filter/add-to-comparison"

interface ProductListItemProps {
    product: Product
}

/**
 * ProductListItem — Editorial Tech Minimalism
 * Horizontal layout for catalog list-view mode
 */
export default function ProductListItem({ product }: ProductListItemProps) {
    const discount = product.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0
    const isSoldOut = (product.stockQuantity ?? 0) <= 0

    return (
        <article className="group relative bg-card rounded-2xl border border-line overflow-hidden transition-all duration-300 hover:border-ink/40 hover:shadow-md">
            <div className="flex flex-col sm:flex-row items-stretch">
                {/* Product Image Frame */}
                <div className="relative sm:w-52 md:w-60 h-52 sm:h-auto overflow-hidden bg-surface-2/40 flex-shrink-0">
                    {/* Discount badge */}
                    {discount > 0 && (
                        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-brand text-white text-tiny font-bold tracking-tight shadow-xs">
                            -{discount}%
                        </span>
                    )}

                    {/* Wishlist Button */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                        <AddToWishlistButton
                            productId={product.id}
                            productName={product.name}
                            price={product.salePrice || product.price}
                            category={product.categoryName}
                            className="h-8 w-8 p-1.5 rounded-full bg-background/85 backdrop-blur-md hover:bg-background text-foreground border border-line/80 shadow-xs transition-all hover:scale-105"
                        />
                    </div>

                    <Link
                        href={`/product/${product.slug}`}
                        className={`block h-full w-full ${isSoldOut ? "grayscale" : ""}`}
                    >
                        <Image
                            src={product.mainImage || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                            loading="lazy"
                            sizes="(max-width: 640px) 100vw, 240px"
                        />

                        {isSoldOut && (
                            <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-xs">
                                <span className="px-3 py-1 rounded-full bg-ink text-background text-tiny font-semibold uppercase tracking-wider">
                                    Hết hàng
                                </span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                    <div>
                        {/* Category micro-label */}
                        {product.categoryName && (
                            <p className="text-tiny font-semibold uppercase tracking-wider text-ink-faint mb-1">
                                {product.categoryName}
                            </p>
                        )}

                        {/* Title */}
                        <Link href={`/product/${product.slug}`} className="block group">
                            <h3 className="text-base md:text-lg font-semibold text-ink line-clamp-2 transition-colors duration-200 group-hover:text-brand">
                                {product.name}
                            </h3>
                        </Link>

                        {/* Rating row */}
                        <div className="flex items-center mt-2 gap-2">
                            <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-tiny font-semibold text-ink">
                                    {product.rating > 0 ? product.rating.toFixed(1) : "5.0"}
                                </span>
                            </div>
                            <span className="text-tiny text-ink-faint">
                                {product.reviewCount ? `(${product.reviewCount} đánh giá)` : "(Đã kiểm định)"}
                            </span>
                            {product.brandSlug && (
                                <>
                                    <span className="text-tiny text-ink-faint">·</span>
                                    <span className="text-tiny font-medium text-ink-soft">
                                        Chính hãng
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        <p className="mt-3 text-ink-soft text-small line-clamp-2 leading-relaxed">
                            {product.description ||
                                "Trải nghiệm thiết bị thông minh thế hệ mới với hiệu năng vượt trội, độ bền cao và chế độ bảo hành chính hãng toàn diện."}
                        </p>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-line/60">
                        {/* Price */}
                        <div>
                            {product.salePrice ? (
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-lg md:text-xl text-ink tracking-tight">
                                        {formatPrice(product.salePrice)}
                                    </span>
                                    <span className="text-tiny text-ink-faint line-through">
                                        {formatPrice(product.price)}
                                    </span>
                                </div>
                            ) : (
                                <span className="font-bold text-lg md:text-xl text-ink tracking-tight">
                                    {formatPrice(product.price)}
                                </span>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            <AddToComparison product={product} />

                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full border-line text-ink hover:bg-surface h-10 px-4 text-tiny font-semibold"
                                asChild
                            >
                                <Link href={`/product/${product.slug}`} className="flex items-center gap-1.5">
                                    Chi tiết
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>

                            <AddToCartButton
                                productId={product.id}
                                stockQuantity={product.stockQuantity}
                                className="h-10 rounded-full bg-ink text-background hover:bg-brand hover:text-white dark:hover:text-white px-5 text-tiny font-semibold shadow-xs"
                                productName={product.name}
                                price={product.salePrice || product.price}
                                category={product.categoryName}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </article>
    )
}

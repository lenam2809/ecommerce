"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, ArrowRight, Cpu, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Product } from "@/types/product"
import { formatPrice } from "@/lib/contants"
import { formatImageUrl } from "@/lib/utils"
import AddToCartButton from "./add-to-cart-button"
import AddToWishlistButton from "./add-to-wishlist-button"
import AddToComparison from "./filter/add-to-comparison"

interface ProductListItemProps {
    product: Product
}

/**
 * ProductListItem — Editorial Tech Minimalism (SSoT 2026 Edition)
 * Horizontal layout for catalog list-view mode
 */
export default function ProductListItem({ product }: ProductListItemProps) {
    const [imgSrc, setImgSrc] = useState(() => formatImageUrl(product.mainImage))
    const [imgError, setImgError] = useState(false)

    useEffect(() => {
        setImgSrc(formatImageUrl(product.mainImage))
        setImgError(false)
    }, [product.mainImage])

    const discount = product.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0
    const isSoldOut = (product.stockQuantity ?? 0) <= 0

    // Standardize max 2 spec chips
    const specChips = useMemo(() => {
        const chips: string[] = []
        if (product.specifications && product.specifications.length > 0) {
            for (const spec of product.specifications) {
                if (chips.length >= 2) break
                const val = spec.value?.trim()
                if (val && !chips.includes(val)) {
                    chips.push(val)
                }
            }
        }
        if (chips.length < 2 && product.name) {
            const chipMatch = product.name.match(
                /\b(M[1-4]\s*(?:Pro|Max)?|A1[5-8]\s*(?:Pro(?:\s*Max)?)?|Snapdragon\s*\d+|Ryzen\s*\d|Core\s*Ultra\s*\d)\b/i
            )
            if (chipMatch && !chips.includes(chipMatch[0])) {
                chips.push(chipMatch[0])
            }
            const storageMatch = product.name.match(/\b(\d{1,3}GB(?:\/\d{1,2}TB)?|\d{1,2}TB)\b/i)
            if (chips.length < 2 && storageMatch && !chips.includes(storageMatch[0])) {
                chips.push(storageMatch[0])
            }
        }
        if (chips.length === 0) {
            if (product.categoryName) chips.push(product.categoryName)
            chips.push("Bảo hành 24T")
        } else if (chips.length === 1) {
            chips.push("Chính hãng 24T")
        }
        return chips.slice(0, 2)
    }, [product.specifications, product.name, product.categoryName])

    return (
        <article className="group relative bg-card dark:bg-[#111827] dark:hover:bg-[#182234] rounded-2xl border border-border/80 dark:border-white/[0.08] overflow-hidden transition-all duration-300 hover:border-border dark:hover:border-white/20 hover:shadow-md">
            <div className="flex flex-col sm:flex-row items-stretch">
                {/* Product Image Frame */}
                <div className="relative sm:w-52 md:w-60 h-52 sm:h-auto overflow-hidden bg-slate-100 dark:bg-[#182234] flex-shrink-0">
                    {/* Badges container */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start pointer-events-none">
                        {discount > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#e11d48] text-white text-tiny font-bold tracking-tight shadow-xs whitespace-nowrap">
                                -{discount}%
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold tracking-wide backdrop-blur-xs whitespace-nowrap">
                            <ShieldCheck className="h-3 w-3" />
                            24T
                        </span>
                    </div>

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
                        {imgError || !imgSrc ? (
                            <div className="w-full h-full min-h-[180px] flex flex-col items-center justify-center bg-slate-100 dark:bg-[#182234] text-slate-400 dark:text-slate-500">
                                <Cpu className="h-10 w-10 mb-1 opacity-60 text-primary" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider">ShopViet Tech</span>
                            </div>
                        ) : (
                            <Image
                                src={imgSrc}
                                alt={product.name}
                                fill
                                className="object-contain sm:object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 p-2 sm:p-0"
                                loading="lazy"
                                sizes="(max-width: 640px) 100vw, 240px"
                                onError={() => setImgError(true)}
                            />
                        )}

                        {isSoldOut && (
                            <div className="absolute inset-0 grid place-items-center bg-[#090D16]/80 backdrop-blur-xs">
                                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#f8fafc] text-tiny font-semibold uppercase tracking-wider">
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
                            <p className="text-tiny font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                {product.categoryName}
                            </p>
                        )}

                        {/* Title */}
                        <Link href={`/product/${product.slug}`} className="block group">
                            <h3 className="text-base md:text-lg font-semibold text-foreground line-clamp-2 transition-colors duration-200 group-hover:text-primary">
                                {product.name}
                            </h3>
                        </Link>

                        {/* Spec Chips (Max 2) */}
                        <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
                            {specChips.map((chip, idx) => (
                                <span
                                    key={idx}
                                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground truncate max-w-[130px] border border-border/50 shrink-0"
                                    title={chip}
                                >
                                    {chip}
                                </span>
                            ))}
                        </div>

                        {/* Rating row */}
                        <div className="flex items-center mt-2.5 gap-2">
                            <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-tiny font-semibold text-foreground">
                                    {product.rating > 0 ? product.rating.toFixed(1) : "5.0"}
                                </span>
                            </div>
                            <span className="text-tiny text-muted-foreground">
                                {product.reviewCount ? `(${product.reviewCount} đánh giá)` : "(Đã kiểm định)"}
                            </span>
                            <span className="text-tiny text-muted-foreground">·</span>
                            <span className="text-tiny font-medium text-primary">
                                Cam kết chính hãng
                            </span>
                        </div>

                        {/* Description */}
                        <p className="mt-3 text-muted-foreground text-small line-clamp-2 leading-relaxed">
                            {product.description ||
                                "Trải nghiệm thiết bị thông minh thế hệ mới với hiệu năng vượt trội, độ bền cao và chế độ bảo hành chính hãng toàn diện."}
                        </p>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-border/60">
                        {/* Price */}
                        <div>
                            {product.salePrice ? (
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-lg md:text-xl text-foreground dark:text-white tracking-tight tabular-nums whitespace-nowrap">
                                        {formatPrice(product.salePrice)}
                                    </span>
                                    <span className="text-tiny text-muted-foreground line-through tabular-nums whitespace-nowrap">
                                        {formatPrice(product.price)}
                                    </span>
                                </div>
                            ) : (
                                <span className="font-bold text-lg md:text-xl text-foreground dark:text-white tracking-tight tabular-nums whitespace-nowrap">
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
                                className="rounded-full border-border text-foreground hover:bg-surface h-10 px-4 text-tiny font-semibold"
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
                                className="h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5 text-tiny font-semibold shadow-xs"
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

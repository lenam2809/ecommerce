"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Cpu, ShieldCheck } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { formatPrice } from "@/lib/contants"
import { formatImageUrl } from "@/lib/utils"
import AddToWishlistButton from "./add-to-wishlist-button"
import AddToCartButton from "./add-to-cart-button"
import AddToComparison from "./filter/add-to-comparison"
import { Product } from "@/types/product"
import productService from "@/services/product-service"

interface ProductCardProps {
  product: Product
}

/**
 * ProductCard — ShopViet Hybrid Premium Tech (SSoT 2026 Edition)
 * - Pure White / Deep Obsidian card surface (bg-card)
 * - Aspect-square product frame with technology vector fallback
 * - Max 2 core spec chips per card to ensure consistent height across grid
 * - Tech Crimson (-% discount) + Electric Blue 24T official badges
 * - Top-right action cluster: AddToComparison (localStorage sync) + AddToWishlist
 * - Electric Blue AddToCart button with 44x44px mobile touch target
 * - Tabular-nums & whitespace-nowrap on all prices to eliminate "đ" line wraps
 */
export default function ProductCard({ product }: ProductCardProps) {
  const queryClient = useQueryClient()
  const [imgSrc, setImgSrc] = useState(() => formatImageUrl(product.mainImage))
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgSrc(formatImageUrl(product.mainImage))
    setImgError(false)
  }, [product.mainImage])

  const hasSalePrice = Boolean(
    product.salePrice && product.salePrice > 0 && product.salePrice < product.price
  )
  const displayPrice = hasSalePrice ? product.salePrice! : product.price
  const discount = hasSalePrice
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0
  const isSoldOut = (product.stockQuantity ?? 0) <= 0

  // Render keySpecs directly from backend API
  const specChips = useMemo(() => {
    if (product.keySpecs && product.keySpecs.length > 0) {
      return product.keySpecs.slice(0, 2)
    }
    const chips: string[] = []
    if (product.specifications && product.specifications.length > 0) {
      for (const spec of product.specifications) {
        if (chips.length >= 2) break
        const val = (spec.value || spec.specValue)?.trim()
        if (val && !chips.includes(val)) {
          chips.push(val)
        }
      }
    }
    return chips.slice(0, 2)
  }, [product.keySpecs, product.specifications])

  const prefetchProduct = () => {
    if (!product.slug) return

    queryClient.prefetchQuery({
      queryKey: ["productBySlug", product.slug],
      queryFn: () => productService.getProductBySlug(product.slug),
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    })
  }

  return (
    <article className="group relative flex flex-col h-full bg-card rounded-2xl border border-border/80 dark:border-white/[0.08] hover:border-border dark:hover:border-white/20 overflow-hidden shadow-xs hover:shadow-md dark:shadow-none dark:hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      {/* Badges container (Top Left) */}
      <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1 items-start pointer-events-none">
        {discount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-brand text-white text-[11px] font-bold tracking-tight shadow-xs whitespace-nowrap font-mono tabular-nums">
            -{discount}%
          </span>
        )}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold tracking-wide backdrop-blur-xs whitespace-nowrap">
          <ShieldCheck className="h-3 w-3" />
          Chính hãng 24T
        </span>
      </div>

      {/* Top Right Action Cluster: AddToComparison + AddToWishlist */}
      <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1">
        <AddToComparison
          product={product}
          className="h-8 w-8 rounded-full bg-white/85 dark:bg-black/40 backdrop-blur-sm hover:bg-white dark:hover:bg-black/70 text-slate-700 dark:text-white border border-slate-200/80 dark:border-white/10 shadow-xs"
        />
        <AddToWishlistButton
          productId={product.id}
          productName={product.name}
          price={displayPrice}
          category={product.categoryName}
          className="h-8 w-8 p-1.5 rounded-full bg-white/85 dark:bg-black/40 backdrop-blur-sm hover:bg-white dark:hover:bg-black/70 text-slate-700 dark:text-white border border-slate-200/80 dark:border-white/10 shadow-xs transition-all duration-200 hover:scale-105"
        />
      </div>

      {/* Product Image Frame (aspect-square with p-4 breathing room and object-contain) */}
      <div className="relative aspect-square overflow-hidden bg-surface p-4 flex-shrink-0 rounded-t-2xl">
        <Link
          href={`/product/${product.slug}`}
          onMouseEnter={prefetchProduct}
          onFocus={prefetchProduct}
          className={`relative block w-full h-full overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            isSoldOut ? "grayscale" : ""
          }`}
          aria-label={product.name}
        >
          {imgError || !imgSrc ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-surface rounded-xl text-slate-400 dark:text-slate-500">
              <Cpu className="h-10 w-10 mb-1 opacity-60 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">ShopViet Tech</span>
            </div>
          ) : (
            <Image
              src={imgSrc}
              alt={`${product.name} - ₫${displayPrice.toLocaleString("vi-VN")}`}
              fill
              className="object-contain object-center rounded-xl transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgError(true)}
            />
          )}

          {/* Sold out overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 grid place-items-center bg-background/80 backdrop-blur-xs rounded-xl">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider shadow-sm">
                Hết hàng
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Content Stack */}
      <div className="p-4 flex flex-col flex-grow gap-2">
        {/* Category micro-label */}
        {product.categoryName && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground truncate">
            {product.categoryName}
          </p>
        )}

        {/* Product Title */}
        <Link
          href={`/product/${product.slug}`}
          onMouseEnter={prefetchProduct}
          onFocus={prefetchProduct}
          className="outline-none focus-visible:underline"
        >
          <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2 transition-colors duration-200 group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        {/* Core Spec Chips: Max 2 chips */}
        <div className="flex items-center gap-1.5 overflow-hidden">
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

        {/* Rating and review stats */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="font-semibold text-foreground font-mono tabular-nums">
              {product.rating > 0 ? product.rating.toFixed(1) : "—"}
            </span>
          </div>
          {product.reviewCount ? (
            <span className="text-muted-foreground font-mono tabular-nums">({product.reviewCount})</span>
          ) : (
            <span className="text-muted-foreground">(Chưa có đánh giá)</span>
          )}
        </div>

        {/* Bottom Row: Price & Add to Cart Button */}
        <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-border/40">
          <div className="flex flex-col min-w-0">
            <span className="text-foreground dark:text-white font-bold text-base md:text-lg tracking-tight font-mono tabular-nums whitespace-nowrap leading-tight">
              {formatPrice(displayPrice)}
            </span>
            {hasSalePrice && (
              <span className="text-xs text-muted-foreground line-through font-mono tabular-nums whitespace-nowrap mt-0.5">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="shrink-0">
            <AddToCartButton
              productId={product.id}
              stockQuantity={product.stockQuantity}
              iconOnly
              className="h-11 w-11 sm:h-9 sm:w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all"
              productName={product.name}
              price={displayPrice}
              category={product.categoryName}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

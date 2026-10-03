"use client"

import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { formatPrice } from "@/lib/contants"
import AddToWishlistButton from "./add-to-wishlist-button"
import AddToCartButton from "./add-to-cart-button"
import { Product } from "@/types/product"
import productService from "@/services/product-service"

interface ProductCardProps {
  product: Product
}

/**
 * ProductCard — Editorial Tech Minimalism
 * - Bố cục chuẩn tỉ lệ 4:5, viền hairline tinh xảo
 * - Nhãn danh mục nhỏ uppercase phía trên tiêu đề
 * - Discount badge màu đỏ ruby (#e11d48)
 * - Nút Thêm vào giỏ dạng pill đen carbon, chuyển sang đỏ ruby khi hover
 * - Nút yêu thích kính mờ luôn hiển thị sẵn sàng tương tác
 */
export default function ProductCard({ product }: ProductCardProps) {
  const queryClient = useQueryClient()
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0
  const isSoldOut = (product.stockQuantity ?? 0) <= 0

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
    <article className="group relative flex flex-col h-full bg-card rounded-2xl border border-line overflow-hidden transition-all duration-300 hover:border-ink/40 hover:shadow-md">
      {/* Badges container */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start pointer-events-none">
        {discount > 0 ? (
          <span className="px-2.5 py-1 rounded-full bg-brand text-white text-tiny font-bold tracking-tight shadow-xs">
            -{discount}%
          </span>
        ) : product.rating >= 4.8 ? (
          <span className="px-2.5 py-1 rounded-full bg-ink text-background text-tiny font-semibold tracking-wider uppercase shadow-xs">
            Nổi bật
          </span>
        ) : null}
      </div>

      {/* Wishlist Button (Always accessible) */}
      <div className="absolute top-2.5 right-2.5 z-20">
        <AddToWishlistButton
          productId={product.id}
          productName={product.name}
          price={product.salePrice || product.price}
          category={product.categoryName}
          className="h-8.5 w-8.5 p-1.5 rounded-full bg-background/85 backdrop-blur-md hover:bg-background text-foreground border border-line/80 shadow-xs transition-all duration-200 hover:scale-105"
        />
      </div>

      {/* Product Image Frame */}
      <Link
        href={`/product/${product.slug}`}
        onMouseEnter={prefetchProduct}
        onFocus={prefetchProduct}
        className={`relative aspect-[4/5] overflow-hidden bg-surface-2/40 flex-shrink-0 outline-none block focus-visible:ring-2 focus-visible:ring-brand rounded-t-2xl ${
          isSoldOut ? "grayscale" : ""
        }`}
        aria-label={product.name}
      >
        <Image
          src={product.mainImage || "/placeholder.svg"}
          alt={`${product.name}${
            product.salePrice ? ` - ₫${product.salePrice.toLocaleString("vi-VN")}` : ""
          }`}
          fill
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-104"
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-xs">
            <span className="px-3.5 py-1.5 rounded-full bg-ink text-background text-tiny font-semibold uppercase tracking-wider shadow-sm">
              Hết hàng
            </span>
          </div>
        )}
      </Link>

      {/* Content Stack */}
      <div className="p-4 md:p-4.5 flex flex-col flex-grow gap-2">
        {/* Category micro-label */}
        {product.categoryName && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint truncate">
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
          <h3 className="text-small font-semibold leading-snug text-ink line-clamp-2 transition-colors duration-200 group-hover:text-brand">
            {product.name}
          </h3>
        </Link>

        {/* Rating and review stats */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="text-tiny font-semibold text-ink">
              {product.rating > 0 ? product.rating.toFixed(1) : "5.0"}
            </span>
          </div>
          {product.reviewCount ? (
            <span className="text-tiny text-ink-faint">({product.reviewCount})</span>
          ) : (
            <span className="text-tiny text-ink-faint">(Đã kiểm định)</span>
          )}
        </div>

        {/* Price display */}
        <div className="mt-auto pt-2 flex items-baseline gap-2">
          {product.salePrice ? (
            <>
              <span className="text-base md:text-lg font-bold text-ink tracking-tight">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-tiny text-ink-faint line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-base md:text-lg font-bold text-ink tracking-tight">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Add to Cart CTA (Instant pill action) */}
        <AddToCartButton
          productId={product.id}
          stockQuantity={product.stockQuantity}
          className="w-full mt-2.5 h-10 rounded-full bg-ink text-background hover:bg-brand hover:text-white dark:hover:text-white border-0 transition-all font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs"
          productName={product.name}
          price={product.salePrice || product.price}
          category={product.categoryName}
        />
      </div>
    </article>
  )
}

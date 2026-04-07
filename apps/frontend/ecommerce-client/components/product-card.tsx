import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/contants"
import AddToWishlistButton from "./add-to-wishlist-button"
import { Product } from "@/types/product"
import AddToCartButton from "./add-to-cart-button"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0

  return (
    <div className="group relative flex flex-col h-full bg-card rounded-2xl border border-border/50 overflow-hidden transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5 focus-within:shadow-xl focus-within:-translate-y-1.5 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background">
      {discount > 0 && (
        <Badge className="absolute top-3 left-3 z-20 bg-destructive text-destructive-foreground font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
          -{discount}%
        </Badge>
      )}

      {/* Wishlist Button - Floating Glass */}
      <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-300 ease-out translate-y-2 group-hover:translate-y-0 focus-within:translate-y-0">
        <AddToWishlistButton
          productId={product.id}
          className="bg-background/80 hover:bg-background text-foreground backdrop-blur-md border border-border/50 rounded-full h-9 w-9 p-2 transition-all shadow-sm"
        />
      </div>

      <Link href={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-secondary/20 flex-shrink-0 outline-none block focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
        <Image
          src={product.mainImage || "/placeholder.svg"}
          alt={`${product.name}${product.salePrice ? ` - ₫${product.salePrice.toLocaleString('vi-VN')}` : ""}`}
          fill
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          priority={false}
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </Link>

      <div className="p-4 flex flex-col flex-grow gap-3 relative bg-card">
        <Link href={`/product/${product.slug}`} className="outline-none focus-visible:underline">
          <h3 className="text-sm md:text-base font-medium leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-auto" aria-label={`Product rating: ${product.rating.toFixed(1)} out of 5 stars`}>
          <Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
          <span className="text-sm font-medium text-muted-foreground">{product.rating.toFixed(1)}</span>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-end justify-between gap-2 overflow-hidden h-8">
          <div className="flex flex-col transform transition-transform duration-300 ease-out group-hover:-translate-y-10 group-focus-within:-translate-y-10 justify-end">
            {product.salePrice ? (
              <>
                <span className="text-xs text-muted-foreground line-through decoration-destructive/50 font-medium tracking-wide">
                  {formatPrice(product.price)}
                </span>
                <span className="text-lg font-bold text-foreground leading-none mt-0.5">
                  {formatPrice(product.salePrice)}
                </span>
              </>
            ) : (
                <span className="text-lg font-bold text-foreground leading-none mt-auto">
                  {formatPrice(product.price)}
                </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 translate-y-12 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <AddToCartButton
              productId={product.id}
              stockQuantity={product.stockQuantity}
              className="w-full shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

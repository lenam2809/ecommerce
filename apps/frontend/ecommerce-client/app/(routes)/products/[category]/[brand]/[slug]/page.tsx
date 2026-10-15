"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ProductCard from "@/components/product-card"
import ProductGallery from "@/components/product-gallery"
import ProductCardSkeleton from "@/components/product-card-skeleton"
import { useProductBySlug, useSimilarProducts } from "@/hooks/use-products"
import { useCart } from "@/hooks/use-cart"

import { ProductBreadcrumb } from "@/components/products/product-breadcrumb"
import { ProductHeader } from "@/components/products/product-header"
import { ProductPrice } from "@/components/products/product-price"
import { ProductVariantSelector } from "@/components/products/product-variant-selector"
import { ProductQuantitySelector } from "@/components/products/product-quantity-selector"
import { ProductActions } from "@/components/products/product-actions"
import { ProductTabs } from "@/components/products/product-tabs"

export default function ProductDetailPage() {
  const params = useParams()
  const productSlug = params.slug as string

  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  // Fetch product data
  const { data: product, isLoading, error } = useProductBySlug(productSlug)
  // Fetch similar products
  const { data: similarProducts, isLoading: isLoadingSimilar } = useSimilarProducts(product?.id || "")
  // Cart functionality
  const { addToCart, isAddingToCart } = useCart()

  // Set default color when product data is loaded
  useEffect(() => {
    if (product?.variants?.colors && product.variants.colors.length > 0) {
      setSelectedColor(product.variants.colors[0])
    }
  }, [product])

  const incrementQuantity = () => {
    if (product?.stockQuantity && quantity < product.stockQuantity) {
      setQuantity((prev) => prev + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleQuantityChange = (value: number) => {
    setQuantity(value)
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product.id,
        quantity,
        options: {
          color: selectedColor || undefined,
        },
      })
    }
  }

  if (error) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
        <p className="mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Button asChild>
          <Link href="/products">Quay lại trang sản phẩm</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <ProductBreadcrumb
        isLoading={isLoading}
        categoryName={product?.categoryName}
        productName={product?.name}
      />

      <div className="container-app py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
          {/* Product Gallery */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <Skeleton className="aspect-square w-full rounded-2xl" />
            ) : (
              <ProductGallery images={product?.additionalImages || []} />
            )}
          </div>

          {/* Product Info */}
          <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-24">
            <ProductHeader
              isLoading={isLoading}
              name={product?.name}
              rating={product?.rating}
              reviewCount={product?.reviewCount}
            />

            <ProductPrice
              isLoading={isLoading}
              price={product?.price || 0}
              salePrice={product?.salePrice}
            />

            {!isLoading && (
              <p className="text-small text-ink-soft leading-relaxed border-y border-line py-4">
                {product?.description}
              </p>
            )}

            <ProductVariantSelector
              isLoading={isLoading}
              variants={product?.variants}
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
            />

            <ProductQuantitySelector
              isLoading={isLoading}
              quantity={quantity}
              stock={product?.stockQuantity}
              onDecrement={decrementQuantity}
              onIncrement={incrementQuantity}
              onQuantityChange={handleQuantityChange}
            />

            <ProductActions
              productId={product?.id || ""}
              isLoading={isLoading}
              isAddingToCart={isAddingToCart}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>

        <ProductTabs
          isLoading={isLoading}
          productId={product?.id}
          specifications={product?.specifications}
          description={product?.description}
          name={product?.name}
          reviewCount={product?.reviewCount}
        />

        {/* Similar Products */}
        <div className="mt-16 md:mt-24">
          <div className="section-heading">
            <p className="section-label">Có thể bạn thích</p>
            <h2 className="section-title">Sản phẩm tương tự</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {isLoadingSimilar
              ? Array(4)
                .fill(0)
                .map((_, index) => <ProductCardSkeleton key={index} />)
              : similarProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </div>
      </div>
    </>
  )
}
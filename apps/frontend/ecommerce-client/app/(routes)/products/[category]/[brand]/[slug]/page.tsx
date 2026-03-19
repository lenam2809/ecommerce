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
import { ChevronRight } from "lucide-react"

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

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Gallery */}
          <div>
            {isLoading ? (
              <Skeleton className="h-[500px] w-full rounded-lg" />
            ) : (
              <ProductGallery images={product?.additionalImages || []} />
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
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
              <div className="mb-6">
                <p className="text-gray-700">{product?.description}</p>
              </div>
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
        <div className="mt-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Sản phẩm tương tự</h2>
            <Link
              href={`/products?category=${product?.categoryName}`}
              className="text-[#2A5CAA] hover:underline flex items-center"
            >
              Xem thêm <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
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
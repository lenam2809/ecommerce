"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Head from "next/head"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorBoundary } from "@/components/error-boundary"
import ProductCard from "@/components/product-card"
import ProductGallery from "@/components/product-gallery"
import ProductCardSkeleton from "@/components/product-card-skeleton"
import { useProductBySlug, useSimilarProducts } from "@/hooks/use-products"
import { useCart } from "@/hooks/use-cart"
import { generateProductSchema } from "@/lib/seo-utils"
import { analytics } from "@/lib/analytics"
import { toSafeJsonLd } from "@/lib/sanitize-html-content"
import { formatPrice } from "@/lib/contants"

import { ProductBreadcrumb } from "@/components/products/product-breadcrumb"
import { ProductHeader } from "@/components/products/product-header"
import { ProductPrice } from "@/components/products/product-price"
import { ProductVariantSelector } from "@/components/products/product-variant-selector"
import { ProductQuantitySelector } from "@/components/products/product-quantity-selector"
import { ProductActions } from "@/components/products/product-actions"

// Lazy load tabs component
const ProductTabs = dynamic(() => import("@/components/products/product-tabs").then((m) => ({ default: m.ProductTabs })), {
    loading: () => <div className="h-96 bg-surface-2/40 rounded-2xl animate-pulse" />,
})

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const productSlug = params.slug as string

    const [quantity, setQuantity] = useState(1)
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const [selectedSize, setSelectedSize] = useState<string | null>(null)

    // Fetch product data
    const { data: product, isLoading, error } = useProductBySlug(productSlug)
    // Fetch similar products
    const { data: similarProducts, isLoading: isLoadingSimilar } = useSimilarProducts(product?.id || "")
    // Cart functionality
    const { addToCart, isAddingToCart } = useCart()

    // Set default color & size when product data is loaded
    useEffect(() => {
        if (product?.variants?.colors && product.variants.colors.length > 0) {
            setSelectedColor(product.variants.colors[0])
        }
        if (product?.variants?.sizes && product.variants.sizes.length > 0) {
            setSelectedSize(product.variants.sizes[0])
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
                    size: selectedSize || undefined,
                },
            })

            // Track Add to Cart Event
            analytics.trackAddToCart({
                id: product.id,
                name: product.name,
                price: product.salePrice || product.price,
                brand: product.brandSlug || "ShopViet",
                category: product.categoryName,
            }, quantity)
        }
    }

    const handleBuyNow = () => {
        if (product) {
            handleAddToCart()
            router.push("/cart")
        }
    }

    if (error) {
        return (
            <div className="container-app py-24 text-center">
                <div className="max-w-md mx-auto p-8 rounded-3xl bg-card border border-line">
                    <h1 className="text-h2 font-bold mb-3 text-ink">Không tìm thấy sản phẩm</h1>
                    <p className="text-ink-soft text-small mb-6">
                        Sản phẩm này có thể đã được ngừng kinh doanh hoặc đường dẫn không chính xác.
                    </p>
                    <Button asChild className="rounded-full bg-brand text-white hover:bg-brand-hover px-6">
                        <Link href="/products">Quay lại trang sản phẩm</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <>
            {product && (
                <Head>
                    <title>{`${product.name} - Chính Hãng Giá Tốt | ShopViet`}</title>
                    <meta name="description" content={product.description || `Mua ${product.name} chính hãng bảo hành 24 tháng tại ShopViet.`} />
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: toSafeJsonLd(generateProductSchema({
                                name: product.name,
                                description: product.description || "",
                                price: product.salePrice || product.price,
                                image: product.mainImage,
                                rating: product.rating,
                                reviewCount: product.reviewCount,
                                brand: "ShopViet",
                                url: `https://shopviet.com/product/${product.slug}`,
                            }))
                        }}
                    />
                </Head>
            )}
            <ErrorBoundary>
                <div className="min-h-screen bg-background">
                    <div className="container-app py-6 md:py-10">
                        {/* Breadcrumb Navigation */}
                        <ProductBreadcrumb
                            isLoading={isLoading}
                            categoryName={product?.categoryName}
                            categorySlug={product?.categorySlug}
                            productName={product?.name}
                        />

                        {/* Main Product Stage: Gallery (60%) + Details Stack (40%) */}
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                            {/* Left: Gallery (7 cols on lg) */}
                            <div className="lg:col-span-7">
                                {isLoading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="aspect-[4/3] sm:aspect-square w-full rounded-3xl" />
                                        <div className="flex gap-3">
                                            <Skeleton className="h-20 w-20 rounded-2xl" />
                                            <Skeleton className="h-20 w-20 rounded-2xl" />
                                            <Skeleton className="h-20 w-20 rounded-2xl" />
                                        </div>
                                    </div>
                                ) : (
                                    <ProductGallery
                                        images={
                                            product?.additionalImages && product.additionalImages.length > 0
                                                ? [product.mainImage, ...product.additionalImages]
                                                : [product?.mainImage || "/placeholder.svg"]
                                        }
                                    />
                                )}
                            </div>

                            {/* Right: Product Info & Actions Stack (5 cols on lg) */}
                            <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
                                {isLoading ? (
                                    <div className="space-y-5">
                                        <Skeleton className="h-4 w-28 rounded-full" />
                                        <Skeleton className="h-10 w-full rounded-2xl" />
                                        <Skeleton className="h-20 w-full rounded-2xl" />
                                        <Skeleton className="h-14 w-full rounded-2xl" />
                                        <Skeleton className="h-12 w-full rounded-full" />
                                    </div>
                                ) : (
                                    <>
                                        <ProductHeader
                                            isLoading={false}
                                            name={product?.name}
                                            categoryName={product?.categoryName}
                                            rating={product?.rating}
                                            reviewCount={product?.reviewCount}
                                        />

                                        <ProductPrice
                                            isLoading={false}
                                            price={product?.price || 0}
                                            salePrice={product?.salePrice}
                                        />

                                        <ProductVariantSelector
                                            isLoading={false}
                                            variants={product?.variants}
                                            selectedColor={selectedColor}
                                            onColorSelect={setSelectedColor}
                                            selectedSize={selectedSize}
                                            onSizeSelect={setSelectedSize}
                                        />

                                        <ProductQuantitySelector
                                            isLoading={false}
                                            quantity={quantity}
                                            stock={product?.stockQuantity}
                                            onDecrement={decrementQuantity}
                                            onIncrement={incrementQuantity}
                                            onQuantityChange={handleQuantityChange}
                                        />

                                        <ProductActions
                                            productId={product?.id || ""}
                                            isLoading={false}
                                            isAddingToCart={isAddingToCart}
                                            onAddToCart={handleAddToCart}
                                            onBuyNow={handleBuyNow}
                                            productName={product?.name}
                                            price={product?.salePrice || product?.price}
                                            categoryName={product?.categoryName}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Product Technical Tabs (Specs, Description, Reviews) */}
                        <div className="mt-16 md:mt-24">
                            <ProductTabs
                                isLoading={isLoading}
                                productId={product?.id}
                                specifications={product?.specifications}
                                description={product?.description}
                                name={product?.name}
                                reviewCount={product?.reviewCount}
                            />
                        </div>

                        {/* Similar Products Section */}
                        <div className="mt-16 md:mt-24 pt-12 border-t border-line/60">
                            <div className="section-heading">
                                <span className="section-label">Gợi ý dành cho bạn</span>
                                <h2 className="section-title">Sản phẩm tương tự</h2>
                                <p className="text-small text-ink-faint mt-1">
                                    Các thiết bị cùng phân khúc được khách hàng quan tâm nhiều nhất.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {isLoadingSimilar
                                    ? Array(4)
                                          .fill(0)
                                          .map((_, index) => <ProductCardSkeleton key={index} />)
                                    : similarProducts
                                          ?.slice(0, 4)
                                          .map((item) => <ProductCard key={item.id} product={item} />)}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Sticky Buy Bar (Conversion Optimization) */}
                    {!isLoading && product && (
                        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-line shadow-lg">
                            <div className="container-app flex items-center justify-between gap-3 py-3">
                                <div className="leading-tight min-w-0">
                                    {product.salePrice && (
                                        <p className="text-tiny text-ink-faint line-through truncate">
                                            {formatPrice(product.price)}
                                        </p>
                                    )}
                                    <p className="text-base font-bold text-ink truncate">
                                        {formatPrice(product.salePrice || product.price)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={isAddingToCart}
                                        variant="outline"
                                        className="h-10 px-4 rounded-full border-line text-ink text-tiny font-semibold"
                                    >
                                        Thêm giỏ
                                    </Button>
                                    <Button
                                        onClick={handleBuyNow}
                                        disabled={isAddingToCart}
                                        className="h-10 px-5 rounded-full bg-brand text-white hover:bg-brand-hover text-tiny font-semibold shadow-xs"
                                    >
                                        Mua ngay
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ErrorBoundary>
            {/* Spacer cho sticky bar mobile */}
            {!isLoading && product && <div className="lg:hidden h-20" />}
        </>
    )
}

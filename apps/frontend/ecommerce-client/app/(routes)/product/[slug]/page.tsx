"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Head from "next/head"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"

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

import { ProductBreadcrumb } from "@/components/products/product-breadcrumb"
import { ProductHeader } from "@/components/products/product-header"
import { ProductPrice } from "@/components/products/product-price"
import { ProductVariantSelector } from "@/components/products/product-variant-selector"
import { ProductQuantitySelector } from "@/components/products/product-quantity-selector"
import { ProductActions } from "@/components/products/product-actions"
import { ChevronRight } from "lucide-react"

// Lazy load tabs component - user typically doesn't need it immediately
const ProductTabs = dynamic(() => import("@/components/products/product-tabs").then(m => ({ default: m.ProductTabs })), {
    loading: () => <div className="h-96 bg-muted/30 rounded-lg animate-pulse" />,
})

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
            
            // Track Add to Cart Event
            analytics.trackAddToCart({
                id: product.id,
                name: product.name,
                price: product.salePrice || product.price,
                brand: product.categoryName, // fallback to category if brand is missing
                category: product.categoryName
            }, quantity)
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
            {product && (
                <Head>
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
                                brand: "ShopViet", // Brand string or static fallback
                                url: `https://shopviet.com/product/${product.slug}`,
                            }))
                        }}
                    />
                </Head>
            )}
            <ErrorBoundary>
                <div className="min-h-screen bg-background relative overflow-hidden">
                    <div className="absolute inset-0 mesh-gradient-subtle opacity-30 pointer-events-none" />

                    <div className="container mx-auto px-4 py-8 relative z-10">
                        <ProductBreadcrumb
                        isLoading={isLoading}
                        categoryName={product?.categoryName}
                        productName={product?.name}
                    />

                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 items-start">
                        {/* Product Gallery */}
                        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            {isLoading ? (
                                <Skeleton className="h-[500px] w-full rounded-2xl" />
                            ) : (
                                <ProductGallery images={product?.additionalImages || []} />
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="animate-fade-in space-y-8 glass-card rounded-2xl p-6 md:p-8" style={{ animationDelay: '0.2s' }}>
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
                                <div className="py-4 border-y border-border/50">
                                    <p className="text-muted-foreground leading-relaxed">{product?.description}</p>
                                </div>
                            )}

                            <div className="space-y-6">
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
                    </div>

                    <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <ProductTabs
                            isLoading={isLoading}
                            productId={product?.id}
                            specifications={product?.specifications}
                            description={product?.description}
                            name={product?.name}
                            reviewCount={product?.reviewCount}
                        />
                    </div>

                    {/* Similar Products */}
                    <div className="mt-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="tech-heading text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                    Sản phẩm tương tự
                                </h2>
                                <p className="text-muted-foreground mt-2">Có thể bạn cũng sẽ thích</p>
                            </div>
                            <Link
                                href={`/products?category=${product?.categoryName}`}
                                className="group flex items-center text-primary font-medium hover:text-primary/80 transition-colors"
                            >
                                Xem tất cả
                                <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
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
                </div>
            </ErrorBoundary>
        </>
    )
}

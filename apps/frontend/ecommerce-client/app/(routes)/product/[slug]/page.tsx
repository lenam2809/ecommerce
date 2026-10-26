"use client"

import { useEffect, useState, useMemo } from "react"
import Head from "next/head"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import {
    Check,
    CreditCard,
    MapPin,
    ShieldPlus,
    ShoppingCart,
    Store,
    Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorBoundary } from "@/components/error-boundary"
import ProductCard from "@/components/product-card"
import ProductGallery from "@/components/product-gallery"
import ProductCardSkeleton from "@/components/product-card-skeleton"
import { useProductBySlug, useSimilarProducts } from "@/hooks/use-products"
import { useProductStock } from "@/hooks/use-showrooms"
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
const ProductTabs = dynamic(
    () => import("@/components/products/product-tabs").then((m) => ({ default: m.ProductTabs })),
    {
        loading: () => <div className="h-96 bg-surface-2/40 rounded-2xl animate-pulse" />,
    }
)

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const productSlug = (params?.slug as string) || ""

    const [quantity, setQuantity] = useState(1)
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const [includeAppleCare, setIncludeAppleCare] = useState(false)
    const [installmentMonths, setInstallmentMonths] = useState<3 | 6 | 9 | 12>(12)
    const [selectedRegion, setSelectedRegion] = useState<"all" | "hcm" | "hn" | "dn">("all")

    // Fetch product data directly from API
    const { data: product, isLoading } = useProductBySlug(productSlug)

    // Fetch similar products
    const { data: apiSimilarProducts, isLoading: isLoadingSimilar } = useSimilarProducts(product?.id || "")
    const similarProducts = apiSimilarProducts || []

    // Real Showroom Stock from API
    const { data: showroomStock = [] } = useProductStock(product?.id)

    // Real AddOns from Product
    const availableAddOns = product?.availableAddOns || product?.addOns || []
    const primaryAddOn = availableAddOns[0]
    const addOnPrice = primaryAddOn?.price || 0

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

    const baseUnitPrice = product ? (product.salePrice || product.price) : 0
    const effectiveUnitPrice = baseUnitPrice + (includeAppleCare ? addOnPrice : 0)

    const handleAddToCart = () => {
        if (product) {
            addToCart({
                productId: product.id,
                quantity,
                options: {
                    color: selectedColor || undefined,
                    size: selectedSize || undefined,
                    addOnId: includeAppleCare && primaryAddOn ? primaryAddOn.id : undefined,
                },
            })

            analytics.trackAddToCart(
                {
                    id: product.id,
                    name: product.name,
                    price: effectiveUnitPrice,
                    brand: product.brandSlug || "Apple",
                    category: product.categoryName,
                },
                quantity
            )
        }
    }

    const handleBuyNow = () => {
        if (product) {
            handleAddToCart()
            router.push("/cart")
        }
    }

    const filteredShowrooms = useMemo(() => {
        if (selectedRegion === "all") return showroomStock
        return showroomStock.filter(
            (s) => s.region?.toLowerCase() === selectedRegion.toLowerCase()
        )
    }, [showroomStock, selectedRegion])

    const stickyVariantLabel = useMemo(() => {
        const shortSize = (selectedSize || "Phiên bản chuẩn")
            .replace(" RAM", "")
            .replace(" SSD", "")
        const shortColor = (selectedColor || "").split("(")[0].trim()
        return shortColor ? `${shortSize} • ${shortColor}` : shortSize
    }, [selectedSize, selectedColor])

    return (
        <>
            {product && (
                <Head>
                    <title>{`${product.name} - Chính Hãng Giá Tốt | ShopViet`}</title>
                    <meta
                        name="description"
                        content={
                            product.description ||
                            `Mua ${product.name} chính hãng bảo hành 24 tháng tại 45 Showroom ShopViet.`
                        }
                    />
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: toSafeJsonLd(
                                generateProductSchema({
                                    name: product.name,
                                    description: product.description || "",
                                    price: effectiveUnitPrice,
                                    image: product.mainImage,
                                    rating: product.rating,
                                    reviewCount: product.reviewCount,
                                    brand: product.brandSlug || "Apple",
                                    url: `https://shopviet.vn/product/${product.slug}`,
                                })
                            ),
                        }}
                    />
                </Head>
            )}
            <ErrorBoundary>
                <div className="min-h-screen bg-background">
                    <div className="container-app py-5 md:py-10">
                        {/* Breadcrumb Navigation */}
                        <ProductBreadcrumb
                            isLoading={isLoading}
                            categoryName={product?.categoryName}
                            categorySlug={product?.categorySlug}
                            productName={product?.name}
                        />

                        {/* Main Product Split-Screen Stage: Left Sticky Gallery (7 cols) + Right Configurator (5 cols) */}
                        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                            {/* Left: Sticky Gallery on Desktop, max-h-[35vh] on Mobile */}
                            <div className="lg:col-span-7 lg:sticky lg:top-24">
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

                            {/* Right: Scrollable Product Configurator & Purchase Panel (5 cols on lg) */}
                            <div className="lg:col-span-5 flex flex-col gap-5">
                                {isLoading ? (
                                    <div className="space-y-5">
                                        <Skeleton className="h-4 w-28 rounded-full" />
                                        <Skeleton className="h-10 w-full rounded-2xl" />
                                        <Skeleton className="h-20 w-full rounded-2xl" />
                                        <Skeleton className="h-14 w-full rounded-2xl" />
                                        <Skeleton className="h-12 w-full rounded-xl" />
                                    </div>
                                ) : (
                                    <>
                                        <ProductHeader
                                            isLoading={false}
                                            name={product?.name}
                                            categoryName={product?.categoryName}
                                            sku={product?.sku || product?.code}
                                            rating={product?.rating}
                                            reviewCount={product?.reviewCount}
                                        />

                                        <ProductPrice
                                            isLoading={false}
                                            price={product?.price || 0}
                                            salePrice={product?.salePrice}
                                            appleCarePlusPrice={addOnPrice}
                                            includeAppleCare={includeAppleCare}
                                        />

                                        <ProductVariantSelector
                                            isLoading={false}
                                            variants={product?.variants}
                                            selectedColor={selectedColor}
                                            onColorSelect={setSelectedColor}
                                            selectedSize={selectedSize}
                                            onSizeSelect={setSelectedSize}
                                        />

                                        {/* Checkbox Mua kèm gói bảo hành mở rộng */}
                                        {primaryAddOn && (
                                            <div
                                                onClick={() => setIncludeAppleCare((prev) => !prev)}
                                                role="checkbox"
                                                aria-checked={includeAppleCare}
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === " ") {
                                                        e.preventDefault()
                                                        setIncludeAppleCare((prev) => !prev)
                                                    }
                                                }}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                                                    includeAppleCare
                                                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                                                        : "border-line bg-card hover:border-primary/40"
                                                }`}
                                            >
                                                <div
                                                    className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                                        includeAppleCare
                                                            ? "bg-primary border-primary text-white"
                                                            : "border-slate-300 dark:border-slate-600 bg-background"
                                                    }`}
                                                >
                                                    {includeAppleCare && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <span className="inline-flex items-center gap-1.5 text-small font-bold text-ink">
                                                            <ShieldPlus className="h-4 w-4 text-primary" />
                                                            Mua kèm gói {primaryAddOn.name}
                                                        </span>
                                                        <span className="text-small font-extrabold text-primary font-mono tabular-nums whitespace-nowrap">
                                                            +{formatPrice(addOnPrice)}
                                                        </span>
                                                    </div>
                                                    {primaryAddOn.description ? (
                                                        <p className="text-tiny text-ink-soft mt-1 leading-relaxed">
                                                            {primaryAddOn.description}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        )}

                                        {/* Bảng tính trả góp 0% lãi suất (0% Installment Calculator) */}
                                        <div className="p-4 rounded-2xl border border-line bg-card space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="inline-flex items-center gap-1.5 text-small font-bold text-ink">
                                                    <CreditCard className="h-4 w-4 text-primary" />
                                                    Bảng tính trả góp 0% lãi suất
                                                </span>
                                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                    Duyệt hồ sơ 5 phút
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-4 gap-2">
                                                {([3, 6, 9, 12] as const).map((m) => {
                                                    const isSelected = installmentMonths === m
                                                    return (
                                                        <button
                                                            key={m}
                                                            type="button"
                                                            onClick={() => setInstallmentMonths(m)}
                                                            className={`py-2 px-2 rounded-xl text-tiny font-bold border transition-all tabular-nums ${
                                                                isSelected
                                                                    ? "border-primary bg-primary text-white shadow-xs"
                                                                    : "border-line bg-surface text-ink hover:border-primary/40"
                                                            }`}
                                                        >
                                                            {m} tháng
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-line/60 text-tiny">
                                                <span className="text-ink-soft">
                                                    Góp mỗi tháng ({installmentMonths} kỳ • Trả trước 0đ):
                                                </span>
                                                <span className="text-small font-extrabold text-primary font-mono tabular-nums whitespace-nowrap">
                                                    {formatPrice(Math.round(effectiveUnitPrice / installmentMonths))}/tháng
                                                </span>
                                            </div>
                                        </div>

                                        {/* Kiểm tra tồn kho tại 45 Showroom (Showroom Stock Checker) */}
                                        <div className="p-4 rounded-2xl border border-line bg-card space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="inline-flex items-center gap-1.5 text-small font-bold text-ink">
                                                    <Store className="h-4 w-4 text-primary" />
                                                    Kiểm tra tồn kho tại 45 Showroom
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {(
                                                        [
                                                            { id: "all", label: `Toàn quốc (${showroomStock.length || 45})` },
                                                            { id: "hcm", label: `TP.HCM (${showroomStock.filter((s) => s.region?.toLowerCase() === "hcm").length})` },
                                                            { id: "hn", label: `Hà Nội (${showroomStock.filter((s) => s.region?.toLowerCase() === "hn").length})` },
                                                        ] as const
                                                    ).map((reg) => (
                                                        <button
                                                            key={reg.id}
                                                            type="button"
                                                            onClick={() => setSelectedRegion(reg.id)}
                                                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors tabular-nums ${
                                                                selectedRegion === reg.id
                                                                    ? "bg-primary/15 text-primary border border-primary/30"
                                                                    : "text-ink-soft hover:bg-surface-2"
                                                            }`}
                                                        >
                                                            {reg.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                                {filteredShowrooms.length === 0 ? (
                                                    <p className="text-xs text-ink-soft py-2 text-center">Chưa có dữ liệu tồn kho cho cơ sở đã chọn</p>
                                                ) : (
                                                    filteredShowrooms.map((sr) => (
                                                        <div
                                                            key={sr.showroomId || sr.code}
                                                            className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-surface-2/60 border border-line/50 text-tiny"
                                                        >
                                                            <span className="inline-flex items-center gap-1.5 text-ink font-medium truncate">
                                                                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                                                <span className="truncate">{sr.name} — {sr.address}</span>
                                                            </span>
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap shrink-0 font-mono tabular-nums">
                                                                {sr.quantity > 0 ? `Sẵn hàng (${sr.quantity} máy) • Giao 2H` : "Liên hệ"}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

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
                                            price={effectiveUnitPrice}
                                            categoryName={product?.categoryName}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Product Technical Tabs (14 Zebra-striped Specs, Description, SignalR Reviews) */}
                        <div className="mt-14 md:mt-20">
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
                        <div className="mt-14 md:mt-20 pt-10 border-t border-line/60">
                            <div className="section-heading">
                                <span className="section-label">Hệ sinh thái đề xuất</span>
                                <h2 className="section-title">Sản phẩm tương tự</h2>
                                <p className="text-small text-ink-faint mt-1">
                                    Các thiết bị chính hãng cùng phân khúc được khách hàng chọn mua nhiều nhất tại 45 Showroom.
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

                    {/* Mobile Sticky Buy Bar (z-50 — Pinned above Bottom Navigation per Stitch D1-06) */}
                    {!isLoading && product && (
                        <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 dark:bg-card/95 backdrop-blur-xl border-t border-line shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
                            <div className="container-app py-2.5 space-y-2">
                                {/* Configuration summary row */}
                                <div className="flex items-center justify-between gap-2 text-[11px] border-b border-line/50 pb-1.5">
                                    <span className="font-semibold text-primary truncate">
                                        {stickyVariantLabel}
                                        {includeAppleCare && primaryAddOn ? ` + ${primaryAddOn.name}` : ""}
                                    </span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap shrink-0">
                                        ● Sẵn hàng 45 Showroom
                                    </span>
                                </div>

                                {/* Price & Dual CTA Row */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="leading-tight min-w-0">
                                        {product.salePrice && (
                                            <p className="text-[11px] text-ink-faint line-through font-mono tabular-nums whitespace-nowrap">
                                                {formatPrice(
                                                    product.price + (includeAppleCare ? addOnPrice : 0)
                                                )}
                                            </p>
                                        )}
                                        <p className="text-base sm:text-lg font-extrabold text-ink dark:text-white font-mono tabular-nums whitespace-nowrap">
                                            {formatPrice(effectiveUnitPrice)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            onClick={handleAddToCart}
                                            disabled={isAddingToCart}
                                            className="h-11 px-3.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-tiny font-bold shadow-xs"
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-1.5" />
                                            Thêm giỏ
                                        </Button>
                                        <Button
                                            onClick={handleBuyNow}
                                            disabled={isAddingToCart}
                                            className="h-11 px-4 rounded-xl bg-brand text-white hover:bg-brand/90 text-tiny font-bold shadow-xs"
                                        >
                                            <Zap className="h-4 w-4 mr-1" />
                                            Mua ngay
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ErrorBoundary>
            {/* Spacer cho sticky bar mobile */}
            {!isLoading && product && <div className="lg:hidden h-28" />}
        </>
    )
}

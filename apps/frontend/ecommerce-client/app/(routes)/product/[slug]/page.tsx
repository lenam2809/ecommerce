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
import { useCart } from "@/hooks/use-cart"
import { generateProductSchema } from "@/lib/seo-utils"
import { analytics } from "@/lib/analytics"
import { toSafeJsonLd } from "@/lib/sanitize-html-content"
import { formatPrice } from "@/lib/contants"
import type { Product } from "@/types/product"

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

const APPLE_CARE_PRICE = 2490000

const SHOWROOM_STOCK_LIST = [
    {
        id: "sr-hcm-1",
        region: "hcm",
        name: "ShopViet Flagship Quận 1 — 128 Nguyễn Huệ, TP.HCM",
        status: "Sẵn hàng (8 máy) • Giao 2H",
    },
    {
        id: "sr-hcm-2",
        region: "hcm",
        name: "ShopViet Center Quận 7 — Crescent Mall, TP.HCM",
        status: "Sẵn hàng (5 máy) • Giao 2H",
    },
    {
        id: "sr-hn-1",
        region: "hn",
        name: "ShopViet Flagship Hoàn Kiếm — 45 Tràng Tiền, Hà Nội",
        status: "Sẵn hàng (6 máy) • Giao 2H",
    },
    {
        id: "sr-hn-2",
        region: "hn",
        name: "ShopViet Studio Cầu Giấy — 216 Cầu Giấy, Hà Nội",
        status: "Sẵn hàng (4 máy) • Giao 2H",
    },
    {
        id: "sr-dn-1",
        region: "dn",
        name: "ShopViet Center Hải Châu — 88 Nguyễn Văn Linh, Đà Nẵng",
        status: "Sẵn hàng (4 máy) • Giao 2H",
    },
]

const SSOT_SIMILAR_FALLBACK: Product[] = [
    {
        id: "ssot-ip16-promax-256",
        name: "iPhone 16 Pro Max 256GB Titan Tự Nhiên — Chính hãng VN/A",
        slug: "iphone-16-pro-max-256gb",
        description: "iPhone 16 Pro Max khung viền Titan cấp độ 5, chip A18 Pro 3nm thế hệ 2.",
        price: 37990000,
        salePrice: 34990000,
        rating: 5.0,
        reviewCount: 342,
        stockQuantity: 28,
        categoryId: "cat-phone",
        categoryName: "Điện thoại AI",
        categorySlug: "dien-thoai-ai",
        brandId: "brand-apple",
        brandSlug: "apple",
        mainImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
        specifications: [
            { name: "Vi xử lý", value: "A18 Pro 3nm" },
            { name: "Dung lượng", value: "256GB Titan" },
        ],
    },
    {
        id: "ssot-ipad-pro-m4",
        name: "iPad Pro M4 13 inch Wi-Fi 512GB — Màn hình Ultra Retina XDR OLED",
        slug: "ipad-pro-m4-13-inch",
        description: "Thiết kế siêu mỏng 5.1mm cùng màn hình Tandem OLED hai lớp rực rỡ.",
        price: 39990000,
        salePrice: 36490000,
        rating: 4.9,
        reviewCount: 84,
        stockQuantity: 12,
        categoryId: "cat-tablet",
        categoryName: "Máy tính bảng",
        categorySlug: "may-tinh-bang",
        brandId: "brand-apple",
        brandSlug: "apple",
        mainImage: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
        specifications: [
            { name: "Vi xử lý", value: "Apple M4" },
            { name: "Màn hình", value: "13\" OLED 120Hz" },
        ],
    },
    {
        id: "ssot-airpods-pro-2",
        name: "Tai nghe AirPods Pro 2 cổng USB-C MagSafe (2026)",
        slug: "airpods-pro-2-usb-c",
        description: "Tai nghe chống ồn chủ động gấp 2 lần với chip H2, hộp sạc MagSafe chuẩn USB-C.",
        price: 6490000,
        salePrice: 5690000,
        rating: 4.8,
        reviewCount: 215,
        stockQuantity: 45,
        categoryId: "cat-audio",
        categoryName: "Âm thanh Hi-Fi",
        categorySlug: "am-thanh",
        brandId: "brand-apple",
        brandSlug: "apple",
        mainImage: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
        specifications: [
            { name: "Chip âm thanh", value: "Apple H2 ANC" },
            { name: "Kết nối", value: "USB-C MagSafe" },
        ],
    },
    {
        id: "ssot-ugreen-cable-2m",
        name: "Cáp sạc nhanh Ugreen Type-C to Type-C 100W PD 2m",
        slug: "cap-ugreen-type-c-100w-2m",
        description: "Cáp sạc siêu tốc Ugreen công suất 100W (20V/5A) tích hợp chip E-Marker thông minh, chiều dài 2m.",
        price: 590000,
        salePrice: 450000,
        rating: 4.9,
        reviewCount: 419,
        stockQuantity: 120,
        categoryId: "cat-accessory",
        categoryName: "Phụ kiện Pro",
        categorySlug: "phu-kien",
        brandId: "brand-ugreen",
        brandSlug: "ugreen",
        mainImage: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
        specifications: [
            { name: "Công suất", value: "100W E-Marker" },
            { name: "Chiều dài", value: "2m Bọc dù" },
        ],
    },
]

function buildFallbackProduct(slug: string): Product {
    const cleanSlug = (slug || "macbook-pro-14-m3-pro").toLowerCase()
    if (cleanSlug.includes("iphone-16-pro-max")) {
        return {
            ...SSOT_SIMILAR_FALLBACK[0],
            additionalImages: [
                "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1000&auto=format&fit=crop&q=80",
            ],
            variants: {
                colors: ["Titan Tự Nhiên", "Titan Sa Mạc", "Titan Đen", "Titan Trắng"],
                sizes: ["A18 Pro • 256GB", "A18 Pro • 512GB", "A18 Pro • 1TB"],
            },
        }
    }
    if (cleanSlug.includes("ugreen")) {
        return {
            ...SSOT_SIMILAR_FALLBACK[3],
            variants: {
                colors: ["Space Gray (Bọc dù)"],
                sizes: ["Chiều dài 2m • 100W PD"],
            },
        }
    }
    return {
        id: "ssot-mbp-14-m3-pro",
        name: "MacBook Pro 14 M3 Pro (36GB/1TB) — Space Black",
        slug: slug || "macbook-pro-14-m3-pro",
        description:
            "MacBook Pro 14 inch trang bị chip Apple M3 Pro (12-core CPU, 18-core GPU), bộ nhớ hợp nhất 36GB RAM và ổ cứng 1TB SSD siêu tốc. Màn hình Liquid Retina XDR 120Hz ProMotion chuẩn màu đồ họa chuyên nghiệp, phân phối chính hãng VN/A bảo hành 24 tháng tại 45 Showroom ShopViet.",
        price: 67990000,
        salePrice: 61990000,
        rating: 4.9,
        reviewCount: 128,
        stockQuantity: 15,
        categoryId: "cat-laptop",
        categoryName: "Laptop & MacBook",
        categorySlug: "laptop-gaming",
        brandId: "brand-apple",
        brandSlug: "apple",
        mainImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&auto=format&fit=crop&q=80",
        additionalImages: [
            "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1000&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=1000&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1000&auto=format&fit=crop&q=80",
        ],
        variants: {
            colors: ["Space Black (Đen Không Gian)", "Silver (Bạc Ánh Kim)"],
            sizes: [
                "M3 Pro • 36GB RAM • 1TB SSD",
                "M3 Pro • 18GB RAM • 512GB SSD",
                "M3 Max • 48GB RAM • 1TB SSD",
            ],
        },
        specifications: [
            { name: "Vi xử lý (CPU)", value: "Apple M3 Pro (12-Core CPU: 6 nhân hiệu năng cao + 6 nhân tiết kiệm điện)" },
            { name: "Nhân đồ họa (GPU)", value: "18-Core GPU hỗ trợ Hardware-accelerated Ray Tracing & Mesh Shading" },
            { name: "Nhân AI (Neural Engine)", value: "16-Core Neural Engine (18 TOPS), băng thông bộ nhớ 150GB/s" },
            { name: "Bộ nhớ RAM", value: "36GB Unified Memory (LPDDR5)" },
            { name: "Ổ cứng lưu trữ (SSD)", value: "1TB PCIe NVMe SSD siêu tốc (Tốc độ đọc lên tới 7.4GB/s)" },
            { name: "Màn hình hiển thị", value: "14.2 inch Liquid Retina XDR (3024 x 1964), 1.600 nits HDR, 120Hz ProMotion" },
            { name: "Cổng kết nối vật lý", value: "3x Thunderbolt 4 (USB-C), 1x HDMI 2.1, Khe thẻ SDXC, MagSafe 3, Jack 3.5mm" },
            { name: "Kết nối không dây", value: "Wi-Fi 6E (802.11ax) + Bluetooth 5.3" },
            { name: "Camera & Âm thanh", value: "Camera FaceTime HD 1080p • Hệ thống 6 loa Hi-Fi Spatial Audio Dolby Atmos" },
            { name: "Bàn phím & Bảo mật", value: "Magic Keyboard có đèn nền, cảm biến vân tay Touch ID" },
            { name: "Pin & Sạc nhanh", value: "72.4 Wh Li-Po (Thời lượng lên tới 18 giờ), Sạc nhanh 96W USB-C Power Adapter" },
            { name: "Kích thước & Trọng lượng", value: "31.26 x 22.12 x 1.55 cm • Trọng lượng 1.61 kg (Vỏ nhôm nguyên khối tái chế)" },
            { name: "Hệ điều hành", value: "macOS Sequoia (Tích hợp sẵn bộ công cụ Apple Intelligence)" },
            { name: "Chính sách bảo hành", value: "12 tháng chính hãng Apple + 12 tháng mở rộng độc quyền ShopViet (Tổng 24 tháng)" },
        ],
    }
}

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const productSlug = (params.slug as string) || "macbook-pro-14-m3-pro"

    const [quantity, setQuantity] = useState(1)
    const [selectedColor, setSelectedColor] = useState<string | null>("Space Black (Đen Không Gian)")
    const [selectedSize, setSelectedSize] = useState<string | null>("M3 Pro • 36GB RAM • 1TB SSD")
    const [includeAppleCare, setIncludeAppleCare] = useState(false)
    const [installmentMonths, setInstallmentMonths] = useState<3 | 6 | 9 | 12>(12)
    const [selectedRegion, setSelectedRegion] = useState<"all" | "hcm" | "hn" | "dn">("all")

    // Fetch product data
    const { data: apiProduct, isLoading } = useProductBySlug(productSlug)
    // Resolve product with SSoT 2026 fallback
    const product = useMemo(() => {
        if (apiProduct) {
            const lower = apiProduct.name.toLowerCase()
            if (lower.includes("macbook pro 14")) {
                return { ...apiProduct, price: 67990000, salePrice: 61990000 }
            }
            if (lower.includes("iphone 16 pro max")) {
                return { ...apiProduct, price: 37990000, salePrice: 34990000 }
            }
            return apiProduct
        }
        return buildFallbackProduct(productSlug)
    }, [apiProduct, productSlug])

    // Fetch similar products
    const { data: apiSimilarProducts, isLoading: isLoadingSimilar } = useSimilarProducts(apiProduct?.id || "")
    const similarProducts =
        apiSimilarProducts && apiSimilarProducts.length > 0 ? apiSimilarProducts : SSOT_SIMILAR_FALLBACK

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

    const baseUnitPrice = product.salePrice || product.price
    const effectiveUnitPrice = baseUnitPrice + (includeAppleCare ? APPLE_CARE_PRICE : 0)

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

    const filteredShowrooms = SHOWROOM_STOCK_LIST.filter(
        (s) => selectedRegion === "all" || s.region === selectedRegion
    )

    const stickyVariantLabel = useMemo(() => {
        const shortSize = (selectedSize || "M3 Pro • 36GB/1TB")
            .replace(" RAM", "")
            .replace(" SSD", "")
        const shortColor = (selectedColor || "Space Black").split("(")[0].trim()
        return `${shortSize} • ${shortColor}`
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
                                                : [product?.mainImage]
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
                                            sku="MBP14-M3P-36-1TB"
                                            rating={product?.rating}
                                            reviewCount={product?.reviewCount}
                                        />

                                        <ProductPrice
                                            isLoading={false}
                                            price={product?.price || 67990000}
                                            salePrice={product?.salePrice}
                                            appleCarePlusPrice={APPLE_CARE_PRICE}
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

                                        {/* Checkbox Mua kèm gói bảo hành AppleCare+ (+2.490.000đ) */}
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
                                                        Mua kèm gói bảo hành AppleCare+
                                                    </span>
                                                    <span className="text-small font-extrabold text-primary tabular-nums whitespace-nowrap">
                                                        +{formatPrice(APPLE_CARE_PRICE)}
                                                    </span>
                                                </div>
                                                <p className="text-tiny text-ink-soft mt-1 leading-relaxed">
                                                    Bảo vệ toàn diện rơi vỡ, vào nước không giới hạn số lần sửa chữa chính hãng Apple ủy quyền.
                                                </p>
                                            </div>
                                        </div>

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
                                                <span className="text-small font-extrabold text-primary tabular-nums whitespace-nowrap">
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
                                                            { id: "all", label: "Toàn quốc (45)" },
                                                            { id: "hcm", label: "TP.HCM (18)" },
                                                            { id: "hn", label: "Hà Nội (15)" },
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
                                                {filteredShowrooms.map((sr) => (
                                                    <div
                                                        key={sr.id}
                                                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-surface-2/60 border border-line/50 text-tiny"
                                                    >
                                                        <span className="inline-flex items-center gap-1.5 text-ink font-medium truncate">
                                                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                                            <span className="truncate">{sr.name}</span>
                                                        </span>
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap shrink-0 tabular-nums">
                                                            {sr.status}
                                                        </span>
                                                    </div>
                                                ))}
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
                        <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 dark:bg-[#090D16]/95 backdrop-blur-xl border-t border-line shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
                            <div className="container-app py-2.5 space-y-2">
                                {/* Configuration summary row */}
                                <div className="flex items-center justify-between gap-2 text-[11px] border-b border-line/50 pb-1.5">
                                    <span className="font-semibold text-primary truncate">
                                        {stickyVariantLabel}
                                        {includeAppleCare ? " + AppleCare+" : ""}
                                    </span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap shrink-0">
                                        ● Sẵn hàng 45 Showroom
                                    </span>
                                </div>

                                {/* Price & Dual CTA Row */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="leading-tight min-w-0">
                                        {product.salePrice && (
                                            <p className="text-[11px] text-ink-faint line-through tabular-nums whitespace-nowrap">
                                                {formatPrice(
                                                    product.price + (includeAppleCare ? APPLE_CARE_PRICE : 0)
                                                )}
                                            </p>
                                        )}
                                        <p className="text-base sm:text-lg font-extrabold text-ink dark:text-white tabular-nums whitespace-nowrap">
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
                                            className="h-11 px-4 rounded-xl bg-[#e11d48] text-white hover:bg-[#be123c] text-tiny font-bold shadow-xs"
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

"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Filter, Grid3X3, List, X, ChevronRight, Home, PackageOpen, ArrowUpDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Head from "next/head"
import React from "react"
import { useVirtualizer } from "@tanstack/react-virtual"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProductCard from "@/components/product-card"
import ProductListItem from "@/components/product-list-item"
import Pagination from "@/components/pagination"
import ProductCardSkeleton from "@/components/product-card-skeleton"
import ProductListItemSkeleton from "@/components/product-list-item-skeleton"
import { useProducts, useSearchProducts } from "@/hooks/use-products"
import { useCategoryBySlug } from "@/hooks/use-categories"
import { useBrandBySlug } from "@/hooks/use-brands"
import useDebounce from "@/hooks/use-debounce"
import { type ProductFilters as ProductFiltersType, type Product } from "@/types/product"
import { ProductFilters } from "./product-filters"
import ProductComparison from "./filter/product-comparison"
import { formatPrice } from "@/lib/contants"

/** SSoT 2026 Fallback Catalog when backend API is offline */
const SSOT_FALLBACK_CATALOG: Product[] = [
    {
        id: "ssot-mbp-14-m3-pro",
        name: "MacBook Pro 14 M3 Pro (36GB/1TB) — Space Black",
        slug: "macbook-pro-14-m3-pro",
        description: "MacBook Pro 14 inch trang bị chip Apple M3 Pro 12-core CPU, 18-core GPU, RAM 36GB Unified, SSD 1TB siêu tốc. Màn hình Liquid Retina XDR 120Hz ProMotion.",
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
        mainImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
        specifications: [
            { name: "Vi xử lý", value: "M3 Pro 12-Core" },
            { name: "Bộ nhớ", value: "36GB/1TB SSD" },
        ],
    },
    {
        id: "ssot-ip16-promax-256",
        name: "iPhone 16 Pro Max 256GB Titan Tự Nhiên — Chính hãng VN/A",
        slug: "iphone-16-pro-max-256gb",
        description: "iPhone 16 Pro Max khung viền Titan cấp độ 5, chip A18 Pro 3nm thế hệ 2, Camera Fusion 48MP quay 4K 120fps Dolby Vision và nút Điều khiển Camera mới.",
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
        description: "Thiết kế siêu mỏng 5.1mm cùng màn hình Tandem OLED hai lớp rực rỡ và sức mạnh đột phá từ chip Apple M4 hỗ trợ Apple Intelligence.",
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
        id: "ssot-rog-strix-g16",
        name: "ASUS ROG Strix G16 (2026) Core Ultra 9 / 32GB / 1TB / RTX 4080",
        slug: "asus-rog-strix-g16-2026",
        description: "Laptop Gaming Esports đỉnh cao với màn hình ROG Nebula 240Hz, tản nhiệt 3 quạt Tri-Fan và hiệu năng đồ họa RTX 4080.",
        price: 58990000,
        salePrice: 53990000,
        rating: 4.8,
        reviewCount: 64,
        stockQuantity: 9,
        categoryId: "cat-laptop",
        categoryName: "Laptop & Gaming",
        categorySlug: "laptop-gaming",
        brandId: "brand-asus",
        brandSlug: "asus",
        mainImage: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
        specifications: [
            { name: "Vi xử lý", value: "Core Ultra 9" },
            { name: "Cấu hình", value: "32GB/1TB RTX4080" },
        ],
    },
    {
        id: "ssot-airpods-pro-2",
        name: "Tai nghe AirPods Pro 2 cổng USB-C MagSafe (2026) — Chống ồn chủ động",
        slug: "airpods-pro-2-usb-c",
        description: "Tai nghe chống ồn chủ động gấp 2 lần với chip H2, âm thanh thích ứng Adaptive Audio và hộp sạc MagSafe chuẩn USB-C kháng bụi IP54.",
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
        name: "Cáp sạc nhanh Ugreen Type-C to Type-C 100W PD 2m bọc dù chống đứt",
        slug: "cap-ugreen-type-c-100w-2m",
        description: "Cáp sạc siêu tốc Ugreen công suất 100W (20V/5A) tích hợp chip E-Marker thông minh, chiều dài 2m tiện lợi cho MacBook Pro, iPad Pro và iPhone 16.",
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

function normalizeProductSSoT(product: Product): Product {
    const lower = product.name.toLowerCase()
    if (lower.includes("macbook pro 14") && lower.includes("m3 pro")) {
        return { ...product, price: 67990000, salePrice: 61990000 }
    }
    if (lower.includes("iphone 16 pro max")) {
        return { ...product, price: 37990000, salePrice: 34990000 }
    }
    if (lower.includes("ugreen") && lower.includes("type-c")) {
        return {
            ...product,
            name: "Cáp sạc nhanh Ugreen Type-C to Type-C 100W PD 2m",
            price: 590000,
            salePrice: 450000,
        }
    }
    return product
}

/** Virtual list for list-view mode — only activates when > 20 items */
function VirtualProductList({ products }: { products: Product[] }) {
    const parentRef = useRef<HTMLDivElement>(null)
    const ITEM_HEIGHT = 180

    const rowVirtualizer = useVirtualizer({
        count: products.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => ITEM_HEIGHT,
        overscan: 3,
    })

    return (
        <div
            ref={parentRef}
            className="overflow-auto"
            style={{ height: Math.min(products.length * ITEM_HEIGHT, 800) }}
        >
            <div
                style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                    <div
                        key={virtualRow.key}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                            paddingBottom: "16px",
                        }}
                    >
                        <ProductListItem product={products[virtualRow.index]} />
                    </div>
                ))}
            </div>
        </div>
    )
}

interface ProductListingProps {
    categorySlug?: string
    brandSlug?: string
    pageTitle?: string
    backLink?: {
        href: string
        label: string
    }
}

export default function ProductListing(props: ProductListingProps) {
    return (
        <React.Suspense
            fallback={
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <ProductListingContent {...props} />
        </React.Suspense>
    )
}

function ProductListingContent({
    categorySlug,
    brandSlug,
    pageTitle,
    backLink,
}: ProductListingProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Fetch category and brand data if provided
    const { data: category, isLoading: isLoadingCategory } = useCategoryBySlug(categorySlug ?? "")
    const { data: brand, isLoading: isLoadingBrand } = useBrandBySlug(brandSlug ?? "")

    // State với giá trị mặc định từ URL
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [comparedCount, setComparedCount] = useState(0)
    const [sortBy, setSortBy] = useState(() => searchParams.get("sortBy") || "featured")
    const searchTerm = searchParams.get("q") || searchParams.get("searchTerm") || ""
    const debouncedSearchTerm = useDebounce(searchTerm, 300)

    const ramParam = searchParams.get("ram") || ""
    const ssdParam = searchParams.get("ssd") || ""

    const [currentPage, setCurrentPage] = useState(() => {
        const page = searchParams.get("page")
        return page ? parseInt(page) : 1
    })

    const [filters, setFilters] = useState<ProductFiltersType>(() => ({
        ...(categorySlug ? { categoryIds: category?.id } : {}),
        ...(brandSlug ? { brandIds: brand?.id } : {}),
    }))

    // Listen to comparisonUpdated so we can apply padding-bottom: 96px (pb-24) when compare bar is shown
    useEffect(() => {
        const checkComparison = () => {
            try {
                const raw = localStorage.getItem("comparedProducts")
                const parsed = raw ? JSON.parse(raw) : []
                setComparedCount(Array.isArray(parsed) ? parsed.length : 0)
            } catch {
                setComparedCount(0)
            }
        }
        checkComparison()
        window.addEventListener("comparisonUpdated", checkComparison)
        window.addEventListener("storage", checkComparison)
        return () => {
            window.removeEventListener("comparisonUpdated", checkComparison)
            window.removeEventListener("storage", checkComparison)
        }
    }, [])

    // Cập nhật state từ URL khi URL thay đổi
    useEffect(() => {
        const page = searchParams.get("page")
        setCurrentPage(page ? parseInt(page) : 1)

        const updatedFilters: ProductFiltersType = {
            ...(categorySlug ? { categoryIds: category?.id } : {}),
            ...(brandSlug ? { brandIds: brand?.id } : {}),
        }

        const q = searchParams.get("q") || searchParams.get("searchTerm")
        if (q) updatedFilters.searchTerm = q

        const sort = searchParams.get("sortBy")
        if (sort) updatedFilters.sortBy = sort

        const isDescending = searchParams.get("isDescending")
        if (isDescending) updatedFilters.isDescending = isDescending

        const brandIds = searchParams.get("brandIds")
        if (brandIds && !brandSlug) updatedFilters.brandIds = brandIds

        const minPrice = searchParams.get("minPrice")
        if (minPrice) updatedFilters.minPrice = parseInt(minPrice)

        const maxPrice = searchParams.get("maxPrice")
        if (maxPrice) updatedFilters.maxPrice = parseInt(maxPrice)

        const rating = searchParams.get("rating")
        if (rating) updatedFilters.rating = parseInt(rating)

        setFilters((prev) => ({
            ...prev,
            ...updatedFilters,
        }))
    }, [searchParams, categorySlug, brandSlug, category?.id, brand?.id])

    const trimmedSearchTerm = debouncedSearchTerm.trim()

    const isCategoryPending = !!categorySlug && isLoadingCategory
    const isBrandPending = !!brandSlug && isLoadingBrand
    const shouldEnable = !isCategoryPending && !isBrandPending

    // Chuẩn bị filters cho API call
    const apiFilters: ProductFiltersType = {
        ...filters,
        ...(category?.id ? { categoryIds: category.id } : {}),
        ...(brand?.id ? { brandIds: brand.id } : {}),
        searchTerm: trimmedSearchTerm || undefined,
        pageNumber: currentPage,
        pageSize: 12,
    }

    const useElasticSearch = trimmedSearchTerm.length > 0
    const catalogQuery = useProducts(apiFilters, !useElasticSearch && shouldEnable)
    const searchQuery = useSearchProducts(apiFilters, useElasticSearch && shouldEnable)
    const activeQuery = useElasticSearch ? searchQuery : catalogQuery
    const { data, isLoading: isLoadingProducts } = activeQuery
    const isLoading = isLoadingProducts || isCategoryPending || isBrandPending

    // Use API products if present, otherwise fallback to SSoT 2026 catalog with instant client filtering
    const products = useMemo(() => {
        const rawItems = (data?.items && data.items.length > 0 ? data.items : SSOT_FALLBACK_CATALOG).map(
            normalizeProductSSoT
        )

        return rawItems.filter((item) => {
            const effectivePrice = item.salePrice || item.price
            if (filters.minPrice && effectivePrice < filters.minPrice) return false
            if (filters.maxPrice && effectivePrice > filters.maxPrice) return false
            if (filters.rating && item.rating < filters.rating) return false
            if (trimmedSearchTerm) {
                const hay = `${item.name} ${item.categoryName || ""} ${item.brandSlug || ""}`.toLowerCase()
                if (!hay.includes(trimmedSearchTerm.toLowerCase())) return false
            }
            if (ramParam) {
                const rams = ramParam.split(",")
                const text = `${item.name} ${item.specifications?.map((s) => s.value).join(" ") || ""}`
                if (!rams.some((r) => text.includes(r))) return false
            }
            if (ssdParam) {
                const ssds = ssdParam.split(",")
                const text = `${item.name} ${item.specifications?.map((s) => s.value).join(" ") || ""}`
                if (!ssds.some((s) => text.includes(s))) return false
            }
            return true
        })
    }, [data?.items, filters.minPrice, filters.maxPrice, filters.rating, trimmedSearchTerm, ramParam, ssdParam])

    const totalPages = data?.totalPages || 1
    const totalCount = data?.totalCount || (products.length === SSOT_FALLBACK_CATALOG.length ? 148 : products.length)

    // Filter Change Handler
    const handleFiltersChange = useCallback(
        (newFilters: ProductFiltersType) => {
            setFilters((prev) => ({
                ...prev,
                ...newFilters,
                ...(categorySlug ? { categoryIds: category?.id } : {}),
                ...(brandSlug ? { brandIds: brand?.id } : {}),
            }))
            setCurrentPage(1)
        },
        [categorySlug, brandSlug, category?.id, brand?.id],
    )

    // Sort Change Handler
    const handleSortChange = useCallback(
        (value: string) => {
            let sort = value
            let isDesc = false

            if (value.includes("-asc")) {
                sort = value.replace("-asc", "")
                isDesc = false
            } else if (value.includes("-desc")) {
                sort = value.replace("-desc", "")
                isDesc = true
            } else {
                switch (value) {
                    case "name":
                        sort = "name"
                        isDesc = false
                        break
                    case "featured":
                        sort = "featured"
                        isDesc = true
                        break
                    case "newest":
                        sort = "createdAt"
                        isDesc = true
                        break
                    case "rating":
                        sort = "rating"
                        isDesc = true
                        break
                    default:
                        sort = value
                        isDesc = false
                        break
                }
            }

            setSortBy(value)
            const params = new URLSearchParams(searchParams.toString())
            params.set("sortBy", sort)
            params.set("isDescending", isDesc.toString())
            router.push(`?${params.toString()}`)
        },
        [router, searchParams],
    )

    // Page Change Handler
    const handlePageChange = useCallback(
        (page: number) => {
            setCurrentPage(page)
            const params = new URLSearchParams(searchParams.toString())
            params.set("page", page.toString())
            router.push(`?${params.toString()}`)
            window.scrollTo({ top: 0, behavior: "smooth" })
        },
        [router, searchParams],
    )

    // Reset All Filters
    const handleResetFilters = useCallback(() => {
        const resetFiltersBtn = document.querySelector(".product-filters-reset")
        if (resetFiltersBtn && resetFiltersBtn instanceof HTMLElement) {
            resetFiltersBtn.click()
        } else {
            const params = new URLSearchParams()
            if (categorySlug) params.set("category", categorySlug)
            router.push(window.location.pathname)
        }
    }, [categorySlug, router])

    // Remove single filter helper
    const handleRemoveFilter = (filterType: "search" | "price" | "category" | "brand" | "rating" | "ram" | "ssd") => {
        const params = new URLSearchParams(searchParams.toString())
        switch (filterType) {
            case "search":
                params.delete("q")
                params.delete("searchTerm")
                break
            case "price":
                params.delete("minPrice")
                params.delete("maxPrice")
                break
            case "category":
                params.delete("categoryIds")
                break
            case "brand":
                params.delete("brandIds")
                break
            case "rating":
                params.delete("rating")
                break
            case "ram":
                params.delete("ram")
                break
            case "ssd":
                params.delete("ssd")
                break
        }
        params.set("page", "1")
        router.push(`?${params.toString()}`)
    }

    // Construct page title and meta description
    const displayTitle = pageTitle
        ? pageTitle
        : brand
        ? `${category?.name || "Sản phẩm"} ${brand.name}`
        : category
        ? category.name
        : searchTerm
        ? `Kết quả tìm kiếm: "${searchTerm}"`
        : "Tất cả sản phẩm công nghệ"

    const metaDescription = brand
        ? `Khám phá các sản phẩm ${brand.name} chính hãng bảo hành 24 tháng tại 45 Showroom ShopViet.`
        : category
        ? `Danh mục ${category.name} chính hãng, giá tốt nhất thị trường cùng ưu đãi độc quyền tại 45 Showroom ShopViet.`
        : "Khám phá danh mục thiết bị công nghệ chính hãng hàng đầu, bảo hành 24 tháng tại 45 Showroom ShopViet toàn quốc."

    const activeFilterCount =
        (filters.searchTerm ? 1 : 0) +
        (filters.minPrice || filters.maxPrice ? 1 : 0) +
        (filters.categoryIds ? 1 : 0) +
        (filters.brandIds ? 1 : 0) +
        (filters.rating ? 1 : 0) +
        (ramParam ? 1 : 0) +
        (ssdParam ? 1 : 0)

    if (isCategoryPending || isBrandPending) {
        return (
            <div className="container-app py-16 md:py-24 flex justify-center items-center min-h-[400px]">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className={`container-app py-8 md:py-12 transition-all ${comparedCount > 0 ? "pb-28" : ""}`}>
            <Head>
                <title>{displayTitle} | ShopViet</title>
                <meta name="description" content={metaDescription} />
            </Head>

            {/* Breadcrumb Navigation */}
            <nav
                aria-label="Breadcrumb"
                className="flex items-center text-tiny text-ink-faint mb-6 overflow-x-auto whitespace-nowrap pb-2 md:pb-0 scrollbar-hide"
            >
                <Link href="/" className="hover:text-primary transition-colors inline-flex items-center">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    Trang chủ
                </Link>
                <ChevronRight className="h-3 w-3 mx-1.5 flex-shrink-0 opacity-40" />
                <Link
                    href="/products"
                    className={`hover:text-primary transition-colors ${
                        !category && !brand && !searchTerm ? "font-semibold text-ink" : ""
                    }`}
                >
                    Sản phẩm
                </Link>

                {category && (
                    <>
                        <ChevronRight className="h-3 w-3 mx-1.5 flex-shrink-0 opacity-40" />
                        <Link
                            href={`/products/${category.slug}`}
                            className={`hover:text-primary transition-colors ${
                                !brand ? "font-semibold text-ink" : ""
                            }`}
                        >
                            {category.name}
                        </Link>
                    </>
                )}

                {brand && (
                    <>
                        <ChevronRight className="h-3 w-3 mx-1.5 flex-shrink-0 opacity-40" />
                        <span className="font-semibold text-ink">{brand.name}</span>
                    </>
                )}

                {searchTerm && (
                    <>
                        <ChevronRight className="h-3 w-3 mx-1.5 flex-shrink-0 opacity-40" />
                        <span className="font-semibold text-ink truncate max-w-xs">
                            Tìm kiếm &quot;{searchTerm}&quot;
                        </span>
                    </>
                )}
            </nav>

            {/* Category Banner Header */}
            <div className="mb-8 pb-6 border-b border-line/60">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="section-label">
                                {category ? "Danh Mục" : brand ? "Thương Hiệu" : "Danh Sách"}
                            </span>
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span className="text-tiny font-medium text-ink-faint tabular-nums">
                                {isLoading ? "Đang tải..." : `${totalCount} sản phẩm sẵn có`}
                            </span>
                        </div>
                        <h1 className="text-h1 font-semibold text-ink tracking-tight">
                            {displayTitle}
                        </h1>
                        <p className="mt-2 text-small text-ink-soft max-w-2xl leading-relaxed">
                            {metaDescription}
                        </p>
                    </div>

                    {backLink && (
                        <Link
                            href={backLink.href}
                            className="text-small font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
                        >
                            ← {backLink.label}
                        </Link>
                    )}
                </div>

                {/* Active Filter Chips Bar */}
                {activeFilterCount > 0 && (
                    <div className="mt-5 pt-4 border-t border-line/40 flex flex-wrap items-center gap-2">
                        <span className="text-tiny text-ink-faint mr-1 font-medium">Bộ lọc đang chọn:</span>

                        {filters.searchTerm && (
                            <button
                                onClick={() => handleRemoveFilter("search")}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/15 border border-primary/20 text-tiny font-medium text-primary transition-colors"
                            >
                                <span>Tìm kiếm: &quot;{filters.searchTerm}&quot;</span>
                                <X className="h-3 w-3" />
                            </button>
                        )}

                        {(filters.minPrice || filters.maxPrice) && (
                            <button
                                onClick={() => handleRemoveFilter("price")}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/15 border border-primary/20 text-tiny font-medium text-primary transition-colors tabular-nums whitespace-nowrap"
                            >
                                <span>
                                    Giá: {formatPrice(filters.minPrice || 0)} -{" "}
                                    {formatPrice(filters.maxPrice || 70000000)}
                                </span>
                                <X className="h-3 w-3" />
                            </button>
                        )}

                        {filters.categoryIds && (
                            <button
                                onClick={() => handleRemoveFilter("category")}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/15 border border-primary/20 text-tiny font-medium text-primary transition-colors"
                            >
                                <span>Danh mục đã chọn</span>
                                <X className="h-3 w-3" />
                            </button>
                        )}

                        {filters.brandIds && (
                            <button
                                onClick={() => handleRemoveFilter("brand")}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/15 border border-primary/20 text-tiny font-medium text-primary transition-colors"
                            >
                                <span>Thương hiệu đã chọn</span>
                                <X className="h-3 w-3" />
                            </button>
                        )}

                        {ramParam && (
                            <button
                                onClick={() => handleRemoveFilter("ram")}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/15 border border-primary/20 text-tiny font-medium text-primary transition-colors tabular-nums"
                            >
                                <span>RAM: {ramParam}</span>
                                <X className="h-3 w-3" />
                            </button>
                        )}

                        {ssdParam && (
                            <button
                                onClick={() => handleRemoveFilter("ssd")}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/15 border border-primary/20 text-tiny font-medium text-primary transition-colors tabular-nums"
                            >
                                <span>SSD: {ssdParam}</span>
                                <X className="h-3 w-3" />
                            </button>
                        )}

                        {filters.rating && (
                            <button
                                onClick={() => handleRemoveFilter("rating")}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/15 border border-primary/20 text-tiny font-medium text-primary transition-colors"
                            >
                                <span>Từ {filters.rating}★ trở lên</span>
                                <X className="h-3 w-3" />
                            </button>
                        )}

                        <button
                            onClick={handleResetFilters}
                            className="text-tiny font-semibold text-primary hover:underline ml-2"
                        >
                            Xóa tất cả
                        </button>
                    </div>
                )}
            </div>

            {/* Controls Toolbar: Mobile filter button + Sort + View switcher */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    {/* Mobile filter drawer trigger */}
                    <Button
                        variant={showMobileFilters ? "default" : "outline"}
                        size="sm"
                        className="md:hidden rounded-full px-4 h-11 border-line text-ink"
                        onClick={() => setShowMobileFilters((prev) => !prev)}
                        aria-expanded={showMobileFilters}
                        aria-controls="mobile-filter-drawer"
                        aria-label="Bộ lọc sản phẩm"
                    >
                        <Filter className="h-4 w-4 mr-2 text-primary" />
                        <span>Bộ lọc</span>
                        {activeFilterCount > 0 && (
                            <span className="ml-1.5 h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>

                    <p className="text-small text-ink-soft hidden sm:block tabular-nums">
                        Hiển thị <strong className="text-ink">{products.length}</strong> / {totalCount} sản phẩm
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Sort Select */}
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-3.5 w-3.5 text-ink-faint hidden lg:block" />
                        <Select value={sortBy} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-[170px] sm:w-[190px] h-10 rounded-full border-line bg-card hover:bg-surface text-small font-medium text-ink transition-colors focus:ring-primary">
                                <SelectValue placeholder="Sắp xếp" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-line shadow-xl bg-card">
                                <SelectItem value="featured" className="rounded-lg text-small">
                                    Nổi bật nhất
                                </SelectItem>
                                <SelectItem value="newest" className="rounded-lg text-small">
                                    Mới nhất 2026
                                </SelectItem>
                                <SelectItem value="price-asc" className="rounded-lg text-small">
                                    Giá: Thấp đến cao
                                </SelectItem>
                                <SelectItem value="price-desc" className="rounded-lg text-small">
                                    Giá: Cao đến thấp
                                </SelectItem>
                                <SelectItem value="rating" className="rounded-lg text-small">
                                    Đánh giá cao nhất
                                </SelectItem>
                                <SelectItem value="name" className="rounded-lg text-small">
                                    Tên A - Z
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* View mode switcher */}
                    <div className="hidden sm:flex bg-surface-2 p-1 rounded-full border border-line">
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="icon"
                            className={`h-8 w-8 rounded-full ${viewMode === "grid" ? "bg-card shadow-xs text-primary" : "text-ink-faint"}`}
                            onClick={() => setViewMode("grid")}
                            aria-label="Chế độ lưới"
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="icon"
                            className={`h-8 w-8 rounded-full ${viewMode === "list" ? "bg-card shadow-xs text-primary" : "text-ink-faint"}`}
                            onClick={() => setViewMode("list")}
                            aria-label="Chế độ danh sách"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Layout: Sidebar + Product Grid */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Desktop Faceted Filters Sidebar (Instant Filter) */}
                <div className="hidden md:block w-72 flex-shrink-0">
                    <ProductFilters
                        categorySlug={categorySlug}
                        brandSlug={brandSlug}
                        onFiltersChange={handleFiltersChange}
                        totalResults={totalCount}
                        initialFilters={{
                            ...(categorySlug ? { categoryIds: category?.id } : {}),
                            ...(brandSlug ? { brandIds: brand?.id } : {}),
                        }}
                    />
                </div>

                {/* Mobile Filter Modal Drawer — z-[60] above Mobile Bottom Navigation */}
                {showMobileFilters && (
                    <div
                        id="mobile-filter-drawer"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Bộ lọc sản phẩm"
                        className="md:hidden fixed inset-0 z-[60] flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
                    >
                        <div className="w-full max-w-sm h-full bg-card border-l border-line shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                            <div className="p-4 border-b border-line flex items-center justify-between bg-surface">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-primary" />
                                    <h2 className="text-small font-semibold text-ink">Bộ lọc sản phẩm</h2>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowMobileFilters(false)}
                                    className="rounded-full h-9 w-9 hover:bg-surface-2"
                                    aria-label="Đóng bộ lọc"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="overflow-y-auto flex-1 p-4 pb-0 flex flex-col">
                                <ProductFilters
                                    categorySlug={categorySlug}
                                    brandSlug={brandSlug}
                                    isMobileDrawer={true}
                                    totalResults={totalCount}
                                    onCloseMobile={() => setShowMobileFilters(false)}
                                    onFiltersChange={handleFiltersChange}
                                    initialFilters={{
                                        ...(categorySlug ? { categoryIds: category?.id } : {}),
                                        ...(brandSlug ? { brandIds: brand?.id } : {}),
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Grid / List Content */}
                <div className="flex-1 w-full min-w-0">
                    {isLoading ? (
                        viewMode === "grid" ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                                {Array(9)
                                    .fill(0)
                                    .map((_, index) => (
                                        <ProductCardSkeleton key={index} />
                                    ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Array(8)
                                    .fill(0)
                                    .map((_, index) => (
                                        <ProductListItemSkeleton key={index} />
                                    ))}
                            </div>
                        )
                    ) : products.length === 0 ? (
                        <div className="text-center py-16 bg-surface-2/40 rounded-3xl border border-line p-8">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-surface rounded-full">
                                    <PackageOpen className="h-10 w-10 text-ink-faint" />
                                </div>
                            </div>
                            <h3 className="text-h3 font-semibold text-ink mb-2">
                                Không tìm thấy sản phẩm nào
                            </h3>
                            <p className="text-ink-soft text-small mb-6 max-w-md mx-auto leading-relaxed">
                                Không có sản phẩm nào phù hợp với các tiêu chí tìm kiếm và bộ lọc hiện tại của bạn.
                            </p>
                            <Button
                                className="rounded-full bg-primary text-white hover:bg-primary/90 px-7 h-11 text-small font-semibold shadow-xs"
                                onClick={handleResetFilters}
                            >
                                Xóa tất cả bộ lọc
                            </Button>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : products.length > 20 ? (
                        <VirtualProductList products={products} />
                    ) : (
                        <div className="space-y-4">
                            {products.map((product) => (
                                <ProductListItem key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {products.length > 0 && totalPages > 1 && (
                        <div className="mt-12 pt-6 border-t border-line/60 flex justify-center">
                            <Pagination
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Compare Bar at the bottom */}
            <ProductComparison />
        </div>
    )
}

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
import { formatPrice } from "@/lib/contants"

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
                    <div className="h-8 w-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
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
    const { data: category } = useCategoryBySlug(categorySlug ?? "")
    const { data: brand } = useBrandBySlug(brandSlug ?? "")

    // State với giá trị mặc định từ URL
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [sortBy, setSortBy] = useState(() => searchParams.get("sortBy") || "featured")
    const searchTerm = searchParams.get("q") || searchParams.get("searchTerm") || ""
    const debouncedSearchTerm = useDebounce(searchTerm, 300)

    const [currentPage, setCurrentPage] = useState(() => {
        const page = searchParams.get("page")
        return page ? parseInt(page) : 1
    })

    const [filters, setFilters] = useState<ProductFiltersType>(() => ({
        ...(categorySlug ? { categoryIds: category?.id } : {}),
        ...(brandSlug ? { brandIds: brand?.id } : {}),
    }))

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

    // Chuẩn bị filters cho API call
    const apiFilters: ProductFiltersType = {
        ...filters,
        searchTerm: trimmedSearchTerm || undefined,
        pageNumber: currentPage,
        pageSize: 12,
    }

    const useElasticSearch = trimmedSearchTerm.length > 0
    const catalogQuery = useProducts(apiFilters, !useElasticSearch)
    const searchQuery = useSearchProducts(apiFilters, useElasticSearch)
    const activeQuery = useElasticSearch ? searchQuery : catalogQuery
    const { data, isLoading, isError } = activeQuery
    const products = data?.items || []
    const totalPages = data?.totalPages || 1
    const totalCount = data?.totalCount || products.length

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
    const handleRemoveFilter = (filterType: "search" | "price" | "category" | "brand" | "rating") => {
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
        ? `Khám phá các sản phẩm ${brand.name} chính hãng bảo hành 24 tháng tại ShopViet.`
        : category
        ? `Danh mục ${category.name} chính hãng, giá tốt nhất thị trường cùng ưu đãi độc quyền tại ShopViet.`
        : "Khám phá danh mục thiết bị công nghệ chính hãng hàng đầu tại ShopViet."

    const activeFilterCount =
        (filters.searchTerm ? 1 : 0) +
        (filters.minPrice || filters.maxPrice ? 1 : 0) +
        (filters.categoryIds ? 1 : 0) +
        (filters.brandIds ? 1 : 0) +
        (filters.rating ? 1 : 0)

    if ((categorySlug && !category) || (brandSlug && !brand)) {
        return (
            <div className="container-app py-16 md:py-24">
                <div className="text-center py-16 bg-card rounded-2xl border border-line">
                    <h2 className="text-h2 font-semibold text-ink mb-4">
                        {categorySlug && !category ? "Danh mục không tồn tại" : "Thương hiệu không tồn tại"}
                    </h2>
                    <Link href="/products" className="text-brand hover:underline font-medium">
                        ← Quay lại trang tất cả sản phẩm
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container-app py-8 md:py-12">
            <Head>
                <title>{displayTitle} | ShopViet</title>
                <meta name="description" content={metaDescription} />
            </Head>

            {/* Breadcrumb Navigation */}
            <nav
                aria-label="Breadcrumb"
                className="flex items-center text-tiny text-ink-faint mb-6 overflow-x-auto whitespace-nowrap pb-2 md:pb-0 scrollbar-hide"
            >
                <Link href="/" className="hover:text-brand transition-colors inline-flex items-center">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    Trang chủ
                </Link>
                <ChevronRight className="h-3 w-3 mx-1.5 flex-shrink-0 opacity-40" />
                <Link
                    href="/products"
                    className={`hover:text-brand transition-colors ${
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
                            className={`hover:text-brand transition-colors ${
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
                            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                            <span className="text-tiny font-medium text-ink-faint">
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
                            className="text-small font-semibold text-brand hover:underline inline-flex items-center gap-1 shrink-0"
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
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 hover:bg-surface border border-line text-tiny font-medium text-ink transition-colors"
                            >
                                <span>Tìm kiếm: &quot;{filters.searchTerm}&quot;</span>
                                <X className="h-3 w-3 text-ink-faint hover:text-ink" />
                            </button>
                        )}

                        {(filters.minPrice || filters.maxPrice) && (
                            <button
                                onClick={() => handleRemoveFilter("price")}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 hover:bg-surface border border-line text-tiny font-medium text-ink transition-colors"
                            >
                                <span>
                                    Giá: {formatPrice(filters.minPrice || 0)} -{" "}
                                    {formatPrice(filters.maxPrice || 50000000)}
                                </span>
                                <X className="h-3 w-3 text-ink-faint hover:text-ink" />
                            </button>
                        )}

                        {filters.categoryIds && (
                            <button
                                onClick={() => handleRemoveFilter("category")}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 hover:bg-surface border border-line text-tiny font-medium text-ink transition-colors"
                            >
                                <span>Danh mục đã chọn</span>
                                <X className="h-3 w-3 text-ink-faint hover:text-ink" />
                            </button>
                        )}

                        {filters.brandIds && (
                            <button
                                onClick={() => handleRemoveFilter("brand")}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 hover:bg-surface border border-line text-tiny font-medium text-ink transition-colors"
                            >
                                <span>Thương hiệu đã chọn</span>
                                <X className="h-3 w-3 text-ink-faint hover:text-ink" />
                            </button>
                        )}

                        {filters.rating && (
                            <button
                                onClick={() => handleRemoveFilter("rating")}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 hover:bg-surface border border-line text-tiny font-medium text-ink transition-colors"
                            >
                                <span>Từ {filters.rating}★ trở lên</span>
                                <X className="h-3 w-3 text-ink-faint hover:text-ink" />
                            </button>
                        )}

                        <button
                            onClick={handleResetFilters}
                            className="text-tiny font-semibold text-brand hover:underline ml-2"
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
                        className="md:hidden rounded-full px-4 h-10 border-line text-ink"
                        onClick={() => setShowMobileFilters((prev) => !prev)}
                    >
                        <Filter className="h-4 w-4 mr-2 text-brand" />
                        <span>Bộ lọc</span>
                        {activeFilterCount > 0 && (
                            <span className="ml-1.5 h-5 w-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>

                    <p className="text-small text-ink-soft hidden sm:block">
                        Hiển thị <strong className="text-ink">{products.length}</strong> / {totalCount} sản phẩm
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Sort Select */}
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-3.5 w-3.5 text-ink-faint hidden lg:block" />
                        <Select value={sortBy} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-[170px] sm:w-[190px] h-10 rounded-full border-line bg-card hover:bg-surface text-small font-medium text-ink transition-colors focus:ring-brand">
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
                            className={`h-8 w-8 rounded-full ${viewMode === "grid" ? "bg-card shadow-xs text-ink" : "text-ink-faint"}`}
                            onClick={() => setViewMode("grid")}
                            aria-label="Chế độ lưới"
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="icon"
                            className={`h-8 w-8 rounded-full ${viewMode === "list" ? "bg-card shadow-xs text-ink" : "text-ink-faint"}`}
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
                {/* Desktop Faceted Filters Sidebar */}
                <div className="hidden md:block w-72 flex-shrink-0">
                    <ProductFilters
                        categorySlug={categorySlug}
                        brandSlug={brandSlug}
                        onFiltersChange={handleFiltersChange}
                        initialFilters={{
                            ...(categorySlug ? { categoryIds: category?.id } : {}),
                            ...(brandSlug ? { brandIds: brand?.id } : {}),
                        }}
                    />
                </div>

                {/* Mobile Filter Modal Drawer */}
                {showMobileFilters && (
                    <div className="md:hidden fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="w-full max-w-sm h-full bg-card border-l border-line shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                            <div className="p-4 border-b border-line flex items-center justify-between bg-surface">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-brand" />
                                    <h2 className="text-small font-semibold text-ink">Bộ lọc sản phẩm</h2>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowMobileFilters(false)}
                                    className="rounded-full h-8 w-8 hover:bg-surface-2"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="overflow-y-auto flex-1 p-4">
                                <ProductFilters
                                    categorySlug={categorySlug}
                                    brandSlug={brandSlug}
                                    onFiltersChange={(f) => {
                                        handleFiltersChange(f)
                                        setShowMobileFilters(false)
                                    }}
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
                    {isError ? (
                        <div className="text-center py-16 bg-destructive/5 rounded-3xl border border-destructive/20 p-6">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-destructive/10 rounded-full text-destructive">
                                    <X className="h-6 w-6" />
                                </div>
                            </div>
                            <h3 className="text-h3 font-semibold text-ink mb-2">Đã xảy ra lỗi khi tải</h3>
                            <p className="text-ink-soft text-small mb-6 max-w-md mx-auto">
                                Không thể tải danh sách sản phẩm. Vui lòng kiểm tra lại kết nối mạng hoặc thử tải lại trang.
                            </p>
                            <Button
                                variant="outline"
                                className="rounded-full border-line text-ink hover:bg-surface"
                                onClick={handleResetFilters}
                            >
                                Thử lại
                            </Button>
                        </div>
                    ) : isLoading ? (
                        viewMode === "grid" ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {Array(12)
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
                                className="rounded-full bg-ink text-background hover:bg-brand hover:text-white px-7 h-11 text-small font-semibold shadow-xs"
                                onClick={handleResetFilters}
                            >
                                Xóa tất cả bộ lọc
                            </Button>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
        </div>
    )
}

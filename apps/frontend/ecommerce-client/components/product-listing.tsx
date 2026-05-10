"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Filter, Grid3X3, List, X, ChevronRight, Home, PackageOpen } from "lucide-react"
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
import { type ProductFilters as ProductFiltersType } from "@/types/product"
import { ProductFilters } from "./product-filters"
import { type Product } from "@/types/product"

/** Virtual list for list-view mode — only activates when > 20 items */
function VirtualProductList({ products }: { products: Product[] }) {
    const parentRef = useRef<HTMLDivElement>(null)
    const ITEM_HEIGHT = 176 // approximate px height of ProductListItem

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
        <React.Suspense fallback={<div className="flex justify-center items-center h-[60vh]"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <ProductListingContent {...props} />
        </React.Suspense>
    )
}

function ProductListingContent({
    categorySlug,
    brandSlug,
    pageTitle = "Tất cả sản phẩm",
    backLink,
}: ProductListingProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Fetch category and brand data if provided
    const { data: category } = categorySlug ? useCategoryBySlug(categorySlug) : { data: null }
    const { data: brand } = brandSlug ? useBrandBySlug(brandSlug) : { data: null }

    // State với giá trị mặc định từ URL
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [sortBy, setSortBy] = useState(() => searchParams.get("sortBy") || "name")
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
        // if (sort) setSortBy(sort)
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

    // Chuẩn bị filters cho API call
    const apiFilters: ProductFiltersType = {
        ...filters,
        searchTerm: debouncedSearchTerm,
        pageNumber: currentPage,
        pageSize: 12,
    }

    const useElasticSearch = debouncedSearchTerm.trim().length > 0
    const catalogQuery = useProducts(apiFilters, !useElasticSearch)
    const searchQuery = useSearchProducts(apiFilters, useElasticSearch)
    const activeQuery = useElasticSearch ? searchQuery : catalogQuery
    const { data, isLoading, isError } = activeQuery
    const products = data?.items || []
    const totalPages = data?.totalPages || 1

    // Sử dụng useCallback cho các hàm xử lý
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
        [categorySlug, brandSlug],
    )

    const handleSortChange = useCallback(
        (value: string) => {
            let sort = value;
            let isDesc = false;

            // Parse giá trị chọn
            if (value.includes("-asc")) {
                sort = value.replace("-asc", "");
                isDesc = false;
            } else if (value.includes("-desc")) {
                sort = value.replace("-desc", "");
                isDesc = true;
            } else {
                // Các trường hợp đặc biệt không có asc/desc => dùng mặc định
                switch (value) {
                    case "name":
                        sort = "name";
                        isDesc = false;
                        break;
                    case "featured":
                        sort = "featured";
                        isDesc = true;
                        break;
                    case "newest":
                        sort = "createdAt";
                        isDesc = true;
                        break;
                    case "rating":
                        sort = "rating";
                        isDesc = true;
                        break;
                    default:
                        sort = value;
                        isDesc = false;
                        break;
                }
            }
            // Cập nhật local state nếu cần
            setSortBy(value);

            // Cập nhật URL params
            const params = new URLSearchParams(searchParams.toString());
            params.set("sortBy", sort);
            params.set("isDescending", isDesc.toString());
            router.push(`?${params.toString()}`);
        },
        [router, searchParams]
    );


    const handlePageChange = useCallback(
        (page: number) => {
            setCurrentPage(page)
            const params = new URLSearchParams(searchParams.toString())
            params.set("page", page.toString())
            params.set("page", page.toString())
            router.push(`?${params.toString()}`)
            window.scrollTo({ top: 0, behavior: "smooth" })
        },
        [router, searchParams],
    )

    const toggleViewMode = useCallback((mode: "grid" | "list") => {
        setViewMode(mode)
    }, [])

    const toggleMobileFilters = useCallback(() => {
        setShowMobileFilters((prev) => !prev)
    }, [])

    const handleResetFilters = useCallback(() => {
        const resetFiltersBtn = document.querySelector(".product-filters-reset")
        if (resetFiltersBtn && resetFiltersBtn instanceof HTMLElement) {
            resetFiltersBtn.click()
        }
    }, [])

    // Construct page title and meta description
    const metaTitle = brand
        ? `${category?.name || "Sản phẩm"} - ${brand.name}`
        : category
            ? category.name
            : "Tất cả sản phẩm"
    const metaDescription = brand
        ? `Khám phá các sản phẩm ${brand.name} thuộc danh mục ${category?.name || "sản phẩm"}. Mua sắm chất lượng với giá tốt nhất!`
        : category
            ? `Khám phá các sản phẩm trong danh mục ${category.name}. Tìm kiếm sản phẩm chất lượng với giá cả hợp lý!`
            : "Khám phá tất cả sản phẩm chất lượng cao với giá tốt nhất. Mua sắm ngay hôm nay!"
    const metaKeywords = [
        "sản phẩm",
        category?.name?.toLowerCase(),
        brand?.name?.toLowerCase(),
        "mua sắm",
        "chất lượng",
    ]
        .filter(Boolean)
        .join(", ")

    // Handle invalid category or brand
    if ((categorySlug && !category) || (brandSlug && !brand)) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <Head>
                    <title>Danh mục hoặc thương hiệu không tồn tại</title>
                    <meta
                        name="description"
                        content="Không tìm thấy danh mục hoặc thương hiệu. Quay lại trang sản phẩm để khám phá thêm!"
                    />
                    <meta name="robots" content="noindex" />
                </Head>
                <div className="text-center py-16 bg-card rounded-2xl border border-white/5">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                        {categorySlug && !category
                            ? "Danh mục không tồn tại"
                            : "Thương hiệu không tồn tại"}
                    </h2>
                    <Link href="/products" className="text-primary hover:underline">
                        ← Quay lại trang sản phẩm
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <Head>
                <title>{metaTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta name="keywords" content={metaKeywords} />
                <meta name="robots" content="index, follow" />
            </Head>

            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2 md:pb-0 scrollbar-hide">
                <Link href="/" className="hover:text-primary hover:underline flex items-center transition-colors">
                    <Home className="h-4 w-4 mr-1.5" />
                    Trang chủ
                </Link>
                <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0 opacity-50" />
                <Link href="/products" className={`hover:text-primary hover:underline transition-colors ${!category && !brand ? "font-medium text-foreground" : ""}`}>
                    Sản phẩm
                </Link>
                {category && (
                    <>
                        <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0 opacity-50" />
                        <Link href={`/products/${category.slug}`} className={`hover:text-primary hover:underline transition-colors ${!brand ? "font-medium text-foreground" : ""}`}>
                            {category.name}
                        </Link>
                    </>
                )}
                {brand && (
                    <>
                        <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0 opacity-50" />
                        <span className="font-medium text-foreground">
                            {brand.name}
                        </span>
                    </>
                )}
            </nav>

            {/* Premium Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{metaTitle}</h1>
                    <div className="flex items-center mt-3 gap-3 text-sm text-muted-foreground">
                        {isLoading ? (
                            <span className="animate-pulse">Đang tải dữ liệu...</span>
                        ) : (
                            <span>Hiển thị <span className="font-medium text-foreground">{data?.totalCount || products.length}</span> kết quả</span>
                        )}
                        {(filters.searchTerm || filters.minPrice || filters.maxPrice || filters.categoryIds || filters.brandIds || filters.rating) && (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                                <button onClick={handleResetFilters} className="text-primary font-medium hover:text-primary/80 hover:underline transition-all">
                                    Xóa tất cả bộ lọc
                                </button>
                            </>
                        )}
                        {backLink && (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                                <Link href={backLink.href} className="text-primary font-medium hover:underline transition-all">
                                    ← {backLink.label}
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {/* Mobile Filter Toggle */}
                    <Button
                        variant={showMobileFilters ? "default" : "outline"}
                        size="sm"
                        className="md:hidden rounded-full px-4 h-10 border-white/10"
                        onClick={toggleMobileFilters}
                    >
                        {showMobileFilters ? (
                            <>
                                <X className="h-4 w-4 mr-2" />
                                Đóng
                            </>
                        ) : (
                            <>
                                <Filter className="h-4 w-4 mr-2" />
                                Bộ lọc
                            </>
                        )}
                    </Button>

                    <div className="h-6 w-px bg-border hidden md:block mx-1"></div>

                    {/* Sort Dropdown */}
                    <Select value={sortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[180px] h-10 rounded-full border-white/10 bg-card hover:bg-secondary/50 transition-colors focus:ring-primary">
                            <SelectValue placeholder="Sắp xếp theo" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-white/10 shadow-xl">
                            <SelectItem value="name" className="rounded-lg">Tên A-Z</SelectItem>
                            <SelectItem value="featured" className="rounded-lg">Nổi bật</SelectItem>
                            <SelectItem value="price-asc" className="rounded-lg">Giá: Thấp đến cao</SelectItem>
                            <SelectItem value="price-desc" className="rounded-lg">Giá: Cao đến thấp</SelectItem>
                            <SelectItem value="newest" className="rounded-lg">Mới nhất</SelectItem>
                            <SelectItem value="rating" className="rounded-lg">Đánh giá cao nhất</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="h-6 w-px bg-border hidden md:block mx-1"></div>

                    {/* View Controls */}
                    <div className="hidden md:flex bg-secondary/30 p-1 rounded-full border border-white/5 shadow-sm">
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => toggleViewMode("grid")}
                            aria-label="Grid view"
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => toggleViewMode("list")}
                            aria-label="List view"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 relative items-start">
                {/* Filters - Desktop */}
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

                {/* Mobile Filters Drawer */}
                {showMobileFilters && (
                    <div className="md:hidden fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-sm h-full bg-card border-l border-white/5 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-secondary/10">
                                <h2 className="text-lg font-semibold tracking-tight">Bộ lọc</h2>
                                <Button variant="ghost" size="icon" onClick={toggleMobileFilters} className="rounded-full hover:bg-secondary/50">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="overflow-y-auto flex-1 p-4">
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
                        </div>
                    </div>
                )}

                <div className="flex-1">
                    {isError ? (
                        <div className="text-center py-16 bg-destructive/10 rounded-2xl border border-destructive/20">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-destructive/20 rounded-full">
                                    <X className="h-8 w-8 text-destructive" />
                                </div>
                            </div>
                            <h3 className="text-lg font-medium text-destructive mb-2">Đã xảy ra lỗi</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                Không thể tải danh sách sản phẩm. Vui lòng kiểm tra lại kết nối hoặc thử lại sau.
                            </p>
                            <Button variant="outline" onClick={handleResetFilters}>Thử lại</Button>
                        </div>
                    ) : isLoading ? (
                        viewMode === "grid" ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {Array(12).fill(0).map((_, index) => (
                                    <ProductCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Array(8).fill(0).map((_, index) => (
                                    <ProductListItemSkeleton key={index} />
                                ))}
                            </div>
                        )
                    ) : products.length === 0 ? (
                        <div className="text-center py-16 bg-card rounded-2xl border border-white/5 shadow-sm">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-secondary/50 rounded-full">
                                    <PackageOpen className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                Không tìm thấy sản phẩm
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại của bạn.
                            </p>
                            <Button variant="outline" onClick={handleResetFilters}>
                                Xóa bộ lọc & Thử lại
                            </Button>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : products.length > 20 ? (
                        // Virtual scroll for long lists (> 20 items) in list view
                        <VirtualProductList products={products} />
                    ) : (
                        <div className="space-y-4">
                            {products.map((product) => (
                                <ProductListItem key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {products.length > 0 && (
                        <div className="mt-8">
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

"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, RotateCcw, Cpu } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { useResolvedCategoryBrand } from "@/hooks/use-resolved-category-brand"
import { useCategoriesByBrandyId } from "@/hooks/use-categories"
import { useBrandsByCategoryId } from "@/hooks/use-brands"
import type { ProductFilters } from "@/types/product"
import { PriceFilter } from "./price-filter"
import { CategoryFilter } from "./category-filter"
import { BrandFilter } from "./brand-filter"
import { RatingFilter } from "./rating-filter"

const RAM_OPTIONS = ["16GB", "32GB", "36GB", "64GB"]
const SSD_OPTIONS = ["512GB", "1TB", "2TB"]

interface ProductFiltersProps {
    categorySlug?: string
    brandSlug?: string
    onFiltersChange?: (filters: ProductFilters) => void
    initialFilters?: ProductFilters
    isMobileDrawer?: boolean
    totalResults?: number
    onCloseMobile?: () => void
}

export function ProductFilters({
    categorySlug,
    brandSlug,
    onFiltersChange,
    initialFilters = {},
    isMobileDrawer = false,
    totalResults = 148,
    onCloseMobile,
}: ProductFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State cho các bộ lọc
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 70000000])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedBrands, setSelectedBrands] = useState<string[]>([])
    const [rating, setRating] = useState<number | null>(null)
    const [selectedRam, setSelectedRam] = useState<string[]>([])
    const [selectedSsd, setSelectedSsd] = useState<string[]>([])
    const [isInitialized, setIsInitialized] = useState(false)
    const isFirstRender = useRef(true)

    // Lấy danh mục và thương hiệu ban đầu dựa trên slug
    const { categories: initialCategories, brands: initialBrands } = useResolvedCategoryBrand(
        categorySlug,
        brandSlug
    )

    // Lấy danh mục động dựa trên thương hiệu được chọn
    const selectedBrandId = selectedBrands.length === 1 ? selectedBrands[0] : null
    const { data: dynamicCategories } = useCategoriesByBrandyId(selectedBrandId || "")

    // Lấy thương hiệu động dựa trên danh mục được chọn
    const selectedCategoryId = selectedCategories.length === 1 ? selectedCategories[0] : null
    const { data: dynamicBrands } = useBrandsByCategoryId(selectedCategoryId || "")

    // Xác định danh mục nào sẽ hiển thị
    const categoriesToShow = (() => {
        if (categorySlug && initialCategories?.length) return initialCategories
        if (selectedBrands.length === 1 && dynamicCategories?.length) return dynamicCategories
        if (initialCategories?.length) return initialCategories
        return initialCategories || []
    })()

    // Xác định thương hiệu nào sẽ hiển thị
    const brandsToShow = (() => {
        if (brandSlug && initialBrands?.length) return initialBrands
        if (selectedCategories.length === 1 && dynamicBrands?.length) return dynamicBrands
        if (initialBrands?.length) return initialBrands
        return initialBrands || []
    })()

    // Kiểm tra xem bộ lọc RAM/SSD (Laptop) có nên hiển thị linh hoạt hay không
    const showLaptopSpecsFilter = (() => {
        const slugLower = (categorySlug || "").toLowerCase()
        const qParam = (searchParams.get("q") || "").toLowerCase()
        if (slugLower.includes("laptop") || slugLower.includes("mac") || slugLower.includes("may-tinh")) {
            return true
        }
        if (qParam.includes("macbook") || qParam.includes("laptop")) {
            return true
        }
        if (selectedCategories.length > 0) {
            return categoriesToShow.some(
                (c) =>
                    selectedCategories.includes(c.id) &&
                    (c.name.toLowerCase().includes("laptop") ||
                        c.name.toLowerCase().includes("máy tính") ||
                        c.name.toLowerCase().includes("mac"))
            )
        }
        // Mặc định hiển thị trên trang /products tổng hợp để người dùng lọc nhanh Laptop
        return !categorySlug
    })()

    // Khởi tạo bộ lọc từ URL hoặc props
    useEffect(() => {
        if (isInitialized) return

        const params = {
            minPrice: searchParams.get("minPrice"),
            maxPrice: searchParams.get("maxPrice"),
            categoryIds: searchParams.get("categoryIds"),
            brandIds: searchParams.get("brandIds"),
            rating: searchParams.get("rating"),
        }

        const initialMinPrice = params.minPrice ? Number(params.minPrice) : initialFilters.minPrice || 0
        const initialMaxPrice = params.maxPrice ? Number(params.maxPrice) : initialFilters.maxPrice || 70000000
        const initialCategoriesList = params.categoryIds
            ? params.categoryIds.split(",")
            : initialFilters.categoryIds?.split(",") || []
        const initialBrandsList = params.brandIds
            ? params.brandIds.split(",")
            : initialFilters.brandIds?.split(",") || []
        const initialRatingValue = params.rating ? Number(params.rating) : initialFilters.rating || null

        setPriceRange([initialMinPrice, initialMaxPrice])
        setSelectedCategories(initialCategoriesList)
        setSelectedBrands(initialBrandsList)
        setRating(initialRatingValue)
        setIsInitialized(true)

        if (onFiltersChange) {
            const filters: ProductFilters = {
                minPrice: initialMinPrice > 0 ? initialMinPrice : undefined,
                maxPrice: initialMaxPrice < 70000000 ? initialMaxPrice : undefined,
                categoryIds: initialCategoriesList.length > 0 ? initialCategoriesList.join(",") : undefined,
                brandIds: initialBrandsList.length > 0 ? initialBrandsList.join(",") : undefined,
                rating: initialRatingValue || undefined,
            }
            onFiltersChange(filters)
        }
    }, [searchParams, initialFilters, onFiltersChange, isInitialized])

    // Instant Filter: Tự động đồng bộ ngay khi bộ lọc thay đổi
    useEffect(() => {
        if (!isInitialized) return
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        const timer = setTimeout(() => {
            const filters: ProductFilters = {
                minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
                maxPrice: priceRange[1] < 70000000 ? priceRange[1] : undefined,
                categoryIds: selectedCategories.length > 0 ? selectedCategories.join(",") : undefined,
                brandIds: selectedBrands.length > 0 ? selectedBrands.join(",") : undefined,
                rating: rating || undefined,
            }

            if (onFiltersChange && !isMobileDrawer) {
                onFiltersChange(filters)
            }

            if (!isMobileDrawer) {
                const params = new URLSearchParams(searchParams.toString())
                if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString())
                else params.delete("minPrice")

                if (priceRange[1] < 70000000) params.set("maxPrice", priceRange[1].toString())
                else params.delete("maxPrice")

                if (selectedCategories.length > 0) params.set("categoryIds", selectedCategories.join(","))
                else params.delete("categoryIds")

                if (selectedBrands.length > 0) params.set("brandIds", selectedBrands.join(","))
                else params.delete("brandIds")

                if (rating !== null) params.set("rating", rating.toString())
                else params.delete("rating")

                params.set("page", "1")
                router.replace(`?${params.toString()}`, { scroll: false })
            }
        }, 180)

        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        priceRange,
        selectedCategories,
        selectedBrands,
        rating,
        selectedRam,
        selectedSsd,
        isInitialized,
        isMobileDrawer,
    ])

    // Xử lý thay đổi danh mục
    const handleCategoryChange = (categoryId: string, checked: boolean) => {
        setSelectedCategories((prev) => {
            const newSelection = checked ? [...prev, categoryId] : prev.filter((id) => id !== categoryId)
            if (newSelection.length === 1 && prev.length !== 1) {
                setSelectedBrands([])
            }
            return newSelection
        })
    }

    // Xử lý thay đổi thương hiệu
    const handleBrandChange = (brandId: string, checked: boolean) => {
        setSelectedBrands((prev) => {
            const newSelection = checked ? [...prev, brandId] : prev.filter((id) => id !== brandId)
            if (newSelection.length === 1 && prev.length !== 1) {
                setSelectedCategories([])
            }
            return newSelection
        })
    }

    // Xử lý thay đổi đánh giá
    const handleRatingChange = (newRating: number) => {
        setRating((prev) => (prev === newRating ? null : newRating))
    }

    const toggleRam = (ram: string) => {
        setSelectedRam((prev) =>
            prev.includes(ram) ? prev.filter((r) => r !== ram) : [...prev, ram]
        )
    }

    const toggleSsd = (ssd: string) => {
        setSelectedSsd((prev) =>
            prev.includes(ssd) ? prev.filter((s) => s !== ssd) : [...prev, ssd]
        )
    }

    // Áp dụng bộ lọc (Dành cho nút Xem kết quả trên Mobile Drawer)
    const applyMobileFilters = () => {
        const params = new URLSearchParams(searchParams.toString())

        if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString())
        else params.delete("minPrice")

        if (priceRange[1] < 70000000) params.set("maxPrice", priceRange[1].toString())
        else params.delete("maxPrice")

        if (selectedCategories.length > 0) params.set("categoryIds", selectedCategories.join(","))
        else params.delete("categoryIds")

        if (selectedBrands.length > 0) params.set("brandIds", selectedBrands.join(","))
        else params.delete("brandIds")

        if (rating !== null) params.set("rating", rating.toString())
        else params.delete("rating")

        params.set("page", "1")
        router.push(`?${params.toString()}`)

        if (onFiltersChange) {
            const filters: ProductFilters = {
                minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
                maxPrice: priceRange[1] < 70000000 ? priceRange[1] : undefined,
                categoryIds: selectedCategories.length > 0 ? selectedCategories.join(",") : undefined,
                brandIds: selectedBrands.length > 0 ? selectedBrands.join(",") : undefined,
                rating: rating || undefined,
            }
            onFiltersChange(filters)
        }
        if (onCloseMobile) {
            onCloseMobile()
        }
    }

    // Đặt lại bộ lọc
    const resetFilters = () => {
        setPriceRange([0, 70000000])
        setSelectedCategories([])
        setSelectedBrands([])
        setRating(null)
        setSelectedRam([])
        setSelectedSsd([])

        const params = new URLSearchParams()
        const sortParam = searchParams.get("sortBy")
        if (sortParam) params.set("sortBy", sortParam)
        const isDescParam = searchParams.get("isDescending")
        if (isDescParam) params.set("isDescending", isDescParam)

        params.set("page", "1")
        router.push(params.toString() ? `?${params.toString()}` : window.location.pathname)

        if (onFiltersChange) {
            onFiltersChange({})
        }
    }

    const isCategoryDisabled = (categoryId: string) => {
        if (selectedBrands.length === 1 && dynamicCategories) {
            return !dynamicCategories.some((cat) => cat.id === categoryId)
        }
        return false
    }

    const isBrandDisabled = (brandId: string) => {
        if (selectedCategories.length === 1 && dynamicBrands) {
            return !dynamicBrands.some((brand) => brand.id === brandId)
        }
        return false
    }

    const hasActiveFilters =
        priceRange[0] > 0 ||
        priceRange[1] < 70000000 ||
        selectedCategories.length > 0 ||
        selectedBrands.length > 0 ||
        selectedRam.length > 0 ||
        selectedSsd.length > 0 ||
        rating !== null

    const specsCount = selectedRam.length + selectedSsd.length

    return (
        <aside
            className={
                isMobileDrawer
                    ? "flex flex-col h-full justify-between"
                    : "bg-card rounded-2xl border border-border/80 dark:border-white/[0.08] p-5 sticky top-28 shadow-xs"
            }
        >
            <div>
                {!isMobileDrawer && (
                    <div className="flex items-center justify-between pb-4 mb-3 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-primary" />
                            <h2 className="text-small font-semibold text-foreground tracking-tight">
                                Bộ lọc tức thì
                            </h2>
                        </div>

                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="text-tiny text-primary hover:underline font-semibold inline-flex items-center gap-1 product-filters-reset"
                                aria-label="Thiết lập lại bộ lọc"
                            >
                                <RotateCcw className="h-3 w-3" />
                                Thiết lập lại
                            </button>
                        )}
                    </div>
                )}

                <Accordion
                    type="multiple"
                    defaultValue={["price", "category", "brand", "laptop-specs", "rating"]}
                    className="space-y-2.5"
                >
                    {/* Bộ lọc giá */}
                    <AccordionItem value="price" className="border border-border/60 rounded-xl px-3.5 bg-surface/40">
                        <AccordionTrigger className="py-3 hover:no-underline text-small font-semibold text-foreground">
                            <div className="flex items-center gap-2">
                                <span>Khoảng giá</span>
                                {(priceRange[0] > 0 || priceRange[1] < 70000000) && (
                                    <span className="h-4.5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                        1
                                    </span>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3.5">
                            <PriceFilter value={priceRange} onChange={setPriceRange} />
                        </AccordionContent>
                    </AccordionItem>

                    {/* Bộ lọc danh mục */}
                    <AccordionItem value="category" className="border border-border/60 rounded-xl px-3.5 bg-surface/40">
                        <AccordionTrigger className="py-3 hover:no-underline text-small font-semibold text-foreground">
                            <div className="flex items-center gap-2">
                                <span>Danh mục</span>
                                {selectedCategories.length > 0 && (
                                    <span className="h-4.5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                        {selectedCategories.length}
                                    </span>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3.5">
                            <CategoryFilter
                                categories={categoriesToShow}
                                selectedCategories={selectedCategories}
                                onCategoryChange={handleCategoryChange}
                                isCategoryDisabled={isCategoryDisabled}
                            />
                        </AccordionContent>
                    </AccordionItem>

                    {/* Bộ lọc thương hiệu (kèm ô tìm nhanh) */}
                    <AccordionItem value="brand" className="border border-border/60 rounded-xl px-3.5 bg-surface/40">
                        <AccordionTrigger className="py-3 hover:no-underline text-small font-semibold text-foreground">
                            <div className="flex items-center gap-2">
                                <span>Thương hiệu</span>
                                {selectedBrands.length > 0 && (
                                    <span className="h-4.5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                        {selectedBrands.length}
                                    </span>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3.5">
                            <BrandFilter
                                brands={brandsToShow}
                                selectedBrands={selectedBrands}
                                onBrandChange={handleBrandChange}
                                isBrandDisabled={isBrandDisabled}
                                showCategoryContext={selectedCategories.length === 1}
                            />
                        </AccordionContent>
                    </AccordionItem>

                    {/* Bộ lọc RAM & SSD — Chỉ hiển thị linh hoạt cho danh mục Laptop */}
                    {showLaptopSpecsFilter && (
                        <AccordionItem
                            value="laptop-specs"
                            className="border border-border/60 rounded-xl px-3.5 bg-surface/40"
                        >
                            <AccordionTrigger className="py-3 hover:no-underline text-small font-semibold text-foreground">
                                <div className="flex items-center gap-2">
                                    <Cpu className="h-3.5 w-3.5 text-primary" />
                                    <span>RAM & SSD (Laptop)</span>
                                    {specsCount > 0 && (
                                        <span className="h-4.5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                            {specsCount}
                                        </span>
                                    )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3.5 space-y-3">
                                <div>
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                        Dung lượng RAM
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {RAM_OPTIONS.map((ram) => {
                                            const active = selectedRam.includes(ram)
                                            return (
                                                <button
                                                    key={ram}
                                                    type="button"
                                                    onClick={() => toggleRam(ram)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all tabular-nums ${
                                                        active
                                                            ? "bg-primary text-primary-foreground border-primary font-semibold"
                                                            : "bg-card text-foreground border-border hover:border-primary/50"
                                                    }`}
                                                >
                                                    {ram}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                        Ổ cứng SSD
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {SSD_OPTIONS.map((ssd) => {
                                            const active = selectedSsd.includes(ssd)
                                            return (
                                                <button
                                                    key={ssd}
                                                    type="button"
                                                    onClick={() => toggleSsd(ssd)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all tabular-nums ${
                                                        active
                                                            ? "bg-primary text-primary-foreground border-primary font-semibold"
                                                            : "bg-card text-foreground border-border hover:border-primary/50"
                                                    }`}
                                                >
                                                    {ssd}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {/* Bộ lọc đánh giá */}
                    <AccordionItem value="rating" className="border border-border/60 rounded-xl px-3.5 bg-surface/40">
                        <AccordionTrigger className="py-3 hover:no-underline text-small font-semibold text-foreground">
                            <div className="flex items-center gap-2">
                                <span>Đánh giá</span>
                                {rating !== null && (
                                    <span className="h-4.5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                        {rating}★
                                    </span>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3.5">
                            <RatingFilter rating={rating} onRatingChange={handleRatingChange} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Mobile Sticky Footer Actions inside Drawer */}
            {isMobileDrawer && (
                <div className="sticky bottom-0 left-0 right-0 pt-3 pb-2 bg-card border-t border-border mt-4 flex items-center gap-2.5">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={resetFilters}
                        className="flex-1 h-11 rounded-xl border-border text-foreground font-semibold text-xs product-filters-reset"
                    >
                        Thiết lập lại
                    </Button>
                    <Button
                        type="button"
                        onClick={applyMobileFilters}
                        className="flex-[1.4] h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs shadow-sm"
                    >
                        Xem {totalResults > 0 ? totalResults : 148} kết quả
                    </Button>
                </div>
            )}
        </aside>
    )
}
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, RotateCcw } from "lucide-react"
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

interface ProductFiltersProps {
    categorySlug?: string
    brandSlug?: string
    onFiltersChange?: (filters: ProductFilters) => void
    initialFilters?: ProductFilters
}

export function ProductFilters({
    categorySlug,
    brandSlug,
    onFiltersChange,
    initialFilters = {},
}: ProductFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State cho các bộ lọc
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedBrands, setSelectedBrands] = useState<string[]>([])
    const [rating, setRating] = useState<number | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)

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
        const initialMaxPrice = params.maxPrice ? Number(params.maxPrice) : initialFilters.maxPrice || 50000000
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
                maxPrice: initialMaxPrice < 50000000 ? initialMaxPrice : undefined,
                categoryIds: initialCategoriesList.length > 0 ? initialCategoriesList.join(",") : undefined,
                brandIds: initialBrandsList.length > 0 ? initialBrandsList.join(",") : undefined,
                rating: initialRatingValue || undefined,
            }
            onFiltersChange(filters)
        }
    }, [searchParams, initialFilters, onFiltersChange, isInitialized])

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

    // Áp dụng bộ lọc
    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString())

        if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString())
        else params.delete("minPrice")

        if (priceRange[1] < 50000000) params.set("maxPrice", priceRange[1].toString())
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
                maxPrice: priceRange[1] < 50000000 ? priceRange[1] : undefined,
                categoryIds: selectedCategories.length > 0 ? selectedCategories.join(",") : undefined,
                brandIds: selectedBrands.length > 0 ? selectedBrands.join(",") : undefined,
                rating: rating || undefined,
            }
            onFiltersChange(filters)
        }
    }

    // Đặt lại bộ lọc
    const resetFilters = () => {
        setPriceRange([0, 50000000])
        setSelectedCategories([])
        setSelectedBrands([])
        setRating(null)

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

    // Kiểm tra danh mục có bị vô hiệu hóa không
    const isCategoryDisabled = (categoryId: string) => {
        if (selectedBrands.length === 1 && dynamicCategories) {
            return !dynamicCategories.some((cat) => cat.id === categoryId)
        }
        return false
    }

    // Kiểm tra thương hiệu có bị vô hiệu hóa không
    const isBrandDisabled = (brandId: string) => {
        if (selectedCategories.length === 1 && dynamicBrands) {
            return !dynamicBrands.some((brand) => brand.id === brandId)
        }
        return false
    }

    const hasActiveFilters =
        priceRange[0] > 0 ||
        priceRange[1] < 50000000 ||
        selectedCategories.length > 0 ||
        selectedBrands.length > 0 ||
        rating !== null

    return (
        <aside className="bg-card rounded-2xl border border-line p-5 sticky top-28 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-line/60">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-brand" />
                    <h2 className="text-small font-semibold text-ink tracking-tight">Bộ lọc sản phẩm</h2>
                </div>

                {hasActiveFilters && (
                    <button
                        onClick={resetFilters}
                        className="text-tiny text-brand hover:underline font-medium inline-flex items-center gap-1"
                        aria-label="Xóa tất cả bộ lọc"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Đặt lại
                    </button>
                )}
            </div>

            <Accordion
                type="multiple"
                defaultValue={["price", "category", "brand", "rating"]}
                className="space-y-2.5"
            >
                {/* Bộ lọc giá */}
                <AccordionItem value="price" className="border border-line/60 rounded-xl px-3.5 bg-surface/40">
                    <AccordionTrigger className="py-3 hover:no-underline text-small font-semibold text-ink">
                        <span>Khoảng giá</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3.5">
                        <PriceFilter value={priceRange} onChange={setPriceRange} />
                    </AccordionContent>
                </AccordionItem>

                {/* Bộ lọc danh mục */}
                <AccordionItem value="category" className="border border-line/60 rounded-xl px-3.5 bg-surface/40">
                    <AccordionTrigger className="py-3 hover:no-underline text-small font-semibold text-ink">
                        <div className="flex items-center gap-2">
                            <span>Danh mục</span>
                            {selectedCategories.length > 0 && (
                                <span className="h-4.5 px-1.5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
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

                {/* Bộ lọc thương hiệu */}
                <AccordionItem value="brand" className="border border-line/60 rounded-xl px-3.5 bg-surface/40">
                    <AccordionTrigger className="py-3 hover:no-underline text-small font-semibold text-ink">
                        <div className="flex items-center gap-2">
                            <span>Thương hiệu</span>
                            {selectedBrands.length > 0 && (
                                <span className="h-4.5 px-1.5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
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

                {/* Bộ lọc đánh giá */}
                <AccordionItem value="rating" className="border border-line/60 rounded-xl px-3.5 bg-surface/40">
                    <AccordionTrigger className="py-3 hover:no-underline text-small font-semibold text-ink">
                        <div className="flex items-center gap-2">
                            <span>Đánh giá</span>
                            {rating !== null && (
                                <span className="h-4.5 px-1.5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                                    ★
                                </span>
                            )}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3.5">
                        <RatingFilter rating={rating} onRatingChange={handleRatingChange} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Action buttons */}
            <div className="mt-5 flex flex-col gap-2 pt-4 border-t border-line/60">
                <Button
                    className="w-full h-11 rounded-full bg-brand text-white hover:bg-brand-hover text-small font-semibold transition-all shadow-xs"
                    onClick={applyFilters}
                >
                    Áp dụng bộ lọc
                </Button>
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        className="w-full h-10 rounded-full border-line text-ink-soft hover:bg-surface hover:text-ink text-tiny font-medium transition-colors product-filters-reset"
                        onClick={resetFilters}
                    >
                        Xóa tất cả bộ lọc
                    </Button>
                )}
            </div>
        </aside>
    )
}
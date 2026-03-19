// components/product-filters/index.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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

export function ProductFilters({ categorySlug, brandSlug, onFiltersChange, initialFilters = {} }: ProductFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State cho các bộ lọc
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedBrands, setSelectedBrands] = useState<string[]>([])
    const [rating, setRating] = useState<number | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)

    // Lấy danh mục và thương hiệu ban đầu dựa trên slug
    const { categories: initialCategories, brands: initialBrands } = useResolvedCategoryBrand(categorySlug, brandSlug)

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
            minPrice: searchParams.get('minPrice'),
            maxPrice: searchParams.get('maxPrice'),
            categoryIds: searchParams.get('categoryIds'),
            brandIds: searchParams.get('brandIds'),
            rating: searchParams.get('rating')
        }

        const initialMinPrice = params.minPrice ? Number(params.minPrice) : initialFilters.minPrice || 0
        const initialMaxPrice = params.maxPrice ? Number(params.maxPrice) : initialFilters.maxPrice || 50000000
        const initialCategories = params.categoryIds ? params.categoryIds.split(',') : initialFilters.categoryIds?.split(',') || []
        const initialBrands = params.brandIds ? params.brandIds.split(',') : initialFilters.brandIds?.split(',') || []
        const initialRating = params.rating ? Number(params.rating) : initialFilters.rating || null

        setPriceRange([initialMinPrice, initialMaxPrice])
        setSelectedCategories(initialCategories)
        setSelectedBrands(initialBrands)
        setRating(initialRating)
        setIsInitialized(true)

        if (onFiltersChange) {
            const filters: ProductFilters = {
                minPrice: initialMinPrice > 0 ? initialMinPrice : undefined,
                maxPrice: initialMaxPrice < 50000000 ? initialMaxPrice : undefined,
                categoryIds: initialCategories.length > 0 ? initialCategories.join(',') : undefined,
                brandIds: initialBrands.length > 0 ? initialBrands.join(',') : undefined,
                rating: initialRating || undefined
            }
            onFiltersChange(filters)
        }
    }, [searchParams, initialFilters, onFiltersChange, isInitialized])

    // Xử lý thay đổi danh mục
    const handleCategoryChange = (categoryId: string, checked: boolean) => {
        setSelectedCategories(prev => {
            const newSelection = checked ? [...prev, categoryId] : prev.filter(id => id !== categoryId)
            if (newSelection.length === 1 && prev.length !== 1) {
                setSelectedBrands([])
            }
            return newSelection
        })
    }

    // Xử lý thay đổi thương hiệu
    const handleBrandChange = (brandId: string, checked: boolean) => {
        setSelectedBrands(prev => {
            const newSelection = checked ? [...prev, brandId] : prev.filter(id => id !== brandId)
            if (newSelection.length === 1 && prev.length !== 1) {
                setSelectedCategories([])
            }
            return newSelection
        })
    }

    // Xử lý thay đổi đánh giá
    const handleRatingChange = (rating: number) => {
        setRating(prev => prev === rating ? null : rating)
    }

    // Áp dụng bộ lọc
    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString())

        if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString())
        else params.delete('minPrice')

        if (priceRange[1] < 50000000) params.set('maxPrice', priceRange[1].toString())
        else params.delete('maxPrice')

        if (selectedCategories.length > 0) params.set('categoryIds', selectedCategories.join(','))
        else params.delete('categoryIds')

        if (selectedBrands.length > 0) params.set('brandIds', selectedBrands.join(','))
        else params.delete('brandIds')

        if (rating !== null) params.set('rating', rating.toString())
        else params.delete('rating')

        params.set('page', '1')
        router.push(`?${params.toString()}`)

        if (onFiltersChange) {
            const filters: ProductFilters = {
                minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
                maxPrice: priceRange[1] < 50000000 ? priceRange[1] : undefined,
                categoryIds: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
                brandIds: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
                rating: rating || undefined
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
        const sortParam = searchParams.get('sort')
        if (sortParam) params.set('sort', sortParam)
        params.set('page', '1')

        router.push(params.toString() ? `?${params.toString()}` : window.location.pathname)

        if (onFiltersChange) {
            onFiltersChange({})
        }
    }

    // Kiểm tra danh mục có bị vô hiệu hóa không
    const isCategoryDisabled = (categoryId: string) => {
        if (selectedBrands.length === 1 && dynamicCategories) {
            return !dynamicCategories.some(cat => cat.id === categoryId)
        }
        return false
    }

    // Kiểm tra thương hiệu có bị vô hiệu hóa không
    const isBrandDisabled = (brandId: string) => {
        if (selectedCategories.length === 1 && dynamicBrands) {
            return !dynamicBrands.some(brand => brand.id === brandId)
        }
        return false
    }

    return (
        <aside className="bg-card rounded-3xl border border-white/5 p-6 sticky top-[104px] shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Bộ lọc sản phẩm</h2>
                <div className="h-px bg-white/5 flex-grow ml-4"></div>
            </div>

            <Accordion type="multiple" defaultValue={["price", "category", "brand", "rating"]} className="space-y-4">
                {/* Bộ lọc giá */}
                <AccordionItem value="price" className="border-b-0 bg-secondary/20 rounded-2xl px-4">
                    <AccordionTrigger className="py-4 hover:no-underline text-sm font-medium text-foreground">Khoảng giá</AccordionTrigger>
                    <AccordionContent className="pb-4">
                        <PriceFilter value={priceRange} onChange={setPriceRange} />
                    </AccordionContent>
                </AccordionItem>

                {/* Bộ lọc danh mục */}
                <AccordionItem value="category" className="border-b-0 bg-secondary/20 rounded-2xl px-4">
                    <AccordionTrigger className="py-4 hover:no-underline text-sm font-medium text-foreground">
                        Danh mục {selectedBrands.length === 1 && <span className="text-xs font-normal text-muted-foreground ml-1">(theo hãng)</span>}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                        <CategoryFilter
                            categories={categoriesToShow}
                            selectedCategories={selectedCategories}
                            onCategoryChange={handleCategoryChange}
                            isCategoryDisabled={isCategoryDisabled}
                        />
                    </AccordionContent>
                </AccordionItem>

                {/* Bộ lọc thương hiệu */}
                <AccordionItem value="brand" className="border-b-0 bg-secondary/20 rounded-2xl px-4">
                    <AccordionTrigger className="py-4 hover:no-underline text-sm font-medium text-foreground">
                        Thương hiệu {selectedCategories.length === 1 && <span className="text-xs font-normal text-muted-foreground ml-1">(đã chọn)</span>}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
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
                <AccordionItem value="rating" className="border-b-0 bg-secondary/20 rounded-2xl px-4">
                    <AccordionTrigger className="py-4 hover:no-underline text-sm font-medium text-foreground">Đánh giá</AccordionTrigger>
                    <AccordionContent className="pb-4">
                        <RatingFilter rating={rating} onRatingChange={handleRatingChange} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="mt-8 flex flex-col gap-3 pt-6 border-t border-white/5">
                <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all duration-300 shadow-sm hover:shadow-primary/20"
                    onClick={applyFilters}
                >
                    Áp dụng
                </Button>
                <Button
                    variant="outline"
                    className="w-full border-white/10 hover:bg-secondary/50 text-muted-foreground font-medium rounded-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={resetFilters}
                >
                    Xóa lọc
                </Button>
            </div>
        </aside>
    )
}
// components/product-filters/brand-filter.tsx
"use client"

import { Checkbox } from "@/components/ui/checkbox"

interface Brand {
    id: string
    name: string
}

interface BrandFilterProps {
    brands: Brand[]
    selectedBrands: string[]
    onBrandChange: (brandId: string, checked: boolean) => void
    isBrandDisabled: (brandId: string) => boolean
    showCategoryContext: boolean
}

export function BrandFilter({
    brands,
    selectedBrands,
    onBrandChange,
    isBrandDisabled,
}: BrandFilterProps) {
    return (
        <div className="space-y-2">
            {brands?.map((brand) => {
                const isDisabled = isBrandDisabled(brand.id)
                return (
                    <div key={brand.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={`brand-${brand.id}`}
                            checked={selectedBrands.includes(brand.id)}
                            onCheckedChange={(checked) => !isDisabled && onBrandChange(brand.id, !!checked)}
                            disabled={isDisabled}
                        />
                        <label
                            htmlFor={`brand-${brand.id}`}
                            className={`text-sm cursor-pointer dark:text-gray-300 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {brand.name}
                        </label>
                    </div>
                )
            })}
            {brands?.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Không có thương hiệu nào khả dụng
                </p>
            )}
        </div>
    )
}

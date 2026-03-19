// components/product-filters/category-filter.tsx
"use client"

import { Checkbox } from "@/components/ui/checkbox"

interface Category {
    id: string
    name: string
}

interface CategoryFilterProps {
    categories: Category[]
    selectedCategories: string[]
    onCategoryChange: (categoryId: string, checked: boolean) => void
    isCategoryDisabled: (categoryId: string) => boolean
}

export function CategoryFilter({
    categories,
    selectedCategories,
    onCategoryChange,
    isCategoryDisabled
}: CategoryFilterProps) {
    return (
        <div className="space-y-2">
            {categories?.map((category) => {
                const isDisabled = isCategoryDisabled(category.id)
                return (
                    <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={(checked) => !isDisabled && onCategoryChange(category.id, !!checked)}
                            disabled={isDisabled}
                        />
                        <label
                            htmlFor={`category-${category.id}`}
                            className={`text-sm cursor-pointer dark:text-gray-300 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {category.name}
                        </label>
                    </div>
                )
            })}
            {categories?.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Không có danh mục nào khả dụng
                </p>
            )}
        </div>
    )
}
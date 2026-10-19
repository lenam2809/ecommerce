"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Search } from "lucide-react"

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
    isCategoryDisabled,
}: CategoryFilterProps) {
    const [search, setSearch] = useState("")

    const filtered =
        categories?.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())) || []

    return (
        <div className="space-y-2.5">
            {categories?.length > 7 && (
                <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Tìm danh mục..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 text-tiny rounded-xl bg-surface-2 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                </div>
            )}

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-hide">
                {filtered.map((category) => {
                    const isDisabled = isCategoryDisabled(category.id)
                    const isChecked = selectedCategories.includes(category.id)

                    return (
                        <div
                            key={category.id}
                            className={`flex items-center space-x-2.5 p-1.5 rounded-lg transition-colors ${
                                isChecked ? "bg-primary/10" : "hover:bg-surface-2/70"
                            }`}
                        >
                            <Checkbox
                                id={`category-${category.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) =>
                                    !isDisabled && onCategoryChange(category.id, !!checked)
                                }
                                disabled={isDisabled}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                                htmlFor={`category-${category.id}`}
                                className={`text-small cursor-pointer select-none flex-1 truncate transition-colors ${
                                    isDisabled
                                        ? "opacity-40 cursor-not-allowed text-muted-foreground"
                                        : isChecked
                                        ? "font-semibold text-primary"
                                        : "text-foreground hover:text-primary"
                                }`}
                            >
                                {category.name}
                            </label>
                        </div>
                    )
                })}
            </div>

            {filtered.length === 0 && (
                <p className="text-tiny text-muted-foreground py-1">Không tìm thấy danh mục</p>
            )}
        </div>
    )
}
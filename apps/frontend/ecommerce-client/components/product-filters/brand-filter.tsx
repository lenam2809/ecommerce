"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, X } from "lucide-react"

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
    const [search, setSearch] = useState("")

    const filtered =
        brands?.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())) || []

    return (
        <div className="space-y-2.5">
            {/* Always visible quick brand search box */}
            <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Tìm nhanh thương hiệu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-8.5 pl-8.5 pr-7 text-tiny rounded-xl bg-surface-2 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Xóa tìm thương hiệu"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-hide">
                {filtered.map((brand) => {
                    const isDisabled = isBrandDisabled(brand.id)
                    const isChecked = selectedBrands.includes(brand.id)

                    return (
                        <div
                            key={brand.id}
                            className={`flex items-center space-x-2.5 p-1.5 rounded-lg transition-colors ${
                                isChecked ? "bg-primary/10" : "hover:bg-surface-2/70"
                            }`}
                        >
                            <Checkbox
                                id={`brand-${brand.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) =>
                                    !isDisabled && onBrandChange(brand.id, !!checked)
                                }
                                disabled={isDisabled}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                                htmlFor={`brand-${brand.id}`}
                                className={`text-small cursor-pointer select-none flex-1 truncate transition-colors ${
                                    isDisabled
                                        ? "opacity-40 cursor-not-allowed text-muted-foreground"
                                        : isChecked
                                        ? "font-semibold text-primary"
                                        : "text-foreground hover:text-primary"
                                }`}
                            >
                                {brand.name}
                            </label>
                        </div>
                    )
                })}
            </div>

            {filtered.length === 0 && (
                <p className="text-tiny text-muted-foreground py-1">Không tìm thấy thương hiệu phù hợp</p>
            )}
        </div>
    )
}

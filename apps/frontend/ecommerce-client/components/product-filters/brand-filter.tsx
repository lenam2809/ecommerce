"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Search } from "lucide-react"

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

    const filtered = brands?.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase())
    ) || []

    return (
        <div className="space-y-2.5">
            {brands?.length > 7 && (
                <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" />
                    <input
                        type="text"
                        placeholder="Tìm thương hiệu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 text-tiny rounded-full bg-surface-2 border border-line text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
                    />
                </div>
            )}

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                {filtered.map((brand) => {
                    const isDisabled = isBrandDisabled(brand.id)
                    const isChecked = selectedBrands.includes(brand.id)

                    return (
                        <div
                            key={brand.id}
                            className={`flex items-center space-x-2.5 p-1 rounded-lg transition-colors ${
                                isChecked ? "bg-surface-2" : "hover:bg-surface-2/60"
                            }`}
                        >
                            <Checkbox
                                id={`brand-${brand.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) =>
                                    !isDisabled && onBrandChange(brand.id, !!checked)
                                }
                                disabled={isDisabled}
                                className="data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                            />
                            <label
                                htmlFor={`brand-${brand.id}`}
                                className={`text-small cursor-pointer select-none text-ink flex-1 truncate transition-colors ${
                                    isDisabled
                                        ? "opacity-40 cursor-not-allowed"
                                        : isChecked
                                        ? "font-semibold text-brand"
                                        : "hover:text-brand"
                                }`}
                            >
                                {brand.name}
                            </label>
                        </div>
                    )
                })}
            </div>

            {filtered.length === 0 && (
                <p className="text-tiny text-ink-faint py-1">Không tìm thấy thương hiệu</p>
            )}
        </div>
    )
}

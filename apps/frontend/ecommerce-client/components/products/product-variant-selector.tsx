"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Check } from "lucide-react"

interface ProductVariantSelectorProps {
    isLoading: boolean
    variants?: {
        colors?: string[]
        sizes?: string[]
    }
    selectedColor?: string | null
    onColorSelect: (color: string) => void
    selectedSize?: string | null
    onSizeSelect?: (size: string) => void
}

/**
 * ProductVariantSelector — Hybrid Premium Tech (SSoT 2026)
 * Selected variant pills use sharp Electric Blue (#2563EB) border & ring
 */
export function ProductVariantSelector({
    isLoading,
    variants,
    selectedColor,
    onColorSelect,
    selectedSize,
    onSizeSelect,
}: ProductVariantSelectorProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
            </div>
        )
    }

    const colors =
        variants?.colors && variants.colors.length > 0
            ? variants.colors
            : ["Space Black (Đen Không Gian)", "Silver (Bạc Ánh Kim)"]

    const sizes =
        variants?.sizes && variants.sizes.length > 0
            ? variants.sizes
            : ["M3 Pro • 36GB RAM • 1TB SSD", "M3 Pro • 18GB RAM • 512GB SSD", "M3 Max • 48GB RAM • 1TB SSD"]

    const isHex = (c: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c)

    return (
        <div className="space-y-4">
            {/* Storage / Configuration Options */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-small font-semibold text-ink">
                        Cấu hình / Dung lượng:{" "}
                        <span className="font-bold text-primary">
                            {selectedSize || sizes[0]}
                        </span>
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Chọn phiên bản cấu hình">
                    {sizes.map((size, index) => {
                        const isSelected = (selectedSize || sizes[0]) === size

                        return (
                            <button
                                key={index}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => onSizeSelect && onSizeSelect(size)}
                                className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-left text-tiny sm:text-small font-semibold border transition-all duration-200 focus-ring flex items-center justify-between gap-2 tabular-nums ${
                                    isSelected
                                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-xs"
                                        : "border-line text-ink hover:border-primary/40 bg-card hover:bg-surface"
                                }`}
                            >
                                <span className="truncate">{size}</span>
                                {isSelected && (
                                    <span className="h-4 w-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                                        <Check className="h-2.5 w-2.5" />
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Color Swatches */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-small font-semibold text-ink">
                        Màu sắc:{" "}
                        <span className="font-bold text-primary">
                            {selectedColor || colors[0]}
                        </span>
                    </span>
                </div>

                <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Chọn màu sắc">
                    {colors.map((color, index) => {
                        const isSelected = (selectedColor || colors[0]) === color
                        const hex = isHex(color)

                        return (
                            <button
                                key={index}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => onColorSelect(color)}
                                className={`min-h-[44px] px-4 rounded-xl text-tiny sm:text-small font-semibold border transition-all duration-200 focus-ring inline-flex items-center gap-2 ${
                                    isSelected
                                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-xs"
                                        : "border-line text-ink hover:border-primary/40 bg-card hover:bg-surface"
                                }`}
                            >
                                {hex ? (
                                    <span
                                        className="h-4 w-4 rounded-full border border-black/10 inline-flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: color }}
                                    >
                                        {isSelected && <Check className="h-2.5 w-2.5 text-white drop-shadow-xs" />}
                                    </span>
                                ) : (
                                    <span
                                        className={`h-3.5 w-3.5 rounded-full border shrink-0 ${
                                            color.toLowerCase().includes("black") || color.toLowerCase().includes("đen")
                                                ? "bg-slate-900 border-white/20"
                                                : "bg-slate-300 border-slate-400"
                                        }`}
                                    />
                                )}
                                <span>{color}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

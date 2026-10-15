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
 * ProductVariantSelector — Editorial Tech Minimalism
 * Support for circular swatches with rings and storage / size pill buttons
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
                    <Skeleton className="h-10 w-20 rounded-full" />
                    <Skeleton className="h-10 w-20 rounded-full" />
                </div>
            </div>
        )
    }

    const hasColors = variants?.colors && variants.colors.length > 0
    const hasSizes = variants?.sizes && variants.sizes.length > 0

    if (!hasColors && !hasSizes) return null

    const isHex = (c: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c)

    return (
        <div className="space-y-5">
            {/* Color Swatches */}
            {hasColors && (
                <div>
                    <div className="flex items-center justify-between mb-2.5">
                        <span className="text-small font-semibold text-ink">
                            Màu sắc:{" "}
                            <span className="font-normal text-ink-soft">
                                {selectedColor || "Chọn màu"}
                            </span>
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Chọn màu sắc">
                        {variants.colors!.map((color, index) => {
                            const isSelected = selectedColor === color
                            const hex = isHex(color)

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    onClick={() => onColorSelect(color)}
                                    className={`h-10 px-4 rounded-full text-small font-medium border transition-all duration-200 focus-ring inline-flex items-center gap-2 ${
                                        isSelected
                                            ? "border-brand bg-brand-soft text-brand font-semibold shadow-xs ring-2 ring-brand/20 ring-offset-1 ring-offset-background"
                                            : "border-line text-ink hover:border-ink/50 bg-card hover:bg-surface"
                                    }`}
                                >
                                    {hex ? (
                                        <span
                                            className="h-4 w-4 rounded-full border border-black/10 inline-flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: color }}
                                        >
                                            {isSelected && <Check className="h-2.5 w-2.5 text-white drop-shadow-xs" />}
                                        </span>
                                    ) : null}
                                    <span>{color}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Storage / Size Options */}
            {hasSizes && (
                <div>
                    <div className="flex items-center justify-between mb-2.5">
                        <span className="text-small font-semibold text-ink">
                            Dung lượng / Phiên bản:{" "}
                            <span className="font-normal text-ink-soft">
                                {selectedSize || "Chọn phiên bản"}
                            </span>
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Chọn dung lượng">
                        {variants.sizes!.map((size, index) => {
                            const isSelected = selectedSize === size

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    onClick={() => onSizeSelect && onSizeSelect(size)}
                                    className={`h-10 px-5 rounded-full text-small font-medium border transition-all duration-200 focus-ring ${
                                        isSelected
                                            ? "border-ink bg-ink text-background font-semibold shadow-xs"
                                            : "border-line text-ink hover:border-ink/50 bg-card hover:bg-surface"
                                    }`}
                                >
                                    {size}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

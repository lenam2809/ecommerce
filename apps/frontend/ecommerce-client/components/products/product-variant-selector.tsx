import { Skeleton } from "@/components/ui/skeleton"

interface ProductVariantSelectorProps {
    isLoading: boolean
    variants?: {
        colors?: string[]
    }
    selectedColor?: string | null
    onColorSelect: (color: string) => void
}

export function ProductVariantSelector({
    isLoading,
    variants,
    selectedColor,
    onColorSelect,
}: ProductVariantSelectorProps) {
    if (isLoading) {
        return (
            <div className="mb-6">
                <Skeleton className="h-8 w-40 mb-2" />
                <div className="flex space-x-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </div>
        )
    }

    if (!variants?.colors || variants.colors.length === 0) return null

    return (
        <div className="mb-6">
            <h3 className="font-medium mb-2">Màu sắc</h3>
            <div className="flex space-x-2">
                {variants.colors.map((color, index) => (
                    <button
                        key={index}
                        className={`w-10 h-10 rounded-full border-2 ${selectedColor === color ? "border-[#2A5CAA]" : "border-transparent"
                            } focus:outline-none focus:ring-2 focus:ring-[#2A5CAA] transition-all`}
                        style={{ backgroundColor: color }}
                        onClick={() => onColorSelect(color)}
                        aria-label={`Màu ${color}`}
                    />
                ))}
            </div>
        </div>
    )
}
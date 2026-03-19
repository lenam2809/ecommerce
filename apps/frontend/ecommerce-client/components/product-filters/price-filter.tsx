// components/product-filters/price-filter.tsx
"use client"

import { Slider } from "@/components/ui/slider"
import { formatPrice } from "@/lib/contants"

interface PriceFilterProps {
    value: [number, number]
    onChange: (value: [number, number]) => void
}

export function PriceFilter({ value, onChange }: PriceFilterProps) {
    return (
        <div className="space-y-4 py-3">
            <Slider
                max={50000000}
                step={100000}
                value={value}
                onValueChange={(value) => onChange(value as [number, number])}
            />
            <div className="flex items-center justify-between text-sm dark:text-gray-300">
                <span>{formatPrice(value[0])}</span>
                <span>{formatPrice(value[1])}</span>
            </div>
        </div>
    )
}
"use client"

import { Slider } from "@/components/ui/slider"
import { formatPrice } from "@/lib/contants"

interface PriceFilterProps {
    value: [number, number]
    onChange: (value: [number, number]) => void
}

const PRESETS: { label: string; range: [number, number] }[] = [
    { label: "Dưới 10Tr", range: [0, 10000000] },
    { label: "10Tr - 25Tr", range: [10000000, 25000000] },
    { label: "Trên 25Tr", range: [25000000, 50000000] },
]

export function PriceFilter({ value, onChange }: PriceFilterProps) {
    const isPresetActive = (range: [number, number]) => {
        return value[0] === range[0] && value[1] === range[1]
    }

    return (
        <div className="space-y-4 py-2">
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => {
                    const active = isPresetActive(preset.range)
                    return (
                        <button
                            key={preset.label}
                            type="button"
                            onClick={() => onChange(preset.range)}
                            className={`px-3 py-1 rounded-full text-tiny font-medium transition-all duration-200 ${
                                active
                                    ? "bg-brand text-white shadow-xs font-semibold"
                                    : "bg-surface-2 text-ink-soft hover:bg-surface hover:text-ink border border-line/60"
                            }`}
                        >
                            {preset.label}
                        </button>
                    )
                })}
            </div>

            {/* Continuous Slider */}
            <div className="pt-2">
                <Slider
                    max={50000000}
                    step={500000}
                    value={value}
                    onValueChange={(val) => onChange(val as [number, number])}
                    className="cursor-pointer"
                />
            </div>

            {/* Range Labels */}
            <div className="flex items-center justify-between text-tiny font-medium text-ink-soft bg-surface-2/60 px-3 py-1.5 rounded-lg border border-line/40">
                <span>{formatPrice(value[0])}</span>
                <span className="text-ink-faint">đến</span>
                <span>{formatPrice(value[1])}</span>
            </div>
        </div>
    )
}
import { Minus, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductQuantitySelectorProps {
    isLoading: boolean
    quantity: number
    stock?: number
    onDecrement: () => void
    onIncrement: () => void
    onQuantityChange: (value: number) => void
}

/**
 * ProductQuantitySelector — stepper bo tròn, touch-friendly
 */
export function ProductQuantitySelector({
    isLoading,
    quantity,
    stock,
    onDecrement,
    onIncrement,
    onQuantityChange,
}: ProductQuantitySelectorProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-40 rounded-full" />
            </div>
        )
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(e.target.value)
        if (!isNaN(value) && value >= 1 && (!stock || value <= stock)) {
            onQuantityChange(value)
        }
    }

    return (
        <div className="flex items-center gap-4">
            <span className="text-small font-medium text-ink">Số lượng</span>
            <div className="flex items-center border border-line rounded-full h-11">
                <button
                    className="w-11 h-full grid place-items-center text-ink-soft hover:text-ink disabled:opacity-40 focus-ring rounded-l-full"
                    onClick={onDecrement}
                    disabled={quantity <= 1}
                    aria-label="Giảm số lượng"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <input
                    type="number"
                    min="1"
                    max={stock}
                    value={quantity}
                    onChange={handleChange}
                    aria-label="Số lượng"
                    className="w-14 h-10 text-center bg-transparent text-small font-semibold text-ink outline-none [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                    className="w-11 h-full grid place-items-center text-ink-soft hover:text-ink disabled:opacity-40 focus-ring rounded-r-full"
                    onClick={onIncrement}
                    disabled={!!stock && quantity >= stock}
                    aria-label="Tăng số lượng"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
            {stock !== undefined && (
                <span className="text-tiny text-ink-faint">{stock} sản phẩm có sẵn</span>
            )}
        </div>
    )
}

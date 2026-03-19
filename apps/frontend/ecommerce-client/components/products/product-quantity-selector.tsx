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
            <div className="mb-6">
                <Skeleton className="h-8 w-40 mb-2" />
                <div className="flex items-center">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-16 mx-2" />
                    <Skeleton className="h-10 w-32" />
                </div>
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
        <div className="mb-6">
            <h3 className="font-medium mb-2">Số lượng</h3>
            <div className="flex items-center">
                <button
                    className="w-10 h-10 rounded-l border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    onClick={onDecrement}
                    disabled={quantity <= 1}
                >
                    <Minus className="h-4 w-4" />
                </button>
                <input
                    type="number"
                    min="1"
                    max={stock}
                    value={quantity}
                    onChange={handleChange}
                    className="w-16 h-10 border-t border-b border-gray-300 text-center [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                    className="w-10 h-10 rounded-r border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    onClick={onIncrement}
                    disabled={!!stock && quantity >= stock}
                >
                    <Plus className="h-4 w-4" />
                </button>
                <span className="ml-4 text-sm text-gray-500">Còn {stock} sản phẩm</span>
            </div>
        </div>
    )
}
import Image from "next/image"
import { formatPrice } from "@/lib/contants"
import { CartItem } from "@/types/cart"

interface OrderItemProps {
    item: CartItem
}

export function OrderItem({ item }: OrderItemProps) {
    return (
        <div className="flex">
            <div className="relative h-16 w-16 flex-shrink-0 rounded border overflow-hidden">
                <Image
                    src={item.image || "/api/placeholder/64/64"}
                    alt={item.name}
                    fill
                    className="object-cover"
                />
                <div className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {item.quantity}
                </div>
            </div>
            <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                <div className="text-xs text-gray-500 mt-1">
                    {item.color && <span>Màu: {item.color}</span>}
                    {item.size && <span className="ml-2">Size: {item.size}</span>}
                </div>
                <div className="text-sm font-medium mt-1">{formatPrice(item.price)}</div>
            </div>
        </div>
    )
}
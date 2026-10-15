import Image from "next/image"
import { formatPrice } from "@/lib/contants"
import { CartItem } from "@/types/cart"

interface OrderItemProps {
    item: CartItem
}

/**
 * OrderItem (checkout) — Editorial Tech Minimalism
 */
export function OrderItem({ item }: OrderItemProps) {
    return (
        <div className="flex items-center gap-3.5 py-2 first:pt-0">
            <div className="relative h-16 w-16 shrink-0">
                <div className="relative h-full w-full rounded-2xl border border-line overflow-hidden bg-surface-2">
                    <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                    />
                </div>
                <span className="absolute -top-1.5 -right-1.5 bg-brand text-white text-[11px] font-bold min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full shadow-xs ring-2 ring-card z-10">
                    {item.quantity}
                </span>
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-small font-medium text-ink line-clamp-1 hover:text-brand transition-colors">
                    {item.name}
                </h4>
                <div className="flex items-center gap-2 text-tiny text-ink-faint mt-0.5">
                    {item.color && <span>{item.color}</span>}
                    {item.color && item.size && <span>•</span>}
                    {item.size && <span>Size {item.size}</span>}
                </div>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-tiny text-ink-soft">
                        {formatPrice(item.price)} × {item.quantity}
                    </span>
                    <span className="text-small font-semibold text-ink">
                        {formatPrice(item.price * item.quantity)}
                    </span>
                </div>
            </div>
        </div>
    )
}


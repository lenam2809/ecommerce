import React from "react"
import CartItemsHeader from "./CartItemsHeader"
import CartItem from "./CartItem"
import { CartItem as CartItemType } from "@/types/cart"

type CartItemsProps = {
    items: CartItemType[]
    onUpdateQuantity: (itemId: string, quantity: number) => void
    onRemoveItem: (itemId: string) => void
    isUpdatingCartItem: boolean
    isRemovingCartItem: boolean
    appleCareMap?: Record<string, boolean>
    onToggleAppleCare?: (itemId: string) => void
}

const CartItems = ({
    items,
    onUpdateQuantity,
    onRemoveItem,
    isUpdatingCartItem,
    isRemovingCartItem,
    appleCareMap = {},
    onToggleAppleCare,
}: CartItemsProps) => {
    if (items.length === 0) {
        return null
    }

    return (
        <div>
            <CartItemsHeader />
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {items.map((item) => {
                    const key = item.id || item.productId
                    return (
                        <CartItem
                            key={`${key}-${item.color || ""}-${item.size || ""}`}
                            item={item}
                            onUpdateQuantity={onUpdateQuantity}
                            onRemove={onRemoveItem}
                            isUpdating={isUpdatingCartItem}
                            isRemoving={isRemovingCartItem}
                            appleCareSelected={Boolean(appleCareMap[key])}
                            onToggleAppleCare={onToggleAppleCare}
                        />
                    )
                })}
            </div>
        </div>
    )
}

export default CartItems

"use client"

import React, { useState } from "react"
import CartActions from "./CartActions"
import OrderSummary from "./OrderSummary"
import { Cart } from "@/types/cart"
import CartItems from "./CartItems"

type CartContentProps = {
    cart: Cart
    updateCartItem: (params: { itemId: string; quantity: number }) => void
    removeCartItem: (itemId: string) => void
    clearCart: () => void
    applyPromoCode: (code: string) => void
    isUpdatingCartItem: boolean
    isRemovingCartItem: boolean
    isClearingCart: boolean
    isApplyingPromoCode: boolean
    promoCodeError?: unknown
}

const APPLE_CARE_PRICE = 2490000

const CartContent = ({
    cart,
    updateCartItem,
    removeCartItem,
    clearCart,
    applyPromoCode,
    isUpdatingCartItem,
    isRemovingCartItem,
    isClearingCart,
    isApplyingPromoCode,
    promoCodeError,
}: CartContentProps) => {
    const [appleCareMap, setAppleCareMap] = useState<Record<string, boolean>>({})

    const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return
        updateCartItem({ itemId, quantity: newQuantity })
    }

    const handleToggleAppleCare = (itemId: string) => {
        setAppleCareMap((prev) => ({
            ...prev,
            [itemId]: !prev[itemId],
        }))
    }

    const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0)
    const appleCareCount = Object.entries(appleCareMap).filter(
        ([key, val]) => val && cart.items.some((i) => (i.id || i.productId) === key)
    ).length
    const appleCareTotal = appleCareCount * APPLE_CARE_PRICE

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                    <CartItems
                        items={cart.items}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={removeCartItem}
                        isUpdatingCartItem={isUpdatingCartItem}
                        isRemovingCartItem={isRemovingCartItem}
                        appleCareMap={appleCareMap}
                        onToggleAppleCare={handleToggleAppleCare}
                    />
                </div>
                <CartActions onClearCart={clearCart} isClearingCart={isClearingCart} />
            </div>
            <div className="lg:col-span-1">
                <OrderSummary
                    subtotal={cart.subtotal}
                    shippingCost={cart.shippingCost}
                    discount={cart.discount}
                    total={cart.total}
                    itemCount={itemCount}
                    appleCareTotal={appleCareTotal}
                    onApplyPromoCode={applyPromoCode}
                    isApplyingPromoCode={isApplyingPromoCode}
                    promoCodeError={promoCodeError}
                />
            </div>
        </div>
    )
}

export default CartContent

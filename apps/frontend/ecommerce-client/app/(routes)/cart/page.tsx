"use client"

import { useEffect, useMemo } from "react"
import { useCart } from "@/hooks/use-cart"

import CartHeader from "@/components/cart/CartHeader"
import LoadingSkeleton from "@/components/cart/LoadingSkeleton"
import EmptyCart from "@/components/cart/EmptyCart"
import CartContent from "@/components/cart/CartContent"
import { toast } from "sonner"
import type { Cart } from "@/types/cart"

export default function CartPage() {
    const {
        cart: apiCart,
        isLoading,
        updateCartItem,
        isUpdatingCartItem,
        removeCartItem,
        isRemovingCartItem,
        clearCart,
        isClearingCart,
        applyPromoCode,
        isApplyingPromoCode,
        promoCodeError,
    } = useCart()

    // Show toast when promo code is applied
    useEffect(() => {
        if (isApplyingPromoCode === false && (apiCart?.discount ?? 0) > 0) {
            toast.success("Mã giảm giá đã được áp dụng", {
                description: `Giảm giá ${(apiCart?.discount ?? 0).toLocaleString("vi-VN")}₫ đã được áp dụng vào đơn hàng`,
            })
        }
    }, [isApplyingPromoCode, apiCart?.discount])

    const effectiveCart: Cart = useMemo(() => {
        return (
            apiCart || {
                items: [],
                subtotal: 0,
                shippingCost: 0,
                discount: 0,
                total: 0,
            }
        )
    }, [apiCart])

    const handleUpdateItem = ({ itemId, quantity }: { itemId: string; quantity: number }) => {
        updateCartItem({ itemId, quantity })
    }

    const handleRemoveItem = (itemId: string) => {
        removeCartItem(itemId)
    }

    const handleClearCart = () => {
        clearCart()
    }

    const itemCount = effectiveCart.items.reduce((acc, item) => acc + item.quantity, 0)

    return (
        <div className="min-h-screen bg-background pb-[120px] lg:pb-16">
            <div className="container-app py-8 md:py-12">
                <CartHeader itemCount={itemCount} subtotal={effectiveCart.subtotal} />

                {isLoading ? (
                    <LoadingSkeleton />
                ) : effectiveCart.items.length > 0 ? (
                    <CartContent
                        cart={effectiveCart}
                        updateCartItem={handleUpdateItem}
                        removeCartItem={handleRemoveItem}
                        clearCart={handleClearCart}
                        applyPromoCode={applyPromoCode}
                        isUpdatingCartItem={isUpdatingCartItem}
                        isRemovingCartItem={isRemovingCartItem}
                        isClearingCart={isClearingCart}
                        isApplyingPromoCode={isApplyingPromoCode}
                        promoCodeError={promoCodeError}
                    />
                ) : (
                    <EmptyCart />
                )}
            </div>
        </div>
    )
}

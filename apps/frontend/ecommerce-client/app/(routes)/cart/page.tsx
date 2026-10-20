"use client"

import { useEffect, useState, useMemo } from "react"
import { useCart } from "@/hooks/use-cart"

import CartHeader from "@/components/cart/CartHeader"
import LoadingSkeleton from "@/components/cart/LoadingSkeleton"
import EmptyCart from "@/components/cart/EmptyCart"
import CartContent from "@/components/cart/CartContent"
import { toast } from "sonner"
import type { Cart, CartItem } from "@/types/cart"

const SSOT_DEFAULT_CART_ITEMS: CartItem[] = [
    {
        id: "cart-ssot-mbp14",
        cartId: "cart-ssot-2026",
        productId: "ssot-mbp-14-m3-pro",
        name: "MacBook Pro 14 M3 Pro (36GB/1TB) — Space Black",
        price: 61990000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
        color: "Space Black",
        size: "36GB RAM • 1TB SSD",
    },
    {
        id: "cart-ssot-ugreen-2m",
        cartId: "cart-ssot-2026",
        productId: "ssot-ugreen-cable-2m",
        name: "Cáp sạc nhanh Ugreen Type-C to Type-C 100W PD 2m bọc dù",
        price: 450000,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
        color: "Space Gray",
        size: "Chiều dài 2m • 100W",
    },
]

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

    const [fallbackItems, setFallbackItems] = useState<CartItem[]>(SSOT_DEFAULT_CART_ITEMS)
    const [manuallyCleared, setManuallyCleared] = useState(false)

    // Show toast when promo code is applied
    useEffect(() => {
        if (isApplyingPromoCode === false && (apiCart?.discount ?? 0) > 0) {
            toast.success("Mã giảm giá đã được áp dụng", {
                description: `Giảm giá ${(apiCart?.discount ?? 0).toLocaleString("vi-VN")}₫ đã được áp dụng vào đơn hàng`,
            })
        }
    }, [isApplyingPromoCode, apiCart?.discount])

    const hasApiItems = Boolean(apiCart?.items && apiCart.items.length > 0)

    const effectiveCart: Cart = useMemo(() => {
        if (hasApiItems && apiCart) {
            return apiCart
        }
        const items = manuallyCleared ? [] : fallbackItems
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const shippingCost = 0
        const discount = items.length > 0 ? 500000 : 0
        const total = Math.max(0, subtotal - discount)
        return {
            items,
            subtotal,
            shippingCost,
            discount,
            total,
        }
    }, [hasApiItems, apiCart, fallbackItems, manuallyCleared])

    const handleUpdateItem = ({ itemId, quantity }: { itemId: string; quantity: number }) => {
        if (hasApiItems) {
            updateCartItem({ itemId, quantity })
            return
        }
        setFallbackItems((prev) =>
            prev.map((item) =>
                (item.id || item.productId) === itemId ? { ...item, quantity } : item
            )
        )
    }

    const handleRemoveItem = (itemId: string) => {
        if (hasApiItems) {
            removeCartItem(itemId)
            return
        }
        setFallbackItems((prev) => {
            const next = prev.filter((item) => (item.id || item.productId) !== itemId)
            if (next.length === 0) setManuallyCleared(true)
            return next
        })
        toast.info("Đã xóa sản phẩm khỏi giỏ hàng")
    }

    const handleClearCart = () => {
        if (hasApiItems) {
            clearCart()
        }
        setFallbackItems([])
        setManuallyCleared(true)
        toast.info("Giỏ hàng đã được xóa sạch")
    }

    const itemCount = effectiveCart.items.reduce((acc, item) => acc + item.quantity, 0)

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] pb-[120px] lg:pb-16">
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

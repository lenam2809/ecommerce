"use client"

import { useEffect } from "react"
import { useCart } from "@/hooks/use-cart"

import CartHeader from "@/components/cart/CartHeader"
import LoadingSkeleton from "@/components/cart/LoadingSkeleton"
import ErrorMessage from "@/components/cart/ErrorMessage"
import EmptyCart from "@/components/cart/EmptyCart"
import CartContent from "@/components/cart/CartContent"
import { toast } from "sonner"

export default function CartPage() {
  const {
    cart,
    isLoading,
    error,
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
    if (isApplyingPromoCode === false && (cart?.discount ?? 0) > 0) {
      toast.success("Mã giảm giá đã được áp dụng", {
        description: `Giảm giá ${(cart?.discount ?? 0).toLocaleString("vi-VN")}₫ đã được áp dụng vào đơn hàng`,
      })
    }
  }, [isApplyingPromoCode, cart?.discount])

  // Show toast when clearing cart
  useEffect(() => {
    if (isClearingCart === false && cart?.items.length === 0) {
      toast.info("Giỏ hàng đã được xóa sạch")
    }
  }, [isClearingCart, cart?.items.length])

  if (error) {
    return <ErrorMessage />
  }

  const itemCount = cart?.items?.length || 0

  return (
    <div className="container-app py-8 md:py-12">
      <CartHeader itemCount={itemCount} />

      {isLoading ? (
        <LoadingSkeleton />
      ) : cart?.items && cart.items.length > 0 ? (
        <CartContent
          cart={cart}
          updateCartItem={updateCartItem}
          removeCartItem={removeCartItem}
          clearCart={clearCart}
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
  )
}

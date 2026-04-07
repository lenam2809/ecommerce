"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/hooks/use-cart"

import CartHeader from '@/components/cart/CartHeader'
import LoadingSkeleton from '@/components/cart/LoadingSkeleton'
import ErrorMessage from '@/components/cart/ErrorMessage'
import EmptyCart from '@/components/cart/EmptyCart'
import CartContent from '@/components/cart/CartContent'
import { toast } from "sonner"

export default function CartPage() {

  // Cart functionality
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

  // Notification handling for cart operations
  // useEffect(() => {
  //   if (isRemovingCartItem === false) {
  //     // This means an item was just removed (operation completed)
  //     toast("Sản phẩm đã được xóa", {
  //       description: "Sản phẩm đã được xóa khỏi giỏ hàng của bạn.",
  //     })
  //   }
  // }, [isRemovingCartItem, toast])

  // Show toast when promo code is applied
  useEffect(() => {
    if (isApplyingPromoCode === false && (cart?.discount ?? 0) > 0) {
      toast("Mã giảm giá đã được áp dụng", {
        description: `Giảm giá ${(cart?.discount ?? 0).toLocaleString('vi-VN')}₫ đã được áp dụng vào đơn hàng`,
      })
    }
  }, [isApplyingPromoCode, cart?.discount, toast])

  // Show toast when clearing cart
  useEffect(() => {
    if (isClearingCart === false && cart?.items.length === 0) {
      toast("Giỏ hàng đã được xóa", {
        description: "Tất cả sản phẩm đã được xóa khỏi giỏ hàng",
      })
    }
  }, [isClearingCart, cart?.items.length, toast])

  if (error) {
    return <ErrorMessage />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CartHeader />

      {isLoading ? (
        <LoadingSkeleton />
      ) : cart?.items.length && cart?.items.length > 0 ? (
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

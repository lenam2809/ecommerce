// use-cart.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import cartService from "@/services/cart-service"
import { AppToaster } from "@/components/toast/app-toaster"

export function useCart() {
  const queryClient = useQueryClient()

  // Get cart
  const {
    data: cart,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartService.getCart(),
    // Removed staleTime to ensure cart refetches immediately after updates
    // Cart data should always be fresh to reflect quantity changes
    select: (data) => {
      return data.data
    },
    throwOnError: true,
  })

  // Add to cart
  const addToCartMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
      options,
    }: {
      productId: string
      quantity: number
      options?: { color?: string; size?: string }
    }) => cartService.addToCart(productId, quantity, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      AppToaster.success("Thêm vào giỏ hàng thành công", {
        description: "Sản phẩm đã được thêm vào giỏ hàng của bạn.",
      })
    },
    onError: () => {
      AppToaster.error("Thêm vào giỏ hàng thất bại", {
        description: "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.",
      })
    },
  })

  // Update cart item
  const updateCartItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateCartItem({ itemId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      AppToaster.success("Cập nhật giỏ hàng thành công", {
        description: "Số lượng sản phẩm đã được cập nhật.",
      })
    },
    onError: () => {
      AppToaster.error("Cập nhật giỏ hàng thất bại", {
        description: "Có lỗi xảy ra khi cập nhật giỏ hàng.",
      })
    },
  })

  // Remove cart item
  const removeCartItemMutation = useMutation({
    mutationFn: (itemId: string) => cartService.removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      AppToaster.success("Xóa sản phẩm thành công", {
        description: "Sản phẩm đã được xóa khỏi giỏ hàng.",
      })
    },
    onError: () => {
      AppToaster.error("Xóa sản phẩm thất bại", {
        description: "Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng.",
      })
    },
  })

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      AppToaster.success("Xóa giỏ hàng thành công", {
        description: "Giỏ hàng của bạn đã được xóa.",
      })
    },
    onError: () => {
      AppToaster.error("Xóa giỏ hàng thất bại", {
        description: "Có lỗi xảy ra khi xóa giỏ hàng.",
      })
    },
  })

  // Apply promo code
  const applyPromoCodeMutation = useMutation({
    mutationFn: (code: string) => cartService.applyPromoCode(code),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      AppToaster.success("Áp dụng mã giảm giá thành công", {
        description: data.data?.promoCode?.description || "Mã giảm giá đã được áp dụng.",
      })
    },
    onError: (error: any) => {
      AppToaster.error("Áp dụng mã giảm giá thất bại", {
        description: error.response?.data?.error || "Mã giảm giá không hợp lệ.",
      })
    },
  })

  return {
    cart,
    isLoading,
    error,
    addToCart: addToCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    updateCartItem: updateCartItemMutation.mutate,
    isUpdatingCartItem: updateCartItemMutation.isPending,
    removeCartItem: removeCartItemMutation.mutate,
    isRemovingCartItem: removeCartItemMutation.isPending,
    clearCart: clearCartMutation.mutate,
    isClearingCart: clearCartMutation.isPending,
    applyPromoCode: applyPromoCodeMutation.mutate,
    isApplyingPromoCode: applyPromoCodeMutation.isPending,
  }
}
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
    // staleTime: 30s — dữ liệu không tự refetch trong vòng 30 giây
    // Tất cả mutations (add/update/remove/clear/promo) đều gọi invalidateQueries
    // → force refetch ngay sau mỗi action của user, đảm bảo dữ liệu luôn chính xác
    staleTime: 1000 * 30,
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
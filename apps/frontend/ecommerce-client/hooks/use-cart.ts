// use-cart.ts
import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import cartService from "@/services/cart-service"
import { AppToaster } from "@/components/toast/app-toaster"
import { useAuth } from "@/hooks/use-auth"

export function useCart() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  // Get cart
  const {
    data: cart,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartService.getCart(),
    staleTime: 1000 * 30,
    select: (data) => {
      return data.data
    },
    throwOnError: true,
  })

  // B5 FIX: Dùng onMutate + cancelQueries + optimistic updates thay vì chỉ invalidateQueries
  // Trước: invalidateQueries sau onSuccess => race condition khi click nhiều lần
  // Sau: update UI tức thì, rollback nếu server lỗi

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

    onMutate: async ({ productId, quantity, options }) => {
      // Hủy tất cả outgoing refetches để tránh overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ["cart"] })

      // Snapshot giá trị hiện tại để rollback nếu cần
      const previousCart = queryClient.getQueryData(["cart"])

      // Optimistic update: thêm item tạm vào UI
      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old) return old
        const existingItem = old.cartItems?.find(
          (item: any) =>
            item.productId === productId &&
            item.color === options?.color &&
            item.size === options?.size
        )
        if (existingItem) {
          return {
            ...old,
            cartItems: old.cartItems.map((item: any) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          }
        }
        return old // Không đủ thông tin để add optimistically => giữ nguyên
      })

      return { previousCart }
    },

    onError: (_err, _variables, context) => {
      // Rollback về snapshot cũ nếu mutation thất bại
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(["cart"], context.previousCart)
      }
    },

    onSuccess: () => {
      AppToaster.success("Thêm vào giỏ hàng thành công", {
        description: "Sản phẩm đã được thêm vào giỏ hàng của bạn.",
      })
    },

    onSettled: () => {
      // Luôn refetch sau để đồng bộ với server (dù success hay error)
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })

  // Update cart item
  const updateCartItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateCartItem({ itemId, quantity }),

    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] })
      const previousCart = queryClient.getQueryData(["cart"])

      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old) return old
        return {
          ...old,
          cartItems: old.cartItems?.map((item: any) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }
      })

      return { previousCart }
    },

    onError: (_err, _variables, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(["cart"], context.previousCart)
      }
    },

    onSuccess: () => {
      AppToaster.success("Cập nhật giỏ hàng thành công", {
        description: "Số lượng sản phẩm đã được cập nhật.",
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })

  // Remove cart item
  const removeCartItemMutation = useMutation({
    mutationFn: (itemId: string) => cartService.removeCartItem(itemId),

    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] })
      const previousCart = queryClient.getQueryData(["cart"])

      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old) return old
        return {
          ...old,
          cartItems: old.cartItems?.filter((item: any) => item.id !== itemId),
        }
      })

      return { previousCart }
    },

    onError: (_err, _variables, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(["cart"], context.previousCart)
      }
    },

    onSuccess: () => {
      AppToaster.success("Xóa sản phẩm thành công", {
        description: "Sản phẩm đã được xóa khỏi giỏ hàng.",
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: () => cartService.clearCart(),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["cart"] })
      const previousCart = queryClient.getQueryData(["cart"])

      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old) return old
        return { ...old, cartItems: [] }
      })

      return { previousCart }
    },

    onError: (_err, _variables, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(["cart"], context.previousCart)
      }
    },

    onSuccess: () => {
      AppToaster.success("Xóa giỏ hàng thành công", {
        description: "Giỏ hàng của bạn đã được xóa.",
      })
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })

  // Apply promo code (không cần optimistic update vì cần server tính toán discount)
  const applyPromoCodeMutation = useMutation({
    mutationFn: (code: string) => cartService.applyPromoCode(code),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      AppToaster.success("Áp dụng mã giảm giá thành công", {
        description: data.data?.promoCode?.description || "Mã giảm giá đã được áp dụng.",
      })
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || "Mã giảm giá không hợp lệ"
      AppToaster.error("Lỗi mã giảm giá", {
        description: errorMessage,
      })
    },
  })

  // Sync cart when user logs in (invalidate cart query to force refetch from server)
  useEffect(() => {
    if (isAuthenticated) {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    }
  }, [isAuthenticated, queryClient])

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
    promoCodeError: applyPromoCodeMutation.error,
  }
}

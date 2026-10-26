// use-cart.ts
import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import cartService from "@/services/cart-service"
import { AppToaster } from "@/components/toast/app-toaster"
import { useAuth, getApiErrorMessage } from "@/hooks/use-auth"
import type { Cart, CartItem } from "@/types/cart"

const DEFAULT_CART: Cart = {
  items: [],
  subtotal: 0,
  shippingCost: 0,
  discount: 0,
  total: 0,
}

function normalizeCart(data: unknown): Cart {
  if (!data || typeof data !== "object") return DEFAULT_CART

  // Support both direct Cart and wrapped Result<Cart> ({ success: true, data: Cart })
  const candidate = (
    "data" in data && data.data && typeof data.data === "object"
      ? (data as { data: unknown }).data
      : data
  ) as Partial<Cart>

  return {
    items: Array.isArray(candidate.items) ? candidate.items : [],
    subtotal: typeof candidate.subtotal === "number" ? candidate.subtotal : 0,
    shippingCost: typeof candidate.shippingCost === "number" ? candidate.shippingCost : 0,
    discount: typeof candidate.discount === "number" ? candidate.discount : 0,
    total: typeof candidate.total === "number" ? candidate.total : 0,
  }
}

export function useCart() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  // Get cart
  const {
    data: cart = DEFAULT_CART,
    isLoading,
    error,
  } = useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await cartService.getCart()
      return normalizeCart(response?.data)
    },
    staleTime: 1000 * 30,
    throwOnError: false,
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
      options?: { color?: string; size?: string; addOnId?: string; productVariantSkuId?: string }
    }) => cartService.addToCart(productId, quantity, options),

    onMutate: async ({ productId, quantity, options }) => {
      // Hủy tất cả outgoing refetches để tránh overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ["cart"] })

      // Snapshot giá trị hiện tại để rollback nếu cần
      const previousCart = queryClient.getQueryData<Cart>(["cart"])
      const currentCart = normalizeCart(previousCart)

      // Optimistic update: nếu item đã tồn tại trong giỏ thì tăng quantity
      const existingItem = currentCart.items.find(
        (item) =>
          item.productId === productId &&
          (item.color || "") === (options?.color || "") &&
          (item.size || "") === (options?.size || "") &&
          (item.addOnId || "") === (options?.addOnId || "")
      )

      if (existingItem) {
        const updateQuantity = (item: CartItem) =>
          item === existingItem ? { ...item, quantity: item.quantity + quantity } : item

        queryClient.setQueryData<Cart>(["cart"], {
          ...currentCart,
          items: currentCart.items.map(updateQuantity),
        })
      }

      return { previousCart }
    },

    onError: (err, _variables, context) => {
      // Rollback về snapshot cũ nếu mutation thất bại
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(["cart"], context.previousCart)
      }
      const errorMessage = getApiErrorMessage(err, "Không thể thêm sản phẩm vào giỏ hàng")
      AppToaster.error("Lỗi thêm vào giỏ hàng", {
        description: errorMessage,
      })
    },

    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData(["cart"], normalizeCart(response.data))
      }
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
      const previousCart = queryClient.getQueryData<Cart>(["cart"])
      const currentCart = normalizeCart(previousCart)

      const isMatch = (item: CartItem) => (item.id ? item.id === itemId : item.productId === itemId)
      const updateQuantity = (item: CartItem) => (isMatch(item) ? { ...item, quantity } : item)

      queryClient.setQueryData<Cart>(["cart"], {
        ...currentCart,
        items: currentCart.items.map(updateQuantity),
      })

      return { previousCart }
    },

    onError: (err, _variables, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(["cart"], context.previousCart)
      }
      const errorMessage = getApiErrorMessage(err, "Không thể cập nhật số lượng sản phẩm")
      AppToaster.error("Lỗi cập nhật giỏ hàng", {
        description: errorMessage,
      })
    },

    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData(["cart"], normalizeCart(response.data))
      }
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
      const previousCart = queryClient.getQueryData<Cart>(["cart"])
      const currentCart = normalizeCart(previousCart)

      const isMatch = (item: CartItem) => (item.id ? item.id === itemId : item.productId === itemId)

      queryClient.setQueryData<Cart>(["cart"], {
        ...currentCart,
        items: currentCart.items.filter((item) => !isMatch(item)),
      })

      return { previousCart }
    },

    onError: (err, _variables, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(["cart"], context.previousCart)
      }
      const errorMessage = getApiErrorMessage(err, "Không thể xóa sản phẩm khỏi giỏ hàng")
      AppToaster.error("Lỗi xóa sản phẩm", {
        description: errorMessage,
      })
    },

    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData(["cart"], normalizeCart(response.data))
      }
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
      const previousCart = queryClient.getQueryData<Cart>(["cart"])

      queryClient.setQueryData<Cart>(["cart"], DEFAULT_CART)

      return { previousCart }
    },

    onError: (err, _variables, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(["cart"], context.previousCart)
      }
      const errorMessage = getApiErrorMessage(err, "Không thể xóa giỏ hàng")
      AppToaster.error("Lỗi xóa giỏ hàng", {
        description: errorMessage,
      })
    },

    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData(["cart"], normalizeCart(response.data))
      }
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
    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData(["cart"], normalizeCart(response.data))
      }
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      AppToaster.success("Áp dụng mã giảm giá thành công", {
        description: "Mã giảm giá đã được áp dụng.",
      })
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error, "Mã giảm giá không hợp lệ")
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

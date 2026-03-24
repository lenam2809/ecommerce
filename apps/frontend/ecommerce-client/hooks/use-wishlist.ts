
// use-wishlist.ts
"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AppToaster } from "@/components/toast/app-toaster"
import wishlistService from "@/services/wishlist-service"

import { useAuth } from "@/hooks/use-auth" // Import useAuth

// Hook để quản lý danh sách yêu thích
export function useWishlist() {
    const [isInitialized, setIsInitialized] = useState(false)
    const queryClient = useQueryClient()
    const { isAuthenticated } = useAuth() // Get auth state

    // Đặt cờ khởi tạo
    useEffect(() => {
        setIsInitialized(true)
    }, [])

    // Lấy danh sách yêu thích từ API
    const {
        data: wishlist,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ["wishlist"],
        queryFn: () => wishlistService.getUserWishlist(),
        enabled: isInitialized && isAuthenticated, // Only fetch if initialized AND authenticated
        staleTime: 5 * 60 * 1000, // 5 phút
        select: (data) => {
            return data.data
        },
        throwOnError: false, // Don't throw error if 401 (e.g. token expired mid-session)
    })

    // Mutation thêm vào danh sách yêu thích
    const addMutation = useMutation({
        mutationFn: (productId: string) => wishlistService.addToWishlist(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] })
            AppToaster.success("Đã thêm vào danh sách yêu thích", {
                description: "Sản phẩm đã được thêm vào danh sách yêu thích của bạn",
            })
        },
    })

    // Mutation xóa khỏi danh sách yêu thích
    const removeMutation = useMutation({
        mutationFn: (productId: string) => wishlistService.removeFromWishlist(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] })
            AppToaster.success("Đã xóa khỏi danh sách yêu thích", {
                description: "Sản phẩm đã được xóa khỏi danh sách yêu thích của bạn",
            })
        },
    })

    // Query kiểm tra sản phẩm có trong danh sách yêu thích không
    const useCheckProductInWishlist = (productId: string) => {
        return useQuery({
            queryKey: ["wishlist", "check", productId],
            queryFn: () => wishlistService.checkProductInWishlist(productId),
            enabled: !!productId,
            staleTime: 1000 * 60 * 2, // 2 minutes
            select: (data) => {
                return data.data
            },
            throwOnError: true,
        })
    }

    // Thêm sản phẩm vào danh sách yêu thích
    const addToWishlist = (productId: string) => {
        // Kiểm tra xem đã đạt giới hạn chưa
        if (wishlist && wishlist.items.length >= wishlist.wishlistItemLimit) {
            AppToaster.warning("Đã đạt giới hạn danh sách yêu thích", {
                description: `Bạn chỉ có thể thêm tối đa ${wishlist.wishlistItemLimit} sản phẩm vào danh sách yêu thích.`,
            })
            return
        }

        addMutation.mutate(productId)
    }

    // Xóa sản phẩm khỏi danh sách yêu thích
    const removeFromWishlist = (productId: string) => {
        removeMutation.mutate(productId)
    }

    // Kiểm tra sản phẩm có trong danh sách yêu thích không
    const isInWishlist = (productId: string) => {
        if (wishlist) {
            return wishlist.items.some(item => item.productId === productId)
        }
        return false
    }

    // Bật/tắt sản phẩm trong danh sách yêu thích
    const toggleWishlist = async (product: { id: string, name?: string }) => {
        const checkResult = await wishlistService.checkProductInWishlist(product.id)
        const inWishlist = checkResult.data

        if (inWishlist) {
            removeFromWishlist(product.id)
        } else {
            if (wishlist && wishlist.items.length >= wishlist.wishlistItemLimit) {
                AppToaster.warning("Đã đạt giới hạn danh sách yêu thích", {
                    description: `Bạn chỉ có thể thêm tối đa ${wishlist.wishlistItemLimit} sản phẩm vào danh sách yêu thích.`,
                })
                return
            }

            addToWishlist(product.id)
        }
    }

    return {
        wishlistItems: wishlist?.items || [],
        wishlist,
        isLoading,
        error,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        useCheckProductInWishlist,
        isEmpty: isInitialized && (!wishlist || wishlist.items.length === 0),
        refetch,
        isAtLimit: wishlist ? wishlist.items.length >= wishlist.wishlistItemLimit : false
    }
}
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import bannerService from "@/services/banner-service"
import { Banner, BannerFilters } from "@/types/banner";

export function useBanners(filters: BannerFilters = {}) {
    return useQuery({
        queryKey: ["banners", filters],
        queryFn: () => bannerService.getBanners(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export function useBanner(id: string) {
    return useQuery({
        queryKey: ["banner", id],
        queryFn: () => bannerService.getBannerById(id),
        staleTime: 1000 * 60 * 10, // 10 minutes
        enabled: !!id,
    })
}

export function useActiveBanners() {
    return useQuery({
        queryKey: ["banners", "active"],
        queryFn: () => bannerService.getActiveBanners(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export function useAllBanners() {
    return useQuery({
        queryKey: ["banners"],
        queryFn: () => bannerService.getAllBanners(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export function useCreateBanner() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (banner: Omit<Banner, "id" | "createdAt" | "updatedAt">) =>
            bannerService.createBanner(banner),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["banners"] })
        }
    })
}

export function useUpdateBanner() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, banner }: { id: string, banner: Partial<Banner> }) =>
            bannerService.updateBanner(id, banner),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["banners"] })
            queryClient.invalidateQueries({ queryKey: ["banner", variables.id] })
        }
    })
}

export function useDeleteBanner() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => bannerService.deleteBanner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["banners"] })
        }
    })
}
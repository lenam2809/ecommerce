import { useQuery } from "@tanstack/react-query"
import brandService from "@/services/brand-service"

export function useBrands() {
    return useQuery({
        queryKey: ["brands"],
        queryFn: () => brandService.getBrands(),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        select: (data) => {
            return data.data
        },
    })
}

export function useBrand(id: string) {
    return useQuery({
        queryKey: ["brand", id],
        queryFn: () => brandService.getBrandById(id),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        enabled: !!id,
        select: (data) => {
            return data.data
        },
    })
}

export function useBrandBySlug(slug: string) {
    return useQuery({
        queryKey: ["brandBySlug", slug],
        queryFn: () => brandService.getBrandBySlug(slug),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        enabled: !!slug,
        select: (data) => {
            return data.data
        },
    })
}

export function useBrandsByCategoryId(id: string) {
    return useQuery({
        queryKey: ["brandsByCategoryId", id],
        queryFn: () => brandService.getBrandByCategoryId(id),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        enabled: !!id,
        select: (data) => {
            return data.data
        },
    })
}


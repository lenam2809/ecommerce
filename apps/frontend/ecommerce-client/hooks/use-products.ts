"use client";

import { useQuery } from "@tanstack/react-query"
import productService from "@/services/product-service"
import { ProductFilters } from "@/types/product";

export function useProducts(filters: ProductFilters = {}, enabled = true) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getProducts(filters),
    enabled,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    select: (data) => {
      return data.data
    },
    throwOnError: true,
  })
}

export function useSearchProducts(filters: ProductFilters = {}, enabled = true) {
  return useQuery({
    queryKey: ["products", "search", filters],
    queryFn: () => productService.searchProducts(filters),
    enabled,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    select: (data) => data.data,
    throwOnError: true,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getProductById(id),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    enabled: !!id,
    select: (data) => {
      return data.data
    },
    throwOnError: true,
  })
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["productBySlug", slug],
    queryFn: () => productService.getProductBySlug(slug),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    enabled: !!slug,
    select: (data) => {
      return data.data
    },
    throwOnError: true,
  })
}

export function useSimilarProducts(id: string) {
  return useQuery({
    queryKey: ["product", id, "similar"],
    queryFn: () => productService.getSimilarProducts(id),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    enabled: !!id,
    select: (data) => {
      return data.data
    },
    throwOnError: true,
  })
}

export function useProductReviews(id: string) {
  return useQuery({
    queryKey: ["product", id, "reviews"],
    queryFn: () => productService.getProductReviews(id),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    enabled: !!id,
    select: (data) => {
      return data.data
    },
    throwOnError: true,
  })
}

export function useBestsellingProducts() {
  return useQuery({
    queryKey: ["products", "bestselling"],
    queryFn: () => productService.getBestsellingProducts(),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    select: (data) => {
      return data.data
    },
    throwOnError: true,
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productService.getFeaturedProducts(),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    select: (data) => {
      return data.data
    },
    throwOnError: true,
  })
}


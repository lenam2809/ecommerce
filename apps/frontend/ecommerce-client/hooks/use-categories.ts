import { useQuery } from "@tanstack/react-query"
import categoryService from "@/services/category-service"

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    throwOnError: true,
    select: (data) => {
      return data.data
    }
  })
}

export function useTopPopularCategories() {
  return useQuery({
    queryKey: ["categories/popular"],
    queryFn: () => categoryService.getTopPopularCategories(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    select: (data) => {
      return data.data
    }
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => categoryService.getCategoryById(id),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: !!id,
  })
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ["categoryBySlug", slug],
    queryFn: () => categoryService.getCategoryBySlug(slug),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: !!slug,
    select: (data) => {
      return data.data
    }
  })
}

export function useCategoriesByBrandyId(id: string) {
  return useQuery({
    queryKey: ["categoriesByBrandId", id],
    queryFn: () => categoryService.getCategoriesByBrandId(id),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: !!id,
    select: (data) => {
      return data.data
    },
  })
}



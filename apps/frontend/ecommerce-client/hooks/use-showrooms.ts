"use client";

import { useQuery } from "@tanstack/react-query";
import showroomService from "@/services/showroom-service";

export function useShowrooms(province?: string) {
  return useQuery({
    queryKey: ["showrooms", province],
    queryFn: async () => {
      const res = await showroomService.getShowrooms(province ? { province } : undefined);
      return res.data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useProductStock(productId: string | undefined, skuId?: string) {
  return useQuery({
    queryKey: ["product-stock", productId, skuId],
    queryFn: async () => {
      if (!productId) return [];
      const res = await showroomService.checkProductStock(productId, skuId);
      return res.data || [];
    },
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

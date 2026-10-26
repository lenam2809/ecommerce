"use client";

import { useQuery } from "@tanstack/react-query";
import productService from "@/services/product-service";

export function useCompareMatrix(productIds: string[]) {
  const idsString = productIds.filter(Boolean).join(",");

  return useQuery({
    queryKey: ["compare-matrix", idsString],
    queryFn: async () => {
      if (!idsString) return null;
      const res = await productService.getCompareMatrix(idsString);
      return res.data || null;
    },
    enabled: Boolean(idsString),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

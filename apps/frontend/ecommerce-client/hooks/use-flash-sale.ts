"use client";

import { useQuery } from "@tanstack/react-query";
import flashSaleService from "@/services/flash-sale-service";

export function useFlashSale() {
  return useQuery({
    queryKey: ["flash-sale-current"],
    queryFn: async () => {
      const res = await flashSaleService.getCurrentFlashSale();
      return res.data || null;
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // 1 minute
  });
}

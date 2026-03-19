// use-about.ts
"use client";

import { useQuery } from "@tanstack/react-query"
import aboutService from "@/services/about-service";

export function useAbout() {
    return useQuery({
        queryKey: ["about"],
        queryFn: () => aboutService.getAboutActive(),
        staleTime: 1000 * 60 * 10, // 10 minutes
        select: (data) => {
            return data.data
        },
        throwOnError: true,
    })
}

export function useAllAbout() {
    return useQuery({
        queryKey: ["about", "all"],
        queryFn: () => aboutService.getAbout(),
        staleTime: 1000 * 60 * 10, // 10 minutes
        select: (data) => {
            return data.data
        },
        throwOnError: true,
    })
}
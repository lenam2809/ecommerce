// use-search-suggestions.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import searchSuggestionsService from "@/services/search-suggestions-service";
import { SaveSearchHistoryRequest } from "@/types/search-suggestion";

export function useSearchSuggestions(query?: string, limit: number = 5) {
    return useQuery({
        queryKey: ["searchSuggestions", "search", query, limit],
        queryFn: () => searchSuggestionsService.getSearchSuggestions(query, limit),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!query && query.length > 0, // Chỉ gọi API khi có query
        select: (data) => {
            return data.data
        },
        throwOnError: true,
    });
}

export function useTrendingSuggestions(limit: number = 10) {
    return useQuery({
        queryKey: ["searchSuggestions", "trending", limit],
        queryFn: () => searchSuggestionsService.getTrendingSuggestions(limit),
        staleTime: 1000 * 60 * 10, // 10 minutes
        select: (data) => {
            return data.data
        },
        throwOnError: true,
    });
}

export function useSaveSearchHistory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: SaveSearchHistoryRequest) =>
            searchSuggestionsService.saveSearchHistory(request),
        onSuccess: () => {
            // Invalidate trending queries when a new search is recorded
            queryClient.invalidateQueries({
                queryKey: ["searchSuggestions", "trending"]
            });
        }
    });
}

export function useDeleteSearchHistory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => searchSuggestionsService.deleteSearchHistory(id),
        onSuccess: (_, id) => {
            // Update any cached query data that might contain this suggestion
            queryClient.invalidateQueries({
                queryKey: ["searchSuggestions"]
            });
        }
    });
}

export function useClearSearchHistory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => searchSuggestionsService.clearSearchHistory(userId),
        onSuccess: () => {
            // Clear all search suggestions from cache
            queryClient.invalidateQueries({
                queryKey: ["searchSuggestions"]
            });
        }
    });
}
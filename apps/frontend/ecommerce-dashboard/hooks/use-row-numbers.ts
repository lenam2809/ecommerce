"use client"

import { useMemo } from "react"

interface UseRowNumbersProps {
    currentPage: number
    pageSize: number
    totalItems: number
    isLoading: boolean
}

export function useRowNumbers({ currentPage, pageSize, totalItems, isLoading }: UseRowNumbersProps) {
    const rowNumbers = useMemo(() => {
        if (isLoading) {
            // Return placeholder numbers for loading state
            return Array.from({ length: pageSize }, (_, i) => ({
                absolute: (currentPage - 1) * pageSize + i + 1,
                relative: i + 1,
                isLoading: true,
            }))
        }

        // Calculate the starting index for the current page
        const startIndex = (currentPage - 1) * pageSize

        // Generate row numbers for the current page
        return Array.from({ length: Math.min(pageSize, totalItems - startIndex) }, (_, i) => ({
            absolute: startIndex + i + 1, // Absolute position in the entire dataset
            relative: i + 1, // Relative position on the current page
            isLoading: false,
        }))
    }, [currentPage, pageSize, totalItems, isLoading])

    return rowNumbers
}

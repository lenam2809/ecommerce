"use client"
import { useWishlist } from "@/hooks/use-wishlist"
import React, { createContext, useContext } from "react"

// Define the WishlistContext type
type WishlistContextType = ReturnType<typeof useWishlist> | undefined

// Create the context with initial undefined value
const WishlistContext = createContext<WishlistContextType>(undefined)

// Provider component
export function WishlistProvider({ children }: { children: React.ReactNode }) {
    // Use the wishlist hook to get all wishlist functionality
    const wishlist = useWishlist()


    // Changing approach: Modifying Header instead to not assume wishlist exists.

    return (
        <WishlistContext.Provider value={wishlist}>
            {children}
        </WishlistContext.Provider>
    )
}

// Custom hook to use the wishlist context
export function useWishlistContext() {
    const context = useContext(WishlistContext)

    if (context === undefined) {
        throw new Error("useWishlistContext must be used within a WishlistProvider")
    }

    return context
}
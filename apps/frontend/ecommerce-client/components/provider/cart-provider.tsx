"use client"
import React, { createContext, useContext } from "react"
import { useCart } from "@/hooks/use-cart"

// Define the CartContext type
type CartContextType = ReturnType<typeof useCart> | undefined

// Create the context with initial undefined value
const CartContext = createContext<CartContextType>(undefined)

// Provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
    // Use the cart hook to get all cart functionality
    const cart = useCart()

    return (
        <CartContext.Provider value={cart}>
            {children}
        </CartContext.Provider>
    )
}

// Custom hook to use the cart context
export function useCartContext() {
    const context = useContext(CartContext)

    if (context === undefined) {
        throw new Error("useCartContext must be used within a CartProvider")
    }

    return context
}
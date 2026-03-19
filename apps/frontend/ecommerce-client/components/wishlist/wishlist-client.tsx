// components/wishlist/wishlist-client.tsx
"use client"

import { useWishlist } from "@/hooks/use-wishlist"
import WishlistItem from "./wishlist-item"
import EmptyWishlist from "./empty-wishlist"
import WishlistLoading from "./wishlist-loading"
import WishlistError from "./wishlist-error"

export default function WishlistClient() {
    const { wishlistItems, isLoading, error, removeFromWishlist, isEmpty } = useWishlist()

    if (isLoading) return <WishlistLoading />
    if (error) return <WishlistError />
    if (isEmpty || wishlistItems.length === 0) return <EmptyWishlist />

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
                <WishlistItem
                    key={product.productId}
                    product={product}
                    onRemove={removeFromWishlist}
                />
            ))}
        </div>
    )
}
export interface WishlistItem {
    productId: string
    productName: string
    price: number
    imageUrl: string
    dateAdded: string
    slug: string
}

export interface Wishlist {
    id: string
    applicationUserId: string
    items: WishlistItem[]
    wishlistItemLimit: number
}
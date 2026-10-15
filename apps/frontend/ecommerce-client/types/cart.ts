
export interface CartItem {
    id?: string
    cartId: string
    productId: string
    name: string
    price: number
    quantity: number
    image: string
    color?: string
    size?: string
}

export interface Cart {
    items: CartItem[]
    subtotal: number
    shippingCost: number
    discount: number
    total: number
}
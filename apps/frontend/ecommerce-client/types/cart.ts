export interface CartItem {
    id?: string;
    cartId: string;
    productId: string;
    productVariantSkuId?: string;
    slug?: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    color?: string;
    size?: string;
    addOnId?: string;
    addOnName?: string;
    addOnPrice?: number;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
}
// components/cart/CartItems.tsx
import React from "react";
import CartItemsHeader from "./CartItemsHeader";
import CartItem from "./CartItem";
import { CartItem as CartItemType } from "@/types/cart";

type CartItemsProps = {
    items: CartItemType[];
    onUpdateQuantity: (itemId: string, quantity: number) => void;
    onRemoveItem: (itemId: string) => void;
    isUpdatingCartItem: boolean;
    isRemovingCartItem: boolean;
};

const CartItems = ({
    items,
    onUpdateQuantity,
    onRemoveItem,
    isUpdatingCartItem,
    isRemovingCartItem,
}: CartItemsProps) => {
    if (items.length === 0) {
        return (
            <div className="p-8 text-center">
                <p className="text-muted-foreground">Không có sản phẩm nào trong giỏ hàng</p>
            </div>
        );
    }

    return (
        <div>
            <CartItemsHeader />
            <div className="divide-y">
                {items.map((item) => (
                    <CartItem
                        key={item.productId}
                        item={item}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemove={onRemoveItem}
                        isUpdating={isUpdatingCartItem}
                        isRemoving={isRemovingCartItem}
                    />
                ))}
            </div>
        </div>
    );
};

export default CartItems;
// components/cart/CartContent.tsx
import React from "react";
import CartActions from "./CartActions";
import OrderSummary from "./OrderSummary";
import { Cart } from "@/types/cart";
import CartItems from "./CartItems";

type CartContentProps = {
    cart: Cart;
    updateCartItem: (params: { itemId: string; quantity: number }) => void;
    removeCartItem: (itemId: string) => void;
    clearCart: () => void;
    applyPromoCode: (code: string) => void;
    isUpdatingCartItem: boolean;
    isRemovingCartItem: boolean;
    isClearingCart: boolean;
    isApplyingPromoCode: boolean;
};

const CartContent = ({
    cart,
    updateCartItem,
    removeCartItem,
    clearCart,
    applyPromoCode,
    isUpdatingCartItem,
    isRemovingCartItem,
    isClearingCart,
    isApplyingPromoCode,
}: CartContentProps) => {
    const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        updateCartItem({ itemId, quantity: newQuantity });
    };

    // Calculate total items count
    const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="glass-card rounded-xl overflow-hidden">
                    <CartItems
                        items={cart.items}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={removeCartItem}
                        isUpdatingCartItem={isUpdatingCartItem}
                        isRemovingCartItem={isRemovingCartItem}
                    />
                </div>
                <CartActions onClearCart={clearCart} isClearingCart={isClearingCart} />
            </div>
            <div className="lg:col-span-1">
                <OrderSummary
                    subtotal={cart.subtotal}
                    shippingCost={cart.shippingCost}
                    discount={cart.discount}
                    total={cart.total}
                    itemCount={itemCount}
                    onApplyPromoCode={applyPromoCode}
                    isApplyingPromoCode={isApplyingPromoCode}
                />
            </div>
        </div>
    );
};

export default CartContent;
// components/cart/CartHeader.tsx
import React from "react";

const CartHeader = () => {
    return (
        <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl tech-heading text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70 mb-2">Giỏ hàng của bạn</h1>
            <p className="text-muted-foreground tech-label tracking-wide">Quản lý sản phẩm và tiến hành thanh toán</p>
        </div>
    );
};

export default CartHeader;
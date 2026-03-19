// components/cart/CartItemsHeader.tsx
import React from "react";

const CartItemsHeader = () => {
    return (
        <div className="p-5 border-b border-white/10 bg-white/5 hidden sm:block">
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-5">
                    <h3 className="text-sm font-medium text-muted-foreground w-fit">Sản phẩm</h3>
                </div>
                <div className="col-span-2 text-center">
                    <h3 className="text-sm font-medium text-muted-foreground">Giá</h3>
                </div>
                <div className="col-span-2 text-center pr-0">
                    <h3 className="text-sm font-medium text-muted-foreground">Số lượng</h3>
                </div>
                <div className="col-span-3 text-right">
                    <h3 className="text-sm font-medium text-muted-foreground">Tổng</h3>
                </div>
            </div>
        </div>
    );
};

export default CartItemsHeader;
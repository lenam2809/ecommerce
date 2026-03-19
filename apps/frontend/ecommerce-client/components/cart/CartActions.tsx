// components/cart/CartActions.tsx
import React from "react";
import Link from "next/link";
import { ChevronRight, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

type CartActionsProps = {
    onClearCart: () => void;
    isClearingCart: boolean;
};

const CartActions = ({ onClearCart, isClearingCart }: CartActionsProps) => {
    return (
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-between items-start">
            <Link
                href="/products"
                className="text-primary hover:underline flex items-center mb-4 sm:mb-0 font-medium hover:text-primary/80 transition-colors duration-150 group"
            >
                <ChevronRight className="h-4 w-4 mr-1.5 rotate-180 group-hover:-translate-x-1 transition-transform duration-150" />
                Tiếp tục mua sắm
            </Link>

            <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 transition-colors duration-150 flex items-center"
                onClick={onClearCart}
                disabled={isClearingCart}
            >
                <Trash className="h-4 w-4 mr-2" />
                {isClearingCart ? "Đang xóa..." : "Xóa giỏ hàng"}
            </Button>
        </div>
    );
};

export default CartActions;
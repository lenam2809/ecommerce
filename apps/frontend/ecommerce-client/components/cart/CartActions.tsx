// components/cart/CartActions.tsx
import React from "react";
import Link from "next/link";
import { ChevronLeft, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

type CartActionsProps = {
    onClearCart: () => void;
    isClearingCart: boolean;
};

const CartActions = ({ onClearCart, isClearingCart }: CartActionsProps) => {
    return (
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-between items-start gap-4">
            <Link
                href="/products"
                className="inline-flex items-center text-small font-medium text-ink-soft hover:text-brand transition-colors duration-150 focus-ring rounded-sm"
            >
                <ChevronLeft className="h-4 w-4 mr-1.5" />
                Tiếp tục mua sắm
            </Link>

            <Button
                variant="outline"
                className="rounded-full border-white/10 text-ink-faint hover:text-status-danger hover:border-status-danger/40 hover:bg-status-danger-soft transition-colors duration-150 flex items-center"
                onClick={onClearCart}
                disabled={isClearingCart}
            >
                <Trash className="h-4 w-4 mr-2" />
                {isClearingCart ? "Đang xóa..." : "Xóa tất cả"}
            </Button>
        </div>
    );
};

export default CartActions;

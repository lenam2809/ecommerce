import React from 'react';
import { Button } from './ui/button';
import { ShoppingCart, Ban } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { analytics } from '@/lib/analytics';

interface AddToCartButtonProps {
    productId: string;
    stockQuantity?: number; // undefined = không check (backward-compatible), 0 = hết hàng
    title?: string;
    className?: string;
    productName?: string;
    price?: number;
    category?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ 
    productId, stockQuantity, title, className, productName, price, category 
}) => {
    const { addToCart, isAddingToCart } = useCart()

    const isOutOfStock = stockQuantity !== undefined && stockQuantity === 0
    const isDisabled = isAddingToCart || isOutOfStock

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigating if inside a Link
        if (isOutOfStock) return
        addToCart({
            productId,
            quantity: 1,
            options: {},
        })
        
        if (productName && price !== undefined) {
             analytics.trackAddToCart({
                 id: productId,
                 name: productName,
                 price: price,
                 category: category
             }, 1)
        }
    }

    if (title && !isOutOfStock) {
        return (
            <Button
                size="sm"
                className={cn("bg-primary hover:bg-primary/90 text-primary-foreground", className)}
                onClick={handleAddToCart}
                disabled={isDisabled}
                title={title}
            >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Thêm vào giỏ
            </Button>
        )
    }

    if (isOutOfStock) {
        return (
            <Button
                size="sm"
                disabled
                title="Sản phẩm đã hết hàng"
                className={cn(
                    "w-full bg-muted text-muted-foreground cursor-not-allowed border border-border/50",
                    className
                )}
            >
                <Ban className="h-4 w-4 mr-2" />
                Hết hàng
            </Button>
        )
    }

    return (
        <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isDisabled}
            title="Thêm vào giỏ hàng"
            className={cn("w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors", className)}
        >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Thêm vào giỏ
        </Button>
    )
};

export default AddToCartButton;
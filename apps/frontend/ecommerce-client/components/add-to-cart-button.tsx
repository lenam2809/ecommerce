import React from 'react';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { title } from 'process';

import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
    productId: string;
    title?: string;
    className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ productId, title, className }) => {
    const { addToCart, isAddingToCart } = useCart()
    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if inside a Link
        addToCart({
            productId: productId,
            quantity: 1,
            options: {},
        })
    }
    if (title) {
        return <Button
            size="sm"
            className={cn("bg-primary hover:bg-primary/90 text-primary-foreground", className)}
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            title={title}
        >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Thêm vào giỏ
        </Button>
    }
    return (
        <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            title="Thêm vào giỏ hàng"
            className={cn("w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors", className)}
        >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Thêm vào giỏ
        </Button>
    )
};

export default AddToCartButton;
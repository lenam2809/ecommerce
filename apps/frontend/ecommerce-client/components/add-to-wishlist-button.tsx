"use client"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useWishlist } from "@/hooks/use-wishlist"

interface AddToWishlistButtonProps {
    productId: string
    className?: string
    size?: "default" | "sm" | "lg" | "icon"
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export default function AddToWishlistButton({
    productId,
    className,
    size = "icon",
    variant = "ghost",
}: AddToWishlistButtonProps) {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
    const [isAnimating, setIsAnimating] = useState(false)

    const inWishlist = isInWishlist(productId)

    const handleToggleWishlist = () => {
        setIsAnimating(true)

        if (inWishlist) {
            removeFromWishlist(productId)
        } else {
            addToWishlist(productId)
        }

        // Reset animation after a short delay
        setTimeout(() => setIsAnimating(false), 300)
    }

    return (
        <Button
            size={size}
            variant={variant}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleToggleWishlist()
            }}
            className={cn(
                "h-8 w-8 rounded-full transition-all duration-300 shadow-sm",
                inWishlist
                    ? "text-red-500 hover:text-red-600"
                    : "text-gray-600 dark:text-gray-300 hover:bg-pink-500 hover:text-white dark:hover:bg-pink-600",
                isAnimating && "scale-110",
                className,
            )}
            aria-label={inWishlist ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
        >
            <Heart
                className={cn("h-4 w-4 transition-all duration-300", inWishlist && "fill-current", isAnimating && "scale-110")}
            />
            <span className="sr-only">{inWishlist ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}</span>
        </Button>
    )
}

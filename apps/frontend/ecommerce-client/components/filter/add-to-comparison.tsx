"use client"

import { useState, useEffect } from "react"
import { SplitSquareVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types/product"
import { AppToaster } from "@/components/toast/app-toaster"
import { cn } from "@/lib/utils"

interface AddToComparisonProps {
    product: Product
    className?: string
}

export default function AddToComparison({ product, className }: AddToComparisonProps) {
    const [isInComparison, setIsInComparison] = useState(false)

    // Check if product is already in comparison
    useEffect(() => {
        const storedProducts = localStorage.getItem("comparedProducts")
        if (storedProducts) {
            const comparedProducts = JSON.parse(storedProducts)
            setIsInComparison(comparedProducts.some((p: Product) => p.id === product.id))
        }
    }, [product.id])

    const toggleComparison = () => {
        const storedProducts = localStorage.getItem("comparedProducts")
        let comparedProducts: Product[] = storedProducts ? JSON.parse(storedProducts) : []

        if (isInComparison) {
            // Remove from comparison
            comparedProducts = comparedProducts.filter((p: Product) => p.id !== product.id)
            localStorage.setItem("comparedProducts", JSON.stringify(comparedProducts))
            setIsInComparison(false)
            AppToaster.info("Đã xóa khỏi so sánh", {
                description: `${product.name} đã được xóa khỏi danh sách so sánh.`,
            })
        } else {
            // Add to comparison
            if (comparedProducts.length >= 4) {
                AppToaster.warning("Không thể thêm sản phẩm", {
                    description: "Bạn chỉ có thể so sánh tối đa 4 sản phẩm.",
                })
                return
            }

            comparedProducts.push(product)
            localStorage.setItem("comparedProducts", JSON.stringify(comparedProducts))
            setIsInComparison(true)
            AppToaster.success("Đã thêm vào so sánh", {
                description: `${product.name} đã được thêm vào danh sách so sánh.`,
            })
        }

        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent("comparisonUpdated"))
    }

    return (
        <Button
            variant={isInComparison ? "default" : "outline"}
            size="icon"
            className={cn(
                "transition-all duration-200",
                isInComparison
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-primary border-primary/30 hover:bg-primary/10",
                className
            )}
            onClick={toggleComparison}
            title={isInComparison ? "Xóa khỏi so sánh" : "Thêm vào so sánh"}
        >
            <SplitSquareVertical className="h-4 w-4" />
            <span className="sr-only">{isInComparison ? "Xóa khỏi so sánh" : "Thêm vào so sánh"}</span>
        </Button>
    )
}

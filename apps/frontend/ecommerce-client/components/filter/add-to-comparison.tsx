"use client"

import { useState, useEffect } from "react"
import { SplitSquareVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types/product"
import { AppToaster } from "@/components/toast/app-toaster"

interface AddToComparisonProps {
    product: Product
}

export default function AddToComparison({ product }: AddToComparisonProps) {
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
            className={isInComparison ? "bg-[#2A5CAA] text-white" : "text-[#2A5CAA] border-[#2A5CAA]"}
            onClick={toggleComparison}
            title={isInComparison ? "Xóa khỏi so sánh" : "Thêm vào so sánh"}
        >
            <SplitSquareVertical className="h-4 w-4" />
            <span className="sr-only">{isInComparison ? "Xóa khỏi so sánh" : "Thêm vào so sánh"}</span>
        </Button>
    )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { formatPrice } from "@/lib/contants"
import { Product } from "@/types/product"

export default function ProductComparison() {
    const [comparedProducts, setComparedProducts] = useState<Product[]>([])
    const router = useRouter()

    // Load compared products from localStorage
    useEffect(() => {
        const storedProducts = localStorage.getItem("comparedProducts")
        if (storedProducts) {
            setComparedProducts(JSON.parse(storedProducts))
        }
    }, [])

    // Save compared products to localStorage
    useEffect(() => {
        localStorage.setItem("comparedProducts", JSON.stringify(comparedProducts))
    }, [comparedProducts])

    // Add product to comparison
    // Remove product from comparison
    const removeFromComparison = (productId: string) => {
        setComparedProducts(comparedProducts.filter((p) => p.id !== productId))
    }

    // Clear all compared products
    const clearComparison = () => {
        setComparedProducts([])
    }

    // Navigate to comparison page
    const goToComparisonPage = () => {
        if (comparedProducts.length < 2) {
            alert("Vui lòng chọn ít nhất 2 sản phẩm để so sánh")
            return
        }

        const productIds = comparedProducts.map((p) => p.id).join(",")
        router.push(`/compare?ids=${productIds}`)
    }

    return (
        <div>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="relative" disabled={comparedProducts.length === 0}>
                        So sánh sản phẩm
                        {comparedProducts.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#2A5CAA] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {comparedProducts.length}
                            </span>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[400px]">
                    <SheetHeader>
                        <SheetTitle>So sánh sản phẩm</SheetTitle>
                        <SheetDescription>Chọn tối đa 4 sản phẩm để so sánh chi tiết.</SheetDescription>
                    </SheetHeader>

                    <div className="mt-4">
                        {comparedProducts.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Chưa có sản phẩm nào được chọn để so sánh</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-4 overflow-x-auto pb-4">
                                    {comparedProducts.map((product) => (
                                        <div key={product.id} className="min-w-[200px] border rounded-md p-3 relative">
                                            <button
                                                className="absolute top-2 right-2 bg-gray-100 rounded-full p-1"
                                                onClick={() => removeFromComparison(product.id)}
                                            >
                                                <X className="h-4 w-4" />
                                                <span className="sr-only">Remove</span>
                                            </button>

                                            <div className="flex flex-col items-center">
                                                <div className="relative w-24 h-24 mb-2">
                                                    <Image
                                                        src={product.mainImage || "/placeholder.svg"}
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                                <h3 className="text-sm font-medium line-clamp-2 text-center mb-1">{product.name}</h3>
                                                <p className="text-[#FF6B00] font-semibold">
                                                    {formatPrice(product.salePrice || product.price)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between mt-4">
                                    <Button variant="outline" onClick={clearComparison}>
                                        Xóa tất cả
                                    </Button>
                                    <Button onClick={goToComparisonPage} disabled={comparedProducts.length < 2}>
                                        So sánh chi tiết
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X, ArrowRight, ArrowLeftRight, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/contants"
import { formatImageUrl } from "@/lib/utils"
import { Product } from "@/types/product"

export default function ProductComparison() {
    const [comparedProducts, setComparedProducts] = useState<Product[]>([])
    const [isCollapsed, setIsCollapsed] = useState(false)
    const router = useRouter()

    const loadComparedProducts = useCallback(() => {
        try {
            const storedProducts = localStorage.getItem("comparedProducts")
            if (storedProducts) {
                const parsed = JSON.parse(storedProducts)
                setComparedProducts(Array.isArray(parsed) ? parsed : [])
            } else {
                setComparedProducts([])
            }
        } catch {
            setComparedProducts([])
        }
    }, [])

    useEffect(() => {
        loadComparedProducts()
        window.addEventListener("comparisonUpdated", loadComparedProducts)
        return () => window.removeEventListener("comparisonUpdated", loadComparedProducts)
    }, [loadComparedProducts])

    const removeFromComparison = (productId: string) => {
        const updated = comparedProducts.filter((p) => p.id !== productId)
        setComparedProducts(updated)
        localStorage.setItem("comparedProducts", JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent("comparisonUpdated"))
    }

    const clearComparison = () => {
        setComparedProducts([])
        localStorage.removeItem("comparedProducts")
        window.dispatchEvent(new CustomEvent("comparisonUpdated"))
    }

    const goToComparisonPage = () => {
        const productIds = comparedProducts.map((p) => p.id).join(",")
        router.push(productIds ? `/compare?ids=${productIds}` : "/compare")
    }

    if (comparedProducts.length === 0) return null

    const emptySlots = Math.max(0, 4 - comparedProducts.length)

    return (
        <div className="fixed bottom-4 inset-x-0 z-50 max-w-5xl mx-auto px-3 sm:px-6 pointer-events-none">
            <div className="pointer-events-auto bg-card/95 dark:bg-[#111827]/95 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
                {/* Top Header Strip of Floating Compare Bar */}
                <div className="px-4 py-2.5 bg-surface/80 dark:bg-[#090D16]/80 border-b border-border/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {comparedProducts.length}
                        </span>
                        <span className="text-xs sm:text-small font-bold text-foreground">
                            Thanh so sánh thiết bị ({comparedProducts.length}/4)
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={clearComparison}
                            className="inline-flex items-center gap-1 text-tiny text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/10"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Xóa tất cả</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCollapsed((prev) => !prev)}
                            className="inline-flex items-center gap-1 text-tiny font-semibold text-primary hover:underline px-2 py-1 rounded-lg hover:bg-primary/10"
                            aria-label={isCollapsed ? "Mở rộng thanh so sánh" : "Thu gọn thanh so sánh"}
                        >
                            <span>{isCollapsed ? "Mở rộng" : "Thu gọn"}</span>
                            {isCollapsed ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Expandable 4-Slot Compare Matrix Bar */}
                {!isCollapsed && (
                    <div className="p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1">
                            {comparedProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="relative flex items-center gap-2.5 p-2 rounded-xl bg-surface dark:bg-[#182234] border border-border/80 min-w-0"
                                >
                                    <button
                                        type="button"
                                        onClick={() => removeFromComparison(product.id)}
                                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-slate-800 text-white hover:bg-destructive flex items-center justify-center shadow-xs transition-colors"
                                        aria-label={`Xóa ${product.name} khỏi so sánh`}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                    <div className="relative h-10 w-10 rounded-lg bg-white dark:bg-[#090D16] p-1 shrink-0 overflow-hidden border border-border/50">
                                        <Image
                                            src={formatImageUrl(product.mainImage)}
                                            alt={product.name}
                                            fill
                                            sizes="40px"
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-semibold text-foreground truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-[11px] font-bold text-primary tabular-nums whitespace-nowrap">
                                            {formatPrice(product.salePrice || product.price)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {Array.from({ length: emptySlots }).map((_, idx) => (
                                <div
                                    key={`empty-${idx}`}
                                    className="hidden sm:flex items-center justify-center gap-1.5 p-2 rounded-xl border border-dashed border-border text-muted-foreground text-tiny min-h-[56px]"
                                >
                                    <Plus className="h-3.5 w-3.5 opacity-60" />
                                    <span>Thêm sản phẩm</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                onClick={goToComparisonPage}
                                className="w-full md:w-auto h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-small font-bold shadow-md flex items-center justify-center gap-2"
                            >
                                <ArrowLeftRight className="h-4 w-4" />
                                <span>So sánh ngay ({comparedProducts.length})</span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

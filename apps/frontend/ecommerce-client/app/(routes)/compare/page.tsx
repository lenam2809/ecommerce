// app/(routes)/compare/page.tsx
"use client"

import { logger } from '@/lib/logger'
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star, AlertCircle, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/contants"
import AddToCartButton from "@/components/add-to-cart-button"
import { Product } from "@/types/product"
import { Skeleton } from "@/components/ui/skeleton"

export default function ComparePage() {
    return (
        <Suspense fallback={
            <div className="container py-8 space-y-8">
                <div className="glass-card rounded-3xl p-8 border-white/5">
                    <div className="flex justify-between mb-8">
                        <Skeleton className="h-10 w-48 rounded-xl bg-secondary/50" />
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                        <Skeleton className="h-96 w-full rounded-2xl bg-secondary/30" />
                        <Skeleton className="h-96 w-full rounded-2xl bg-secondary/30" />
                        <Skeleton className="h-96 w-full rounded-2xl bg-secondary/30" />
                    </div>
                </div>
            </div>
        }>
            <CompareContent />
        </Suspense>
    )
}

function CompareContent() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const fetchProducts = async () => {
            const productIds = searchParams.get("ids")

            if (!productIds) {
                // If no IDs, just stop loading, render empty state will handle redirect button
                // Or auto redirect
                setLoading(false)
                return
            }

            try {
                // In a real app, you would fetch the products from the API
                // For now, we'll get them from localStorage
                const storedProducts = localStorage.getItem("comparedProducts")
                if (storedProducts) {
                    const allProducts = JSON.parse(storedProducts)
                    const idsToCompare = productIds.split(",")
                    const filteredProducts = allProducts.filter((p: Product) => idsToCompare.includes(p.id))
                    setProducts(filteredProducts)
                }
            } catch (error) {
                logger.error("Error fetching products:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [searchParams, router])

    if (loading) {
        return (
            <div className="container py-8 space-y-8">
                <div className="glass-card rounded-3xl p-8 border-white/5">
                    <div className="flex justify-between mb-8">
                        <Skeleton className="h-10 w-48 rounded-xl bg-secondary/50" />
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                        <Skeleton className="h-96 w-full rounded-2xl bg-secondary/30" />
                        <Skeleton className="h-96 w-full rounded-2xl bg-secondary/30" />
                        <Skeleton className="h-96 w-full rounded-2xl bg-secondary/30" />
                    </div>
                </div>
            </div>
        )
    }

    if (products.length < 2) {
        return (
            <div className="container py-12 flex justify-center">
                <div className="glass-card rounded-3xl p-12 text-center max-w-md w-full border-white/5">
                    <div className="h-24 w-24 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl tech-heading mb-3">Chưa đủ sản phẩm</h2>
                    <p className="text-muted-foreground mb-8">
                        Vui lòng chọn ít nhất 2 sản phẩm để thực hiện so sánh chi tiết.
                    </p>
                    <Button asChild className="btn-glow w-full rounded-full py-6 text-base">
                        <Link href="/products">Quay lại trang sản phẩm</Link>
                    </Button>
                </div>
            </div>
        )
    }

    // Get all unique specifications
    const allSpecs = new Set<string>()
    products.forEach((product) => {
        if (product.specifications) {
            Object.keys(product.specifications).forEach((key) => {
                allSpecs.add(key)
            })
        }
    })

    // Sort specs if needed, or predefined list
    const sortedSpecs = Array.from(allSpecs)

    return (
        <div className="container py-8">
            <div className="mb-6">
                <Button variant="ghost" className="hover:bg-secondary/50 rounded-full pl-0" asChild>
                    <Link href="/products" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại trang sản phẩm
                    </Link>
                </Button>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden border-white/5">
                <div className="p-8 border-b border-white/5 bg-gradient-to-r from-secondary/20 to-transparent">
                    <h1 className="text-3xl tech-heading">So sánh sản phẩm</h1>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="p-6 min-w-[200px] text-muted-foreground font-medium border-b border-white/5 bg-secondary/10">Thông tin sản phẩm</th>
                                {products.map((product) => (
                                    <th key={product.id} className="p-6 min-w-[250px] border-b border-white/5 border-l border-white/5">
                                        <div className="flex flex-col items-center group">
                                            <Link href={`/product/${product.slug || product.id}`} className="relative w-40 h-40 mb-4 rounded-xl overflow-hidden bg-background/50 p-2 transition-transform hover:scale-105">
                                                <Image
                                                    src={product.mainImage || "/placeholder.svg"}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </Link>
                                            <Link href={`/product/${product.slug || product.id}`} className="font-semibold text-lg text-foreground hover:text-primary text-center line-clamp-2 transition-colors">
                                                {product.name}
                                            </Link>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {/* Price Row */}
                            <tr className="bg-secondary/5 hover:bg-secondary/10 transition-colors">
                                <td className="p-6 font-semibold text-foreground bg-secondary/10">Giá bán</td>
                                {products.map((product) => (
                                    <td key={`${product.id}-price`} className="p-6 text-center border-l border-white/5">
                                        {product.salePrice ? (
                                            <div className="flex flex-col items-center">
                                                <span className="text-xl font-bold text-red-500">{formatPrice(product.salePrice)}</span>
                                                <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">{formatPrice(product.price)}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xl font-bold text-foreground">{formatPrice(product.price)}</span>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Rating Row */}
                            <tr className="hover:bg-secondary/10 transition-colors">
                                <td className="p-6 font-medium text-foreground bg-secondary/10">Đánh giá</td>
                                {products.map((product) => (
                                    <td key={`${product.id}-rating`} className="p-6 text-center border-l border-white/5">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="font-bold text-lg">{product.rating.toFixed(1)}</span>
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Dynamic Specs */}
                            {sortedSpecs.map((spec) => (
                                <tr key={spec} className="hover:bg-secondary/10 transition-colors">
                                    <td className="p-6 font-medium text-muted-foreground capitalize bg-secondary/10">
                                        {spec.replace(/_/g, " ")}
                                    </td>
                                    {products.map((product) => {
                                        const matchedSpec = product.specifications?.find(
                                            (s) => s.name === spec
                                        );
                                        return (
                                            <td key={`${product.id}-${spec}`} className="p-6 text-center border-l border-white/5">
                                                {matchedSpec ? (
                                                    <span className="font-medium">{matchedSpec.value}</span>
                                                ) : (
                                                    <span className="text-muted-foreground/30">—</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}

                            {/* Actions Row */}
                            <tr className="bg-secondary/5">
                                <td className="p-6 font-medium bg-secondary/10"></td>
                                {products.map((product) => (
                                    <td key={`${product.id}-actions`} className="p-6 text-center border-l border-white/5">
                                        <div className="flex flex-col gap-3">
                                            <AddToCartButton productId={product.id} />
                                            <Button variant="ghost" size="sm" asChild className="w-full text-muted-foreground hover:text-foreground">
                                                <Link href={`/product/${product.slug || product.id}`}>Xem chi tiết</Link>
                                            </Button>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

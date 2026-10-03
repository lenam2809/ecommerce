// app/(routes)/compare/page.tsx
"use client"

import { logger } from '@/lib/logger'
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/contants"
import AddToCartButton from "@/components/add-to-cart-button"
import { Product } from "@/types/product"
import { Skeleton } from "@/components/ui/skeleton"

export default function ComparePage() {
    return (
        <Suspense fallback={
            <div className="container-app py-8 space-y-8">
                <div className="bg-card rounded-3xl p-8 border border-line">
                    <div className="flex justify-between mb-8">
                        <Skeleton className="h-10 w-48 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                        <Skeleton className="h-96 w-full rounded-2xl" />
                        <Skeleton className="h-96 w-full rounded-2xl" />
                        <Skeleton className="h-96 w-full rounded-2xl" />
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
            <div className="container-app py-8 space-y-8">
                <div className="bg-card rounded-3xl p-8 border border-line">
                    <div className="flex justify-between mb-8">
                        <Skeleton className="h-10 w-48 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                        <Skeleton className="h-96 w-full rounded-2xl" />
                        <Skeleton className="h-96 w-full rounded-2xl" />
                        <Skeleton className="h-96 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        )
    }

    if (products.length < 2) {
        return (
            <div className="container-app py-12 flex justify-center">
                <div className="bg-card rounded-3xl p-12 text-center max-w-md w-full border border-line">
                    <div className="h-24 w-24 rounded-full bg-surface flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-10 w-10 text-ink-faint" />
                    </div>
                    <h2 className="text-h2 font-semibold text-ink mb-3">Chưa đủ sản phẩm</h2>
                    <p className="text-ink-soft mb-8">
                        Vui lòng chọn ít nhất 2 sản phẩm để thực hiện so sánh chi tiết.
                    </p>
                    <Button asChild className="rounded-full bg-brand text-white hover:bg-brand-hover w-full h-12 text-small font-semibold">
                        <Link href="/products">Quay lại trang sản phẩm</Link>
                    </Button>
                </div>
            </div>
        )
    }

    // Get all unique specifications
    const allSpecs = new Set<string>()
    products.forEach((product) => {
        if (Array.isArray(product.specifications)) {
            product.specifications.forEach((s) => {
                if (s.name) allSpecs.add(s.name)
            })
        }
    })

    const sortedSpecs = Array.from(allSpecs)

    return (
        <div className="container-app py-8 md:py-12">
            <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" className="hover:bg-surface rounded-full text-ink-soft hover:text-brand px-3" asChild>
                    <Link href="/products" className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại danh mục sản phẩm
                    </Link>
                </Button>
            </div>

            <div className="bg-card rounded-3xl overflow-hidden border border-line shadow-xs">
                <div className="p-6 md:p-8 border-b border-line/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-tiny font-bold uppercase tracking-widest text-brand mb-1">Ma trận thông số</p>
                        <h1 className="text-h2 font-bold tracking-tight text-ink">So sánh chi tiết thiết bị</h1>
                        <p className="text-small text-ink-soft mt-1">Đối chiếu trực quan thông số kỹ thuật giữa {products.length} sản phẩm</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-line/70">
                                <th className="p-6 min-w-[200px] text-tiny font-bold uppercase tracking-wider text-ink-faint bg-surface/50 align-top">
                                    Thiết bị
                                </th>
                                {products.map((product) => (
                                    <th key={product.id} className="p-6 min-w-[260px] border-l border-line/70 align-top bg-card">
                                        <div className="flex flex-col items-center group text-center">
                                            <Link href={`/product/${product.slug || product.id}`} className="relative w-36 h-36 mb-4 rounded-2xl overflow-hidden bg-surface-2/40 border border-line transition-transform duration-200 group-hover:scale-105">
                                                <Image
                                                    src={product.mainImage || "/placeholder.svg"}
                                                    alt={product.name}
                                                    fill
                                                    sizes="144px"
                                                    className="object-contain p-2"
                                                />
                                            </Link>
                                            <Link href={`/product/${product.slug || product.id}`} className="font-semibold text-small text-ink hover:text-brand line-clamp-2 transition-colors">
                                                {product.name}
                                            </Link>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line/60">
                            {/* Price Row */}
                            <tr className="bg-surface/30 hover:bg-surface/60 transition-colors">
                                <td className="p-6 font-semibold text-small text-ink bg-surface/50">Giá niêm yết</td>
                                {products.map((product) => (
                                    <td key={`${product.id}-price`} className="p-6 text-center border-l border-line/60">
                                        {product.salePrice ? (
                                            <div className="flex flex-col items-center">
                                                <span className="text-h3 font-bold text-brand tracking-tight">{formatPrice(product.salePrice)}</span>
                                                <span className="text-tiny text-ink-faint line-through mt-0.5">{formatPrice(product.price)}</span>
                                            </div>
                                        ) : (
                                            <span className="text-h3 font-bold text-ink tracking-tight">{formatPrice(product.price)}</span>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Rating Row */}
                            <tr className="hover:bg-surface/40 transition-colors">
                                <td className="p-6 font-semibold text-small text-ink bg-surface/50">Đánh giá thực tế</td>
                                {products.map((product) => (
                                    <td key={`${product.id}-rating`} className="p-6 text-center border-l border-line/60">
                                        <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                            <span className="font-bold text-small">{product.rating.toFixed(1)}</span>
                                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Dynamic Specs */}
                            {sortedSpecs.map((spec) => (
                                <tr key={spec} className="hover:bg-surface/40 transition-colors">
                                    <td className="p-6 font-medium text-small text-ink-soft capitalize bg-surface/50">
                                        {spec.replace(/_/g, " ")}
                                    </td>
                                    {products.map((product) => {
                                        const matchedSpec = product.specifications?.find(
                                            (s) => s.name === spec
                                        );
                                        return (
                                            <td key={`${product.id}-${spec}`} className="p-6 text-center border-l border-line/60">
                                                {matchedSpec ? (
                                                    <span className="font-medium text-small text-ink">{matchedSpec.value}</span>
                                                ) : (
                                                    <span className="text-ink-faint/40">—</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}

                            {/* Actions Row */}
                            <tr className="bg-surface/30">
                                <td className="p-6 font-semibold text-small text-ink bg-surface/50">Đặt mua</td>
                                {products.map((product) => (
                                    <td key={`${product.id}-actions`} className="p-6 text-center border-l border-line/60">
                                        <div className="flex flex-col gap-2.5 max-w-[200px] mx-auto">
                                            <AddToCartButton productId={product.id} />
                                            <Button variant="outline" size="sm" asChild className="w-full rounded-full border-line text-ink-soft hover:text-ink text-tiny h-9">
                                                <Link href={`/product/${product.slug || product.id}`}>Chi tiết</Link>
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

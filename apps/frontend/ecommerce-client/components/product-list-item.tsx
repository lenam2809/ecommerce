"use client"

import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/types/product"
import { formatPrice } from "@/lib/contants"
import AddToCartButton from "./add-to-cart-button"
import AddToComparison from "./filter/add-to-comparison"

interface ProductListItemProps {
    product: Product
}

export default function ProductListItem({ product }: ProductListItemProps) {
    const discount = product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0

    return (
        <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col md:flex-row">
                <div className="relative md:w-48 h-48 overflow-hidden">
                    {discount > 0 && <Badge className="absolute top-2 left-2 z-10 bg-[#FF6B00] text-white">-{discount}%</Badge>}
                    <Link href={`/products/${product.id}`} className="block h-full">
                        <Image
                            src={product.mainImage || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            priority={false}
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, 192px"
                        />
                    </Link>
                </div>

                <div className="flex-1 p-4 flex flex-col">
                    <div className="mb-2">
                        <Link href={`/products/${product.id}`} className="block">
                            <h3 className="text-lg font-medium line-clamp-1 group-hover:text-[#2A5CAA] dark:text-white dark:group-hover:text-blue-400 transition-colors">
                                {product.name}
                            </h3>
                        </Link>

                        <div className="flex items-center mt-1">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < Math.floor(product.rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">({product.rating})</span>
                            <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Danh mục: {product.categoryName}</span>
                        </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4 flex-grow">
                        {product.description ||
                            "Sản phẩm chất lượng cao với nhiều tính năng hữu ích. Thiết kế hiện đại, bền bỉ và dễ sử dụng."}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                        <div>
                            {product.salePrice ? (
                                <div className="flex items-center">
                                    <span className="font-semibold text-[#FF6B00] text-lg">{formatPrice(product.salePrice)}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">
                                        {formatPrice(product.price)}
                                    </span>
                                </div>
                            ) : (
                                <span className="font-semibold text-lg dark:text-white">{formatPrice(product.price)}</span>
                            )}
                        </div>

                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-[#2A5CAA] text-[#2A5CAA] hover:bg-[#2A5CAA] hover:text-white dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-700"
                                asChild
                            >
                                <Link href={`/products/${product.id}`}>Chi tiết</Link>
                            </Button>
                            <AddToComparison product={product} />
                            <AddToCartButton 
                                productId={product.id} 
                                title="Thêm vào giỏ hàng" 
                                productName={product.name}
                                price={product.salePrice || product.price}
                                category={product.categoryName}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

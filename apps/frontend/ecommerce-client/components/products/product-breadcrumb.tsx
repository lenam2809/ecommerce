import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductBreadcrumbProps {
    isLoading: boolean
    categoryName?: string
    productName?: string
}

export function ProductBreadcrumb({ isLoading, categoryName, productName }: ProductBreadcrumbProps) {
    return (
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center text-sm text-gray-500">
                <Link href="/" className="hover:text-[#2A5CAA]">
                    Trang chủ
                </Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <Link href="/products" className="hover:text-[#2A5CAA]">
                    Sản phẩm
                </Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                {isLoading ? (
                    <Skeleton className="h-4 w-20" />
                ) : (
                    <>
                        <Link href={`/products?category=${categoryName}`} className="hover:text-[#2A5CAA]">
                            {categoryName}
                        </Link>
                        <ChevronRight className="h-4 w-4 mx-1" />
                        <span className="truncate max-w-[200px]">{productName}</span>
                    </>
                )}
            </div>
        </div>
    )
}
"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductBreadcrumbProps {
    isLoading: boolean
    categoryName?: string
    categorySlug?: string
    productName?: string
}

export function ProductBreadcrumb({
    isLoading,
    categoryName,
    categorySlug,
    productName,
}: ProductBreadcrumbProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-tiny text-ink-faint overflow-x-auto whitespace-nowrap scrollbar-hide py-1"
        >
            <Link
                href="/"
                className="hover:text-brand transition-colors inline-flex items-center gap-1 shrink-0"
            >
                <Home className="h-3.5 w-3.5" />
                <span>Trang chủ</span>
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />

            <Link href="/products" className="hover:text-brand transition-colors shrink-0">
                Sản phẩm
            </Link>

            {isLoading ? (
                <>
                    <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
                    <Skeleton className="h-3.5 w-24 rounded-full" />
                    <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
                    <Skeleton className="h-3.5 w-32 rounded-full" />
                </>
            ) : (
                <>
                    {categoryName && (
                        <>
                            <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
                            <Link
                                href={categorySlug ? `/${categorySlug}` : `/products?category=${categoryName}`}
                                className="hover:text-brand transition-colors shrink-0"
                            >
                                {categoryName}
                            </Link>
                        </>
                    )}

                    {productName && (
                        <>
                            <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
                            <span className="truncate max-w-[260px] font-semibold text-ink">
                                {productName}
                            </span>
                        </>
                    )}
                </>
            )}
        </nav>
    )
}

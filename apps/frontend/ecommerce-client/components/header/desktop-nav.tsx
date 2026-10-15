"use client"

import { useTopPopularCategories } from "@/hooks/use-categories"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function DesktopNav() {
    const { data: categories, isLoading: isLoadingCategories } = useTopPopularCategories()
    const pathname = usePathname()

    return (
        <nav className="hidden lg:flex items-center space-x-7 ml-4 xl:ml-6">
            {isLoadingCategories ? (
                <div className="flex items-center space-x-5">
                    <div className="w-20 h-4 bg-muted animate-pulse rounded-full" />
                    <div className="w-24 h-4 bg-muted animate-pulse rounded-full" />
                    <div className="w-20 h-4 bg-muted animate-pulse rounded-full" />
                </div>
            ) : (
                categories?.map((category) => {
                    const isActive =
                        pathname === `/${category.slug.toLowerCase()}` ||
                        pathname.includes(encodeURIComponent(category.name.toLowerCase()))

                    return (
                        <Link
                            key={category.id}
                            href={`/${encodeURIComponent(category.slug.toLowerCase())}`}
                            className={cn(
                                "relative py-1.5 text-small font-medium transition-colors duration-200 group tracking-tight",
                                isActive
                                    ? "text-ink font-semibold"
                                    : "text-ink-soft hover:text-ink"
                            )}
                        >
                            {category.name}
                            <span
                                className={cn(
                                    "absolute bottom-0 left-0 w-full h-[2px] bg-brand rounded-full transform origin-left transition-transform duration-200",
                                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                )}
                            />
                        </Link>
                    )
                })
            )}

            {/* Link "Tất cả sản phẩm" */}
            <Link
                href="/products"
                className={cn(
                    "relative py-1.5 text-small font-medium transition-colors duration-200 group tracking-tight",
                    pathname === "/products"
                        ? "text-ink font-semibold"
                        : "text-ink-soft hover:text-ink"
                )}
            >
                Tất cả sản phẩm
                <span
                    className={cn(
                        "absolute bottom-0 left-0 w-full h-[2px] bg-brand rounded-full transform origin-left transition-transform duration-200",
                        pathname === "/products" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                />
            </Link>
        </nav>
    )
}

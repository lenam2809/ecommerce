"use client"

import { useTopPopularCategories } from "@/hooks/use-categories"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function DesktopNav() {
    const { data: categories, isLoading: isLoadingCategories } = useTopPopularCategories()
    const pathname = usePathname()

    return (
        <nav className="hidden md:flex items-center space-x-6 lg:ml-6 xl:ml-8">
            {isLoadingCategories ? (
                // Cải thiện placeholder khi đang tải
                <>
                    <div className="flex flex-col space-y-1">
                        <div className="w-24 h-4 bg-muted animate-pulse rounded"></div>
                        <div className="w-16 h-1 bg-transparent"></div>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <div className="w-20 h-4 bg-muted animate-pulse rounded"></div>
                        <div className="w-14 h-1 bg-transparent"></div>
                    </div>
                    <div className="flex flex-col space-y-1">
                        <div className="w-28 h-4 bg-muted animate-pulse rounded"></div>
                        <div className="w-20 h-1 bg-transparent"></div>
                    </div>
                </>
            ) : (
                // Hiển thị danh mục từ API với thiết kế cải tiến
                categories &&
                categories.map((category) => {
                    const isActive = pathname.includes(`/products?category=${encodeURIComponent(category.name.toLowerCase())}`)
                    return (
                        <Link
                            key={category.id}
                            href={`/${encodeURIComponent(category.slug.toLowerCase())}`}
                            className={cn(
                                "relative py-2 font-medium text-base transition-colors duration-200 group",
                                isActive
                                    ? "text-primary font-semibold"
                                    : "text-muted-foreground hover:text-primary",
                            )}
                        >
                            {category.name}
                            <span
                                className={cn(
                                    "absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300",
                                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                                )}
                            />
                        </Link>
                    )
                })
            )}

            {/* Link "Tất cả sản phẩm" với thiết kế nổi bật hơn */}
            <Link
                href="/products"
                className={cn(
                    "relative py-2 font-medium text-base transition-colors duration-200 group",
                    pathname === "/products"
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-primary",
                )}
            >
                Tất cả sản phẩm
                <span
                    className={cn(
                        "absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300",
                        pathname === "/products" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                />
            </Link>
        </nav>
    )
}

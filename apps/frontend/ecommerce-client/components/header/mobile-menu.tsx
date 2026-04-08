"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Package, LogOut, ShoppingCart, ChevronDown, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTopPopularCategories } from "@/hooks/use-categories"
import { cn } from "@/lib/utils"

interface MobileMenuProps {
    isMobileMenuOpen: boolean
    setIsMobileMenuOpen: (open: boolean) => void
    isAuthenticated: boolean
    logout: () => void
    cartCount?: number
    wishlistCount?: number
}

export function MobileMenu({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isAuthenticated,
    logout,
    cartCount = 0,
    wishlistCount = 0
}: MobileMenuProps) {
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const { data: categories, isLoading } = useTopPopularCategories()

    if (!isMobileMenuOpen) return null

    const closeMenu = () => setIsMobileMenuOpen(false)

    return (
        <div
            id="mobile-menu"
            className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border animate-in slide-in-from-top-2 duration-200"
        >
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-1">
                {/* Quick Access Badges - Cart & Wishlist */}
                <div className="flex gap-2 pb-3 mb-1 border-b border-border">
                    <Link href="/cart" className="flex-1" onClick={closeMenu}>
                        <Button variant="outline" className="w-full justify-between rounded-xl h-11" size="sm">
                            <span className="flex items-center gap-2 font-medium">
                                <ShoppingCart className="h-4 w-4" />
                                Giỏ hàng
                            </span>
                            {cartCount > 0 && (
                                <Badge className="bg-primary text-primary-foreground text-xs h-5 min-w-5 flex items-center justify-center px-1 rounded-full">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </Badge>
                            )}
                        </Button>
                    </Link>
                    <Link href="/wishlist" className="flex-1" onClick={closeMenu}>
                        <Button variant="outline" className="w-full justify-between rounded-xl h-11" size="sm">
                            <span className="flex items-center gap-2 font-medium">
                                <Heart className="h-4 w-4" />
                                Yêu thích
                            </span>
                            {wishlistCount > 0 && (
                                <Badge className="bg-primary text-primary-foreground text-xs h-5 min-w-5 flex items-center justify-center px-1 rounded-full">
                                    {wishlistCount > 99 ? "99+" : wishlistCount}
                                </Badge>
                            )}
                        </Button>
                    </Link>
                </div>

                {/* Categories Accordion */}
                <div>
                    <button
                        className="w-full flex items-center justify-between py-3 px-3 rounded-xl hover:bg-secondary/40 transition-colors text-foreground font-medium"
                        onClick={() => setIsCategoryOpen((prev) => !prev)}
                        aria-expanded={isCategoryOpen}
                        aria-controls="mobile-categories"
                    >
                        <span className="flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                            Danh mục
                        </span>
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                isCategoryOpen && "rotate-180"
                            )}
                        />
                    </button>

                    {/* Accordion body */}
                    <div
                        id="mobile-categories"
                        className={cn(
                            "overflow-hidden transition-all duration-300",
                            isCategoryOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        )}
                    >
                        <div className="pl-4 pb-2 space-y-1 mt-1 border-l-2 border-primary/20 ml-5">
                            {isLoading ? (
                                // Skeleton placeholders
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="h-9 rounded-lg bg-muted animate-pulse mx-2" />
                                ))
                            ) : (
                                categories?.map((category) => (
                                    <Link
                                        key={category.id}
                                        href={`/${encodeURIComponent(category.slug.toLowerCase())}`}
                                        className="flex items-center py-2 px-3 rounded-lg hover:bg-secondary/40 hover:text-primary transition-colors text-sm text-foreground/80"
                                        onClick={closeMenu}
                                    >
                                        {category.name}
                                    </Link>
                                ))
                            )}
                            <Link
                                href="/products"
                                className="flex items-center py-2 px-3 rounded-lg text-sm text-primary font-medium hover:bg-primary/10 transition-colors"
                                onClick={closeMenu}
                            >
                                Xem tất cả →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Navigation Links */}
                <Link
                    href="/products"
                    className="text-foreground hover:text-primary py-3 px-3 rounded-xl hover:bg-secondary/40 transition-colors font-medium"
                    onClick={closeMenu}
                >
                    Tất cả sản phẩm
                </Link>

                {/* Auth-gated links */}
                {isAuthenticated ? (
                    <>
                        <Link
                            href="/account"
                            className="text-foreground hover:text-primary py-3 px-3 rounded-xl hover:bg-secondary/40 transition-colors flex items-center gap-2 font-medium"
                            onClick={closeMenu}
                        >
                            <Package className="h-4 w-4 text-muted-foreground" />
                            Tài khoản của tôi
                        </Link>
                        <Link
                            href="/account/orders"
                            className="text-foreground/80 hover:text-primary py-2.5 px-3 rounded-xl hover:bg-secondary/40 transition-colors flex items-center gap-2 text-sm pl-9"
                            onClick={closeMenu}
                        >
                            Đơn hàng của tôi
                        </Link>
                        <div className="pt-2 border-t border-border mt-2">
                            <button
                                className="text-destructive hover:text-destructive/80 py-3 px-3 text-left font-medium rounded-xl hover:bg-destructive/10 transition-colors w-full flex items-center gap-2"
                                onClick={() => {
                                    logout()
                                    closeMenu()
                                }}
                            >
                                <LogOut className="h-4 w-4" />
                                Đăng xuất
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex gap-2 pt-2 border-t border-border mt-2">
                        <Link href="/login" className="flex-1" onClick={closeMenu}>
                            <Button variant="outline" className="w-full rounded-xl h-11 font-medium">
                                Đăng nhập
                            </Button>
                        </Link>
                        <Link href="/register" className="flex-1" onClick={closeMenu}>
                            <Button className="w-full rounded-xl h-11 font-medium">
                                Đăng ký
                            </Button>
                        </Link>
                    </div>
                )}
            </nav>
        </div>
    )
}

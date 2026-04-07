import Link from "next/link"
import { Heart, Package, LogOut, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
    if (!isMobileMenuOpen) return null

    const closeMenu = () => setIsMobileMenuOpen(false)

    return (
        <div className="md:hidden bg-background border-t border-border animate-in slide-in-from-top-2 duration-200">
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-2">
                {/* Quick Access Badges - Cart & Wishlist */}
                <div className="flex gap-2 pb-4 border-b border-border">
                    <Link href="/cart" className="flex-1" onClick={closeMenu}>
                        <Button variant="outline" className="w-full justify-between rounded-lg" size="sm">
                            <span className="flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4" />
                                Giỏ hàng
                            </span>
                            {cartCount > 0 && (
                                <Badge className="bg-primary text-primary-foreground text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full">
                                    {cartCount}
                                </Badge>
                            )}
                        </Button>
                    </Link>
                    <Link href="/wishlist" className="flex-1" onClick={closeMenu}>
                        <Button variant="outline" className="w-full justify-between rounded-lg" size="sm">
                            <span className="flex items-center gap-2">
                                <Heart className="h-4 w-4" />
                                Yêu thích
                            </span>
                            {wishlistCount > 0 && (
                                <Badge className="bg-primary text-primary-foreground text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full">
                                    {wishlistCount}
                                </Badge>
                            )}
                        </Button>
                    </Link>
                </div>

                {/* Main Navigation Links */}
                <Link
                    href="/products"
                    className="text-foreground hover:text-primary py-3 px-2 rounded-lg hover:bg-secondary/30 transition-colors"
                    onClick={closeMenu}
                >
                    Tất cả sản phẩm
                </Link>

                {isAuthenticated ? (
                    <>
                        <Link
                            href="/account"
                            className="text-foreground hover:text-primary py-3 px-2 rounded-lg hover:bg-secondary/30 transition-colors flex items-center gap-2"
                            onClick={closeMenu}
                        >
                            <Package className="h-4 w-4" />
                            Tài khoản của tôi
                        </Link>
                        <Link
                            href="/account/orders"
                            className="text-foreground hover:text-primary py-3 px-2 rounded-lg hover:bg-secondary/30 transition-colors flex items-center gap-2"
                            onClick={closeMenu}
                        >
                            <Package className="h-4 w-4" />
                            Đơn hàng của tôi
                        </Link>
                        <button
                            className="text-destructive hover:text-destructive/80 py-3 px-2 text-left font-medium rounded-lg hover:bg-destructive/10 transition-colors w-full flex items-center gap-2"
                            onClick={() => {
                                logout()
                                closeMenu()
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                            Đăng xuất
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="text-foreground hover:text-primary py-3 px-2 rounded-lg hover:bg-secondary/30 transition-colors"
                            onClick={closeMenu}
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            href="/register"
                            className="text-foreground hover:text-primary py-3 px-2 rounded-lg hover:bg-secondary/30 transition-colors"
                            onClick={closeMenu}
                        >
                            Đăng ký
                        </Link>
                    </>
                )}
            </nav>
        </div>
    )
}

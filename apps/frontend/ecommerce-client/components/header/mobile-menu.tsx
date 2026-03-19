import Link from "next/link"
import { Heart, User, Package, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileMenuProps {
    isMobileMenuOpen: boolean
    setIsMobileMenuOpen: (open: boolean) => void
    isAuthenticated: boolean
    logout: () => void
}

export function MobileMenu({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isAuthenticated,
    logout
}: MobileMenuProps) {
    if (!isMobileMenuOpen) return null

    return (
        <div className="md:hidden bg-background border-t border-border">
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
                <Link
                    href="/products"
                    className="text-foreground hover:text-primary py-2 border-b border-border"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    Tất cả sản phẩm
                </Link>

                {isAuthenticated ? (
                    <>
                        <Link
                            href="/account"
                            className="text-foreground hover:text-primary py-2 border-b border-border"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Tài khoản của tôi
                        </Link>
                        <Link
                            href="/account/orders"
                            className="text-foreground hover:text-primary py-2 border-b border-border"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Đơn hàng của tôi
                        </Link>
                        <button
                            className="text-destructive hover:text-destructive/80 py-2 text-left font-medium"
                            onClick={() => {
                                logout()
                                setIsMobileMenuOpen(false)
                            }}
                        >
                            Đăng xuất
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="text-foreground hover:text-primary py-2 border-b border-border"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            href="/register"
                            className="text-foreground hover:text-primary py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Đăng ký
                        </Link>
                    </>
                )}
            </nav>
        </div>
    )
}
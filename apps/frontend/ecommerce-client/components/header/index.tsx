"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Heart, Menu, X, Sparkles, PhoneCall } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"

import { SearchInput } from "./search-input"
import { UserMenu } from "./user-menu"
import { MobileMenu } from "./mobile-menu"
import { DesktopNav } from "./desktop-nav"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [showAnnouncement, setShowAnnouncement] = useState(true)
    const { cart } = useCart()
    const { wishlist } = useWishlist()
    const [cartItemCount, setCartItemCount] = useState(0)
    const [wishlistItemCount, setWishlistItemCount] = useState(0)

    const { user, isAuthenticated, logout } = useAuth()

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        if (cart) {
            setCartItemCount(cart.items?.length || 0)
        }
    }, [cart])

    useEffect(() => {
        if (wishlist) {
            setWishlistItemCount(wishlist.items?.length || 0)
        }
    }, [wishlist])

    const getUserInitials = () => {
        if (!user?.email) return "U"
        return user.email
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
    }

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
                isScrolled
                    ? "bg-background/90 backdrop-blur-md border-b border-line shadow-xs"
                    : "bg-background/95 backdrop-blur-sm border-b border-line"
            }`}
            role="banner"
        >
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-51 focus:px-4 focus:py-2 focus:bg-brand focus:text-white focus:rounded-full focus:shadow-lg"
            >
                Chuyển đến nội dung chính
            </a>

            {/* Top Announcement Bar — Editorial Minimalist */}
            {showAnnouncement && (
                <div className="bg-surface-2 text-ink text-tiny border-b border-line/60 transition-all duration-200">
                    <div className="container-app flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2 mx-auto md:mx-0 text-center md:text-left">
                            <span className="inline-flex items-center gap-1 text-brand font-medium">
                                <Sparkles className="h-3 w-3" />
                                Đặc quyền 2026:
                            </span>
                            <span className="text-ink-soft">
                                Miễn phí vận chuyển cho đơn từ 2.000.000₫ • 100% Chính hãng bảo hành 24T
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-4 text-ink-faint">
                            <a
                                href="tel:19006868"
                                className="flex items-center gap-1 hover:text-brand transition-colors"
                            >
                                <PhoneCall className="h-3 w-3" />
                                Hotline: <strong className="text-ink font-medium">1900 6868</strong>
                            </a>
                            <button
                                onClick={() => setShowAnnouncement(false)}
                                className="hover:text-ink transition-colors p-0.5"
                                aria-label="Đóng thông báo"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Navigation Bar */}
            <div className="container-app">
                <div className="flex items-center justify-between h-16 md:h-[72px]">
                    {/* Brand Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg shrink-0 group"
                    >
                        <Image
                            src="/logo.png?height=40&width=120"
                            alt="ShopViet - Công nghệ chính hãng"
                            width={124}
                            height={40}
                            className="h-8 md:h-9 w-auto dark:invert transition-transform duration-300 group-hover:scale-102"
                            priority
                        />
                        <span className="hidden sm:inline-block h-2 w-2 rounded-full bg-brand animate-pulse" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:block order-2">
                        <DesktopNav />
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex relative flex-1 max-w-md mx-4 lg:mx-8 order-3">
                        <SearchInput />
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center gap-1 md:gap-1.5 order-4">
                        <ThemeToggle />

                        {/* Mobile Search Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden rounded-full h-10 w-10 text-ink"
                            onClick={() => setShowSuggestions(!showSuggestions)}
                            aria-label={showSuggestions ? "Đóng tìm kiếm" : "Mở tìm kiếm"}
                            aria-expanded={showSuggestions}
                        >
                            <Search className="h-5 w-5" />
                        </Button>

                        {/* Wishlist Button */}
                        <Link
                            href="/wishlist"
                            className="relative hidden md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full h-10 w-10 text-ink hover:text-brand hover:bg-surface transition-colors"
                                aria-label={`Danh sách yêu thích ${wishlistItemCount > 0 ? `(${wishlistItemCount})` : ""}`}
                            >
                                <Heart className="h-5 w-5" />
                            </Button>
                            {wishlistItemCount > 0 && (
                                <Badge
                                    className="absolute -top-1 -right-1 bg-brand text-white h-5 min-w-5 flex items-center justify-center p-0 text-[10px] font-semibold rounded-full border-2 border-background shadow-xs"
                                    aria-label={`${wishlistItemCount} sản phẩm yêu thích`}
                                >
                                    {wishlistItemCount > 99 ? "99+" : wishlistItemCount}
                                </Badge>
                            )}
                        </Link>

                        {/* Cart Button */}
                        <Link
                            href="/cart"
                            className="relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full h-10 w-10 text-ink hover:text-brand hover:bg-surface transition-colors"
                                aria-label={`Giỏ hàng ${cartItemCount > 0 ? `(${cartItemCount})` : ""}`}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {cartItemCount > 0 && (
                                    <Badge
                                        className="absolute -top-1 -right-1 bg-brand text-white h-5 min-w-5 flex items-center justify-center p-0 text-[10px] font-semibold rounded-full border-2 border-background shadow-xs animate-in zoom-in-75 duration-200"
                                        aria-label={`${cartItemCount} sản phẩm trong giỏ`}
                                    >
                                        {cartItemCount > 99 ? "99+" : cartItemCount}
                                    </Badge>
                                )}
                            </Button>
                        </Link>

                        {/* User Menu */}
                        <UserMenu
                            user={user}
                            isAuthenticated={isAuthenticated}
                            logout={logout}
                            getUserInitials={getUserInitials}
                        />

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden rounded-full h-10 w-10 text-ink"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-menu"
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Search Input Drawer */}
                <div className={`md:hidden pb-3 pt-1 transition-all ${showSuggestions ? "block" : "hidden"}`}>
                    <SearchInput />
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <MobileMenu
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                isAuthenticated={isAuthenticated}
                logout={logout}
                cartCount={cartItemCount}
                wishlistCount={wishlistItemCount}
            />
        </header>
    )
}

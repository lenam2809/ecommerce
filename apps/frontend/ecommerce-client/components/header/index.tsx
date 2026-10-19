"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Heart, Menu, X, PhoneCall, ArrowLeftRight } from "lucide-react"

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
    const [comparedItemCount, setComparedItemCount] = useState(0)

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

    useEffect(() => {
        const updateComparedCount = () => {
            try {
                const stored = localStorage.getItem("comparedProducts")
                if (stored) {
                    const parsed = JSON.parse(stored)
                    setComparedItemCount(Array.isArray(parsed) ? parsed.length : 0)
                } else {
                    setComparedItemCount(0)
                }
            } catch {
                setComparedItemCount(0)
            }
        }

        updateComparedCount()
        window.addEventListener("comparisonUpdated", updateComparedCount)
        return () => window.removeEventListener("comparisonUpdated", updateComparedCount)
    }, [])

    const getUserInitials = () => {
        if (!user) return "NA"
        if (user.firstName && user.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
        }
        if (user.email) {
            const clean = user.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "")
            return (clean.substring(0, 2) || "NA").toUpperCase()
        }
        return "NA"
    }

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ${
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

            {/* Top Announcement Bar — SSoT 2026 Alignment */}
            {showAnnouncement && (
                <div className="bg-surface-2 dark:bg-[#111827] text-ink dark:text-[#a1a1aa] text-tiny border-b border-line dark:border-white/10 transition-all duration-200">
                    <div className="container-app flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 mx-auto md:mx-0 text-center md:text-left">
                            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                            <span className="text-ink-soft">
                                Miễn phí vận chuyển toàn quốc cho đơn từ 500.000₫
                            </span>
                            <span className="opacity-30 hidden sm:inline">|</span>
                            <span className="hidden sm:inline text-ink-faint">
                                Cam kết 100% chính hãng • Bảo hành ủy quyền 24 tháng
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-4 text-ink-faint">
                            <a
                                href="tel:18006868"
                                className="flex items-center gap-1 hover:text-primary transition-colors text-[11px]"
                            >
                                <PhoneCall className="h-3 w-3 text-primary" />
                                Hotline: <strong className="text-ink font-medium">1800 6868</strong>
                            </a>
                            <button
                                onClick={() => setShowAnnouncement(false)}
                                className="hover:text-ink transition-colors p-0.5 rounded-full hover:bg-surface"
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
                    {/* Brand Logo - Stitch Typographic Identity */}
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg shrink-0 group py-1"
                    >
                        <span className="text-xl md:text-2xl font-bold tracking-tight text-ink flex items-center">
                            Shop<span className="text-primary font-bold">Viet.</span>
                        </span>
                        <span className="w-2 h-2 rounded-full bg-primary inline-block translate-y-0.5 group-hover:scale-125 transition-transform duration-200" />
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

                        {/* Compare Button */}
                        <Link
                            href="/compare"
                            className="relative hidden md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full h-10 w-10 text-ink hover:text-brand hover:bg-surface transition-colors"
                                aria-label={`So sánh sản phẩm ${comparedItemCount > 0 ? `(${comparedItemCount})` : ""}`}
                            >
                                <ArrowLeftRight className="h-5 w-5" />
                            </Button>
                            {comparedItemCount > 0 && (
                                <Badge
                                    className="absolute -top-1 -right-1 bg-ink text-background h-5 min-w-5 flex items-center justify-center p-0 text-[10px] font-semibold rounded-full border-2 border-background shadow-xs"
                                    aria-label={`${comparedItemCount} sản phẩm đang so sánh`}
                                >
                                    {comparedItemCount}
                                </Badge>
                            )}
                        </Link>

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
                compareCount={comparedItemCount}
            />
        </header>
    )
}

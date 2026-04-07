"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Heart, Menu, X } from "lucide-react"

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
    const { cart } = useCart()
    const { wishlist } = useWishlist()
    const [cartItemCount, setCartItemCount] = useState(3) // Mock cart count
    const [wishlistItemCount, setWishlistItemCount] = useState(3) // Mock wishlist count

    const { user, isAuthenticated, logout } = useAuth()

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])


    useEffect(() => {
        if (cart) {
            // Calculate total number of items in cart
            const itemCount = cart.items?.length || 0
            setCartItemCount(itemCount)
        }
    }, [cart])

    useEffect(() => {
        if (wishlist) {
            // Calculate total number of items in wishlist
            const itemCount = wishlist.items?.length || 0
            setWishlistItemCount(itemCount)
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
                    ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm" 
                    : "bg-transparent border-b border-transparent"
            }`}
            role="banner"
        >
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-51 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded">
                Skip to main content
            </a>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
                        <Image
                            src="/logo.png?height=40&width=120"
                            alt="ShopViet - Home"
                            width={120}
                            height={40}
                            className="h-8 md:h-10 w-auto dark:invert transition-transform duration-300 hover:scale-105"
                        />
                    </Link>


                    {/* Desktop Navigation */}
                    <DesktopNav />

                    {/* Search Bar */}
                    <div className="hidden md:flex relative flex-1 max-w-md mx-4">
                        <SearchInput />
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <ThemeToggle />

                        {/* Mobile Search Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setShowSuggestions(!showSuggestions)}
                            aria-label={showSuggestions ? "Close search" : "Open search"}
                            aria-expanded={showSuggestions}
                        >
                            <Search className="h-5 w-5" />
                        </Button>

                        {/* Wishlist */}
                        <Link href="/wishlist" className="relative hidden md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                aria-label={`Wishlist ${wishlistItemCount > 0 ? `with ${wishlistItemCount} items` : "is empty"}`}
                            >
                                <Heart className="h-5 w-5" />
                            </Button>
                            {wishlistItemCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full" aria-label={`${wishlistItemCount} items in wishlist`}>
                                    {wishlistItemCount}
                                </Badge>
                            )}
                        </Link>

                        {/* Cart */}
                        <Link href="/cart" className="relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                aria-label={`Shopping cart ${cartItemCount > 0 ? `with ${cartItemCount} items` : "is empty"}`}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {cartItemCount > 0 && (
                                    <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full" aria-label={`${cartItemCount} items in cart`}>
                                        {cartItemCount}
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
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-menu"
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className={`md:hidden pb-3 ${showSuggestions ? 'block' : 'hidden'}`}>
                    <SearchInput />
                </div>
            </div>

            {/* Mobile Menu */}
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

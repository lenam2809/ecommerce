"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, LogOut, Package, RotateCcw, MapPin } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

/**
 * AccountSidebar — Editorial Minimal
 */
export function AccountSidebar() {
    const { logout } = useAuth()
    const { user: userData, isLoading: isLoadingUser } = useUser()
    const pathname = usePathname()

    const getUserInitials = () => {
        if (!userData?.email) return "U"
        return userData.email.split(" ").map((part) => part[0]).join("").toUpperCase().substring(0, 2)
    }

    const navItems = [
        { href: "/account", label: "Thông tin cá nhân", icon: User },
        { href: "/account/orders", label: "Đơn hàng của tôi", icon: Package },
        { href: "/account/returns", label: "Đổi/Trả hàng", icon: RotateCcw },
        { href: "/account/addresses", label: "Địa chỉ", icon: MapPin },
    ]

    if (isLoadingUser) {
        return (
            <div className="flex flex-col space-y-6">
                <div className="flex items-center gap-4 px-2">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                        <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
                    </div>
                </div>
                <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-full bg-muted animate-pulse rounded-xl"></div>)}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-6">
            {/* User Profile Summary */}
            <div className="hidden lg:flex items-center gap-4 px-3 mb-2">
                <Avatar className="h-11 w-11 border border-line">
                    <AvatarImage src={userData?.avatar} alt={userData?.email} />
                    <AvatarFallback className="bg-brand-soft text-brand font-medium">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                    <h2 className="font-semibold text-small text-ink truncate">{userData?.firstName} {userData?.lastName}</h2>
                    <p className="text-tiny text-ink-faint truncate">{userData?.email}</p>
                </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex flex-col space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || (item.href !== '/account' && pathname.startsWith(item.href))

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center px-4 py-2.5 rounded-xl transition-colors duration-200 group font-medium text-small",
                                isActive
                                    ? "bg-brand-soft text-brand"
                                    : "text-ink-soft hover:bg-surface hover:text-ink"
                            )}
                        >
                            <Icon className={cn("h-4 w-4 mr-3 transition-colors", isActive ? "text-brand" : "text-ink-faint group-hover:text-ink")} />
                            {item.label}
                        </Link>
                    )
                })}

                <div className="h-px bg-line my-4 mx-3" />

                <button
                    onClick={() => logout()}
                    className="flex items-center px-4 py-2.5 text-destructive hover:bg-destructive/5 hover:text-destructive rounded-xl transition-colors duration-200 group font-medium text-small w-full"
                >
                    <LogOut className="h-4 w-4 mr-3" />
                    Đăng xuất
                </button>
            </nav>

            {/* Mobile Navigation (Horizontal Scroll) */}
            <nav className="lg:hidden flex space-x-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || (item.href !== '/account' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center whitespace-nowrap px-4 py-2 rounded-full border transition-colors text-small font-medium",
                                isActive
                                    ? "bg-brand-soft border-brand/30 text-brand flex-shrink-0"
                                    : "bg-background border-line text-ink-soft hover:text-ink flex-shrink-0"
                            )}
                        >
                            <Icon className="h-4 w-4 mr-2" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}

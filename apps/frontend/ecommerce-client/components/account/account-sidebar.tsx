"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    User,
    LogOut,
    Package,
    RotateCcw,
    MapPin,
    Crown,
    ShieldCheck,
    PhoneCall,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"

export function AccountSidebar() {
    const { logout } = useAuth()
    const { user: userData } = useUser()
    const pathname = usePathname()

    const displayFullName =
        userData?.firstName || userData?.lastName
            ? `${userData.lastName || ""} ${userData.firstName || ""}`.trim()
            : userData?.fullName || userData?.email || "Thành viên ShopViet"
    const displayEmail = userData?.email || ""
    const avatarInitials = (displayFullName || "U")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("") || "SV"

    const navItems = [
        {
            href: "/account",
            label: "Hồ sơ & Sổ địa chỉ",
            sub: "Thông tin cá nhân & nhận hàng",
            icon: User,
        },
        {
            href: "/account/orders",
            label: "Quản lý đơn hàng",
            sub: "Serial/IMEI & Vận đơn",
            icon: Package,
        },
        {
            href: "/account/returns",
            label: "Đổi trả & Bảo hành",
            sub: "1 đổi 1 & 45 Showroom",
            icon: RotateCcw,
        },
        {
            href: "/account/addresses",
            label: "Sổ địa chỉ giao nhận",
            sub: "Địa chỉ nhận hàng đã lưu",
            icon: MapPin,
        },
    ]

    return (
        <div className="flex flex-col space-y-4">
            {/* Desktop 300px Sidebar Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card overflow-hidden shadow-xs">
                {/* Top Member Header */}
                <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white border-b border-slate-800">
                    <div className="flex items-center gap-3.5">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center ring-2 ring-amber-400/80 shadow-md shrink-0 select-none">
                            {avatarInitials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                                <Crown className="h-3 w-3" />
                                Thành viên ShopViet
                            </span>
                            <h2 className="font-extrabold text-base text-white truncate">
                                {displayFullName}
                            </h2>
                            {displayEmail ? <p className="text-xs text-slate-300 truncate">{displayEmail}</p> : null}
                        </div>
                    </div>

                    {typeof userData?.loyaltyPoints === "number" && (
                        <div className="mt-4 pt-3 border-t border-slate-800/90 flex items-center justify-between text-xs">
                            <span className="text-slate-300">Điểm thưởng khả dụng:</span>
                            <span className="font-extrabold text-amber-400 font-mono tabular-nums whitespace-nowrap">
                                {userData.loyaltyPoints.toLocaleString("vi-VN")} điểm
                            </span>
                        </div>
                    )}
                </div>

                {/* Desktop Navigation Links */}
                <nav className="hidden lg:flex flex-col p-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/account" && pathname.startsWith(item.href))

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-150 group",
                                    isActive
                                        ? "bg-primary text-white shadow-xs"
                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                                )}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <Icon
                                        className={cn(
                                            "h-4 w-4 shrink-0 transition-colors",
                                            isActive
                                                ? "text-white"
                                                : "text-slate-500 dark:text-slate-400 group-hover:text-primary"
                                        )}
                                    />
                                    <div className="min-w-0">
                                        <span className="text-sm font-bold block truncate">
                                            {item.label}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-[11px] block truncate",
                                                isActive
                                                    ? "text-blue-100"
                                                    : "text-slate-500 dark:text-slate-400"
                                            )}
                                        >
                                            {item.sub}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}

                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-2" />

                    <button
                        type="button"
                        onClick={() => logout()}
                        className="flex items-center px-3.5 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-brand rounded-xl transition-colors text-xs font-bold w-full cursor-pointer"
                    >
                        <LogOut className="h-4 w-4 mr-3" />
                        <span>Đăng xuất tài khoản</span>
                    </button>
                </nav>

                {/* VIP Concierge Support Box */}
                <div className="hidden lg:block p-4 m-3 mt-0 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-extrabold text-slate-900 dark:text-white">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span>Tổng đài ưu tiên VIP Diamond</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Hỗ trợ kỹ thuật &amp; bảo hành 1 đổi 1 tận nơi trong 2 giờ.
                    </p>
                    <div className="flex items-center justify-between pt-1 font-bold text-primary font-mono tabular-nums whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                            <PhoneCall className="h-3.5 w-3.5" />
                            CSKH: 1800 6868
                        </span>
                        <span>KT: 1800 6869</span>
                    </div>
                </div>
            </div>

            {/* Mobile Horizontal Navigation */}
            <nav className="lg:hidden flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/account" && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center whitespace-nowrap px-4 py-2.5 rounded-xl border transition-colors text-xs font-bold shrink-0",
                                isActive
                                    ? "bg-primary border-primary text-white shadow-xs"
                                    : "bg-card border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                            )}
                        >
                            <Icon className="h-4 w-4 mr-2" />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}

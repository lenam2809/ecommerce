"use client"

import Link from "next/link"
import { ChevronRight, Home, Check } from "lucide-react"

export function CheckoutBreadcrumbs() {
    return (
        <div className="mb-8 space-y-4">
            {/* Breadcrumb line */}
            <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-tiny text-ink-faint overflow-x-auto whitespace-nowrap scrollbar-hide"
            >
                <Link href="/" className="hover:text-brand transition-colors inline-flex items-center gap-1">
                    <Home className="h-3.5 w-3.5" />
                    <span>Trang chủ</span>
                </Link>
                <ChevronRight className="h-3 w-3 opacity-40" />
                <Link href="/cart" className="hover:text-brand transition-colors">
                    Giỏ hàng
                </Link>
                <ChevronRight className="h-3 w-3 opacity-40" />
                <span className="font-semibold text-ink">Thanh toán</span>
            </nav>

            {/* Visual 3-Step Progress Bar */}
            <div className="flex items-center justify-between max-w-xl py-2">
                {/* Step 1: Cart */}
                <Link href="/cart" className="flex items-center gap-2 group">
                    <span className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-tiny font-bold shadow-xs">
                        <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-tiny font-medium text-ink-soft group-hover:text-ink hidden sm:inline">
                        1. Giỏ hàng
                    </span>
                </Link>

                <div className="flex-1 h-0.5 bg-emerald-600/40 mx-2 sm:mx-4" />

                {/* Step 2: Checkout (Active) */}
                <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-full bg-brand text-white flex items-center justify-center text-tiny font-bold shadow-xs ring-4 ring-brand/15">
                        2
                    </span>
                    <span className="text-tiny font-semibold text-brand hidden sm:inline">
                        2. Thông tin & Vận chuyển
                    </span>
                </div>

                <div className="flex-1 h-0.5 bg-line mx-2 sm:mx-4" />

                {/* Step 3: Complete */}
                <div className="flex items-center gap-2 opacity-50">
                    <span className="h-7 w-7 rounded-full bg-surface-2 border border-line text-ink-faint flex items-center justify-center text-tiny font-semibold">
                        3
                    </span>
                    <span className="text-tiny font-medium text-ink-faint hidden sm:inline">
                        3. Hoàn tất
                    </span>
                </div>
            </div>
        </div>
    )
}

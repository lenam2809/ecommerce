"use client"

import Link from "next/link"
import { ChevronRight, Home, Check, ShieldCheck } from "lucide-react"

export function CheckoutBreadcrumbs() {
    return (
        <div className="mb-6 space-y-4">
            {/* Top Row: Breadcrumb + SSL Security Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <nav
                    aria-label="Breadcrumb"
                    className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-hide"
                >
                    <Link href="/" className="hover:text-primary transition-colors inline-flex items-center gap-1 font-medium">
                        <Home className="h-3.5 w-3.5" />
                        <span>Trang chủ</span>
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <Link href="/cart" className="hover:text-primary transition-colors font-medium">
                        Giỏ hàng
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-bold text-slate-900 dark:text-white">Thanh toán & Giao nhận</span>
                </nav>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Bảo mật thanh toán SSL 256-bit • PCI-DSS</span>
                </div>
            </div>

            {/* Visual 3-Step Progress Bar */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] px-4 py-3.5 shadow-xs">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {/* Step 1: Cart (Completed) */}
                    <Link href="/cart" className="flex items-center gap-2.5 group">
                        <span className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
                            <Check className="h-4 w-4 stroke-[2.5]" />
                        </span>
                        <div className="hidden sm:block">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:underline block">
                                1. Giỏ hàng
                            </span>
                            <span className="text-[11px] text-slate-600 dark:text-slate-400">Đã kiểm tra</span>
                        </div>
                    </Link>

                    <div className="flex-1 h-0.5 bg-emerald-500 mx-3 sm:mx-5 rounded-full" />

                    {/* Step 2: Checkout (Active) */}
                    <div className="flex items-center gap-2.5">
                        <span className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-xs ring-4 ring-primary/15 shrink-0">
                            2
                        </span>
                        <div>
                            <span className="text-xs font-bold text-primary block">
                                2. Thanh toán & Giao nhận
                            </span>
                            <span className="text-[11px] text-slate-600 dark:text-slate-400 hidden sm:inline">Đang thực hiện</span>
                        </div>
                    </div>

                    <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-800 mx-3 sm:mx-5 rounded-full" />

                    {/* Step 3: Complete */}
                    <div className="flex items-center gap-2.5 opacity-60">
                        <span className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold shrink-0">
                            3
                        </span>
                        <div className="hidden sm:block">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                                3. Hoàn tất đơn hàng
                            </span>
                            <span className="text-[11px] text-slate-600 dark:text-slate-400">Nhận mã vận đơn</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

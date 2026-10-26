"use client"

import { AccountSidebar } from "@/components/account/account-sidebar"
import Link from "next/link"
import { ChevronRight, Home, ShieldCheck } from "lucide-react"

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background py-6 md:py-10">
            <div className="container-app">
                {/* Breadcrumb */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                        <Link href="/" className="hover:text-primary transition-colors inline-flex items-center gap-1 font-medium">
                            <Home className="h-3.5 w-3.5" />
                            <span>Trang chủ</span>
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5 mx-1.5 text-slate-400" />
                        <span className="font-bold text-slate-900 dark:text-white">Trung tâm Tài khoản &amp; Đặc quyền VIP</span>
                    </nav>

                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Đồng bộ Bảo hành Điện tử Toàn hệ thống 45 Showroom</span>
                    </div>
                </div>

                {/* Single 300px Left Sidebar + Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-8 items-start">
                    <aside className="w-full lg:w-[300px] lg:sticky lg:top-24">
                        <AccountSidebar />
                    </aside>

                    <main className="min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}

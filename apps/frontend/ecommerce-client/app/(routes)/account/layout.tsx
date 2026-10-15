"use client"

import { AccountSidebar } from "@/components/account/account-sidebar"
import AuthGuard from "@/components/auth-guard"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <AuthGuard>
            <div className="container-app py-6 md:py-10">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex items-center text-tiny text-ink-faint mb-6">
                    <Link href="/" className="hover:text-brand transition-colors">
                        Trang chủ
                    </Link>
                    <ChevronRight className="h-3 w-3 mx-1.5" />
                    <span className="text-ink-soft">Tài khoản của tôi</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <AccountSidebar />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 min-w-0">
                        {children}
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}

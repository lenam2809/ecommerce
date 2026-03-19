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
            <div className="flex items-center text-sm text-muted-foreground mb-6">
                <Link href="/" className="hover:text-primary transition-colors">
                    Trang chủ
                </Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span>Tài khoản của tôi</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <AccountSidebar />
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {children}
                </div>
            </div>
        </AuthGuard>
    )
}
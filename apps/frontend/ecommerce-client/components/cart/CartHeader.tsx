"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface CartHeaderProps {
    itemCount?: number
}

export default function CartHeader({ itemCount = 0 }: CartHeaderProps) {
    return (
        <div className="mb-8 pb-6 border-b border-line/60">
            {/* Breadcrumb */}
            <nav
                aria-label="Breadcrumb"
                className="flex items-center text-tiny text-ink-faint mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide"
            >
                <Link href="/" className="hover:text-brand transition-colors inline-flex items-center gap-1">
                    <Home className="h-3.5 w-3.5" />
                    <span>Trang chủ</span>
                </Link>
                <ChevronRight className="h-3 w-3 mx-1.5 opacity-40" />
                <span className="font-semibold text-ink">Giỏ hàng ({itemCount})</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="section-label">Đơn Hàng Của Bạn</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                        <span className="text-tiny text-ink-faint font-medium">Bảo mật thanh toán SSL</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink flex items-center gap-3">
                        <span>Giỏ hàng</span>
                        {itemCount > 0 && (
                            <span className="text-base font-semibold text-ink-soft bg-surface-2 px-3 py-0.5 rounded-full border border-line">
                                {itemCount} sản phẩm
                            </span>
                        )}
                    </h1>
                </div>

                <p className="text-small text-ink-soft">
                    Miễn phí vận chuyển cho đơn hàng từ <strong className="text-ink font-semibold">500.000₫</strong>
                </p>
            </div>
        </div>
    )
}

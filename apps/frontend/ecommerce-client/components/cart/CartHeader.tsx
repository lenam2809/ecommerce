"use client"

import Link from "next/link"
import { ChevronRight, Home, Truck, ShieldCheck } from "lucide-react"
import { formatPrice } from "@/lib/contants"

interface CartHeaderProps {
    itemCount?: number
    subtotal?: number
}

const FREESHIP_THRESHOLD = 500000

export default function CartHeader({ itemCount = 0, subtotal = 62890000 }: CartHeaderProps) {
    const progress = Math.min(100, Math.round((subtotal / FREESHIP_THRESHOLD) * 100))
    const isFreeshipUnlocked = subtotal >= FREESHIP_THRESHOLD

    return (
        <div className="mb-8 space-y-6">
            {/* Breadcrumb & 3-Step Checkout Stepper */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                <nav
                    aria-label="Breadcrumb"
                    className="flex items-center text-tiny text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-hide"
                >
                    <Link href="/" className="hover:text-primary transition-colors inline-flex items-center gap-1 font-medium">
                        <Home className="h-3.5 w-3.5" />
                        <span>Trang chủ</span>
                    </Link>
                    <ChevronRight className="h-3 w-3 mx-1.5 opacity-40" />
                    <span className="font-bold text-slate-900 dark:text-white">Giỏ hàng ({itemCount})</span>
                </nav>

                {/* 3-Step Progress Stepper */}
                <div className="flex items-center gap-2 sm:gap-4 text-tiny font-semibold overflow-x-auto whitespace-nowrap py-1">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-xs">
                            1
                        </span>
                        <span>Giỏ hàng</span>
                    </div>
                    <div className="w-6 sm:w-10 h-0.5 bg-slate-200 dark:bg-slate-700" />
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold">
                            2
                        </span>
                        <span>Thanh toán & Giao nhận</span>
                    </div>
                    <div className="w-6 sm:w-10 h-0.5 bg-slate-200 dark:bg-slate-700" />
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold">
                            3
                        </span>
                        <span>Hoàn tất đơn hàng</span>
                    </div>
                </div>
            </div>

            {/* Title & Freeship 500.000đ Progress Banner */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-tiny font-bold uppercase tracking-wider text-primary">
                            Giỏ Hàng Công Nghệ
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-tiny text-slate-600 dark:text-slate-400 font-medium inline-flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            Bảo hành chính hãng 24 tháng tại 45 Showroom
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <span>Giỏ hàng của bạn</span>
                        {itemCount > 0 && (
                            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 tabular-nums">
                                {itemCount} sản phẩm
                            </span>
                        )}
                    </h1>
                </div>

                {/* Freeship 500.000đ Bar */}
                {itemCount > 0 && (
                    <div className="p-3.5 sm:px-5 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 shadow-2xs min-w-[280px] sm:min-w-[360px]">
                        <div className="flex items-center justify-between gap-2 text-tiny mb-2">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                                <Truck className="h-4 w-4 text-primary shrink-0" />
                                {isFreeshipUnlocked ? (
                                    <span>
                                        Đủ điều kiện <strong className="text-emerald-600 dark:text-emerald-400">Miễn phí giao hỏa tốc 2H</strong>
                                    </span>
                                ) : (
                                    <span>
                                        Mua thêm{" "}
                                        <strong className="text-primary font-mono tabular-nums whitespace-nowrap">
                                            {formatPrice(FREESHIP_THRESHOLD - subtotal)}
                                        </strong>{" "}
                                        để được Freeship
                                    </span>
                                )}
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums whitespace-nowrap">
                                Mốc {formatPrice(FREESHIP_THRESHOLD)}
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 flex items-center justify-end"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

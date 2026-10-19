"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Copy, Check, Sparkles } from "lucide-react"
import { toast } from "sonner"

/**
 * PromotionBanner — Editorial Tech Minimalism
 * VIP Privilege banner with 1-click coupon copy and high-contrast typography
 */
export function PromotionBanner() {
    const [copied, setCopied] = useState(false)
    const couponCode = "TECHVIP500"

    const handleCopy = () => {
        navigator.clipboard.writeText(couponCode)
        setCopied(true)
        toast.success(`Đã sao chép mã giảm giá ${couponCode}`)
        setTimeout(() => setCopied(false), 2500)
    }

    return (
        <section className="container-app py-12 md:py-16">
            <div className="relative rounded-3xl overflow-hidden bg-[#090D16] text-[#f8fafc] border border-white/10 shadow-xl">
                {/* Crimson glow effects on the right */}
                <div
                    className="absolute -top-24 -right-20 w-96 h-96 bg-[#e11d48]/25 rounded-full blur-3xl pointer-events-none"
                    aria-hidden="true"
                />
                <div
                    className="absolute -bottom-24 right-10 w-72 h-72 bg-[#e11d48]/15 rounded-full blur-3xl pointer-events-none"
                    aria-hidden="true"
                />

                <div className="relative z-10 px-6 py-12 md:px-16 md:py-16 text-center max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#e11d48]/20 text-[#fb7185] text-xs font-bold uppercase tracking-wider mb-5 border border-[#e11d48]/30">
                        <Sparkles className="h-3.5 w-3.5 text-[#e11d48]" />
                        Đặc Quyền Hội Viên 2026
                    </span>

                    <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-[#f8fafc] leading-tight">
                        Gia nhập Cộng đồng ShopViet Privilege
                    </h3>

                    <p className="mt-4 text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
                        Nhận ngay voucher độc quyền giảm{" "}
                        <strong className="text-[#f8fafc] font-semibold">500.000₫</strong> cho đơn hàng công nghệ đầu tiên cùng bảo hành VIP tận nhà.
                    </p>

                    {/* Voucher Pill Box */}
                    <div className="mt-6 inline-flex items-center gap-2.5 p-1.5 pl-4 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
                        <span className="text-xs text-slate-300">Mã voucher:</span>
                        <span className="font-mono font-bold text-[#f8fafc] tracking-wider text-sm">
                            {couponCode}
                        </span>
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-[#e11d48]"
                            aria-label="Sao chép mã giảm giá"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Đã sao chép</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5 text-slate-700" />
                                    <span>Sao chép</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center items-center">
                        <Link
                            href="/products"
                            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-[#e11d48] text-white text-sm font-semibold hover:bg-[#be123c] transition-all focus-ring shadow-md hover:scale-[1.01]"
                        >
                            Mua sắm với ưu đãi <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/products?sort=bestselling"
                            className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-white/20 bg-white/5 text-[#f8fafc] text-sm font-semibold hover:bg-white/10 transition-colors focus-ring"
                        >
                            Xem sản phẩm bán chạy
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

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
            <div className="relative rounded-3xl overflow-hidden bg-ink text-background border border-ink/20 shadow-md">
                {/* Subtle background ambient light */}
                <div
                    className="absolute -top-24 -right-24 w-80 h-80 bg-brand/25 rounded-full blur-3xl pointer-events-none"
                    aria-hidden="true"
                />

                <div className="relative px-6 py-12 md:px-16 md:py-16 text-center max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/20 text-brand text-tiny font-bold uppercase tracking-wider mb-5 border border-brand/30">
                        <Sparkles className="h-3 w-3" />
                        Đặc Quyền Hội Viên 2026
                    </span>

                    <h3 className="text-h1 font-semibold tracking-tight text-white leading-tight">
                        Gia nhập Cộng đồng ShopViet Privilege
                    </h3>

                    <p className="mt-4 text-body text-white/80 leading-relaxed max-w-xl mx-auto">
                        Nhận ngay voucher độc quyền giảm{" "}
                        <strong className="text-white font-semibold">500.000₫</strong> cho đơn hàng công nghệ đầu tiên cùng bảo hành VIP tận nhà.
                    </p>

                    {/* Voucher Pill Box */}
                    <div className="mt-6 inline-flex items-center gap-2 p-1.5 pl-4 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
                        <span className="text-tiny text-white/70">Mã voucher:</span>
                        <span className="font-mono font-bold text-white tracking-wider text-small">
                            {couponCode}
                        </span>
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1 h-8 px-3 rounded-full bg-white text-ink text-tiny font-semibold hover:bg-white/90 transition-all focus:outline-none focus:ring-2 focus:ring-brand"
                            aria-label="Sao chép mã giảm giá"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3 w-3 text-emerald-600" />
                                    <span>Đã sao chép</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3 w-3" />
                                    <span>Sao chép</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <Link
                            href="/products"
                            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-brand text-white text-small font-semibold hover:bg-brand-hover transition-all focus-ring shadow-sm hover:scale-[1.01]"
                        >
                            Mua sắm với ưu đãi <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/products?sort=bestselling"
                            className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-white/20 text-white text-small font-semibold hover:bg-white/10 transition-colors focus-ring"
                        >
                            Xem sản phẩm bán chạy
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

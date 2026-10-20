"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Copy, Check, Sparkles, Mail, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

/**
 * PromotionBanner — Unified VIP Privilege Club & Tech Newsletter Bento Block (SSoT 2026)
 * Combines VIP Privilege voucher + Newsletter signup into a single cohesive Deep Obsidian transition block
 */
export function PromotionBanner() {
    const [copied, setCopied] = useState(false)
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const couponCode = "TECHVIP500"

    const handleCopy = () => {
        navigator.clipboard.writeText(couponCode)
        setCopied(true)
        toast.success(`Đã sao chép mã giảm giá ${couponCode}`)
        setTimeout(() => setCopied(false), 2500)
    }

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        setIsSubmitting(true)
        await new Promise((resolve) => setTimeout(resolve, 600))
        setIsSubmitting(false)
        setEmail("")
        toast.success("Cảm ơn bạn đã đăng ký! Ưu đãi VIP 10% đã được gửi tới email của bạn.")
    }

    return (
        <section className="container-app py-10 md:py-16">
            <div className="relative rounded-3xl overflow-hidden bg-[#090D16] text-[#f8fafc] border border-slate-800 shadow-xl">
                {/* Ambient glow effects */}
                <div
                    className="absolute -top-24 -left-20 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"
                    aria-hidden="true"
                />
                <div
                    className="absolute -bottom-24 -right-10 w-80 h-80 bg-[#E11D48]/15 rounded-full blur-3xl pointer-events-none"
                    aria-hidden="true"
                />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-6 sm:p-10 md:p-14 items-center">
                    {/* Left: ShopViet Privilege VIP Club (7 cols) */}
                    <div className="lg:col-span-7 space-y-4 text-left">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#2563EB]/20 text-[#60A5FA] text-xs font-bold uppercase tracking-wider border border-[#2563EB]/30">
                            <Sparkles className="h-3.5 w-3.5 text-[#3B82F6]" />
                            Đặc Quyền Hội Viên Kim Cương 2026
                        </span>

                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                            Gia nhập Cộng đồng ShopViet Privilege
                        </h3>

                        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                            Nhận ngay voucher độc quyền giảm{" "}
                            <strong className="text-white font-bold tabular-nums whitespace-nowrap">500.000₫</strong>{" "}
                            cho đơn hàng công nghệ đầu tiên, tích điểm hạng Bạc → Vàng → Platinum → Kim Cương và bảo hành VIP tại 45 Showroom.
                        </p>

                        {/* Voucher Pill Box + CTA */}
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center gap-2.5 p-1.5 pl-4 rounded-full bg-[#111827] border border-slate-700/80">
                                <span className="text-xs text-slate-400">Mã ưu đãi:</span>
                                <span className="font-mono font-bold text-[#60A5FA] tracking-wider text-sm">
                                    {couponCode}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-all focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                                    aria-label="Sao chép mã giảm giá"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-3.5 w-3.5 text-emerald-300" />
                                            <span>Đã chép</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5" />
                                            <span>Sao chép</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <Link
                                href="/products"
                                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#E11D48] text-white text-xs sm:text-sm font-bold hover:bg-[#BE123C] transition-all shadow-md"
                            >
                                <span>Mua sắm ngay</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Right: Integrated VIP Newsletter Card (5 cols) */}
                    <div className="lg:col-span-5 bg-[#111827]/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 backdrop-blur-md">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#60A5FA]">
                                Bản Tin Công Nghệ 2026
                            </span>
                            <h4 className="text-lg font-bold text-white mt-1">
                                Đăng ký nhận thông báo mở bán sớm
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Cập nhật lịch đặt trước iPhone, MacBook, Galaxy mới nhất và nhận đặc quyền giảm thêm 10% phụ kiện chính hãng.
                            </p>
                        </div>

                        <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
                            <div className="relative">
                                <label htmlFor="vip-newsletter-email" className="sr-only">
                                    Địa chỉ email của bạn
                                </label>
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    id="vip-newsletter-email"
                                    type="email"
                                    placeholder="Nhập email nhận đặc quyền VIP..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-700 bg-[#090D16] text-xs sm:text-sm text-white placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-11 rounded-xl bg-[#2563EB] text-white text-xs sm:text-sm font-bold hover:bg-[#1D4ED8] transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                <span>{isSubmitting ? "Đang đăng ký..." : "Nhận đặc quyền ngay"}</span>
                                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                            </button>
                        </form>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-[#3B82F6] shrink-0" />
                            <span>Bảo mật 100% • Hủy đăng ký bất kỳ lúc nào</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

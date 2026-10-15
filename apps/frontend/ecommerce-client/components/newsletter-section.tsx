"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { Mail, ArrowRight, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export function NewsletterSection() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800))

        setIsLoading(false)
        setEmail("")
        toast.success("Cảm ơn bạn đã đăng ký! Mã ưu đãi 10% đã được gửi tới email của bạn.")
    }

    return (
        <section className="container-app py-14 md:py-20 border-t border-line/60">
            <div className="max-w-2xl mx-auto text-center">
                <span className="section-label mb-3 inline-block">Bản Tin Công Nghệ</span>
                <h2 className="section-title">Nhận ưu đãi 10% cho đơn hàng đầu tiên</h2>
                <p className="mt-3 text-small text-ink-soft leading-relaxed max-w-lg mx-auto">
                    Đăng ký nhận bản tin công nghệ của ShopViet để là người đầu tiên tiếp cận các đợt mở bán flagship, ưu đãi đặc quyền và review chuyên sâu.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <div className="relative flex-1">
                        <label htmlFor="newsletter-email" className="sr-only">
                            Địa chỉ email
                        </label>
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
                        <input
                            id="newsletter-email"
                            type="email"
                            placeholder="Nhập địa chỉ email của bạn..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full h-12 pl-11 pr-4 rounded-full border border-line bg-surface/70 text-small text-ink placeholder:text-ink-faint focus:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="h-12 px-7 rounded-full bg-brand text-white text-small font-semibold hover:bg-brand-hover transition-all disabled:opacity-60 focus-ring shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                    >
                        <span>{isLoading ? "Đang gửi..." : "Đăng ký ngay"}</span>
                        {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </button>
                </form>

                <div className="flex items-center justify-center gap-2 text-tiny text-ink-faint mt-5">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand" />
                    <span>
                        Không spam • Có thể hủy bất kỳ lúc nào • Tuân thủ{" "}
                        <Link href="/privacy" className="underline hover:text-ink transition-colors">
                            Chính sách bảo mật
                        </Link>
                    </span>
                </div>
            </div>
        </section>
    )
}

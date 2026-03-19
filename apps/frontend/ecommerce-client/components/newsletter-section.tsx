"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSection() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setIsLoading(false)
        setEmail("")
    }

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="relative rounded-3xl overflow-hidden bg-card border border-white/5 shadow-2xl p-8 md:p-16 lg:p-20">
                {/* Subtle Glow Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-primary/10 blur-[100px] pointer-events-none" />
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="relative z-10 text-center max-w-3xl mx-auto"
                >
                    <div className="flex justify-center mb-8">
                        <div className="p-4 bg-secondary/50 rounded-2xl border border-white/5 shadow-sm">
                            <Gift className="h-8 w-8 text-primary" />
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-foreground">
                        Giảm giá 10% cho đơn hàng đầu tiên của bạn
                    </h2>
                    <p className="text-lg md:text-xl mb-10 text-muted-foreground leading-relaxed">
                        Đăng ký nhận bản tin của chúng tôi và là người đầu tiên biết về các sản phẩm mới, ưu đãi độc quyền và thông tin chuyên sâu về công nghệ.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                        <div className="relative flex-1">
                            <label htmlFor="newsletter-email" className="sr-only">Địa chỉ email</label>
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                id="newsletter-email"
                                type="email"
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="pl-12 h-12 rounded-full bg-secondary/30 border-white/10 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary transition-all"
                            />
                        </div>
                        <Button 
                            type="submit" 
                            disabled={isLoading} 
                            className="h-12 rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all font-medium"
                        >
                            {isLoading ? "Đang xử lý..." : "Đăng ký ngay"}
                        </Button>
                    </form>

                    <p className="text-sm text-muted-foreground mt-6 max-w-md mx-auto">
                        Không spam, có thể hủy đăng ký bất cứ lúc nào. Bằng cách đăng ký, bạn đồng ý với <Link href="/privacy" className="underline hover:text-foreground transition-colors">Chính sách Quyền riêng tư</Link> của chúng tôi.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}

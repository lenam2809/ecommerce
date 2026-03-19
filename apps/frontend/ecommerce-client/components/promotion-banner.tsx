"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PromotionBanner() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-card/80 to-accent/40 mix-blend-multiply z-10" />
                <div className="absolute inset-0 bg-card/40 backdrop-blur-[2px] z-10" />
                <Image
                    src="/placeholder.svg?height=400&width=1200"
                    alt="Khuyến mãi"
                    fill
                    className="object-cover"
                />

                <div className="relative z-20 flex flex-col justify-center items-center text-foreground p-8 md:p-16 text-center min-h-[400px]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="max-w-2xl mx-auto"
                    >
                        <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md text-sm font-semibold tracking-wide mb-6 text-primary-foreground border border-white/20 shadow-sm">
                            Ưu đãi có hạn
                        </span>
                        <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white drop-shadow-sm">
                            Siêu Sale Mùa Hè
                        </h3>
                        <p className="text-lg md:text-xl mb-10 text-gray-200 leading-relaxed">
                            Nhập mã <span className="font-mono font-bold text-white bg-white/20 px-3 py-1 rounded-md mx-1 border border-white/10 shadow-inner">SUMMER50</span> để được giảm 50% cho đơn hàng đầu tiên
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-1"
                                asChild
                            >
                                <Link href="/products" className="flex items-center gap-2">
                                    Mua sắm ngay <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="rounded-full px-8 bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all duration-300"
                                asChild
                            >
                                <Link href="/products?sort=newest">
                                    Xem hàng mới về
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

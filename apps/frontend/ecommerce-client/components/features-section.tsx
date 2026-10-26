"use client"

import { Truck, ShieldCheck, RefreshCw, CreditCard } from "lucide-react"

const features = [
    {
        icon: Truck,
        title: "Giao Siêu Tốc 2H",
        description: "Miễn phí đơn từ 500.000₫",
    },
    {
        icon: ShieldCheck,
        title: "Bảo Hành Chính Hãng 24T",
        description: "Ủy quyền Apple & 45 Showroom",
    },
    {
        icon: RefreshCw,
        title: "Đổi Mới 30 Ngày",
        description: "1 đổi 1 tận nơi nếu lỗi kỹ thuật",
    },
    {
        icon: CreditCard,
        title: "Trả Góp 0% Lãi Suất",
        description: "Duyệt nhanh qua CCCD & Thẻ tín dụng",
    },
]

/**
 * FeaturesSection — Editorial Tech Minimalism (SSoT 2026)
 * 4-column elevated USP grid with Electric Blue tech icons and balanced typography
 */
export function FeaturesSection() {
    return (
        <section className="py-4 md:py-8">
            <div className="container-app">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 bg-card p-5 md:p-6 rounded-3xl border border-border/80 dark:border-white/[0.08] shadow-xs dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="flex items-center gap-3.5 px-2 py-1.5 transition-all duration-200 group"
                        >
                            <span className="grid place-items-center h-11 w-11 shrink-0 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                                <feature.icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-foreground tracking-tight leading-snug whitespace-nowrap group-hover:text-primary transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-snug whitespace-nowrap">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

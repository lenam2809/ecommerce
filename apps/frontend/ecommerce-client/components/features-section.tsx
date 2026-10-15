"use client"

import { Truck, ShieldCheck, RefreshCw, HeadphonesIcon } from "lucide-react"

const features = [
    {
        icon: Truck,
        title: "Giao Siêu Tốc 2H",
        description: "Miễn phí vận chuyển từ 2.000.000₫",
    },
    {
        icon: RefreshCw,
        title: "Đổi Trả 30 Ngày",
        description: "1 đổi 1 tận nơi nếu có lỗi kỹ thuật",
    },
    {
        icon: ShieldCheck,
        title: "100% Chính Hãng",
        description: "Cam kết hoàn 200% nếu hàng giả",
    },
    {
        icon: HeadphonesIcon,
        title: "Hỗ Trợ Chuyên Gia 24/7",
        description: "Tư vấn cấu hình & giải pháp trọn đời",
    },
]

/**
 * FeaturesSection — Editorial Tech Minimalism
 * 4-column elevated USP grid with ruby red accent icons and subtle hover border
 */
export function FeaturesSection() {
    return (
        <section className="py-8 md:py-12">
            <div className="container-app">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-card p-6 md:p-8 rounded-3xl border border-line shadow-sm dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="flex items-start gap-4 p-2 transition-all duration-200 group"
                        >
                            <span className="grid place-items-center h-12 w-12 shrink-0 rounded-full bg-brand-soft text-brand group-hover:scale-105 transition-transform duration-200">
                                <feature.icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <h3 className="text-small font-semibold text-ink tracking-tight group-hover:text-brand transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-tiny text-ink-faint mt-1 leading-relaxed">
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

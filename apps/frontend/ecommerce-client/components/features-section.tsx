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
        <section className="border-b border-line/60 bg-surface/50 py-8 md:py-12">
            <div className="container-app">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-line/70 transition-all duration-200 hover:border-ink/30 hover:shadow-xs"
                        >
                            <span className="grid place-items-center h-12 w-12 shrink-0 rounded-2xl bg-brand-soft text-brand">
                                <feature.icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <h3 className="text-small font-semibold text-ink tracking-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-tiny text-ink-faint mt-0.5 leading-relaxed">
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

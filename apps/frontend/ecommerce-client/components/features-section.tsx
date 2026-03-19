"use client"

import { motion } from "framer-motion"
import { Truck, ShieldCheck, RefreshCw, HeadphonesIcon } from "lucide-react"

const features = [
    {
        icon: Truck,
        title: "Miễn phí vận chuyển",
        description: "Cho đơn hàng từ 500k",
    },
    {
        icon: ShieldCheck,
        title: "Thanh toán an toàn",
        description: "Được bảo vệ 100%",
    },
    {
        icon: RefreshCw,
        title: "Đổi trả dễ dàng",
        description: "Trong vòng 30 ngày",
    },
    {
        icon: HeadphonesIcon,
        title: "Hỗ trợ 24/7",
        description: "Luôn sẵn sàng hỗ trợ",
    },
]

export function FeaturesSection() {
    return (
        <section className="py-12 md:py-16 bg-background border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-5 p-6 bg-card rounded-2xl border border-white/5 hover:border-white/10 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div className="p-4 bg-secondary/50 rounded-full text-primary ring-4 ring-background">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

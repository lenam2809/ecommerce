"use client"

import {
    Cpu,
    MonitorSmartphone,
    Camera,
    Battery,
    HardDrive,
    Wifi,
    Smartphone,
    MemoryStick,
    Gauge,
    Palette,
    Package,
    Info,
    Shield,
    Layers,
} from "lucide-react"

interface SpecCardProps {
    name: string
    value: string
}

// Map spec names to icons
const getSpecIcon = (name: string) => {
    const lowerName = name.toLowerCase()

    if (lowerName.includes("cpu") || lowerName.includes("chip") || lowerName.includes("vi xử lý") || lowerName.includes("gpu") || lowerName.includes("nhân")) {
        return <Cpu className="w-4.5 h-4.5" />
    }
    if (lowerName.includes("màn hình") || lowerName.includes("display") || lowerName.includes("screen") || lowerName.includes("oled")) {
        return <MonitorSmartphone className="w-4.5 h-4.5" />
    }
    if (lowerName.includes("camera") || lowerName.includes("ống kính") || lowerName.includes("quay phim")) {
        return <Camera className="w-4.5 h-4.5" />
    }
    if (lowerName.includes("pin") || lowerName.includes("battery") || lowerName.includes("sạc")) {
        return <Battery className="w-4.5 h-4.5" />
    }
    if (lowerName.includes("bộ nhớ") || lowerName.includes("storage") || lowerName.includes("ssd") || lowerName.includes("ổ cứng") || lowerName.includes("dung lượng")) {
        return <HardDrive className="w-4.5 h-4.5" />
    }
    if (lowerName.includes("ram") || lowerName.includes("bộ nhớ đệm")) {
        return <MemoryStick className="w-4.5 h-4.5" />
    }
    if (lowerName.includes("kết nối") || lowerName.includes("wifi") || lowerName.includes("cổng") || lowerName.includes("bluetooth")) {
        return <Wifi className="w-4.5 h-4.5" />
    }
    if (lowerName.includes("kích thước") || lowerName.includes("size") || lowerName.includes("mỏng")) {
        return <Smartphone className="w-4.5 h-4.5" />
    }
    if (lowerName.includes("hiệu năng") || lowerName.includes("benchmark") || lowerName.includes("antutu")) {
        return <Gauge className="w-4.5 h-4.5" />
    }
    if (lowerName.includes("màu") || lowerName.includes("color")) {
        return <Palette className="w-4.5 h-4.5" />
    }
    if (lowerName.includes("hệ điều hành") || lowerName.includes("os") || lowerName.includes("bàn phím")) {
        return <Layers className="w-4.5 h-4.5" />
    }
    if (lowerName.includes("bảo hành") || lowerName.includes("chống nước") || lowerName.includes("kháng nước") || lowerName.includes("ip68")) {
        return <Shield className="w-4.5 h-4.5" />
    }
    if (lowerName.includes("trọng lượng") || lowerName.includes("weight") || lowerName.includes("khối lượng")) {
        return <Package className="w-4.5 h-4.5" />
    }

    return <Info className="w-4.5 h-4.5" />
}

export function SpecCard({ name, value }: SpecCardProps) {
    return (
        <div className="border border-line/70 rounded-2xl p-4 flex items-start gap-3.5 bg-card hover:border-primary/40 transition-all duration-200">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                {getSpecIcon(name)}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-tiny font-semibold uppercase tracking-wider text-ink-faint mb-0.5">
                    {name}
                </p>
                <p className="text-small font-semibold text-ink break-words leading-snug tabular-nums">
                    {value}
                </p>
            </div>
        </div>
    )
}

interface SpecGridProps {
    specifications?: { name: string; value: string }[]
}

export function SpecGrid({ specifications = [] }: SpecGridProps) {
    if (!specifications || specifications.length === 0) {
        return (
            <div className="rounded-2xl border border-line p-8 text-center bg-card text-ink-muted">
                Chưa có thông số kỹ thuật chi tiết cho sản phẩm này.
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Quick Cards Grid (Top 6 Key Specs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {specifications.slice(0, 6).map((spec, index) => (
                    <SpecCard key={index} name={spec.name} value={spec.value} />
                ))}
            </div>

            {/* Technical Specifications Table */}
            <div className="rounded-2xl border border-line overflow-hidden bg-card mt-6 shadow-xs">
                <div className="px-5 py-3.5 bg-surface-2 dark:bg-card border-b border-line flex items-center justify-between">
                    <h4 className="text-small font-bold text-ink">
                        Bảng thông số kỹ thuật chi tiết ({specifications.length} hạng mục)
                    </h4>
                    <span className="text-tiny font-semibold text-primary">Thông số kỹ thuật chính hãng</span>
                </div>
                <div className="divide-y divide-line/60">
                    {specifications.map((spec, index) => (
                        <div
                            key={index}
                            className={`grid grid-cols-1 sm:grid-cols-12 px-5 py-3.5 text-small transition-colors ${
                                index % 2 === 1
                                    ? "bg-slate-50/90 dark:bg-white/[0.03]"
                                    : "bg-card dark:bg-card/40"
                            } hover:bg-primary/5`}
                        >
                            <span className="font-semibold text-ink-soft sm:col-span-4 pr-4">
                                {spec.name}
                            </span>
                            <span className="font-semibold text-ink sm:col-span-8 mt-1 sm:mt-0 break-words leading-relaxed tabular-nums">
                                {spec.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

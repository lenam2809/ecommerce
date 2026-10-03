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
    Layers
} from "lucide-react"

interface SpecCardProps {
    name: string
    value: string
}

// Map spec names to icons
const getSpecIcon = (name: string) => {
    const lowerName = name.toLowerCase()

    if (lowerName.includes("cpu") || lowerName.includes("chip") || lowerName.includes("vi xử lý") || lowerName.includes("processor")) {
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
    if (lowerName.includes("bộ nhớ") || lowerName.includes("storage") || lowerName.includes("rom") || lowerName.includes("dung lượng")) {
        return <HardDrive className="w-4.5 h-4.5" />
    }
    if (lowerName.includes("ram") || lowerName.includes("bộ nhớ đệm")) {
        return <MemoryStick className="w-4.5 h-4.5" />
    }
    if (lowerName.includes("kết nối") || lowerName.includes("wifi") || lowerName.includes("5g") || lowerName.includes("bluetooth")) {
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
    if (lowerName.includes("hệ điều hành") || lowerName.includes("os")) {
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
        <div className="border border-line/70 rounded-2xl p-4 flex items-center gap-3.5 bg-card hover:border-ink/30 transition-all duration-200">
            <div className="h-10 w-10 rounded-xl bg-surface-2 flex items-center justify-center shrink-0 text-brand">
                {getSpecIcon(name)}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-tiny font-semibold uppercase tracking-wider text-ink-faint mb-0.5">
                    {name}
                </p>
                <p className="text-small font-semibold text-ink truncate" title={value}>
                    {value}
                </p>
            </div>
        </div>
    )
}

interface SpecGridProps {
    specifications: { name: string; value: string }[]
}

export function SpecGrid({ specifications }: SpecGridProps) {
    if (!specifications || specifications.length === 0) {
        return (
            <div className="border border-line rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-surface/30">
                <div className="h-14 w-14 bg-surface rounded-full flex items-center justify-center mb-3">
                    <Info className="h-6 w-6 text-ink-faint" />
                </div>
                <h4 className="text-small font-semibold text-ink mb-1">Đang cập nhật thông số</h4>
                <p className="text-ink-soft text-tiny">Sản phẩm này đang được đồng bộ thông số chi tiết.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Quick Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {specifications.slice(0, 6).map((spec, index) => (
                    <SpecCard key={index} name={spec.name} value={spec.value} />
                ))}
            </div>

            {/* Editorial Hairline 2-Column Table */}
            <div className="rounded-2xl border border-line overflow-hidden bg-card mt-6">
                <div className="px-5 py-3.5 bg-surface-2 border-b border-line">
                    <h4 className="text-small font-semibold text-ink">Bảng thông số kỹ thuật đầy đủ</h4>
                </div>
                <div className="divide-y divide-line/60">
                    {specifications.map((spec, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 sm:grid-cols-3 px-5 py-3.5 text-small hover:bg-surface/50 transition-colors"
                        >
                            <span className="font-medium text-ink-faint sm:col-span-1">{spec.name}</span>
                            <span className="font-semibold text-ink sm:col-span-2 mt-0.5 sm:mt-0">
                                {spec.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

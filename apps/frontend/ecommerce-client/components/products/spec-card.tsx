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

const DEFAULT_14_SPECS: { name: string; value: string }[] = [
    { name: "Vi xử lý (CPU)", value: "Apple M3 Pro (12-Core CPU: 6 nhân hiệu năng cao + 6 nhân tiết kiệm điện)" },
    { name: "Nhân đồ họa (GPU)", value: "18-Core GPU hỗ trợ Hardware-accelerated Ray Tracing & Mesh Shading" },
    { name: "Nhân AI (Neural Engine)", value: "16-Core Neural Engine (18 TOPS), băng thông bộ nhớ 150GB/s" },
    { name: "Bộ nhớ RAM", value: "36GB Unified Memory (LPDDR5)" },
    { name: "Ổ cứng lưu trữ (SSD)", value: "1TB PCIe NVMe SSD siêu tốc (Tốc độ đọc lên tới 7.4GB/s)" },
    { name: "Màn hình hiển thị", value: "14.2 inch Liquid Retina XDR (3024 x 1964), 1.600 nits HDR, 120Hz ProMotion" },
    { name: "Cổng kết nối vật lý", value: "3x Thunderbolt 4 (USB-C), 1x HDMI 2.1, Khe thẻ SDXC, MagSafe 3, Jack 3.5mm" },
    { name: "Kết nối không dây", value: "Wi-Fi 6E (802.11ax) + Bluetooth 5.3" },
    { name: "Camera & Âm thanh", value: "Camera FaceTime HD 1080p • Hệ thống 6 loa Hi-Fi Spatial Audio Dolby Atmos" },
    { name: "Bàn phím & Bảo mật", value: "Magic Keyboard có đèn nền, cảm biến vân tay Touch ID" },
    { name: "Pin & Sạc nhanh", value: "72.4 Wh Li-Po (Thời lượng lên tới 18 giờ), Sạc nhanh 96W USB-C Power Adapter" },
    { name: "Kích thước & Trọng lượng", value: "31.26 x 22.12 x 1.55 cm • Trọng lượng 1.61 kg (Vỏ nhôm nguyên khối tái chế)" },
    { name: "Hệ điều hành", value: "macOS Sequoia (Tích hợp sẵn bộ công cụ Apple Intelligence)" },
    { name: "Chính sách bảo hành", value: "12 tháng chính hãng Apple + 12 tháng mở rộng độc quyền ShopViet (Tổng 24 tháng)" },
]

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
    specifications: { name: string; value: string }[]
}

export function SpecGrid({ specifications }: SpecGridProps) {
    // Merge provided specs with SSoT 14-item matrix so we always display 14 comprehensive Zebra-striped rows
    const mergedSpecs = (() => {
        if (!specifications || specifications.length === 0) return DEFAULT_14_SPECS
        if (specifications.length >= 14) return specifications
        const existingNames = new Set(specifications.map((s) => s.name.toLowerCase()))
        const extras = DEFAULT_14_SPECS.filter((d) => !existingNames.has(d.name.toLowerCase()))
        return [...specifications, ...extras].slice(0, 14)
    })()

    return (
        <div className="space-y-6">
            {/* Quick Cards Grid (Top 6 Key Specs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {mergedSpecs.slice(0, 6).map((spec, index) => (
                    <SpecCard key={index} name={spec.name} value={spec.value} />
                ))}
            </div>

            {/* 14-Item Zebra-Striping Technical Specifications Table */}
            <div className="rounded-2xl border border-line overflow-hidden bg-card mt-6 shadow-xs">
                <div className="px-5 py-3.5 bg-surface-2 dark:bg-[#111827] border-b border-line flex items-center justify-between">
                    <h4 className="text-small font-bold text-ink">
                        Bảng thông số kỹ thuật chi tiết ({mergedSpecs.length} hạng mục)
                    </h4>
                    <span className="text-tiny font-semibold text-primary">Chuẩn kiểm định Apple VN/A</span>
                </div>
                <div className="divide-y divide-line/60">
                    {mergedSpecs.map((spec, index) => (
                        <div
                            key={index}
                            className={`grid grid-cols-1 sm:grid-cols-12 px-5 py-3.5 text-small transition-colors ${
                                index % 2 === 1
                                    ? "bg-slate-50/90 dark:bg-white/[0.03]"
                                    : "bg-card dark:bg-[#090D16]/40"
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

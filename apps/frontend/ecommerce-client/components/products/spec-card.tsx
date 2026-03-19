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
    Info
} from "lucide-react"

interface SpecCardProps {
    name: string
    value: string
}

// Map spec names to icons
const getSpecIcon = (name: string) => {
    const lowerName = name.toLowerCase()

    if (lowerName.includes('cpu') || lowerName.includes('chip') || lowerName.includes('vi xử lý')) {
        return <Cpu className="w-5 h-5" />
    }
    if (lowerName.includes('màn hình') || lowerName.includes('display') || lowerName.includes('screen')) {
        return <MonitorSmartphone className="w-5 h-5" />
    }
    if (lowerName.includes('camera')) {
        return <Camera className="w-5 h-5" />
    }
    if (lowerName.includes('pin') || lowerName.includes('battery')) {
        return <Battery className="w-5 h-5" />
    }
    if (lowerName.includes('bộ nhớ') || lowerName.includes('storage') || lowerName.includes('rom')) {
        return <HardDrive className="w-5 h-5" />
    }
    if (lowerName.includes('ram')) {
        return <MemoryStick className="w-5 h-5" />
    }
    if (lowerName.includes('kết nối') || lowerName.includes('wifi') || lowerName.includes('5g')) {
        return <Wifi className="w-5 h-5" />
    }
    if (lowerName.includes('kích thước') || lowerName.includes('size')) {
        return <Smartphone className="w-5 h-5" />
    }
    if (lowerName.includes('hiệu năng') || lowerName.includes('benchmark')) {
        return <Gauge className="w-5 h-5" />
    }
    if (lowerName.includes('màu') || lowerName.includes('color')) {
        return <Palette className="w-5 h-5" />
    }
    if (lowerName.includes('trọng lượng') || lowerName.includes('weight') || lowerName.includes('khối lượng')) {
        return <Package className="w-5 h-5" />
    }

    return <Info className="w-5 h-5" />
}

export function SpecCard({ name, value }: SpecCardProps) {
    return (
        <div className="glass-card bg-secondary/10 border-border/30 rounded-2xl p-4 sm:p-5 flex items-center gap-4 hover:bg-secondary/20 hover:border-primary/20 transition-all duration-300 group">
            <div className="h-12 w-12 rounded-xl bg-background/50 border border-border/40 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 shadow-sm text-muted-foreground">
                {getSpecIcon(name)}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{name}</p>
                <p className="text-sm font-medium text-foreground uppercase tracking-wide truncate" title={value}>
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
            <div className="glass-card rounded-3xl p-10 flex flex-col items-center justify-center border-border/50 text-center">
                <div className="h-16 w-16 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
                    <Info className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h4 className="tech-heading text-lg text-foreground mb-2">Chưa có thông số kỹ thuật</h4>
                <p className="text-muted-foreground text-sm">Sản phẩm này hiện đang cập nhật thông số.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {specifications.map((spec, index) => (
                <SpecCard key={index} name={spec.name} value={spec.value} />
            ))}
        </div>
    )
}

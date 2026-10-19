"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Flame,
  ShieldCheck,
  Zap,
  MapPin,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Cpu,
  Sparkles,
} from "lucide-react"
import { Banner } from "@/types/banner"

interface HeroProps {
  banners: Banner[]
}

const QUICK_CATEGORIES = [
  { key: "all", label: "Nổi bật", href: "#bestselling", icon: Sparkles, active: true },
  { key: "phone", label: "Điện thoại", href: "/products?q=iPhone", icon: Smartphone },
  { key: "laptop", label: "Laptop & Mac", href: "/products?q=MacBook", icon: Laptop },
  { key: "audio", label: "Âm thanh", href: "/products?q=Tai+nghe", icon: Headphones },
  { key: "watch", label: "Đồng hồ", href: "/products?q=Watch", icon: Watch },
  { key: "accessories", label: "Phụ kiện", href: "/products?q=Sạc", icon: Cpu },
]

export function Hero({ banners }: HeroProps) {
  const slide = banners?.find((b) => b.isActive) ?? banners?.[0]
  const imageUrl = slide?.imageUrl || "/hero-showcase.webp"

  // Live Flash Sale Countdown starting at 08:45:12 (31512 seconds)
  const [secondsLeft, setSecondsLeft] = useState(8 * 3600 + 45 * 60 + 12)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 8 * 3600 + 45 * 60 + 12))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, "0")
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0")
  const seconds = String(secondsLeft % 60).padStart(2, "0")

  return (
    <section className="relative isolate bg-background overflow-hidden pt-2 pb-6 md:pt-6 md:pb-12">
      <div className="container-app">
        {/* Bento Grid Showcase (Compact on Mobile ~25% shorter so first product row is visible) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-stretch">
          {/* Primary Dark Bento Hero Block (8 cols on lg) */}
          <div className="lg:col-span-8 relative rounded-3xl overflow-hidden bg-[#090D16] text-white border border-slate-800/90 shadow-xl flex flex-col justify-between p-5 sm:p-7 md:p-10 min-h-[290px] sm:min-h-[360px] lg:min-h-[440px]">
            {/* Background Hero Image & Subtle Ambient Glows */}
            <div className="absolute inset-0 z-0">
              <Image
                src={imageUrl}
                alt="MacBook Pro 14 M3 Pro Flagship 2026"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover object-right opacity-35 sm:opacity-45 mix-blend-luminosity scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#090D16] via-[#090D16]/90 to-[#090D16]/30" />
              <div
                className="absolute -top-24 -left-24 w-80 h-80 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-24 right-12 w-72 h-72 bg-[#E11D48]/15 rounded-full blur-3xl pointer-events-none"
                aria-hidden="true"
              />
            </div>

            {/* Top Bar: Flash Sale Badge + Countdown Timer */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E11D48] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                <Flame className="h-3.5 w-3.5 fill-current animate-pulse" />
                <span>Flash Sale Độc Quyền 2026</span>
              </div>

              {/* Countdown Timer */}
              <div
                className="inline-flex items-center gap-1.5 bg-[#111827]/90 border border-slate-700/80 px-3 py-1 rounded-full text-xs font-semibold text-slate-200 backdrop-blur-md"
                aria-label="Đồng hồ đếm ngược Flash Sale"
              >
                <span className="text-slate-400 hidden sm:inline text-[11px]">Kết thúc sau:</span>
                <div className="flex items-center gap-1 tabular-nums whitespace-nowrap font-bold text-white">
                  <span className="bg-[#E11D48] text-white px-1.5 py-0.5 rounded text-[11px]">
                    {hours}
                  </span>
                  <span className="text-[#E11D48]">:</span>
                  <span className="bg-[#E11D48] text-white px-1.5 py-0.5 rounded text-[11px]">
                    {minutes}
                  </span>
                  <span className="text-[#E11D48]">:</span>
                  <span className="bg-[#E11D48] text-white px-1.5 py-0.5 rounded text-[11px]">
                    {seconds}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Content: Editorial Flagship Title & Pricing */}
            <div className="relative z-10 my-4 sm:my-6 max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#60A5FA] mb-2">
                <span>MacBook Pro 14 M3 Pro</span>
                <span>•</span>
                <span>36GB / 1TB SSD</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                Đỉnh Cao Hiệu Năng.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#60A5FA]">
                  Chuẩn Mực Pro.
                </span>
              </h1>

              <p className="mt-2.5 sm:mt-3.5 text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-none max-w-lg">
                Siêu phẩm chip Apple M3 Pro kiến trúc 3nm, màn hình Liquid Retina XDR 120Hz cùng đặc quyền bảo hành ủy quyền 24 tháng tại hệ thống 45 Showroom ShopViet.
              </p>

              {/* Featured Price Pill & CTA Group */}
              <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-baseline gap-2 bg-[#111827]/90 border border-slate-800 px-4 py-2 rounded-2xl">
                  <span className="text-xs text-slate-400">Giá ưu đãi:</span>
                  <span className="text-lg sm:text-2xl font-extrabold text-white tabular-nums whitespace-nowrap">
                    61.990.000₫
                  </span>
                  <span className="text-xs text-slate-500 line-through tabular-nums whitespace-nowrap hidden sm:inline">
                    67.990.000₫
                  </span>
                </div>

                <Link
                  href="/products?q=MacBook"
                  className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-6 rounded-full bg-[#E11D48] text-white text-xs sm:text-sm font-bold hover:bg-[#BE123C] transition-all duration-200 shadow-md hover:shadow-lg shrink-0"
                >
                  <span>Mua ngay</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Bottom Trust Bar inside Hero Bento */}
            <div className="relative z-10 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] sm:text-xs text-slate-300">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <MapPin className="h-3.5 w-3.5 text-[#3B82F6] shrink-0" />
                  <strong className="text-white font-semibold">45 Showroom</strong> toàn quốc
                </span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#3B82F6] shrink-0" />
                  Bảo hành <strong className="text-white font-semibold">24 tháng</strong>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Zap className="h-3.5 w-3.5 text-[#3B82F6] shrink-0" />
                  Freeship đơn từ <strong className="text-white font-semibold tabular-nums">500.000₫</strong>
                </span>
              </div>
              <span className="hidden md:inline text-slate-400 tabular-nums">
                Hotline: <strong className="text-white">1800 6868</strong>
              </span>
            </div>
          </div>

          {/* Right Column: Secondary Bento Stack (4 cols on lg) */}
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 md:gap-6">
            {/* Bento Sub-Card 1: iPhone 16 Pro Max 256GB — SSoT Price 34.990.000đ */}
            <Link
              href="/products?q=iPhone"
              className="group relative rounded-3xl overflow-hidden bg-[#111827] text-white border border-slate-800/90 p-4 sm:p-6 flex flex-col justify-between hover:border-[#2563EB]/60 transition-all duration-300 shadow-md"
            >
              <div
                className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#2563EB]/15 rounded-full blur-2xl pointer-events-none"
                aria-hidden="true"
              />

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/20 text-[#60A5FA] border border-[#2563EB]/30 text-[10px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap">
                    Flagship Bán Chạy
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E11D48] text-white text-[10px] sm:text-[11px] font-bold tabular-nums whitespace-nowrap">
                    -13%
                  </span>
                </div>

                <h2 className="text-sm sm:text-lg font-bold text-white group-hover:text-[#60A5FA] transition-colors line-clamp-2">
                  iPhone 16 Pro Max 256GB Titan Tự Nhiên
                </h2>

                {/* Max 2 Spec Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    A18 Pro
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    256GB VN/A
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-end justify-between gap-2">
                <div>
                  <p className="text-[10px] text-slate-400">Giá niêm yết chuẩn:</p>
                  <p className="text-base sm:text-xl font-extrabold text-white tabular-nums whitespace-nowrap">
                    34.990.000₫
                  </p>
                  <p className="text-[11px] text-slate-500 line-through tabular-nums whitespace-nowrap">
                    39.990.000₫
                  </p>
                </div>
                <span className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            {/* Bento Sub-Card 2: Trade-In & 45 Showrooms Experience */}
            <Link
              href="/products"
              className="group relative rounded-3xl overflow-hidden bg-card dark:bg-[#111827] border border-border dark:border-slate-800/90 p-4 sm:p-6 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 shadow-xs"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-[11px] font-bold uppercase tracking-wide mb-2">
                  <Sparkles className="h-3 w-3" />
                  <span>Thu Cũ Đổi Mới 2026</span>
                </div>

                <h2 className="text-sm sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  Trợ giá lên đời tới <span className="text-primary tabular-nums whitespace-nowrap">5.000.000₫</span>
                </h2>

                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                  Định giá máy cũ trong 5 phút tại <strong className="text-foreground">45 Showroom</strong> toàn quốc. Hỗ trợ trả góp 0% lãi suất.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Xem bảng giá thu cũ</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile & Desktop Category Quick-Filter Tabs (Active Electric Blue #2563EB indicator) */}
        <div className="mt-4 sm:mt-6 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
          {QUICK_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isActive = activeTab === cat.key
            return (
              <Link
                key={cat.key}
                href={cat.href}
                onClick={() => setActiveTab(cat.key)}
                className={`inline-flex items-center gap-2 h-10 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 border ${
                  isActive
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
                    : "bg-card dark:bg-[#111827] text-foreground border-border hover:border-[#2563EB]/50 hover:text-[#2563EB]"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{cat.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { Category } from "@/types/category"
import { cn } from "@/lib/utils"

interface CategorySectionProps {
  categories: Category[]
}

type BentoSize = "hero" | "wide" | "small"

interface BentoTile {
  key: string
  badge: string
  title: string
  description?: string
  cta: string
  image: string
  size: BentoSize
  keywords: string[]
}

const TILES: BentoTile[] = [
  {
    key: "smartphone",
    badge: "Flagship 2026",
    title: "Điện Thoại Thông Minh",
    description: "Thế hệ iPhone 16 Pro Max & Flagship AI tiên tiến khung viền Titanium.",
    cta: "Khám phá bộ sưu tập",
    image: "/bento/smartphone.jpg",
    size: "hero",
    keywords: ["dien-thoai", "dien thoai", "smartphone", "phone"],
  },
  {
    key: "laptop-tablet",
    badge: "Hiệu năng M3/M4",
    title: "Laptop & Tablet",
    description: "Sức mạnh kiến trúc mới cho kỹ sư và nhà sáng tạo chuyên nghiệp.",
    cta: "Khám phá",
    image: "/bento/laptop-tablet.jpg",
    size: "wide",
    keywords: ["laptop", "tablet", "may-tinh", "may tinh"],
  },
  {
    key: "audio",
    badge: "Hi-Res Audio",
    title: "Âm Thanh Đỉnh Cao",
    cta: "Khám phá",
    image: "/bento/audio.jpg",
    size: "small",
    keywords: ["am-thanh", "am thanh", "audio", "tai-nghe", "tai nghe", "loa"],
  },
  {
    key: "smart-home",
    badge: "Smart Living",
    title: "Nhà Thông Minh",
    cta: "Khám phá",
    image: "/bento/smart-home.jpg",
    size: "small",
    keywords: ["nha-thong-minh", "nha thong minh", "smart-home", "smart home"],
  },
  {
    key: "accessories",
    badge: "Chuẩn Thunderbolt / MagSafe",
    title: "Phụ Kiện Cao Cấp",
    description: "Cáp Ugreen Type-C 2m (450.000₫), trạm sạc Belkin 3-in-1 chính hãng.",
    cta: "Khám phá",
    image: "/bento/accessories.jpg",
    size: "wide",
    keywords: ["phu-kien", "phu kien", "accessor"],
  },
  {
    key: "wearables",
    badge: "Wearables",
    title: "Thiết Bị Đeo Thông Minh",
    description: "Theo dõi chỉ số sức khỏe, ECG và thể thao chuyên sâu 24/7.",
    cta: "Khám phá",
    image: "/bento/wearables.jpg",
    size: "wide",
    keywords: ["deo-thong-minh", "thiet-bi-deo", "thiet bi deo", "dong-ho", "dong ho", "smartwatch", "wearable", "watch"],
  },
]

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
}

function findCategory(categories: Category[], keywords: string[]) {
  return categories.find((category) => {
    const haystack = `${normalize(category.slug ?? "")} ${normalize(category.name ?? "")}`
    return keywords.some((keyword) => haystack.includes(keyword))
  })
}

const SIZE_CLASSES: Record<BentoSize, string> = {
  hero: "col-span-2 md:col-span-2 lg:col-span-2 row-span-2 p-5 md:p-8",
  wide: "col-span-2 md:col-span-1 lg:col-span-2 p-5 md:p-6",
  small: "col-span-1 p-4 md:p-6",
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section id="categories" className="py-10 md:py-16 bg-surface/30 border-y border-line/40">
      <div className="container-app">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-4">
          <div className="section-heading !mb-0">
            <span className="section-label !text-primary font-semibold">Hệ Sinh Thái Thiết Bị</span>
            <h2 className="section-title">Danh Mục Nổi Bật</h2>
            <p className="text-small text-muted-foreground mt-1 max-w-lg">
              Tuyển tập những thiết bị công nghệ định hình phong cách sống hiện đại tại 45 Showroom.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-small font-semibold text-foreground hover:text-primary transition-colors group w-fit"
          >
            <span>
              Xem tất cả danh mục{categories.length > 0 ? ` (${categories.length})` : ""}
            </span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-6 auto-rows-[180px] md:auto-rows-[250px]">
          {TILES.map((tile) => {
            const category = findCategory(categories, tile.keywords)
            const href = category ? `/${category.slug}` : "/products"
            const isHero = tile.size === "hero"

            return (
              <Link
                key={tile.key}
                href={href}
                aria-label={`${tile.title} — ${tile.cta}`}
                className={cn(
                  "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-bento-dark transition-all duration-300 hover:shadow-lg hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  SIZE_CLASSES[tile.size]
                )}
              >
                <Image
                  src={tile.image}
                  alt={tile.title}
                  fill
                  sizes={isHero ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-80"
                />
                {/* High contrast dark gradient overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-bento-dark/95 via-bento-dark/50 to-transparent"
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  <span className="inline-block bg-bento-dark/80 backdrop-blur-md text-tech-blue border border-tech-blue/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide">
                    {tile.badge}
                  </span>
                </div>

                <div className="relative z-10 text-white drop-shadow-xs">
                  <h3
                    className={cn(
                      "font-bold tracking-tight text-white",
                      isHero ? "text-xl md:text-3xl mb-1.5" : "text-base md:text-xl mb-1"
                    )}
                  >
                    {tile.title}
                  </h3>
                  {tile.description && (
                    <p
                      className={cn(
                        "text-slate-200 leading-relaxed line-clamp-2",
                        isHero ? "text-xs md:text-sm max-w-sm mb-3" : "text-xs mb-2 hidden sm:block"
                      )}
                    >
                      {tile.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-tech-blue transition-colors">
                    <span>{tile.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

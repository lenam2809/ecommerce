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
  /** Từ khóa (không dấu) để ghép với danh mục thật từ API */
  keywords: string[]
}

/**
 * Bố cục bento theo thiết kế Stitch "Danh Mục Nổi Bật".
 * lg: lưới 4 cột, hàng cao 280px
 *  ┌───────────┬───────────┐
 *  │           │  Laptop   │
 *  │ Điện thoại├─────┬─────┤
 *  │ (2x2)     │ Âm  │ Nhà │
 *  │           │thanh│ TM  │
 *  ├───────────┴─────┴─────┤
 *  │ Phụ kiện (2) │ Đeo (2)│
 *  └─────────────────────────┘
 */
const TILES: BentoTile[] = [
  {
    key: "smartphone",
    badge: "Flagship",
    title: "Điện Thoại Thông Minh",
    description: "Các phiên bản cao cấp tích hợp AI tiên tiến và vật liệu Titanium vũ trụ.",
    cta: "Khám phá bộ sưu tập",
    image: "/bento/smartphone.jpg",
    size: "hero",
    keywords: ["dien-thoai", "dien thoai", "smartphone", "phone"],
  },
  {
    key: "laptop-tablet",
    badge: "Hiệu năng cao",
    title: "Laptop & Tablet",
    description: "Sức mạnh kiến trúc mới cho nhà sáng tạo.",
    cta: "Khám phá",
    image: "/bento/laptop-tablet.jpg",
    size: "wide",
    keywords: ["laptop", "tablet", "may-tinh", "may tinh"],
  },
  {
    key: "audio",
    badge: "Hi-Fi Audio",
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
    badge: "Phụ kiện MagSafe",
    title: "Phụ Kiện Cao Cấp",
    description: "Đồng bộ tuyệt đối cho toàn bộ hệ sinh thái thiết bị.",
    cta: "Khám phá",
    image: "/bento/accessories.jpg",
    size: "wide",
    keywords: ["phu-kien", "phu kien", "accessor"],
  },
  {
    key: "wearables",
    badge: "Wearables",
    title: "Thiết Bị Đeo Thông Minh",
    description: "Theo dõi chỉ số sức khỏe và giấc ngủ theo thời gian thực.",
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
  hero: "md:col-span-2 lg:col-span-2 row-span-2 p-6 md:p-8",
  wide: "md:col-span-1 lg:col-span-2 p-6",
  small: "p-6",
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section id="categories" className="py-14 md:py-20 bg-surface/30 border-b border-line/40">
      <div className="container-app">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
          <div className="section-heading !mb-0">
            <span className="section-label !text-brand font-semibold">Danh mục thiết kế</span>
            <h2 className="section-title">Danh Mục Nổi Bật</h2>
            <p className="text-small text-ink-faint mt-1 max-w-lg">
              Tuyển tập những thiết bị định hình phong cách sống.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-small font-semibold text-ink hover:text-brand transition-colors group w-fit"
          >
            <span>
              Xem tất cả danh mục{categories.length > 0 ? ` (${categories.length})` : ""}
            </span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[240px] md:auto-rows-[280px]">
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
                  "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface-2 transition-all duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  SIZE_CLASSES[tile.size]
                )}
              >
                <Image
                  src={tile.image}
                  alt=""
                  fill
                  sizes={isHero ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t via-black/10 to-transparent",
                    isHero ? "from-black/80 via-black/20" : "from-black/75"
                  )}
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold uppercase tracking-wider">
                    {tile.badge}
                  </span>
                </div>

                <div className="relative z-10 text-white">
                  <h3
                    className={cn(
                      "font-semibold tracking-tight",
                      isHero ? "text-h2 mb-2" : "text-h3"
                    )}
                  >
                    {tile.title}
                  </h3>
                  {tile.description && (
                    <p
                      className={cn(
                        "text-white/80 mb-3",
                        isHero ? "text-small max-w-sm mb-4" : "text-tiny mb-2"
                      )}
                    >
                      {tile.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-tiny font-semibold text-white group-hover:text-primary-container transition-colors">
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

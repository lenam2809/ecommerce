"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import { Hero } from "@/components/hero"
import { useBestsellingProducts } from "@/hooks/use-products"
import { useCategories } from "@/hooks/use-categories"
import ProductCardSkeleton from "@/components/product-card-skeleton"
import CategoryGridSkeleton from "@/components/category-grid-skeleton"
import { useAllBanners } from "@/hooks/use-banners"
import Footer from "@/components/footer"
import { Header } from "@/components/header/index"
import { CategorySection } from "@/components/category-section"
import { FeaturesSection } from "@/components/features-section"
import { PromotionBanner } from "@/components/promotion-banner"
import { Product } from "@/types/product"

const FALLBACK_FLAGSHIP_PRODUCTS: Product[] = [
  {
    id: "flagship-macbook-pro-14-m3-pro",
    name: "MacBook Pro 14 M3 Pro (36GB/1TB) Chính hãng VN/A",
    slug: "macbook-pro-16-inch-m3-max",
    price: 67990000,
    salePrice: 61990000,
    rating: 5.0,
    reviewCount: 142,
    mainImage: "/uploads/products/macbook-pro-16-inch-m3-max-main.jpg",
    categoryId: "laptop",
    categoryName: "Laptop & Mac",
    categorySlug: "laptop",
    stockQuantity: 15,
    specifications: [
      { name: "Chip", value: "M3 Pro 12-Core" },
      { name: "RAM/SSD", value: "36GB / 1TB" },
    ],
  },
  {
    id: "flagship-iphone-16-pro-max-256gb",
    name: "iPhone 16 Pro Max 256GB Titan Tự Nhiên VN/A",
    slug: "iphone-16-pro-max-256gb",
    price: 39990000,
    salePrice: 34990000,
    rating: 4.9,
    reviewCount: 328,
    mainImage: "/uploads/products/iphone-16-pro-max-256gb-main.jpg",
    categoryId: "smartphone",
    categoryName: "Điện thoại",
    categorySlug: "dien-thoai",
    stockQuantity: 24,
    specifications: [
      { name: "Chip", value: "Apple A18 Pro" },
      { name: "Dung lượng", value: "256GB Titan" },
    ],
  },
  {
    id: "flagship-samsung-s25-ultra",
    name: "Samsung Galaxy S25 Ultra 5G 12GB/512GB Chính Hãng",
    slug: "samsung-galaxy-s25-ultra",
    price: 35990000,
    salePrice: 31990000,
    rating: 4.9,
    reviewCount: 195,
    mainImage: "/uploads/products/samsung-galaxy-s25-ultra-main.jpg",
    categoryId: "smartphone",
    categoryName: "Điện thoại",
    categorySlug: "dien-thoai",
    stockQuantity: 18,
    specifications: [
      { name: "Chip", value: "Snapdragon 8 Elite" },
      { name: "RAM/ROM", value: "12GB / 512GB" },
    ],
  },
  {
    id: "flagship-sony-wh-1000xm5",
    name: "Tai nghe chống ồn Sony WH-1000XM5 Hi-Res Audio",
    slug: "tai-nghe-sony-wh-1000xm5",
    price: 8490000,
    salePrice: 7490000,
    rating: 4.8,
    reviewCount: 89,
    mainImage: "/uploads/products/tai-nghe-sony-wh-1000xm5-main.jpg",
    categoryId: "audio",
    categoryName: "Âm thanh",
    categorySlug: "am-thanh",
    stockQuantity: 30,
    specifications: [
      { name: "Chống ồn", value: "ANC Đa điểm" },
      { name: "Pin", value: "30 Giờ Hi-Res" },
    ],
  },
]

function normalizeSSoTProduct(p: Product): Product {
  const lower = p.name.toLowerCase()
  if (lower.includes("iphone 16 pro max")) {
    return {
      ...p,
      price: 39990000,
      salePrice: 34990000,
    }
  }
  if (lower.includes("macbook pro") && (lower.includes("m3") || lower.includes("14") || lower.includes("16"))) {
    return {
      ...p,
      price: 67990000,
      salePrice: 61990000,
    }
  }
  if (lower.includes("ugreen") && lower.includes("cáp")) {
    return {
      ...p,
      name: "Cáp sạc nhanh Ugreen Type-C to Type-C 100W 2m",
      price: 550000,
      salePrice: 450000,
    }
  }
  return p
}

export default function Home() {
  const { data: bestsellingProducts, isLoading: isLoadingProducts } = useBestsellingProducts()
  const { data: categories, isLoading: isLoadingCategories } = useCategories()
  const { data: banners, isLoading: isLoadingBanners } = useAllBanners()

  const displayProducts =
    bestsellingProducts && bestsellingProducts.length > 0
      ? bestsellingProducts.slice(0, 8).map(normalizeSSoTProduct)
      : FALLBACK_FLAGSHIP_PRODUCTS

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header with Sticky Blur & SSoT Announcement Bar */}
      <Header />

      {/* Main Content Area */}
      <main id="main-content" className="flex-grow pt-24 md:pt-28">
        {/* Hero Bento Showcase (Dark Bento #090D16 + Flash Sale Countdown + Quick Category Pills) */}
        <Hero banners={isLoadingBanners ? [] : banners || []} />

        {/* 4-Column Elevated USP Trust Strip */}
        <FeaturesSection />

        {/* Bestselling Products Section — Immediately visible after Hero/Trust Strip */}
        <section id="bestselling" className="container-app py-8 md:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 md:mb-10 gap-4">
            <div className="section-heading !mb-0">
              <span className="section-label !text-primary font-semibold">Được Yêu Thích Nhất 2026</span>
              <h2 className="section-title">Sản phẩm bán chạy nhất</h2>
              <p className="text-small text-muted-foreground mt-1 max-w-lg">
                Những siêu phẩm công nghệ chính hãng được cộng đồng đánh giá cao nhất về hiệu năng và độ hoàn thiện.
              </p>
            </div>

            <Button
              variant="outline"
              asChild
              className="rounded-full px-6 border-border/80 dark:border-white/15 bg-card dark:bg-[#111827] text-foreground hover:bg-slate-100 dark:hover:bg-[#182234] w-fit h-11 focus-ring font-semibold"
            >
              <Link href="/products?sortBy=featured" className="inline-flex items-center gap-2">
                <span>Xem tất cả</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-6">
            {isLoadingProducts
              ? Array(8)
                  .fill(0)
                  .map((_, index) => <ProductCardSkeleton key={index} />)
              : displayProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

          <div className="mt-10 text-center">
            <Button
              asChild
              className="rounded-full px-8 h-12 bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg focus-ring font-semibold text-sm"
            >
              <Link href="/products" className="inline-flex items-center gap-2">
                <span>Khám phá toàn bộ 500+ sản phẩm công nghệ</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Asymmetric Bento Categories Section */}
        {isLoadingCategories ? (
          <section className="container-app py-10 md:py-16">
            <CategoryGridSkeleton />
          </section>
        ) : (
          <CategorySection categories={categories || []} />
        )}

        {/* Unified VIP Privilege Club & Tech Newsletter Bento Block */}
        <PromotionBanner />
      </main>

      {/* Global SSoT 2026 Footer (with Mobile Accordion) */}
      <Footer />
    </div>
  )
}

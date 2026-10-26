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

export default function Home() {
  const { data: bestsellingProducts, isLoading: isLoadingProducts } = useBestsellingProducts()
  const { data: categories, isLoading: isLoadingCategories } = useCategories()
  const { data: banners, isLoading: isLoadingBanners } = useAllBanners()

  const displayProducts = bestsellingProducts?.slice(0, 8) || []

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
              className="rounded-full px-6 border-border/80 bg-card text-foreground hover:bg-surface w-fit h-11 focus-ring font-semibold"
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
              className="rounded-full px-8 h-12 bg-tech-blue text-white hover:bg-tech-blue-hover transition-all shadow-md hover:shadow-lg focus-ring font-semibold text-sm"
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

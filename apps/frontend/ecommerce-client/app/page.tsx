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
import { NewsletterSection } from "@/components/newsletter-section"
import { FeaturesSection } from "@/components/features-section"
import { PromotionBanner } from "@/components/promotion-banner"

export default function Home() {
  const { data: bestsellingProducts, isLoading: isLoadingProducts } = useBestsellingProducts()
  const { data: categories, isLoading: isLoadingCategories } = useCategories()
  const { data: banners, isLoading: isLoadingBanners } = useAllBanners()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header with Sticky Blur & Announcement Bar */}
      <Header />

      {/* Main Content Area */}
      <main id="main-content" className="flex-grow pt-24 md:pt-28">
        {/* Hero Section — Editorial Minimal Showcase */}
        <Hero banners={isLoadingBanners ? [] : banners || []} />

        {/* 4-Column Elevated USP Trust Strip */}
        <FeaturesSection />

        {/* Categories Section */}
        {isLoadingCategories ? (
          <section className="container-app py-14 md:py-20">
            <CategoryGridSkeleton />
          </section>
        ) : (
          <CategorySection categories={categories || []} />
        )}

        {/* Bestselling Products Section */}
        <section className="container-app py-14 md:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-10 gap-4">
            <div className="section-heading !mb-0">
              <span className="section-label">Được Yêu Thích Nhất</span>
              <h2 className="section-title">Sản phẩm bán chạy nhất</h2>
              <p className="text-small text-ink-faint mt-1 max-w-lg">
                Những siêu phẩm công nghệ được cộng đồng đánh giá cao nhất về hiệu năng và độ hoàn thiện.
              </p>
            </div>

            <Button
              variant="outline"
              asChild
              className="rounded-full px-6 border-line text-ink hover:bg-surface w-fit h-11 focus-ring"
            >
              <Link href="/products?sort=bestselling" className="inline-flex items-center gap-2">
                <span>Xem tất cả</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoadingProducts
              ? Array(8)
                  .fill(0)
                  .map((_, index) => <ProductCardSkeleton key={index} />)
              : bestsellingProducts
                  ?.slice(0, 8)
                  .map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

          <div className="mt-12 text-center">
            <Button
              asChild
              className="rounded-full px-8 h-12 bg-ink text-background hover:bg-brand hover:text-white transition-all shadow-sm focus-ring font-medium text-small"
            >
              <Link href="/products" className="inline-flex items-center gap-2">
                Khám phá toàn bộ 500+ sản phẩm
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Privilege VIP Club Promotion Banner */}
        <PromotionBanner />

        {/* VIP Newsletter Section */}
        <NewsletterSection />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  )
}

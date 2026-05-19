"use client";

import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import HeroCarousel from "@/components/hero-carousel"
import { useBestsellingProducts } from "@/hooks/use-products"
import { useCategories } from "@/hooks/use-categories"
import ProductCardSkeleton from "@/components/product-card-skeleton"
import CategoryGridSkeleton from "@/components/category-grid-skeleton"
import { useAllBanners } from "@/hooks/use-banners";
import Footer from "@/components/footer";
import { Header } from "@/components/header/index";
import { HeroCarouselSkeleton } from "@/components/hero-carousel-skeleton";
import { CategorySection } from "@/components/category-section";
import { NewsletterSection } from "@/components/newsletter-section";
import { FeaturesSection } from "@/components/features-section";
import { PromotionBanner } from "@/components/promotion-banner";

export default function Home() {
  const { data: bestsellingProducts, isLoading: isLoadingProducts } = useBestsellingProducts()
  const { data: categories, isLoading: isLoadingCategories } = useCategories()
  const { data: banners, isLoading: isLoadingBanners } = useAllBanners()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-background pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="w-full">
          {isLoadingBanners ? <HeroCarouselSkeleton /> : <HeroCarousel
            slides={banners || []}
            autoSlideInterval={5000}
            showDots={true}
            showArrows={true}
            imageHeight={500}
            className="shadow-lg"
          />}
        </section>

        {/* Features Section */}
        <FeaturesSection />

        {/* Categories Section */}
        {isLoadingCategories ? (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <CategoryGridSkeleton />
          </section>
        ) : (
          <CategorySection categories={categories || []} />
        )}

        {/* Bestselling Products Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <div className="bg-card/50 rounded-3xl p-6 sm:p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
            {/* Soft background glow */}
            <div className="absolute top-0 right-0 w-full max-w-md h-full bg-primary/5 blur-3xl pointer-events-none rounded-l-full translate-x-1/2" />
            
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-6 relative z-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-foreground">Sản phẩm bán chạy</h2>
                <p className="text-lg text-muted-foreground">Những sản phẩm được yêu thích nhất tuần qua</p>
              </div>
              <Button variant="ghost" asChild className="group text-primary hover:text-primary hover:bg-primary/10 rounded-full px-6">
                <Link href="/products?sort=bestselling" className="flex items-center">
                  Xem tất cả <ChevronRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
              {isLoadingProducts
                ? Array(8)
                  .fill(0)
                  .map((_, index) => <ProductCardSkeleton key={index} />)
                : bestsellingProducts?.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>

        {/* Promotion Banner */}
        <PromotionBanner />

        {/* Newsletter Section */}
        <NewsletterSection />
      </main>
      <Footer />
    </div >
  )
}


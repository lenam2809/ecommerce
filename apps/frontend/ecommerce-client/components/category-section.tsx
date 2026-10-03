"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Category } from "@/types/category"
import { CategoryCard } from "./category-card"
import { Button } from "./ui/button"

interface CategorySectionProps {
  categories: Category[]
}

export function CategorySection({ categories }: CategorySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount =
        direction === "left"
          ? -Math.max(container.clientWidth / 2, 320)
          : Math.max(container.clientWidth / 2, 320)
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section className="py-14 md:py-20 bg-surface/30 border-b border-line/40">
      <div className="container-app">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div className="section-heading !mb-0">
            <span className="section-label">Danh Mục Nổi Bật</span>
            <h2 className="section-title">Khám phá theo danh mục</h2>
            <p className="text-small text-ink-faint mt-1 max-w-lg">
              Tuyển tập những thiết bị định hình phong cách sống và không gian làm việc hiện đại.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <Link
              href="/products"
              className="text-small font-semibold text-brand hover:underline inline-flex items-center gap-1 group"
            >
              Xem tất cả danh mục
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {categories.length > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scroll("left")}
                  aria-label="Cuộn trái danh mục"
                  className="rounded-full border-line text-ink hover:bg-background h-10 w-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scroll("right")}
                  aria-label="Cuộn phải danh mục"
                  className="rounded-full border-line text-ink hover:bg-background h-10 w-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-4 pt-2 -mb-4 snap-x snap-mandatory gap-4.5 scrollbar-hide px-1 -mx-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}

          {categories.length === 0 && (
            <div className="w-full text-center py-12 text-ink-faint bg-card rounded-2xl border border-line">
              Chưa có danh mục nào.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

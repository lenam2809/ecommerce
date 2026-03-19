"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Category } from "@/types/category"
import { CategoryCard } from "./category-card"
import { Button } from "./ui/button"

interface CategorySectionProps {
  categories: Category[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      // Scroll by card width + gap (~300px) roughly, matching max view
      const scrollAmount = direction === "left" ? -Math.max(container.clientWidth / 2, 300) : Math.max(container.clientWidth / 2, 300)
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section className="relative py-16 md:py-24 bg-background overflow-hidden border-y border-white/5">
      {/* Subtle radial gradient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">Danh mục nổi bật</h2>
            <p className="text-lg text-muted-foreground">Khám phá các sản phẩm công nghệ theo từng nhóm chuyên biệt</p>
          </div>
          
          {/* Navigation Buttons for strict horizontal control */}
          {categories.length > 0 && (
            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                aria-label="Cuộn trái danh mục"
                className="rounded-full bg-card border-white/10 hover:bg-secondary/50 text-foreground transition-all focus-visible:ring-2 focus-visible:ring-primary shadow-sm hover:shadow-md h-12 w-12"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                aria-label="Cuộn phải danh mục"
                className="rounded-full bg-card border-white/10 hover:bg-secondary/50 text-foreground transition-all focus-visible:ring-2 focus-visible:ring-primary shadow-sm hover:shadow-md h-12 w-12"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>

        {/* Horizontal Scroll Track */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-10 pt-4 -mb-4 snap-x snap-mandatory gap-6 scrollbar-hide px-2 -mx-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((category) => (
             <CategoryCard key={category.id} category={category} />
          ))}

          {categories.length === 0 && (
            <div className="w-full text-center py-12 text-muted-foreground bg-card/50 rounded-2xl border border-white/5">
                Chưa có danh mục nào.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

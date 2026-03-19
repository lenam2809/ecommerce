"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { Category } from "@/types/category"


interface CategoryScrollProps {
    categories: Category[]
}

export function CategoryScroll({ categories }: CategoryScrollProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const isMobile = useMobile()

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current
            const scrollAmount = direction === "left" ? -container.clientWidth / 2 : container.clientWidth / 2

            container.scrollBy({
                left: scrollAmount,
                behavior: "smooth",
            })
        }
    }

    if (categories.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">Không có danh mục sản phẩm nào</div>
    }

    return (
        <div className="relative">
            {!isMobile && (
                <>
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md bg-background/80 backdrop-blur-sm"
                        onClick={() => scroll("left")}
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md bg-background/80 backdrop-blur-sm"
                        onClick={() => scroll("right")}
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </>
            )}

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/products/${category.slug}`}
                        className={cn(
                            "flex-shrink-0 snap-start rounded-lg overflow-hidden group",
                            "flex flex-col items-center w-[140px] md:w-[180px] transition-all",
                        )}
                    >
                        <div className="relative w-full aspect-square overflow-hidden rounded-lg mb-2">
                            <Image
                                src={category.image || "/placeholder.svg?height=200&width=200"}
                                alt={category.name}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                                sizes="(max-width: 768px) 140px, 180px"
                            />
                        </div>
                        <h3 className="text-sm md:text-base font-medium text-center line-clamp-2">{category.name}</h3>
                    </Link>
                ))}
            </div>
        </div>
    )
}

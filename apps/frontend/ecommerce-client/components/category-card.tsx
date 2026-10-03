import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Category } from "@/types/category"

interface CategoryCardProps {
  category: Category
}

/**
 * CategoryCard — Editorial Tech Minimalism
 * Studio aspect-square, subtle border, smooth hover scale, hover arrow indicator
 */
export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/${category.slug}`}
      className="group relative block w-[160px] sm:w-[180px] md:w-[200px] flex-shrink-0 snap-center md:snap-start rounded-2xl border border-line bg-card overflow-hidden transition-all duration-300 hover:border-ink/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-2/50">
        <Image
          src={category.image || "/category.jpg"}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 160px, 200px"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {category.productCount !== undefined && (
          <span className="absolute top-2.5 right-2.5 bg-background/85 backdrop-blur-md text-[11px] font-semibold text-ink px-2.5 py-0.5 rounded-full border border-line/70 shadow-xs">
            {category.productCount} SP
          </span>
        )}

        <div className="absolute bottom-2.5 right-2.5 h-7 w-7 rounded-full bg-background/90 backdrop-blur-md border border-line flex items-center justify-center opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <ArrowUpRight className="h-3.5 w-3.5 text-brand" />
        </div>
      </div>

      <div className="p-3 text-center">
        <p className="text-small font-semibold text-ink line-clamp-1 group-hover:text-brand transition-colors">
          {category.name}
        </p>
      </div>
    </Link>
  )
}

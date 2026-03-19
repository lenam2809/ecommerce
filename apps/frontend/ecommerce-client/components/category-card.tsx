import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Category } from "@/types/category"

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link 
      href={`/${category.slug}`}
      className="group relative flex flex-col items-center justify-between w-[260px] md:w-[280px] p-8 rounded-2xl bg-card border border-white/10 transition-all duration-300 ease-out hover:-translate-y-[6px] hover:shadow-[0_15px_40px_-15px_rgba(59,130,246,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex-shrink-0 snap-center md:snap-start overflow-hidden"
    >
      {/* Subtle background glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {category.productCount !== undefined && (
        <span className="absolute top-4 right-4 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full z-10 border border-primary/20">
          {category.productCount}
        </span>
      )}

      <div className="relative w-28 h-28 mb-6 rounded-full bg-secondary/30 ring-[6px] ring-background flex items-center justify-center group-hover:scale-[1.05] transition-transform duration-300 shadow-inner overflow-hidden">
         <Image 
            src={category.image || "/placeholder.svg"} 
            alt={category.name} 
            fill 
            sizes="(max-width: 768px) 112px, 112px"
            className="object-cover"
         />
      </div>
      
      <div className="text-center relative z-10 flex-grow">
        <h3 className="text-lg font-bold text-foreground mb-2">{category.name}</h3>
        {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 h-10 w-full">
            {category.description}
            </p>
        )}
      </div>
      
      {/* Hover CTA */}
      <div className="mt-6 flex h-6 items-center justify-center overflow-hidden w-full relative z-10">
         <div className="flex items-center text-primary font-medium text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
            Xem ngay <ArrowRight className="w-4 h-4 ml-1" />
         </div>
      </div>
    </Link>
  )
}

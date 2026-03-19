import { Category } from "@/types/category"
import Image from "next/image"
import Link from "next/link"


interface CategoryGridProps {
  categories: Category[]
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?categoryIds=${encodeURIComponent(category.id.toLowerCase())}`}
          className="group flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-white/5 hover:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="relative h-20 w-20 mb-4 overflow-hidden rounded-full bg-secondary/30 ring-4 ring-background group-hover:ring-primary/20 transition-all duration-300">
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-110"
            />
          </div>
          <h3 className="text-center font-medium text-foreground group-hover:text-primary transition-colors duration-200">
            {category.name}
          </h3>
        </Link>
      ))}
    </div>
  )
}


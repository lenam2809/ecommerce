"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react"

interface ProductGalleryProps {
  images: string[]
}

/**
 * ProductGallery — Editorial Tech Minimalism
 * Studio aspect framing, floating authenticity badge, smooth thumbnails with brand ring
 */
export default function ProductGallery({ images }: ProductGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0)

  const safeImages = images && images.length > 0 ? images : ["/placeholder.svg"]

  const nextImage = () => {
    setCurrentImage((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1))
  }

  return (
    <div className="space-y-4">
      {/* Main Image Frame */}
      <div className="relative w-full aspect-[4/3] sm:aspect-square md:aspect-[5/4] rounded-3xl overflow-hidden bg-surface-2/40 border border-line shadow-xs group">
        {/* Floating authenticity badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-md border border-line/80 shadow-xs text-tiny font-semibold text-ink">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Chính Hãng VN/A</span>
        </div>

        {/* Counter indicator */}
        <div className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-full bg-background/85 backdrop-blur-md border border-line/70 text-tiny font-mono font-medium text-ink shadow-xs">
          {currentImage + 1} / {safeImages.length}
        </div>

        <Image
          src={safeImages[currentImage] || "/placeholder.svg"}
          alt="Hình ảnh chi tiết sản phẩm"
          fill
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-104"
          priority
          sizes="(max-width: 1024px) 100vw, 65vw"
        />

        {/* Navigation arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-background/85 backdrop-blur-md border border-line text-ink shadow-sm hover:bg-background transition-all focus-ring opacity-90 hover:opacity-100 hover:scale-105"
              aria-label="Xem ảnh trước"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 grid place-items-center h-10 w-10 rounded-full bg-background/85 backdrop-blur-md border border-line text-ink shadow-sm hover:bg-background transition-all focus-ring opacity-90 hover:opacity-100 hover:scale-105"
              aria-label="Xem ảnh sau"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {safeImages.map((image, index) => {
            const isSelected = currentImage === index

            return (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                aria-label={`Xem ảnh ${index + 1}`}
                aria-current={isSelected}
                className={`relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-200 focus-ring ${
                  isSelected
                    ? "border-brand ring-2 ring-brand/20 shadow-xs"
                    : "border-line/70 hover:border-ink/40 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Ảnh thu nhỏ ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

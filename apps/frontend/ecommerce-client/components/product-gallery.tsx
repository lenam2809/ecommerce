"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"

interface ProductGalleryProps {
  images: string[]
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })

  const nextImage = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    setZoomPosition({ x, y })
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Main Image */}
      <div
        className="glass-card bg-card/20 relative aspect-square lg:aspect-[4/5] overflow-hidden rounded-3xl group border-border/50"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <Image
          src={images[currentImage] || "/placeholder.svg"}
          alt="Product image"
          fill
          className={`object-contain transition-transform duration-500 ease-out p-6 ${isZoomed ? "scale-[1.7]" : "scale-100"}`}
          priority
          style={
            isZoomed
              ? {
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }
              : {}
          }
        />

        {/* Zoom indicator */}
        {!isZoomed && (
          <div className="absolute bottom-5 right-5 bg-background/80 backdrop-blur-md p-3 rounded-2xl border border-border/50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ZoomIn className="h-5 w-5 text-foreground/80" />
          </div>
        )}

        {/* Navigation arrows */}
        {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-md hover:bg-background border border-border/50 rounded-full p-2.5 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-md hover:bg-background border border-border/50 rounded-full p-2.5 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-sm"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
            </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
            <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-2xl overflow-hidden transition-all duration-300 ${currentImage === index
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-100"
                : "opacity-60 hover:opacity-100 hover:scale-[1.02]"
                }`}
            >
                <div className="absolute inset-0 bg-secondary/30 -z-10" />
                <Image
                src={image || "/placeholder.svg"}
                alt={`Product thumbnail ${index + 1}`}
                fill
                className="object-cover"
                />
            </button>
            ))}
        </div>
      )}
    </div>
  )
}


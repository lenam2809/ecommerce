"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Banner } from "@/types/banner"


export interface HeroCarouselProps {
  slides: Banner[]
  autoSlideInterval?: number // in milliseconds
  showDots?: boolean
  showArrows?: boolean
  className?: string
  imageHeight?: number | string
  enableAutoSlide?: boolean
  darkMode?: boolean
}

export default function HeroCarousel({
  slides,
  autoSlideInterval = 5000,
  showDots = true,
  showArrows = true,
  className = "",
  enableAutoSlide = true,
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }, [slides.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  useEffect(() => {
    if (!enableAutoSlide || isHovering) return
    const interval = setInterval(() => {
      nextSlide()
    }, autoSlideInterval)
    return () => clearInterval(interval)
  }, [nextSlide, autoSlideInterval, enableAutoSlide, isHovering])

  if (!slides || slides.length === 0) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div
        className={cn("relative w-full rounded-3xl overflow-hidden bg-card border border-white/5 shadow-2xl h-[600px] flex", className)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Slides Container */}
        <div className="relative h-full w-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 h-full w-full flex flex-col-reverse lg:flex-row transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]",
                index === currentSlide ? "opacity-100 z-10 translate-x-0" : "opacity-0 z-0 translate-x-8 lg:translate-x-16 pointer-events-none"
              )}
            >
              {/* Text Side (Left on Desktop) */}
              <div className="flex-1 relative z-20 flex flex-col justify-center p-8 sm:p-12 lg:p-20 bg-gradient-to-br from-card to-background via-card lg:w-1/2">
                <div className="max-w-xl">
                  {/* Subtle Accent Glow */}
                  <div className="absolute top-0 left-0 w-full h-full bg-primary/5 blur-3xl pointer-events-none rounded-r-full -translate-x-1/2" />
                  
                  <h2 className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
                    {slide.title}
                  </h2>
                  <p className="relative text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg">
                    {slide.description}
                  </p>
                  
                  {slide.buttonText && slide.buttonLink && (
                    <div className="relative">
                      <Button asChild size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-1">
                        <a href={slide.buttonLink}>{slide.buttonText}</a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Side (Right on Desktop) */}
              <div className="flex-1 relative lg:w-1/2 h-[300px] sm:h-[400px] lg:h-full bg-secondary/20 overflow-hidden">
                <Image
                  src={slide.imageUrl || "/placeholder.svg"}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className={cn(
                    "object-cover object-center transition-transform duration-[10s] ease-out",
                    index === currentSlide ? "scale-105" : "scale-100"
                  )}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                
                {/* Gradient Fades for blend */}
                <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-card to-transparent z-10" />
                <div className="lg:hidden absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-card to-transparent z-10" />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {showArrows && slides.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-md border-white/10 text-foreground transition-all duration-300 hover:scale-110"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-md border-white/10 text-foreground transition-all duration-300 hover:scale-110"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Indicator Dots */}
        {showDots && slides.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  index === currentSlide ? "bg-primary w-8 shadow-sm shadow-primary/50" : "bg-white/20 hover:bg-white/40 w-2"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


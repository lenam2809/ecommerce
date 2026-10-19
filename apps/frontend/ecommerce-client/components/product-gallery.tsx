"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ShieldCheck, Cpu } from "lucide-react"
import { formatImageUrl } from "@/lib/utils"

interface ProductGalleryProps {
    images: string[]
}

/**
 * ProductGallery — Hybrid Premium Tech (SSoT 2026)
 * Mobile: constrained max-h-[35vh] with touch swipe
 * Desktop: sticky studio framing with Electric Blue (#2563EB) active thumbnail ring
 */
export default function ProductGallery({ images }: ProductGalleryProps) {
    const [currentImage, setCurrentImage] = useState(0)
    const [failedMap, setFailedMap] = useState<Record<number, boolean>>({})
    const touchStartX = useRef<number | null>(null)

    const safeImages =
        images && images.length > 0
            ? images.map((img) => formatImageUrl(img))
            : ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&auto=format&fit=crop&q=80"]

    const nextImage = () => {
        setCurrentImage((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1))
    }

    const prevImage = () => {
        setCurrentImage((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1))
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return
        const deltaX = e.changedTouches[0].clientX - touchStartX.current
        if (Math.abs(deltaX) > 40) {
            if (deltaX < 0) nextImage()
            else prevImage()
        }
        touchStartX.current = null
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Main Image Frame — Mobile constrained to max-h-[35vh] per Stitch D1-06 */}
            <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative w-full h-[33vh] max-h-[35vh] sm:h-auto sm:max-h-none sm:aspect-square md:aspect-[5/4] rounded-3xl overflow-hidden bg-slate-100 dark:bg-[#111827] border border-line shadow-xs group select-none"
            >
                {/* Floating authenticity badge */}
                <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-md border border-primary/25 shadow-xs text-tiny font-semibold text-ink">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span>Chính Hãng Apple VN/A • Bảo hành 24T</span>
                </div>

                {/* Counter indicator */}
                <div className="absolute bottom-3.5 right-3.5 z-20 px-3 py-1 rounded-full bg-background/85 backdrop-blur-md border border-line/70 text-tiny font-semibold tabular-nums text-ink shadow-xs">
                    {currentImage + 1} / {safeImages.length}
                </div>

                {failedMap[currentImage] ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-[#111827] text-slate-400">
                        <Cpu className="h-14 w-14 mb-2 text-primary opacity-70" />
                        <span className="text-xs font-semibold uppercase tracking-wider">ShopViet Studio Flagship</span>
                    </div>
                ) : (
                    <Image
                        src={safeImages[currentImage]}
                        alt="Hình ảnh chi tiết sản phẩm"
                        fill
                        className="object-contain sm:object-cover object-center transition-transform duration-700 ease-out group-hover:scale-104 p-2 sm:p-0"
                        priority
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        onError={() => setFailedMap((prev) => ({ ...prev, [currentImage]: true }))}
                    />
                )}

                {/* Navigation arrows */}
                {safeImages.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={prevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center h-11 w-11 rounded-full bg-background/85 backdrop-blur-md border border-line text-ink shadow-sm hover:bg-background hover:text-primary transition-all focus-ring opacity-90 hover:opacity-100"
                            aria-label="Xem ảnh trước"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={nextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center h-11 w-11 rounded-full bg-background/85 backdrop-blur-md border border-line text-ink shadow-sm hover:bg-background hover:text-primary transition-all focus-ring opacity-90 hover:opacity-100"
                            aria-label="Xem ảnh sau"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails Row */}
            {safeImages.length > 1 && (
                <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    {safeImages.map((image, index) => {
                        const isSelected = currentImage === index

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setCurrentImage(index)}
                                aria-label={`Xem ảnh ${index + 1}`}
                                aria-current={isSelected}
                                className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-200 focus-ring ${
                                    isSelected
                                        ? "border-primary ring-2 ring-primary/25 shadow-xs opacity-100"
                                        : "border-line/70 hover:border-primary/40 opacity-70 hover:opacity-100"
                                }`}
                            >
                                {failedMap[index] ? (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-[#111827]">
                                        <Cpu className="h-5 w-5 text-primary/60" />
                                    </div>
                                ) : (
                                    <Image
                                        src={image}
                                        alt={`Ảnh thu nhỏ ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        onError={() => setFailedMap((prev) => ({ ...prev, [index]: true }))}
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

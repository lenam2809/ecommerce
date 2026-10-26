"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ShieldCheck, Cpu, ZoomIn, X } from "lucide-react"
import { formatImageUrl } from "@/lib/utils"

interface ProductGalleryProps {
    images: string[]
}

/**
 * ProductGallery — Hybrid Premium Tech (SSoT 2026)
 * Mobile: constrained max-h-[35vh] with touch swipe
 * Desktop: sticky studio framing with Electric Blue (#2563EB) active thumbnail ring
 * LCP & CWV: fetchPriority="high", priority={true}, explicit sizes, aspect-ratio
 */
export default function ProductGallery({ images }: ProductGalleryProps) {
    const [currentImage, setCurrentImage] = useState(0)
    const [failedMap, setFailedMap] = useState<Record<number, boolean>>({})
    const [isModalOpen, setIsModalOpen] = useState(false)
    const touchStartX = useRef<number | null>(null)

    const safeImages =
        images && images.length > 0
            ? images.map((img) => formatImageUrl(img))
            : ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&auto=format&fit=crop&q=80"]

    const nextImage = useCallback(() => {
        setCurrentImage((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1))
    }, [safeImages.length])

    const prevImage = useCallback(() => {
        setCurrentImage((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1))
    }, [safeImages.length])

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

    // Modal keyboard navigation and Escape cleanup
    useEffect(() => {
        if (!isModalOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsModalOpen(false)
            } else if (e.key === "ArrowRight") {
                nextImage()
            } else if (e.key === "ArrowLeft") {
                prevImage()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [isModalOpen, nextImage, prevImage])

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Main Image Frame — Mobile constrained to max-h-[35vh] with fixed aspect-ratio */}
            <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative w-full h-[33vh] max-h-[35vh] sm:h-auto sm:max-h-none aspect-[4/3] sm:aspect-square md:aspect-[5/4] rounded-3xl overflow-hidden bg-card border border-line shadow-xs group select-none"
            >
                {/* Floating authenticity badge */}
                <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-md border border-primary/25 shadow-xs text-tiny font-semibold text-ink">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span>Chính Hãng Apple VN/A • Bảo hành 24T</span>
                </div>

                {/* Counter indicator & Zoom trigger */}
                <div className="absolute bottom-3.5 right-3.5 z-20 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-md border border-line/70 text-tiny font-semibold text-ink shadow-xs hover:bg-background hover:text-primary transition-all flex items-center gap-1"
                        aria-label="Phóng to ảnh sản phẩm"
                    >
                        <ZoomIn className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Phóng to</span>
                    </button>
                    <div className="px-3 py-1 rounded-full bg-background/85 backdrop-blur-md border border-line/70 text-tiny font-semibold tabular-nums text-ink shadow-xs">
                        {currentImage + 1} / {safeImages.length}
                    </div>
                </div>

                {failedMap[currentImage] ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-card text-slate-400">
                        <Cpu className="h-14 w-14 mb-2 text-primary opacity-70" />
                        <span className="text-xs font-semibold uppercase tracking-wider">ShopViet Studio Flagship</span>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="w-full h-full relative cursor-zoom-in block"
                        aria-label="Nhấn để xem ảnh phóng to chi tiết"
                    >
                        <Image
                            src={safeImages[currentImage]}
                            alt="Hình ảnh chi tiết sản phẩm"
                            fill
                            className="object-contain sm:object-cover object-center transition-transform duration-700 ease-out group-hover:scale-104 p-2 sm:p-0"
                            priority={true}
                            fetchPriority="high"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                            onError={() => setFailedMap((prev) => ({ ...prev, [currentImage]: true }))}
                        />
                    </button>
                )}

                {/* Navigation arrows */}
                {safeImages.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={prevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center h-11 w-11 rounded-full bg-background/85 backdrop-blur-md border border-line text-ink shadow-sm hover:bg-background hover:text-primary transition-all focus-ring opacity-90 hover:opacity-100 z-10"
                            aria-label="Xem ảnh trước"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={nextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center h-11 w-11 rounded-full bg-background/85 backdrop-blur-md border border-line text-ink shadow-sm hover:bg-background hover:text-primary transition-all focus-ring opacity-90 hover:opacity-100 z-10"
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
                                    <div className="w-full h-full flex items-center justify-center bg-card">
                                        <Cpu className="h-5 w-5 text-primary/60" />
                                    </div>
                                ) : (
                                    <Image
                                        src={image}
                                        alt={`Ảnh thu nhỏ ${index + 1}`}
                                        fill
                                        sizes="80px"
                                        loading="lazy"
                                        className="object-cover"
                                        onError={() => setFailedMap((prev) => ({ ...prev, [index]: true }))}
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Lightbox / Zoom Modal with complete unmount cleanup */}
            {isModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Xem ảnh chi tiết độ phân giải cao"
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="relative max-w-5xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Close Button */}
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-2 right-2 z-10 grid place-items-center h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                            aria-label="Đóng xem ảnh phóng to"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Modal Image */}
                        <div className="relative w-full h-full aspect-[4/3] sm:aspect-[16/10] max-h-[80vh] flex items-center justify-center">
                            <Image
                                src={safeImages[currentImage]}
                                alt="Ảnh sản phẩm phóng to"
                                fill
                                sizes="90vw"
                                priority
                                className="object-contain"
                            />
                        </div>

                        {/* Modal Controls */}
                        {safeImages.length > 1 && (
                            <div className="flex items-center gap-4 mt-4 text-white">
                                <button
                                    type="button"
                                    onClick={prevImage}
                                    className="grid place-items-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
                                    aria-label="Ảnh trước"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="text-sm font-semibold tabular-nums">
                                    {currentImage + 1} / {safeImages.length}
                                </span>
                                <button
                                    type="button"
                                    onClick={nextImage}
                                    className="grid place-items-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
                                    aria-label="Ảnh kế tiếp"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

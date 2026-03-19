"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface HeroCarouselSkeletonProps {
    className?: string
    imageHeight?: number | string
    showDots?: boolean
    showArrows?: boolean
}

export function HeroCarouselSkeleton({
    className = "",
    showDots = true,
    showArrows = true,
}: HeroCarouselSkeletonProps) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div
                className={cn(
                    "relative w-full rounded-3xl overflow-hidden bg-card border border-white/5 shadow-2xl h-[600px] flex flex-col-reverse lg:flex-row",
                    className
                )}
            >
                {/* Text Side */}
                <div className="flex-1 relative z-20 flex flex-col justify-center p-8 sm:p-12 lg:p-20 lg:w-1/2">
                    <div className="max-w-xl w-full flex flex-col gap-6">
                        <Skeleton className="h-14 w-full bg-secondary/30 rounded-lg" />
                        <Skeleton className="h-14 w-4/5 bg-secondary/30 rounded-lg" />
                        
                        <div className="mt-4 space-y-3">
                            <Skeleton className="h-6 w-full bg-secondary/30 rounded-md" />
                            <Skeleton className="h-6 w-5/6 bg-secondary/30 rounded-md" />
                        </div>
                        
                        <Skeleton className="h-12 w-40 mt-6 bg-secondary/30 rounded-full" />
                    </div>
                </div>

                {/* Image Side */}
                <div className="flex-1 relative lg:w-1/2 h-[300px] sm:h-[400px] lg:h-full bg-secondary/20">
                    <Skeleton className="h-full w-full bg-secondary/30 rounded-none" />
                    <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-card to-transparent z-10" />
                    <div className="lg:hidden absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-card to-transparent z-10" />
                </div>

                {/* Navigation Arrows skeleton */}
                {showArrows && (
                    <>
                        <Skeleton className="hidden sm:block absolute left-4 top-1/2 z-30 h-10 w-10 -translate-y-1/2 rounded-full bg-secondary/50" />
                        <Skeleton className="hidden sm:block absolute right-4 top-1/2 z-30 h-10 w-10 -translate-y-1/2 rounded-full bg-secondary/50" />
                    </>
                )}

                {/* Indicator Dots skeleton */}
                {showDots && (
                    <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center space-x-3">
                        {[...Array(3)].map((_, index) => (
                            <Skeleton
                                key={index}
                                className={cn(
                                    "h-1.5 rounded-full bg-secondary/50",
                                    index === 0 ? "w-8" : "w-2"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
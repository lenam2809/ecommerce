'use client'

import Image, { ImageProps } from 'next/image'
import { Package, RotateCcw } from 'lucide-react'
import { useState } from 'react'

export function ImageWithFallback({
    src,
    alt,
    className,
    ...props
}: ImageProps) {
    const [error, setError] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [retryCount, setRetryCount] = useState(0)

    const handleRetry = () => {
        setError(false)
        setIsLoading(true)
        setRetryCount(prev => prev + 1)
    }

    if (error || !src) {
        return (
            <div className={`flex flex-col items-center justify-center bg-muted gap-2 ${className}`}>
                <Package className="w-8 h-8 text-muted-foreground" />
                <button
                    onClick={handleRetry}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    aria-label="Thử tải lại hình ảnh"
                >
                    <RotateCcw className="w-3 h-3" />
                    Thử lại
                </button>
            </div>
        )
    }

    return (
        <>
            {/* Loading skeleton */}
            {isLoading && (
                <div className={`absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted animate-pulse ${className}`} />
            )}
            <Image
                src={src}
                alt={alt}
                className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                onLoadingComplete={() => setIsLoading(false)}
                onError={() => setError(true)}
                loading="lazy"
                {...props}
            />
        </>
    )
}

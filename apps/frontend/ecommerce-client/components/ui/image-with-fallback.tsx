'use client'

import Image, { ImageProps } from 'next/image'
import { Package } from 'lucide-react'
import { useState } from 'react'

export function ImageWithFallback({
    src,
    alt,
    className,
    ...props
}: ImageProps) {
    const [error, setError] = useState(false)

    if (error || !src) {
        return (
            <div className={`flex items-center justify-center bg-muted ${className}`}>
                <Package className="w-12 h-12 text-muted-foreground" />
            </div>
        )
    }

    return (
        <Image
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
            {...props}
        />
    )
}

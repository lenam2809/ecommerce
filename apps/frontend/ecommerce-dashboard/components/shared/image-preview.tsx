'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react'

interface ImagePreviewProps {
    src: string | null
    alt?: string
    className?: string
    onRemove?: () => void
    showActions?: boolean
    width?: number
    height?: number
}

export function ImagePreview({
    src,
    alt = 'Preview',
    className,
    onRemove,
    showActions = true,
    width = 200,
    height = 200,
}: ImagePreviewProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)

    const handleZoomIn = useCallback(() => {
        setZoom((z) => Math.min(z + 0.25, 3))
    }, [])

    const handleZoomOut = useCallback(() => {
        setZoom((z) => Math.max(z - 0.25, 0.5))
    }, [])

    const handleRotate = useCallback(() => {
        setRotation((r) => (r + 90) % 360)
    }, [])

    const handleDownload = useCallback(() => {
        if (!src) return
        const link = document.createElement('a')
        link.href = src
        link.download = alt || 'image'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }, [src, alt])

    if (!src) return null

    return (
        <>
            <div className={cn("relative inline-block group", className)}>
                {/* Thumbnail */}
                <div
                    className="relative cursor-pointer rounded-lg overflow-hidden border bg-muted"
                    onClick={() => setIsOpen(true)}
                    style={{ width, height }}
                >
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Zoom overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="h-6 w-6 text-white" />
                    </div>
                </div>

                {/* Remove button */}
                {onRemove && showActions && (
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation()
                            onRemove()
                        }}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>

            {/* Fullscreen Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{alt}</DialogTitle>
                    </DialogHeader>

                    {/* Toolbar */}
                    <div className="flex items-center justify-center gap-2 py-2 border-b">
                        <Button variant="outline" size="icon" onClick={handleZoomOut}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground w-16 text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <Button variant="outline" size="icon" onClick={handleZoomIn}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-border mx-2" />
                        <Button variant="outline" size="icon" onClick={handleRotate}>
                            <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleDownload}>
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Image Container */}
                    <div className="flex-1 overflow-auto flex items-center justify-center bg-muted/50 rounded-lg">
                        <div
                            className="transition-transform duration-200"
                            style={{
                                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                            }}
                        >
                            <Image
                                src={src}
                                alt={alt}
                                width={800}
                                height={600}
                                className="max-w-none"
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

interface ImageGalleryProps {
    images: Array<{ src: string; alt?: string }>
    onRemove?: (index: number) => void
    className?: string
}

export function ImageGallery({ images, onRemove, className }: ImageGalleryProps) {
    if (images.length === 0) return null

    return (
        <div className={cn("flex flex-wrap gap-3", className)}>
            {images.map((image, index) => (
                <ImagePreview
                    key={index}
                    src={image.src}
                    alt={image.alt || `Image ${index + 1}`}
                    onRemove={onRemove ? () => onRemove(index) : undefined}
                    width={120}
                    height={120}
                />
            ))}
        </div>
    )
}

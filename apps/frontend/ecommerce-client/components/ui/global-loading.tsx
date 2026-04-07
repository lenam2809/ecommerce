"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Skeleton } from "./skeleton"

export function GlobalLoading() {
    const [loading, setLoading] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setLoading(true)
        const timer = setTimeout(() => setLoading(false), 300)
        return () => clearTimeout(timer)
    }, [pathname])

    if (!loading) return null

    return (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-xs z-50 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-4">
                {/* Animated skeleton loader - minimal polished look */}
                <div className="relative w-12 h-12">
                    <Skeleton className="absolute inset-0 rounded-full" />
                    <div className="absolute inset-1 bg-background rounded-full animate-pulse" />
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Đang tải...</p>
            </div>
        </div>
    )
}

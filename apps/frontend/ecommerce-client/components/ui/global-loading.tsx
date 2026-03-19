"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { LoadingSpinner } from "./loading-spinner"

export function GlobalLoading() {
    const [loading, setLoading] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setLoading(true)
        const timer = setTimeout(() => setLoading(false), 500)
        return () => clearTimeout(timer)
    }, [pathname])

    if (!loading) return null

    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
        </div>
    )
}

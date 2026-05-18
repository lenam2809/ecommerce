"use client"

import { logger } from '@/lib/logger'
import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        logger.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
                    <AlertTriangle className="h-8 w-8" />
                </div>

                <h1 className="text-3xl font-bold mb-4 dark:text-white">Đã xảy ra lỗi</h1>

                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Chúng tôi rất tiếc, đã xảy ra lỗi khi tải trang này. Vui lòng thử lại sau.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={reset} className="bg-[#2A5CAA] hover:bg-[#1e4785] dark:bg-blue-600 dark:hover:bg-blue-700">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Thử lại
                    </Button>

                    <Button asChild variant="outline">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Về trang chủ
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}


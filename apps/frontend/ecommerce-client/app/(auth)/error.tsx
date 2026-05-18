"use client"

import { logger } from '@/lib/logger'
import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        logger.error("[Auth Error]", error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mb-6">
                    <AlertTriangle className="h-8 w-8" />
                </div>

                <h1 className="text-3xl font-bold mb-4 text-foreground">Lỗi xác thực</h1>

                <p className="text-muted-foreground mb-8 text-sm">
                    Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại hoặc quay lại trang chủ.
                </p>

                {process.env.NODE_ENV === "development" && (
                    <div className="mt-6 p-3 bg-muted rounded text-left text-xs text-muted-foreground overflow-auto max-h-24">
                        <p className="font-mono text-destructive font-semibold mb-2">Chi tiết lỗi:</p>
                        <p>{error.message}</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                    <Button
                        onClick={reset}
                        className="bg-primary hover:bg-primary/90"
                    >
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

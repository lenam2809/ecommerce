"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import authService from "@/services/auth-service"
import { clearGuestId } from "@/lib/guest-id"
import { sessionSync } from "@/lib/session-sync"
import { AppToaster } from "@/components/toast/app-toaster"

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={<GoogleCallbackLoading />}>
            <GoogleCallbackContent />
        </Suspense>
    )
}

function GoogleCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const complete = async () => {
            const error = searchParams.get("error")
            const returnUrl = normalizeReturnUrl(searchParams.get("returnUrl"))

            if (error) {
                AppToaster.error("Đăng nhập Google thất bại", {
                    description: "Vui lòng thử lại hoặc đăng nhập bằng email.",
                    duration: Infinity,
                })
                router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
                return
            }

            try {
                const currentUser = await authService.getCurrentUser()
                if (currentUser.success && currentUser.data) {
                    clearGuestId()
                    sessionSync.broadcast("LOGIN", { user: currentUser.data })
                    AppToaster.success("Đăng nhập Google thành công")
                    window.location.replace(returnUrl)
                    return
                }
            } catch {
                // handled by redirect below
            }

            router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
        }

        complete()
    }, [router, searchParams])

    return <GoogleCallbackLoading />
}

function GoogleCallbackLoading() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Đang hoàn tất đăng nhập Google...</p>
        </div>
    )
}

function normalizeReturnUrl(value: string | null): string {
    if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
        return "/"
    }

    return value
}

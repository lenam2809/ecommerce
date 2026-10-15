"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import authService from "@/services/auth-service"
import { useAuth } from "@/hooks/use-auth"
import { clearGuestId } from "@/lib/guest-id"
import { sessionSync } from "@/lib/session-sync"
import { normalizeReturnUrlPath } from "@/lib/google-auth"
import { AppToaster } from "@/components/toast/app-toaster"

/**
 * Trang callback OAuth Google.
 *
 * Backend đã set cookie httpOnly (access_token/refresh_token) và redirect về đây
 * với query param:
 *   - `returnUrl`: path tương đối cần quay lại sau khi đăng nhập
 *   - `error`: mã lỗi nếu Google xác thực thất bại
 *
 * Trang này KHÔNG nhận token từ query string — mọi thứ nằm trong cookie do
 * backend set, nên chỉ cần: cookie-check → lấy profile → cập nhật state → redirect.
 */

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
    google_auth_failed: "Google không xác thực được tài khoản. Vui lòng thử lại.",
    google_profile_incomplete: "Tài khoản Google thiếu thông tin (email/họ tên). Vui lòng dùng tài khoản khác.",
    google_login_failed: "Không thể tạo hoặc liên kết tài khoản. Vui lòng thử lại sau.",
}

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
    const queryClient = useQueryClient()
    const { refreshUser } = useAuth()

    useEffect(() => {
        const complete = async () => {
            const error = searchParams.get("error")
            const returnUrl = normalizeReturnUrlPath(searchParams.get("returnUrl"))
            const loginFallbackUrl = `/login?returnUrl=${encodeURIComponent(returnUrl)}`

            // 1. Backend báo lỗi qua query param `error` → hiển thị thông báo cụ thể
            if (error) {
                const description = GOOGLE_ERROR_MESSAGES[error] ?? "Vui lòng thử lại hoặc đăng nhập bằng email."
                AppToaster.error("Đăng nhập Google thất bại", { description, duration: Infinity })
                router.replace(loginFallbackUrl)
                return
            }

            try {
                // 2. Kiểm tra cookie httpOnly đã được backend set chưa
                const { hasCookie } = await authService.cookieCheck()
                if (!hasCookie) {
                    AppToaster.error("Đăng nhập Google thất bại", {
                        description: "Không nhận được phiên đăng nhập từ máy chủ. Vui lòng thử lại.",
                        duration: Infinity,
                    })
                    router.replace(loginFallbackUrl)
                    return
                }

                // 3. Lấy thông tin user và cập nhật state đăng nhập (AuthContext) cho tab hiện tại
                const user = await refreshUser()
                if (!user) {
                    AppToaster.error("Đăng nhập Google thất bại", {
                        description: "Phiên đăng nhập không hợp lệ. Vui lòng thử lại.",
                        duration: Infinity,
                    })
                    router.replace(loginFallbackUrl)
                    return
                }

                // 4. Dọn dẹp trạng thái guest + đồng bộ
                clearGuestId()
                sessionSync.broadcast("LOGIN", { user })
                queryClient.invalidateQueries({ queryKey: ["profile"] })
                AppToaster.success("Đăng nhập Google thành công", {
                    description: "Chào mừng bạn quay trở lại!",
                })

                // 5. Quay lại trang trước đó (hoặc trang chủ) — điều hướng SPA,
                //    không cần reload vì AuthContext đã được cập nhật ở bước 3.
                router.replace(returnUrl)
            } catch {
                AppToaster.error("Đăng nhập Google thất bại", {
                    description: "Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại.",
                    duration: Infinity,
                })
                router.replace(loginFallbackUrl)
            }
        }

        complete()
    }, [router, searchParams, queryClient, refreshUser])

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

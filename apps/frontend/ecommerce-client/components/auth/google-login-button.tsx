"use client"

import { Button } from "@/components/ui/button"
import { buildGoogleLoginUrl } from "@/lib/google-auth"

interface GoogleLoginButtonProps {
    /**
     * Path tương đối để quay lại sau khi đăng nhập Google thành công.
     * Mặc định "/" (trang chủ). Backend chỉ chấp nhận path tương đối.
     */
    returnUrl?: string
    /** Disable nút khi form đăng nhập thường đang xử lý. */
    disabled?: boolean
}

/**
 * Nút "Đăng nhập với Google".
 * Dùng form POST (không phải link GET) vì backend endpoint
 * `/api/auth/external-login` là [HttpPost].
 */
export function GoogleLoginButton({ returnUrl = "/", disabled = false }: GoogleLoginButtonProps) {
    const action = buildGoogleLoginUrl(returnUrl)

    return (
        <form method="post" action={action} aria-busy={disabled}>
            <Button
                type="submit"
                variant="outline"
                aria-label="Đăng nhập với Google"
                className="h-11 w-full rounded-full border-line bg-card text-small font-medium text-ink hover:bg-surface shadow-2xs transition-colors"
                disabled={disabled}
            >
                <GoogleIcon />
                Đăng nhập với Google
            </Button>
        </form>
    )
}

function GoogleIcon() {
    return (
        <svg aria-hidden="true" className="mr-3 h-5 w-5" viewBox="0 0 48 48">
            <path
                fill="#EA4335"
                d="M24 9.5c3.4 0 6.4 1.2 8.8 3.5l6.6-6.6C35.4 2.7 30.1.5 24 .5 14.8.5 6.9 5.8 3.1 13.5l7.7 6C12.6 13.6 17.8 9.5 24 9.5z"
            />
            <path
                fill="#4285F4"
                d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h13.2c-.6 3-2.3 5.6-4.9 7.3l7.5 5.8c4.4-4.1 7.7-10.1 7.7-17.1z"
            />
            <path
                fill="#FBBC05"
                d="M10.8 28.5c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5l-7.7-6C1.4 16.7.5 20.2.5 24s.9 7.3 2.6 10.5l7.7-6z"
            />
            <path
                fill="#34A853"
                d="M24 47.5c6.1 0 11.3-2 15.1-5.4l-7.5-5.8c-2.1 1.4-4.7 2.2-7.6 2.2-6.2 0-11.4-4.1-13.2-9.8l-7.7 6C6.9 42.2 14.8 47.5 24 47.5z"
            />
        </svg>
    )
}

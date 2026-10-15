"use client"

import type React from "react"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-auth"
import { AppToaster } from "@/components/toast/app-toaster"
import { GoogleLoginButton } from "@/components/auth/google-login-button"
import { isGoogleLoginEnabled } from "@/lib/google-auth"

function getSafeReturnUrl(returnUrl: string | null): string {
    if (!returnUrl) return "/"

    try {
        const decoded = decodeURIComponent(returnUrl)
        return decoded.startsWith("/") && !decoded.startsWith("//") ? decoded : "/"
    } catch {
        return "/"
    }
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-[60vh]"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <LoginContent />
        </Suspense>
    )
}

function LoginContent() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

    const router = useRouter()
    const searchParams = useSearchParams()
    const { login } = useAuth()

    // Get redirect URL from query params - support both 'returnUrl' and 'redirect'
    const redirectUrl = getSafeReturnUrl(searchParams.get("returnUrl") || searchParams.get("redirect"))

    // Nút Google chỉ render ở ecommerce-client (gate theo NEXT_PUBLIC_APP_TYPE)
    // và có thể tắt bằng NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=false.
    const googleLoginEnabled = isGoogleLoginEnabled()

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {}

        if (!email) {
            newErrors.email = "Email không được để trống"
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email không hợp lệ"
        }

        if (!password) {
            newErrors.password = "Mật khẩu không được để trống"
        } else if (password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            await login(email, password);
            AppToaster.success("Đăng nhập thành công", {
                description: "Chào mừng bạn quay trở lại!",
            });

            router.push(redirectUrl);
        } catch {
            AppToaster.error("Đăng nhập thất bại", {
                description: "Email hoặc mật khẩu không chính xác",
                duration: Infinity,
            });
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="bg-card border border-line rounded-3xl p-6 sm:p-8 w-full text-left shadow-xs">
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft text-brand text-[11px] font-bold uppercase tracking-wider mb-3">
                    <span>ShopViet Account</span>
                </div>
                <h1 className="text-h2 font-bold tracking-tight mb-1.5 text-ink">
                    Chào mừng trở lại
                </h1>
                <p className="text-ink-soft text-small">
                    Đăng nhập để quản lý đơn hàng và ưu đãi độc quyền
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-tiny font-semibold text-ink-soft ml-1">
                        Email đăng nhập
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-faint group-focus-within:text-brand transition-colors">
                            <Mail className="h-4 w-4" />
                        </div>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className={`h-11 pl-10 rounded-full bg-surface-2/40 border-line text-small text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20 transition-all ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    {errors.email && <p className="text-tiny text-destructive ml-2">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-tiny font-semibold text-ink-soft ml-1">
                            Mật khẩu
                        </label>
                        <Link href="/forgot-password" className="text-tiny font-medium text-brand hover:underline transition-colors">
                            Quên mật khẩu?
                        </Link>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-faint group-focus-within:text-brand transition-colors">
                            <Lock className="h-4 w-4" />
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`h-11 pl-10 pr-10 rounded-full bg-surface-2/40 border-line text-small text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20 transition-all ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-faint hover:text-ink transition-colors cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && <p className="text-tiny text-destructive ml-2">{errors.password}</p>}
                </div>

                <div className="flex items-center pt-1">
                    <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        disabled={isLoading}
                        className="rounded-md border-line data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-tiny text-ink-soft cursor-pointer select-none">
                        Ghi nhớ phiên đăng nhập này
                    </label>
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 text-small font-semibold rounded-full bg-brand text-white hover:bg-brand-hover shadow-xs hover:shadow-brand-glow transition-all cursor-pointer mt-2"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Đang xác thực...</span>
                        </div>
                    ) : (
                        "Đăng nhập"
                    )}
                </Button>
            </form>

            {googleLoginEnabled && (
                <>
                    <div className="my-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-line" />
                        <span className="text-tiny text-ink-faint">Hoặc tiếp tục với</span>
                        <div className="h-px flex-1 bg-line" />
                    </div>

                    <GoogleLoginButton returnUrl={redirectUrl} disabled={isLoading} />
                </>
            )}

            <div className="text-center mt-6 pt-4 border-t border-line/60">
                <p className="text-small text-ink-soft">
                    Chưa có tài khoản?{" "}
                    <Link href="/register" className="font-semibold text-brand hover:underline transition-colors">
                        Đăng ký thành viên
                    </Link>
                </p>
            </div>
        </div>
    )
}


"use client"

import type React from "react"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-auth"
import { AppToaster } from "@/components/toast/app-toaster"
import { getGuestId } from "@/lib/guest-id"

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
    const [guestId, setGuestId] = useState("")
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

    const router = useRouter()
    const searchParams = useSearchParams()
    const { login } = useAuth()

    // Get redirect URL from query params - support both 'returnUrl' and 'redirect'
    const redirectUrl = getSafeReturnUrl(searchParams.get("returnUrl") || searchParams.get("redirect"))
    const googleLoginUrl = `/api/auth/external-login?provider=Google&returnUrl=${encodeURIComponent(redirectUrl)}`

    useEffect(() => {
        setGuestId(getGuestId() ?? "")
    }, [])

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
        <div className="glass-card p-8 rounded-2xl w-full text-left">
            <div className="text-center mb-8">
                <h1 className="text-3xl tech-heading mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#2A5CAA] to-[#1e4785] dark:from-blue-400 dark:to-blue-600">
                    Đăng nhập
                </h1>
                <p className="text-muted-foreground text-sm">
                    Chào mừng trở lại! Nhập thông tin để tiếp tục.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="tech-label ml-1">
                        Email
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Mail className="h-5 w-5" />
                        </div>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className={`pl-10 bg-secondary/50 border-transparent focus:border-primary/50 focus:bg-background transition-all duration-300 ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    {errors.email && <p className="text-sm text-red-500 ml-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="tech-label ml-1">
                            Mật khẩu
                        </label>
                        <Link href="/forgot-password" className="text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
                            Quên mật khẩu?
                        </Link>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Lock className="h-5 w-5" />
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`pl-10 bg-secondary/50 border-transparent focus:border-primary/50 focus:bg-background transition-all duration-300 ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500 ml-1">{errors.password}</p>}
                </div>

                <div className="flex items-center">
                    <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        disabled={isLoading}
                        className="border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground cursor-pointer select-none">
                        Ghi nhớ đăng nhập
                    </label>
                </div>

                <Button
                    type="submit"
                    className="w-full btn-glow h-11 text-base font-medium rounded-xl from-blue-600 to-indigo-600 bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700 border-0"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Đang xử lý...</span>
                        </div>
                    ) : (
                        "Đăng nhập"
                    )}
                </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">Hoặc</span>
                <div className="h-px flex-1 bg-border" />
            </div>

            <form method="post" action={googleLoginUrl}>
                <input type="hidden" name="guestId" value={guestId} />
                <Button
                    type="submit"
                    variant="outline"
                    className="h-11 w-full rounded-xl border-[#dadce0] bg-white text-sm font-medium text-[#3c4043] hover:bg-[#f8fafd] dark:bg-background dark:text-foreground"
                    disabled={isLoading}
                >
                    <svg aria-hidden="true" className="mr-3 h-5 w-5" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.4 0 6.4 1.2 8.8 3.5l6.6-6.6C35.4 2.7 30.1.5 24 .5 14.8.5 6.9 5.8 3.1 13.5l7.7 6C12.6 13.6 17.8 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h13.2c-.6 3-2.3 5.6-4.9 7.3l7.5 5.8c4.4-4.1 7.7-10.1 7.7-17.1z" />
                        <path fill="#FBBC05" d="M10.8 28.5c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5l-7.7-6C1.4 16.7.5 20.2.5 24s.9 7.3 2.6 10.5l7.7-6z" />
                        <path fill="#34A853" d="M24 47.5c6.1 0 11.3-2 15.1-5.4l-7.5-5.8c-2.1 1.4-4.7 2.2-7.6 2.2-6.2 0-11.4-4.1-13.2-9.8l-7.7 6C6.9 42.2 14.8 47.5 24 47.5z" />
                    </svg>
                    Sign in with Google
                </Button>
            </form>

            <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                    Chưa có tài khoản?{" "}
                    <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    )
}


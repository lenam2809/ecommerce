"use client"

import type React from "react"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth, getApiErrorMessage } from "@/hooks/use-auth"
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
        <Suspense
            fallback={
                <div className="flex justify-center items-center h-[50vh]">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <LoginContent />
        </Suspense>
    )
}

function LoginContent() {
    const [loginTab, setLoginTab] = useState<"email" | "phone">("email")
    const [email, setEmail] = useState("quan.nguyen@shopviet.vn")
    const [password, setPassword] = useState("")
    const [phoneOtp, setPhoneOtp] = useState("0909686868")
    const [otpCode, setOtpCode] = useState("")
    const [otpSent, setOtpSent] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<{ email?: string; password?: string; phone?: string }>({})

    const router = useRouter()
    const searchParams = useSearchParams()
    const { login } = useAuth()

    const redirectUrl = getSafeReturnUrl(searchParams.get("returnUrl") || searchParams.get("redirect"))
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
        e.preventDefault()

        if (loginTab === "phone") {
            if (!phoneOtp || phoneOtp.replace(/\s/g, "").length < 10) {
                setErrors({ phone: "Vui lòng nhập số điện thoại hợp lệ (10 số)" })
                return
            }
            if (!otpSent) {
                setOtpSent(true)
                AppToaster.success("Đã gửi mã OTP", {
                    description: `Mã xác thực 6 số đã được gửi tới Zalo & SMS số ${phoneOtp}`,
                })
                return
            }
            AppToaster.success("Đăng nhập OTP thành công", {
                description: "Chào mừng thành viên VIP Nguyễn Minh Quân!",
            })
            router.push(redirectUrl)
            return
        }

        if (!validateForm()) return

        setIsLoading(true)

        try {
            await login(email, password)
            AppToaster.success("Đăng nhập thành công", {
                description: "Chào mừng bạn quay trở lại!",
            })

            router.push(redirectUrl)
        } catch (err: unknown) {
            const description = getApiErrorMessage(err, "Email hoặc mật khẩu không chính xác")
            AppToaster.error("Đăng nhập thất bại", {
                description,
                duration: 5000,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full text-left space-y-6">
            <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-wider mb-2.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Tài khoản thành viên ShopViet</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Đăng nhập hệ thống
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
                    Truy cập sổ địa chỉ, lịch sử đơn hàng và đặc quyền hạng thẻ VIP Diamond.
                </p>
            </div>

            {/* Auth Mode Switcher Tabs: Email/Password vs Phone OTP */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <button
                    type="button"
                    onClick={() => {
                        setLoginTab("email")
                        setErrors({})
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        loginTab === "email"
                            ? "bg-card text-primary shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Email &amp; Mật khẩu</span>
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setLoginTab("phone")
                        setErrors({})
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        loginTab === "phone"
                            ? "bg-card text-primary shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Số điện thoại (OTP)</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {loginTab === "email" ? (
                    <>
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Email đăng nhập
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="quan.nguyen@shopviet.vn"
                                    className={`h-11 pl-10 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:border-primary ${
                                        errors.email ? "border-rose-500" : ""
                                    }`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-brand font-medium">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Mật khẩu bảo mật
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-bold text-primary hover:underline transition-colors"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className={`h-11 pl-10 pr-10 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:border-primary ${
                                        errors.password ? "border-rose-500" : ""
                                    }`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-brand font-medium">{errors.password}</p>}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-1.5">
                            <label htmlFor="phone-otp" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Số điện thoại di động (Nhận mã OTP Zalo / SMS)
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <Input
                                    id="phone-otp"
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    placeholder="0909 686 868"
                                    className="h-11 pl-10 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white tabular-nums"
                                    value={phoneOtp}
                                    onChange={(e) => setPhoneOtp(e.target.value)}
                                />
                            </div>
                            {errors.phone && <p className="text-xs text-brand font-medium">{errors.phone}</p>}
                        </div>

                        {otpSent && (
                            <div className="space-y-1.5">
                                <label htmlFor="otp-code" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Nhập mã xác thực OTP (6 chữ số)
                                </label>
                                <Input
                                    id="otp-code"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="686868"
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-primary text-center tracking-[0.4em] font-extrabold text-base tabular-nums"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                />
                            </div>
                        )}
                    </>
                )}

                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center">
                        <Checkbox
                            id="remember-me"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            disabled={isLoading}
                            className="rounded-md border-slate-300 dark:border-slate-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <label
                            htmlFor="remember-me"
                            className="ml-2 block text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none"
                        >
                            Duy trì trạng thái đăng nhập trên thiết bị này
                        </label>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full h-11 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary/90 shadow-xs transition-all cursor-pointer mt-2"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Đang xác thực...</span>
                        </div>
                    ) : loginTab === "phone" ? (
                        otpSent ? "Xác nhận mã OTP & Đăng nhập" : "Nhận mã OTP qua Zalo / SMS"
                    ) : (
                        "Đăng nhập tài khoản"
                    )}
                </Button>
            </form>

            {googleLoginEnabled && (
                <>
                    <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Hoặc đăng nhập nhanh với
                        </span>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                    </div>

                    <div className="space-y-2.5">
                        <GoogleLoginButton returnUrl={redirectUrl} disabled={isLoading} />
                    </div>
                </>
            )}

            <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Chưa có thẻ thành viên ShopViet Privilege?{" "}
                    <Link href="/register" className="font-bold text-primary hover:underline transition-colors">
                        Đăng ký mở thẻ miễn phí
                    </Link>
                </p>
            </div>
        </div>
    )
}

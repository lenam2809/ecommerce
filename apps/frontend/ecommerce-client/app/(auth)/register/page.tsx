"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-auth"
import { AppToaster } from "@/components/toast/app-toaster"

export default function RegisterPage() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<{
        firstName?: string
        lastName?: string
        email?: string
        phoneNumber?: string
        password?: string
        confirmPassword?: string
        agreeTerms?: string
    }>({})

    const router = useRouter()
    const { register } = useAuth()

    const validateForm = () => {
        const newErrors: {
            firstName?: string
            lastName?: string
            email?: string
            phoneNumber?: string
            password?: string
            confirmPassword?: string
            agreeTerms?: string
        } = {}

        if (!firstName.trim()) {
            newErrors.firstName = "Tên không được để trống"
        } else if (firstName.trim().length > 50) {
            newErrors.firstName = "Tên không được vượt quá 50 ký tự"
        }

        if (!lastName.trim()) {
            newErrors.lastName = "Họ không được để trống"
        } else if (lastName.trim().length > 50) {
            newErrors.lastName = "Họ không được vượt quá 50 ký tự"
        }

        if (!email) {
            newErrors.email = "Email không được để trống"
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email không hợp lệ"
        }

        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = "Số điện thoại không được để trống"
        } else if (!/^[0-9]{10,11}$/.test(phoneNumber.replace(/\s/g, ""))) {
            newErrors.phoneNumber = "Số điện thoại không hợp lệ"
        }

        if (!password) {
            newErrors.password = "Mật khẩu không được để trống"
        } else if (password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
        }

        if (!agreeTerms) {
            newErrors.agreeTerms = "Bạn phải đồng ý với điều khoản dịch vụ"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)

        try {
            await register(
                {
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    password,
                    confirmPassword,
                }
            )

            AppToaster.success("Đăng ký thành công", {
                description: "Tài khoản của bạn đã được tạo thành công!",
            })

            // Redirect to login page
            router.push("/login")
        } catch {
            AppToaster.error("Đăng ký thất bại", {
                description: "Có lỗi xảy ra khi đăng ký tài khoản. Vui lòng thử lại sau.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-card border border-line rounded-3xl p-6 sm:p-8 w-full text-left shadow-xs">
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft text-brand text-[11px] font-bold uppercase tracking-wider mb-3">
                    <span>ShopViet Membership</span>
                </div>
                <h1 className="text-h2 font-bold tracking-tight mb-1.5 text-ink">
                    Tạo tài khoản mới
                </h1>
                <p className="text-ink-soft text-small">
                    Gia nhập cộng đồng ShopViet để hưởng đặc quyền VIP
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label htmlFor="lastName" className="text-tiny font-semibold text-ink-soft ml-1">
                            Họ &amp; Đệm
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-faint group-focus-within:text-brand transition-colors">
                                <User className="h-4 w-4" />
                            </div>
                            <Input
                                id="lastName"
                                type="text"
                                placeholder="Nguyễn"
                                className={`h-11 pl-10 rounded-full bg-surface-2/40 border-line text-small text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20 transition-all ${errors.lastName ? "border-red-500 focus:ring-red-500" : ""}`}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        {errors.lastName && <p className="text-tiny text-destructive ml-2">{errors.lastName}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="firstName" className="text-tiny font-semibold text-ink-soft ml-1">
                            Tên
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-faint group-focus-within:text-brand transition-colors">
                                <User className="h-4 w-4" />
                            </div>
                            <Input
                                id="firstName"
                                type="text"
                                placeholder="Văn A"
                                className={`h-11 pl-10 rounded-full bg-surface-2/40 border-line text-small text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20 transition-all ${errors.firstName ? "border-red-500 focus:ring-red-500" : ""}`}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        {errors.firstName && <p className="text-tiny text-destructive ml-2">{errors.firstName}</p>}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="email" className="text-tiny font-semibold text-ink-soft ml-1">
                        Email liên hệ
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
                    <label htmlFor="phone" className="text-tiny font-semibold text-ink-soft ml-1">
                        Số điện thoại
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-faint group-focus-within:text-brand transition-colors">
                            <Phone className="h-4 w-4" />
                        </div>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="0912 xxx xxx"
                            className={`h-11 pl-10 rounded-full bg-surface-2/40 border-line text-small text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20 transition-all ${errors.phoneNumber ? "border-red-500 focus:ring-red-500" : ""}`}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    {errors.phoneNumber && <p className="text-tiny text-destructive ml-2">{errors.phoneNumber}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-tiny font-semibold text-ink-soft ml-1">
                            Mật khẩu
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-faint group-focus-within:text-brand transition-colors">
                                <Lock className="h-4 w-4" />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={`h-11 pl-10 pr-9 rounded-full bg-surface-2/40 border-line text-small text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20 transition-all ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-faint hover:text-ink transition-colors cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                    <Eye className="h-3.5 w-3.5" />
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-tiny text-destructive ml-2">{errors.password}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="confirmPassword" className="text-tiny font-semibold text-ink-soft ml-1">
                            Xác nhận mật khẩu
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-faint group-focus-within:text-brand transition-colors">
                                <Lock className="h-4 w-4" />
                            </div>
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={`h-11 pl-10 pr-9 rounded-full bg-surface-2/40 border-line text-small text-ink placeholder:text-ink-faint focus:border-brand focus:ring-brand/20 transition-all ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}`}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-faint hover:text-ink transition-colors cursor-pointer"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                    <Eye className="h-3.5 w-3.5" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-tiny text-destructive ml-2">{errors.confirmPassword}</p>}
                    </div>
                </div>

                <div className="flex items-start pt-1">
                    <div className="flex items-center h-5">
                        <Checkbox
                            id="agree-terms"
                            checked={agreeTerms}
                            onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                            disabled={isLoading}
                            className="rounded-md border-line data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                        />
                    </div>
                    <div className="ml-2.5 text-tiny leading-tight">
                        <label htmlFor="agree-terms" className="text-ink-soft cursor-pointer">
                            Tôi đồng ý với{" "}
                            <Link href="/terms" className="font-semibold text-brand hover:underline">
                                Điều khoản
                            </Link>{" "}
                            và{" "}
                            <Link href="/privacy" className="font-semibold text-brand hover:underline">
                                Chính sách bảo mật
                            </Link>
                        </label>
                    </div>
                </div>
                {errors.agreeTerms && <p className="text-tiny text-destructive ml-2">{errors.agreeTerms}</p>}

                <Button
                    type="submit"
                    className="w-full h-11 text-small font-semibold rounded-full bg-brand text-white hover:bg-brand-hover shadow-xs hover:shadow-brand-glow transition-all cursor-pointer mt-3"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Đang tạo tài khoản...</span>
                        </div>
                    ) : (
                        "Đăng ký tài khoản"
                    )}
                </Button>

                <div className="text-center mt-6 pt-4 border-t border-line/60">
                    <p className="text-small text-ink-soft">
                        Đã có tài khoản?{" "}
                        <Link href="/login" className="font-semibold text-brand hover:underline transition-colors">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    )
}
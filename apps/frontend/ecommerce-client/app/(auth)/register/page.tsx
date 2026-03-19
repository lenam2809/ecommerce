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
        <div className="glass-card p-8 rounded-2xl w-full text-left">
            <div className="text-center mb-8">
                <h1 className="text-3xl tech-heading mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                    Đăng ký tài khoản
                </h1>
                <p className="text-muted-foreground text-sm">
                    Tạo tài khoản để trải nghiệm mua sắm tuyệt vời.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="firstName" className="tech-label ml-1">
                            Tên
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                <User className="h-4 w-4" />
                            </div>
                            <Input
                                id="firstName"
                                type="text"
                                placeholder="Văn A"
                                className={`pl-9 bg-secondary/50 border-transparent focus:border-primary/50 focus:bg-background transition-all duration-300 ${errors.firstName ? "border-red-500 focus:ring-red-500" : ""}`}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        {errors.firstName && <p className="text-xs text-red-500 ml-1">{errors.firstName}</p>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="lastName" className="tech-label ml-1">
                            Họ
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                <User className="h-4 w-4" />
                            </div>
                            <Input
                                id="lastName"
                                type="text"
                                placeholder="Nguyễn"
                                className={`pl-9 bg-secondary/50 border-transparent focus:border-primary/50 focus:bg-background transition-all duration-300 ${errors.lastName ? "border-red-500 focus:ring-red-500" : ""}`}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        {errors.lastName && <p className="text-xs text-red-500 ml-1">{errors.lastName}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="tech-label ml-1">
                        Email
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Mail className="h-4 w-4" />
                        </div>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className={`pl-9 bg-secondary/50 border-transparent focus:border-primary/50 focus:bg-background transition-all duration-300 ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="phone" className="tech-label ml-1">
                        Số điện thoại
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Phone className="h-4 w-4" />
                        </div>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="0912345678"
                            className={`pl-9 bg-secondary/50 border-transparent focus:border-primary/50 focus:bg-background transition-all duration-300 ${errors.phoneNumber ? "border-red-500 focus:ring-red-500" : ""}`}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    {errors.phoneNumber && <p className="text-xs text-red-500 ml-1">{errors.phoneNumber}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="tech-label ml-1">
                        Mật khẩu
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Lock className="h-4 w-4" />
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`pl-9 bg-secondary/50 border-transparent focus:border-primary/50 focus:bg-background transition-all duration-300 ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
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
                    {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="tech-label ml-1">
                        Xác nhận mật khẩu
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Lock className="h-4 w-4" />
                        </div>
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`pl-9 bg-secondary/50 border-transparent focus:border-primary/50 focus:bg-background transition-all duration-300 ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-500 ml-1">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-start pt-2">
                    <div className="flex items-center h-5">
                        <Checkbox
                            id="agree-terms"
                            checked={agreeTerms}
                            onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                            disabled={isLoading}
                            className="border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                    </div>
                    <div className="ml-3 text-sm leading-none">
                        <label htmlFor="agree-terms" className="text-muted-foreground">
                            Tôi đồng ý với{" "}
                            <Link href="/terms" className="font-medium text-primary hover:underline">
                                Điều khoản
                            </Link>{" "}
                            và{" "}
                            <Link href="/privacy" className="font-medium text-primary hover:underline">
                                Chính sách
                            </Link>
                        </label>
                    </div>
                </div>
                {errors.agreeTerms && <p className="text-xs text-red-500 ml-1">{errors.agreeTerms}</p>}

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
                        "Đăng ký"
                    )}
                </Button>

                <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground">
                        Đã có tài khoản?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    )
}
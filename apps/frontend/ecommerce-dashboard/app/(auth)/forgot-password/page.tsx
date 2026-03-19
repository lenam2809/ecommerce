import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
    title: "Quên mật khẩu | E-Commerce Dashboard",
    description: "Khôi phục mật khẩu tài khoản của bạn",
}

export default function ForgotPasswordPage() {
    return (
        <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0">
                    <Image
                        src="/login.png"
                        alt="Background"
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </div>
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Image
                        src="/logo.png"
                        alt="E-Commerce Logo"
                        width={24}
                        height={24}
                        className="mr-2 h-6 w-6"
                    />
                    E-Commerce Dashboard
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Bảo mật là ưu tiên hàng đầu của chúng tôi. Quy trình khôi phục mật khẩu được thiết kế để đảm bảo an toàn cho tài khoản của bạn.&rdquo;
                        </p>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">Quên mật khẩu?</h1>
                        <p className="text-sm text-muted-foreground">
                            Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
                        </p>
                    </div>
                    <ForgotPasswordForm />
                    <div className="text-center">
                        <Link
                            href="/login"
                            className="text-sm text-primary hover:underline"
                        >
                            ← Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

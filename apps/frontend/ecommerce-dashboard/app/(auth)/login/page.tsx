import { Suspense } from "react"
import type { Metadata } from "next"
import Image from "next/image"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Đăng nhập | E-Commerce Dashboard",
  description: "Đăng nhập vào bảng điều khiển thương mại điện tử của bạn",
}

export default function LoginPage() {
  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0">
          <Image
            src="/login.png"
            alt="Login Background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" /> {/* Lớp phủ tối để làm chữ dễ đọc hơn */}
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
              &ldquo;Bảng điều khiển này đã hoàn toàn thay đổi cách chúng tôi quản lý cửa hàng trực tuyến. Các tính năng phân tích và theo dõi đơn hàng thực sự là những bước đột phá.&rdquo;
            </p>
            <footer className="text-sm">Lê Nam</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Đăng nhập</h1>
            <p className="text-sm text-muted-foreground">
              Chào mừng bạn quay trở lại! Vui lòng đăng nhập để tiếp tục.
            </p>
          </div>
          <Suspense fallback={<div className="h-[300px] flex items-center justify-center">Đang tải...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
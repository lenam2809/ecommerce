"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, Home, ShoppingBag, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NotFound() {
    return (
        <div className="container-app py-16 md:py-24">
            <div className="w-full max-w-3xl mx-auto text-center">
                <div className="relative w-full h-64 mb-8">
                    <Image
                        src="/placeholder.svg?height=256&width=512"
                        alt="404 Illustration"
                        fill
                        className="object-contain"
                        priority
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h1 className="text-9xl font-bold text-brand opacity-90">404</h1>
                    </div>
                </div>

                <h2 className="text-h1 font-semibold tracking-tight text-ink mb-4">Oops! Trang không tìm thấy</h2>

                <p className="text-body text-ink-soft mb-8 max-w-xl mx-auto">
                    Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
                </p>

                {/* Search box */}
                <div className="relative max-w-md mx-auto mb-8">
                    <div className="flex">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-ink-faint" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="pl-10 pr-4 py-2 w-full rounded-l-full border-line bg-card focus-visible:border-brand focus-visible:ring-brand/30"
                            />
                        </div>
                        <Button className="rounded-r-full rounded-l-none bg-brand hover:bg-brand-hover text-white px-6">
                            Tìm kiếm
                        </Button>
                    </div>
                </div>

                {/* Navigation options */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
                    <Button
                        asChild
                        className="bg-brand hover:bg-brand-hover text-white rounded-full h-11 px-7 w-full sm:w-auto"
                    >
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Về trang chủ
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full border-line text-ink hover:bg-surface h-11 px-7 w-full sm:w-auto">
                        <Link href="/products">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Xem sản phẩm
                        </Link>
                    </Button>
                    <Button variant="ghost" onClick={() => window.history.back()} className="rounded-full text-ink-soft hover:text-ink h-11 px-7 w-full sm:w-auto">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại trang trước
                    </Button>
                </div>

                {/* Quick links */}
                <div className="border-t border-line pt-8">
                    <h3 className="text-h3 font-medium text-ink mb-4">Bạn có thể thử các liên kết phổ biến sau:</h3>
                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-2">
                        {["Điện tử", "Thời trang", "Gia dụng", "Giỏ hàng", "Tài khoản"].map((label, i) => (
                            <span key={label} className="flex items-center gap-3">
                                {i > 0 && <span className="text-ink-faint/50">•</span>}
                                <Link
                                    href={label === "Giỏ hàng" ? "/cart" : label === "Tài khoản" ? "/account" : `/products?category=${label.toLowerCase()}`}
                                    className="text-brand hover:underline"
                                >
                                    {label}
                                </Link>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, Home, ShoppingBag, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NotFound() {
    return (
        <>
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
                        <h1 className="text-9xl font-bold text-[#2A5CAA] opacity-90 dark:text-blue-500">404</h1>
                    </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Oops! Trang không tìm thấy</h2>

                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
                    Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
                </p>

                {/* Search box */}
                <div className="relative max-w-md mx-auto mb-8">
                    <div className="flex">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="pl-10 pr-4 py-2 w-full rounded-l-md border-gray-300 focus:border-[#2A5CAA] focus:ring-[#2A5CAA] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                            />
                        </div>
                        <Button className="rounded-l-none bg-[#2A5CAA] hover:bg-[#1e4785] dark:bg-blue-600 dark:hover:bg-blue-700">
                            Tìm kiếm
                        </Button>
                    </div>
                </div>

                {/* Navigation options */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                    <Button
                        asChild
                        className="bg-[#FF6B00] hover:bg-[#e05f00] dark:bg-orange-600 dark:hover:bg-orange-700 w-full sm:w-auto"
                    >
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Về trang chủ
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href="/products">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Xem sản phẩm
                        </Link>
                    </Button>
                    <Button variant="ghost" onClick={() => window.history.back()} className="w-full sm:w-auto">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại trang trước
                    </Button>
                </div>

                {/* Quick links */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                    <h3 className="text-lg font-medium mb-4 dark:text-white">Bạn có thể thử các liên kết phổ biến sau:</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link href="/products?category=electronics" className="text-[#2A5CAA] hover:underline dark:text-blue-400">
                            Điện tử
                        </Link>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <Link href="/products?category=fashion" className="text-[#2A5CAA] hover:underline dark:text-blue-400">
                            Thời trang
                        </Link>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <Link href="/products?category=home" className="text-[#2A5CAA] hover:underline dark:text-blue-400">
                            Gia dụng
                        </Link>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <Link href="/cart" className="text-[#2A5CAA] hover:underline dark:text-blue-400">
                            Giỏ hàng
                        </Link>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <Link href="/account" className="text-[#2A5CAA] hover:underline dark:text-blue-400">
                            Tài khoản
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}


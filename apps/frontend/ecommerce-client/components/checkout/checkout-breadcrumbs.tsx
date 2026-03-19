import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function CheckoutBreadcrumbs() {
    return (
        <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-[#2A5CAA]">
                Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href="/cart" className="hover:text-[#2A5CAA]">
                Giỏ hàng
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span>Thanh toán</span>
        </div>
    )
}
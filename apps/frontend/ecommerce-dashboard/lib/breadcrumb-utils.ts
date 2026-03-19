"use client"

import { usePathname } from "next/navigation"

export type BreadcrumbItem = {
    label: string
    href: string
    isCurrent?: boolean
}

// Map of path segments to more user-friendly labels
const pathLabels: Record<string, string> = {
    "": "Trang chủ",
    dashboard: "Dashboard",
    products: "Sản phẩm",
    categories: "Danh mục",
    users: "Người dùng",
    orders: "Đơn hàng",
    settings: "Cài đặt",
    brands: "Thương hiệu",
    profile: "Tài khoản",
    reports: "Báo cáo",
    edit: "Chỉnh sửa",
    new: "Thêm mới",
    help: "Trợ giúp",
    contact: "Liên hệ",
    account: "Tài khoản",
    permissions: "Quyền",
    roles: "Vai trò",
    configs: "Cấu hình",
    "promo-codes": "Mã khuyến mãi",
    revenue: "Doanh thu",


}

/**
 * Generates breadcrumb items based on the current path
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
    const pathname = usePathname()

    if (pathname === "/") {
        return [{ label: "Trang chủ", href: "/", isCurrent: true }]
    }

    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Trang chủ", href: "/" }]
    let currentPath = ""

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        currentPath += `/${segment}`
        const isLast = i === segments.length - 1

        // Skip UUID segments when they're followed by 'edit'
        if (isUUID(segment) && segments[i + 1] === 'edit') {
            continue
        }

        let label: string
        if (segment === 'new') {
            label = pathLabels.new
        } else if (segment === 'edit') {
            label = pathLabels.edit
        } else if (isUUID(segment)) {
            label = 'Chi tiết'
        } else {
            label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
        }

        breadcrumbs.push({
            label,
            href: isLast ? "#" : currentPath,
            isCurrent: isLast,
        })
    }

    return breadcrumbs
}

function isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
}
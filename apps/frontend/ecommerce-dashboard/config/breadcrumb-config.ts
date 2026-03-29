export type BreadcrumbConfig = {
    // Define custom paths and their breadcrumb structure
    paths: Record<
        string,
        {
            label: string
            parent?: string // Optional parent path
        }
    >
}

// Example configuration - expand this based on your site structure
export const breadcrumbConfig: BreadcrumbConfig = {
    paths: {
        "/": {
            label: "Trang chủ",
        },
        "/dashboard": {
            label: "Dashboard",
            parent: "/",
        },
        "/reports": {
            label: "Báo cáo",
            parent: "/",
        },
        "/products": {
            label: "Sản phẩm",
            parent: "/",
        },
        "/categories": {
            label: "Loại sản phẩm",
            parent: "/",
        },
        "/settings": {
            label: "Cài đặt",
            parent: "/",
        },
        "/profile": {
            label: "Hồ sơ",
            parent: "/",
        },
        "/help": {
            label: "Trợ giúp",
            parent: "/",
        },
        "/configs/marquee": {
            label: "Quản lý Marquee",
            parent: "/",
        },
        "/configs/marquee/new": {
            label: "Thêm tin nhắn mới",
            parent: "/configs/marquee",
        },
    },
}

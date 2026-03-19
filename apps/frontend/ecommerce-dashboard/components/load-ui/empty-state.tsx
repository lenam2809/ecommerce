import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Package, FileQuestion, Search, Users, ShoppingCart, ArrowRight } from "lucide-react"

export type EmptyStateVariant =
    | "default"
    | "no-data"
    | "no-results"
    | "no-products"
    | "no-orders"
    | "no-users"

interface EmptyStateProps {
    variant?: EmptyStateVariant
    title?: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    className?: string
    icon?: ReactNode
}

const variantConfig: Record<EmptyStateVariant, { icon: ReactNode; title: string; description: string }> = {
    default: {
        icon: <FileQuestion className="h-12 w-12 text-muted-foreground" />,
        title: "Không có dữ liệu",
        description: "Hiện tại chưa có dữ liệu nào để hiển thị.",
    },
    "no-data": {
        icon: <FileQuestion className="h-12 w-12 text-muted-foreground" />,
        title: "Không có dữ liệu",
        description: "Hiện tại chưa có dữ liệu nào để hiển thị.",
    },
    "no-results": {
        icon: <Search className="h-12 w-12 text-muted-foreground" />,
        title: "Không tìm thấy kết quả",
        description: "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.",
    },
    "no-products": {
        icon: <Package className="h-12 w-12 text-muted-foreground" />,
        title: "Chưa có sản phẩm",
        description: "Bắt đầu bằng cách thêm sản phẩm đầu tiên.",
    },
    "no-orders": {
        icon: <ShoppingCart className="h-12 w-12 text-muted-foreground" />,
        title: "Chưa có đơn hàng",
        description: "Các đơn hàng mới sẽ xuất hiện ở đây.",
    },
    "no-users": {
        icon: <Users className="h-12 w-12 text-muted-foreground" />,
        title: "Chưa có người dùng",
        description: "Người dùng mới sẽ xuất hiện ở đây.",
    },
}

export function EmptyState({
    variant = "default",
    title,
    description,
    action,
    className,
    icon,
}: EmptyStateProps) {
    const config = variantConfig[variant]

    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-16 px-4 text-center",
            className
        )}>
            {/* Icon */}
            <div className="mb-4 rounded-full bg-muted p-4">
                {icon || config.icon}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-foreground mb-2">
                {title || config.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground max-w-md mb-6">
                {description || config.description}
            </p>

            {/* Action Button */}
            {action && (
                <Button onClick={action.onClick} className="gap-2">
                    {action.label}
                    <ArrowRight className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}

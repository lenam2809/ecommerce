"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpDown, Edit, Eye, MoreHorizontal, Trash } from "lucide-react"
import type { ListConfig } from "@/types/list-config"
import { EPromoCodeType, PromoCode } from "@/types/promo-code"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useDeletePromoCode } from "@/hooks/use-promo-codes"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/currency"

const PromoCodeActions = ({ promoCode }: { promoCode: PromoCode }) => {
    const router = useRouter()
    const { mutate: deletePromoCode, isPending } = useDeletePromoCode();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => {
                        router.push(`/configs/promo-codes/${promoCode.id}`) // Chuyển đến trang chi tiết
                    }}
                >
                    <Eye className="h-4 w-4 mr-2" />Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => {
                        router.push(`/configs/promo-codes/${promoCode.id}/edit`) // Chuyển đến trang chỉnh sửa
                    }}
                >
                    <Edit className="h-4 w-4 mr-2" />Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        deletePromoCode(promoCode.id)
                    }}
                >
                    <Trash className="h-4 w-4 mr-2" />Xóa
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// Hiển thị trạng thái mã khuyến mãi
const StatusBadge = ({ promoCode }: { promoCode: PromoCode }) => {
    if (!promoCode.isActive) {
        return <Badge variant="outline" className="bg-gray-600">Không hoạt động</Badge>
    }
    if (promoCode.isExpired) {
        return <Badge variant="destructive">Hết hạn</Badge>
    }
    if (promoCode.usageLimit > 0 && promoCode.timesUsed >= promoCode.usageLimit) {
        return <Badge variant="destructive">Đã dùng hết</Badge>
    }
    return <Badge variant="default" className="bg-green-500">Đang hoạt động</Badge>
}

// Hiển thị loại mã khuyến mãi
const TypeBadge = ({ type }: { type: EPromoCodeType }) => {
    switch (type) {
        case EPromoCodeType.PercentageDiscount:
            return <Badge variant="outline" className="bg-blue-100">Giảm theo %</Badge>
        case EPromoCodeType.FixedAmountDiscount:
            return <Badge variant="outline" className="bg-green-100">Giảm số tiền cố định</Badge>
        case EPromoCodeType.FreeShipping:
            return <Badge variant="outline" className="bg-purple-100">Miễn phí vận chuyển</Badge>
        case EPromoCodeType.Mixed:
            return <Badge variant="outline" className="bg-purple-100">Khuyến mại hỗn hợp</Badge>
        default:
            return <Badge variant="outline">{type}</Badge>
    }
}

// Hiển thị chi tiết giảm giá
const DiscountInfo = ({ promoCode }: { promoCode: PromoCode }) => {
    switch (promoCode.type) {
        case EPromoCodeType.PercentageDiscount:
            return <div>{promoCode.discountPercentage}%</div>
        case EPromoCodeType.FixedAmountDiscount:
            return <div>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promoCode.discountAmount)}</div>
        case EPromoCodeType.FreeShipping:
            return <div>Miễn phí vận chuyển</div>
        default:
            return <div>-</div>
    }
}

export const promoCodeListConfig: ListConfig<PromoCode> = {
    id: "promo-codes",
    title: "Mã khuyến mãi",
    addUrl: "/configs/promo-codes/new",
    endpoint: "promo-codes/paged",
    itemsName: "mã khuyến mãi",
    itemName: "mã khuyến mãi",
    columns: [
        {
            id: "code",
            accessorKey: "code",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const isCurrentlyDescending = column.getIsSorted() === "desc"
                            column.toggleSorting(!isCurrentlyDescending)
                        }}
                    >
                        Mã khuyến mãi
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-medium">{row.getValue("code")}</div>,
        },
        {
            id: "type",
            accessorKey: "type",
            header: "Loại khuyến mãi",
            cell: ({ row }) => <TypeBadge type={row.getValue("type")} />,
        },
        {
            id: "discountInfo",
            accessorKey: "discountInfo",
            header: "Giá trị",
            cell: ({ row }) => <DiscountInfo promoCode={row.original} />,
        },
        {
            id: "validFrom",
            accessorKey: "validFrom",
            header: "Ngày bắt đầu",
            cell: ({ row }) => formatDate(row.getValue("validFrom")),
        },
        {
            id: "validTo",
            accessorKey: "validTo",
            header: "Ngày kết thúc",
            cell: ({ row }) => formatDate(row.getValue("validTo")),
        },
        {
            id: "usageInfo",
            accessorKey: "usageInfo",
            header: "Sử dụng",
            cell: ({ row }) => {
                const promoCode = row.original;
                return promoCode.usageLimit > 0
                    ? `${promoCode.timesUsed}/${promoCode.usageLimit}`
                    : `${promoCode.timesUsed}/∞`;
            },
        },
        {
            id: "status",
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => <StatusBadge promoCode={row.original} />,
        },
        {
            id: "description",
            accessorKey: "description",
            header: "Ghi chú",
            cell: ({ row }) => <div className="truncate max-w-xs">{row.getValue("description")}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const promoCode = row.original;
                return <PromoCodeActions promoCode={promoCode} />
            },
        }
    ],
    defaultHiddenColumns: ["description", "brandName"],
    filterFields: [
        {
            id: "searchTerm",
            label: "Từ khóa",
            type: "text",
            placeholder: "Nhập mã hoặc mô tả...",
            defaultValue: "",
            apiParam: "searchTerm",
        },
        {
            id: "isActive",
            label: "Trạng thái",
            type: "select",
            placeholder: "Chọn trạng thái",
            defaultValue: "",
            apiParam: "isActive",
            options: [
                { label: "Tất cả", value: "" },
                { label: "Đang hoạt động", value: "true" },
                { label: "Không hoạt động", value: "false" },
            ]
        },
        {
            id: "type",
            label: "Loại khuyến mãi",
            type: "select",
            placeholder: "Chọn loại",
            defaultValue: "",
            apiParam: "type",
            options: [
                { label: "Tất cả", value: "" },
                { label: "Giảm theo %", value: "PERCENTAGE" },
                { label: "Giảm số tiền cố định", value: "FIXED_AMOUNT" },
                { label: "Miễn phí vận chuyển", value: "FREE_SHIPPING" },
            ]
        },
    ],
    sortOptions: [
        { id: "code", label: "Mã khuyến mãi", apiParam: "sortBy" },
        { id: "validFrom", label: "Ngày bắt đầu", apiParam: "sortBy" },
        { id: "validTo", label: "Ngày kết thúc", apiParam: "sortBy" },
    ],
    defaultSort: {
        sortBy: "validTo",
        isDescending: false,
    },
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    showRowNumbers: true,
    rowNumberColumnTitle: "#",
}
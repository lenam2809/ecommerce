"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpDown, Edit, Eye, MoreHorizontal, Trash } from "lucide-react"
import type { ListConfig } from "@/types/list-config"
import { Banner } from "@/types/banner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useDeleteBanner } from "@/hooks/use-banners"
import { Badge } from "@/components/ui/badge"

const BannerActions = ({ banner }: { banner: Banner }) => {
    const router = useRouter()
    const { mutate: deleteBanner } = useDeleteBanner();

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
                        router.push(`/configs/banners/${banner.id}`) // Chuyển đến trang chi tiết
                    }}
                >
                    <Eye className="h-4 w-4 mr-2" />Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => {
                        router.push(`/configs/banners/${banner.id}/edit`) // Chuyển đến trang chỉnh sửa
                    }}
                >
                    <Edit className="h-4 w-4 mr-2" />Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        deleteBanner(banner.id)
                    }}
                >
                    <Trash className="h-4 w-4 mr-2" />Xóa
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const bannerListConfig: ListConfig<Banner> = {
    id: "banners",
    title: "Banner",
    addUrl: "/configs/banners/new",
    endpoint: "banner/paged",
    itemsName: "banner",
    itemName: "banner",
    columns: [
        {
            id: "title",
            accessorKey: "title",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const isCurrentlyDescending = column.getIsSorted() === "desc"
                            column.toggleSorting(!isCurrentlyDescending)
                        }}
                    >
                        Tiêu đề
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
        },
        {
            id: "description",
            accessorKey: "description",
            header: "Mô tả",
            cell: ({ row }) => <div className="max-w-md truncate">{row.getValue("description") || "-"}</div>,
        },
        {
            id: "imageUrl",
            accessorKey: "imageUrl",
            header: "Hình ảnh",
            cell: ({ row }) => {
                const imageUrl = row.getValue("imageUrl") as string;
                return (
                    <div className="w-16 h-12 relative">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="Banner"
                                className="w-full h-full object-cover rounded-md"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                                <span className="text-xs text-gray-500">Không có</span>
                            </div>
                        )}
                    </div>
                )
            },
        },
        {
            id: "isActive",
            accessorKey: "isActive",
            header: "Trạng thái",
            cell: ({ row }) => {
                const isActive = row.getValue("isActive");
                return isActive ? (
                    <Badge variant="default">Đang hoạt động</Badge>
                ) : (
                    <Badge variant="outline">Không hoạt động</Badge>
                );
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const banner = row.original;
                return <BannerActions banner={banner} />
            },
        }
    ],
    filterFields: [
        {
            id: "searchTerm",
            label: "Từ khóa",
            type: "text",
            placeholder: "Nhập từ khóa...",
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
                { value: "true", label: "Đang hoạt động" },
                { value: "false", label: "Không hoạt động" },
            ],
        },
    ],
    sortOptions: [
        { id: "title", label: "Tiêu đề", apiParam: "sortBy" },
        { id: "isActive", label: "Trạng thái", apiParam: "sortBy" },
    ],
    defaultSort: {
        sortBy: "title",
        isDescending: false,
    },
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    showRowNumbers: true,
    rowNumberColumnTitle: "#",
}

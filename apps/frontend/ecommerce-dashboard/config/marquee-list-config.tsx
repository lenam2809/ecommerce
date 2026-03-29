"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpDown, Edit, MoreHorizontal, Power, Trash } from "lucide-react"
import type { ListConfig } from "@/types/list-config"
import { MarqueeMessage } from "@/types/marquee"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useDeleteMarquee, useToggleMarquee } from "@/hooks/use-marquees"
import { Badge } from "@/components/ui/badge"

const MarqueeActions = ({ marquee }: { marquee: MarqueeMessage }) => {
    const router = useRouter()
    const { mutate: deleteMarquee, isPending: isDeleting } = useDeleteMarquee();
    const { mutate: toggleMarquee, isPending: isToggling } = useToggleMarquee();

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
                    onClick={() => toggleMarquee(marquee.id)}
                    disabled={isToggling}
                >
                    <Power className="h-4 w-4 mr-2" />
                    {marquee.isActive ? 'Tắt tin nhắn' : 'Bật tin nhắn'}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => router.push(`/configs/marquee/${marquee.id}/edit`)}
                >
                    <Edit className="h-4 w-4 mr-2" />Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => deleteMarquee(marquee.id)}
                    disabled={isDeleting}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash className="h-4 w-4 mr-2" />Xóa
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const marqueeListConfig: ListConfig<MarqueeMessage> = {
    id: "marquee",
    title: "Tin nhắn Marquee",
    addUrl: "/configs/marquee/new",
    endpoint: "admin/marquee/paged",
    itemsName: "tin nhắn marquee",
    itemName: "tin nhắn marquee",
    columns: [
        {
            id: "content",
            accessorKey: "content",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const isCurrentlyDescending = column.getIsSorted() === "desc"
                            column.toggleSorting(!isCurrentlyDescending)
                        }}
                    >
                        Nội dung tin nhắn
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="font-medium max-w-md truncate">{row.getValue("content")}</div>
            ),
        },
        {
            id: "priority",
            accessorKey: "priority",
            header: "Ưu tiên",
            cell: ({ row }) => (
                <div className="text-center">{row.getValue("priority")}</div>
            ),
        },
        {
            id: "isActive",
            accessorKey: "isActive",
            header: "Trạng thái",
            cell: ({ row }) => {
                const isActive = row.getValue("isActive");
                return isActive ? (
                    <Badge variant="default" className="bg-green-500">Đang hoạt động</Badge>
                ) : (
                    <Badge variant="outline">Không hoạt động</Badge>
                );
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                return <MarqueeActions marquee={row.original} />
            },
        }
    ],
    filterFields: [
        {
            id: "searchTerm",
            label: "Từ khóa",
            type: "text",
            placeholder: "Nhập nội dung tin nhắn...",
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
    ],
    sortOptions: [
        { id: "content", label: "Nội dung", apiParam: "sortBy" },
        { id: "priority", label: "Thứ tự ưu tiên", apiParam: "sortBy" },
        { id: "isActive", label: "Trạng thái", apiParam: "sortBy" },
    ],
    defaultSort: {
        sortBy: "priority",
        isDescending: false,
    },
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    showRowNumbers: true,
    rowNumberColumnTitle: "#",
}

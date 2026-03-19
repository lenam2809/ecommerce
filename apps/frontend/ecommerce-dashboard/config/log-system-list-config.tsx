// config/log-system-list-config.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Eye } from "lucide-react"
import type { ListConfig } from "@/types/list-config"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { LogEntryDto } from "@/types/log"

const LogActions = ({ log }: { log: LogEntryDto }) => {
    const router = useRouter()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <Eye className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => {
                        router.push(`/logs/${log.id}`)
                    }}
                >
                    <Eye className="h-4 w-4 mr-2" />Xem chi tiết
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const logSystemListConfig: ListConfig<LogEntryDto> = {
    id: "system-logs",
    title: "Danh sách System Logs",
    addUrl: "/log-system/new",
    endpoint: "logs/system",
    itemsName: "logs",
    itemName: "log",
    columns: [
        {
            id: "timestamp",
            accessorKey: "timestamp",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => {
                        const isCurrentlyDescending = column.getIsSorted() === "desc"
                        column.toggleSorting(!isCurrentlyDescending)
                    }}
                >
                    Thời gian
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("timestamp"))
                return <div>{date.toLocaleString()}</div>
            },
        },
        {
            id: "levelText",
            accessorKey: "levelText",
            header: "Mức độ",
            cell: ({ row }) => {
                const level = row.getValue("levelText") as string
                const variant =
                    level === "Error" ? "destructive" :
                        level === "Warning" ? "warning" :
                            "outline"
                return <Badge variant={variant as "destructive" | "outline" | "default"}>{level}</Badge>
            },
        },
        {
            id: "eventName",
            accessorKey: "eventName",
            header: "Sự kiện",
            cell: ({ row }) => <div>{row.getValue("eventName")}</div>,
        },
        {
            id: "message",
            accessorKey: "message",
            header: "Thông điệp",
            cell: ({ row }) => <div className="truncate max-w-xs">{row.getValue("message")}</div>,
        },
        {
            id: "userName",
            accessorKey: "userName",
            header: "Người dùng",
            cell: ({ row }) => <div>{row.getValue("userName")}</div>,
        },
        {
            id: "ipAddress",
            accessorKey: "ipAddress",
            header: "IP",
            cell: ({ row }) => <div>{row.getValue("ipAddress")}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const log = row.original
                return <LogActions log={log} />
            },
        },
    ],
    filterFields: [
        {
            id: "searchTerm",
            label: "Tìm kiếm",
            type: "text",
            placeholder: "Tìm kiếm thông điệp, sự kiện...",
            defaultValue: "",
            apiParam: "searchTerm",
        },
        {
            id: "level",
            label: "Mức độ",
            type: "select",
            options: [
                { value: "", label: "Tất cả mức độ" },
                { value: "Information", label: "Information" },
                { value: "Warning", label: "Warning" },
                { value: "Error", label: "Error" },
                { value: "Debug", label: "Debug" },
            ],
            defaultValue: "",
            apiParam: "level",
        },
        {
            id: "startDate",
            label: "Từ ngày",
            type: "date",
            defaultValue: "",
            apiParam: "startDate",
            isAdvanced: true,
        },
        {
            id: "endDate",
            label: "Đến ngày",
            type: "date",
            defaultValue: "",
            apiParam: "endDate",
            isAdvanced: true,
        },
    ],
    sortOptions: [
        { id: "timestamp", label: "Thời gian", apiParam: "sortBy" },
        { id: "level", label: "Mức độ", apiParam: "sortBy" },
        { id: "eventName", label: "Sự kiện", apiParam: "sortBy" },
    ],
    defaultSort: {
        sortBy: "timestamp",
        isDescending: true,
    },
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    showRowNumbers: true,
    rowNumberColumnTitle: "#",
}
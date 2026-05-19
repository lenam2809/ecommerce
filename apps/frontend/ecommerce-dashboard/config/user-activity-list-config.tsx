"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Eye, MoreHorizontal, MapPin, Monitor } from "lucide-react"
import type { ListConfig } from "@/types/list-config"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { UserActivity, ActivityType } from "@/types/user-activity"
import { formatDistanceToNow, format } from "date-fns"
import { vi } from "date-fns/locale"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const UserActivityActions = ({ activity }: { activity: UserActivity }) => {
    const router = useRouter()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Mở menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => {
                        router.push(`/users/${activity.userId}`)
                    }}
                >
                    <Eye className="h-4 w-4 mr-2" />
                    Xem hồ sơ người dùng
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => {
                        router.push(`/user-activities/${activity.id}`)
                    }}
                >
                    <Eye className="h-4 w-4 mr-2" />
                    Chi tiết hoạt động
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const getActivityTypeBadge = (activityType: string) => {
    const type = activityType as ActivityType

    const typeConfig = {
        [ActivityType.Login]: { variant: "default" as const, label: "Đăng nhập", color: "bg-green-100 text-green-800" },
        [ActivityType.Logout]: { variant: "secondary" as const, label: "Đăng xuất", color: "bg-gray-100 text-gray-800" },
        [ActivityType.Register]: { variant: "default" as const, label: "Đăng ký", color: "bg-blue-100 text-blue-800" },
        [ActivityType.PasswordChange]: { variant: "outline" as const, label: "Đổi mật khẩu", color: "bg-yellow-100 text-yellow-800" },
        [ActivityType.ProfileUpdate]: { variant: "secondary" as const, label: "Cập nhật hồ sơ", color: "bg-purple-100 text-purple-800" },
        [ActivityType.OrderCreated]: { variant: "default" as const, label: "Tạo đơn hàng", color: "bg-green-100 text-green-800" },
        [ActivityType.OrderUpdated]: { variant: "outline" as const, label: "Cập nhật đơn hàng", color: "bg-blue-100 text-blue-800" },
        [ActivityType.OrderCancelled]: { variant: "destructive" as const, label: "Hủy đơn hàng", color: "bg-red-100 text-red-800" },
        [ActivityType.AccountLocked]: { variant: "destructive" as const, label: "Khóa tài khoản", color: "bg-red-100 text-red-800" },
        [ActivityType.AccountUnlocked]: { variant: "default" as const, label: "Mở khóa tài khoản", color: "bg-green-100 text-green-800" },
        [ActivityType.PermissionChanged]: { variant: "outline" as const, label: "Thay đổi quyền", color: "bg-orange-100 text-orange-800" },
        [ActivityType.DataExport]: { variant: "secondary" as const, label: "Xuất dữ liệu", color: "bg-indigo-100 text-indigo-800" },
        [ActivityType.SecurityAlert]: { variant: "destructive" as const, label: "Cảnh báo bảo mật", color: "bg-red-100 text-red-800" },
    }

    const config = typeConfig[type] || { variant: "outline" as const, label: activityType, color: "" }

    return (
        <Badge variant={config.variant} className={config.color}>
            {config.label}
        </Badge>
    )
}

const formatUserAgent = (userAgent: string) => {
    if (!userAgent) return "Không xác định"

    // Extract browser info
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/i)
    const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/i)

    const browser = browserMatch ? browserMatch[1] : "Unknown"
    const os = osMatch ? osMatch[1] : "Unknown"

    return `${browser} trên ${os}`
}

export const userActivityListConfig: ListConfig<UserActivity> = {
    id: "user-activities",
    title: "Danh sách hoạt động người dùng",
    hideButtonAdd: true, // Không hiển thị nút thêm mới vì activities được tạo tự động
    addUrl: "/user-activities/new", // Redirect to create new activity page
    endpoint: "useractivities",
    itemsName: "hoạt động",
    itemName: "hoạt động",
    columns: [
        {
            id: "user",
            accessorKey: "userName",
            header: "Người dùng",
            cell: ({ row }) => {
                const userName = row.original.userName
                const userEmail = row.original.userEmail
                const initials = userName?.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase() || "U"

                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{userName}</div>
                            <div className="text-sm text-muted-foreground">{userEmail}</div>
                        </div>
                    </div>
                )
            },
        },
        {
            id: "activityType",
            accessorKey: "activityType",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const isCurrentlyDescending = column.getIsSorted() === "desc"
                            column.toggleSorting(!isCurrentlyDescending)
                        }}
                    >
                        Loại hoạt động
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => getActivityTypeBadge(row.original.activityType),
        },
        {
            id: "description",
            accessorKey: "description",
            header: "Mô tả",
            cell: ({ row }) => (
                <div className="max-w-[300px] line-clamp-2 text-sm" title={row.getValue("description")}>
                    {row.getValue("description")}
                </div>
            ),
        },
        {
            id: "location",
            accessorKey: "location",
            header: "Vị trí",
            cell: ({ row }) => {
                const location = row.original.location
                const ipAddress = row.original.ipAddress

                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-help">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm max-w-[150px] truncate">
                                        {location || "Không xác định"}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-sm">
                                    <div><strong>Vị trí:</strong> {location || "Không xác định"}</div>
                                    <div><strong>IP:</strong> {ipAddress}</div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            },
        },
        {
            id: "userAgent",
            accessorKey: "userAgent",
            header: "Thiết bị",
            cell: ({ row }) => {
                const userAgent = row.original.userAgent
                const formattedAgent = formatUserAgent(userAgent)

                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-help">
                                    <Monitor className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm max-w-[150px] truncate">
                                        {formattedAgent}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-sm max-w-[300px] break-all">
                                    {userAgent || "Không có thông tin"}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            },
        },
        {
            id: "timestamp",
            accessorKey: "timestamp",
            header: ({ column }) => {
                return (
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
                )
            },
            cell: ({ row }) => {
                const date = new Date(row.getValue("timestamp"))
                return (
                    <div className="text-sm">
                        <div className="font-medium">{format(date, "dd/MM/yyyy HH:mm:ss", { locale: vi })}</div>
                        <div className="text-muted-foreground">
                            {formatDistanceToNow(date, { addSuffix: true, locale: vi })}
                        </div>
                    </div>
                )
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const activity = row.original
                return <UserActivityActions activity={activity} />
            },
        }
    ],
    filterFields: [
        {
            id: "searchTerm",
            label: "Tìm kiếm",
            type: "text",
            placeholder: "Tên người dùng, email, mô tả...",
            defaultValue: "",
            apiParam: "searchTerm",
        },
        {
            id: "userId",
            label: "Người dùng",
            type: "text",
            placeholder: "ID người dùng",
            defaultValue: "",
            apiParam: "userId",
            isAdvanced: true,
        },
        {
            id: "activityType",
            label: "Loại hoạt động",
            type: "select",
            options: [
                { value: "", label: "Tất cả" },
                { value: ActivityType.Login, label: "Đăng nhập" },
                { value: ActivityType.Logout, label: "Đăng xuất" },
                { value: ActivityType.Register, label: "Đăng ký" },
                { value: ActivityType.PasswordChange, label: "Đổi mật khẩu" },
                { value: ActivityType.ProfileUpdate, label: "Cập nhật hồ sơ" },
                { value: ActivityType.OrderCreated, label: "Tạo đơn hàng" },
                { value: ActivityType.OrderUpdated, label: "Cập nhật đơn hàng" },
                { value: ActivityType.OrderCancelled, label: "Hủy đơn hàng" },
                { value: ActivityType.AccountLocked, label: "Khóa tài khoản" },
                { value: ActivityType.AccountUnlocked, label: "Mở khóa tài khoản" },
                { value: ActivityType.PermissionChanged, label: "Thay đổi quyền" },
                { value: ActivityType.DataExport, label: "Xuất dữ liệu" },
                { value: ActivityType.SecurityAlert, label: "Cảnh báo bảo mật" },
            ],
            defaultValue: "",
            apiParam: "activityType",
        },
        {
            id: "startDate",
            label: "Từ ngày",
            type: "date",
            defaultValue: "",
            apiParam: "startDate",
        },
        {
            id: "endDate",
            label: "Đến ngày",
            type: "date",
            defaultValue: "",
            apiParam: "endDate",
        },
    ],
    sortOptions: [
        { id: "timestamp", label: "Thời gian", apiParam: "sortBy" },
        { id: "userName", label: "Tên người dùng", apiParam: "sortBy" },
        { id: "activityType", label: "Loại hoạt động", apiParam: "sortBy" },
    ],
    defaultSort: {
        sortBy: "timestamp",
        isDescending: true,
    },
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    showRowNumbers: true,
    rowNumberColumnTitle: "STT",
}

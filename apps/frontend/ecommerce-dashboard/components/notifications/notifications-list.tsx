"use client"

import { logger } from '@/lib/logger'
import { useState } from "react"
import { useGetSystemNotifications, useGetUserNotifications, useDeleteNotification } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Search, Trash2, Eye, Calendar, ArrowUpDown, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { type NotificationDto, ENotificationCategory, ENotificationType } from "@/types/notification"

interface NotificationsListProps {
    type: "system" | "user"
}

export function NotificationsList({ type }: NotificationsListProps) {
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize] = useState(10)
    const [sortBy, setSortBy] = useState("createdAt")
    const [isDescending, setIsDescending] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")

    const deleteNotification = useDeleteNotification()

    // Mock user ID - trong ứng dụng thực tế, lấy từ auth context
    const userId = "current-user-id"

    const systemQuery = useGetSystemNotifications({
        pageNumber,
        pageSize,
        sortBy,
        isDescending,
        includeExpired: true,
    })

    const userQuery = useGetUserNotifications(
        {
            pageNumber,
            pageSize,
            sortBy,
            isDescending,
            isRead: statusFilter === "read" ? true : statusFilter === "unread" ? false : undefined,
            category: categoryFilter !== "all" ? (categoryFilter as ENotificationCategory) : undefined,
        },
        userId,
    )

    const query = type === "system" ? systemQuery : userQuery
    const { data, isLoading, error } = query

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setIsDescending(!isDescending)
        } else {
            setSortBy(column)
            setIsDescending(true)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteNotification.mutateAsync(id)
        } catch (error) {
            logger.error("Không thể xóa thông báo:", error)
        }
    }

    const getStatusBadge = (notification: NotificationDto) => {
        if (type === "user") {
            return notification.isRead ? <Badge variant="secondary">Đã đọc</Badge> : <Badge variant="default">Chưa đọc</Badge>
        }

        const now = new Date()
        const expiryDate = notification.expiresAt ? new Date(notification.expiresAt) : null

        if (expiryDate && expiryDate < now) {
            return <Badge variant="destructive">Hết hạn</Badge>
        }
        return <Badge variant="default">Hoạt động</Badge>
    }

    const getCategoryBadge = (category: ENotificationCategory) => {
        const categoryLabels = {
            [ENotificationCategory.System]: "Hệ thống",
            [ENotificationCategory.Promotion]: "Khuyến mãi",
            [ENotificationCategory.Order]: "Đơn hàng",
            [ENotificationCategory.Account]: "Tài khoản",
        }

        const categoryColors: Record<ENotificationCategory, string> = {
            [ENotificationCategory.Promotion]: "bg-green-100 text-green-800",
            [ENotificationCategory.System]: "bg-blue-100 text-blue-800",
            [ENotificationCategory.Order]: "bg-purple-100 text-purple-800",
            [ENotificationCategory.Account]: "bg-orange-100 text-orange-800",
        }

        return <Badge className={categoryColors[category]}>{categoryLabels[category]}</Badge>
    }

    const getTypeBadge = (type: ENotificationType) => {
        const typeLabels = {
            [ENotificationType.Info]: "Thông tin",
            [ENotificationType.Warning]: "Cảnh báo",
            [ENotificationType.Error]: "Lỗi",
            [ENotificationType.Success]: "Thành công",
        }

        const typeColors: Record<ENotificationType, string> = {
            [ENotificationType.Info]: "bg-blue-100 text-blue-800",
            [ENotificationType.Warning]: "bg-yellow-100 text-yellow-800",
            [ENotificationType.Error]: "bg-red-100 text-red-800",
            [ENotificationType.Success]: "bg-green-100 text-green-800",
        }

        return <Badge className={typeColors[type]}>{typeLabels[type]}</Badge>
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="h-10 bg-muted animate-pulse rounded flex-1" />
                    <div className="h-10 bg-muted animate-pulse rounded w-32" />
                    <div className="h-10 bg-muted animate-pulse rounded w-32" />
                </div>
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">Không thể tải thông báo. Vui lòng thử lại.</div>
                </CardContent>
            </Card>
        )
    }

    const notifications = data?.data?.items || []

    return (
        <div className="space-y-4">
            {/* Bộ lọc */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Tìm kiếm thông báo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {type === "user" ? (
                            <>
                                <SelectItem value="read">Đã đọc</SelectItem>
                                <SelectItem value="unread">Chưa đọc</SelectItem>
                            </>
                        ) : (
                            <>
                                <SelectItem value="active">Hoạt động</SelectItem>
                                <SelectItem value="expired">Hết hạn</SelectItem>
                            </>
                        )}
                    </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                        <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả danh mục</SelectItem>
                        <SelectItem value={ENotificationCategory.Promotion}>Khuyến mãi</SelectItem>
                        <SelectItem value={ENotificationCategory.System}>Hệ thống</SelectItem>
                        <SelectItem value={ENotificationCategory.Order}>Đơn hàng</SelectItem>
                        <SelectItem value={ENotificationCategory.Account}>Tài khoản</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Bảng */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Button variant="ghost" onClick={() => handleSort("title")} className="h-auto p-0 font-semibold">
                                    Tiêu đề
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>Danh mục</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>
                                <Button variant="ghost" onClick={() => handleSort("createdAt")} className="h-auto p-0 font-semibold">
                                    Ngày tạo
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>Hết hạn</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {notifications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="text-muted-foreground">Không tìm thấy thông báo nào.</div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            notifications.map((notification: NotificationDto) => (
                                <TableRow key={notification.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{notification.title}</div>
                                            <div className="text-sm text-muted-foreground line-clamp-2">{notification.content}</div>
                                            {notification.actionUrl && (
                                                <div className="flex items-center mt-1 text-xs text-blue-600">
                                                    <ExternalLink className="mr-1 h-3 w-3" />
                                                    Có liên kết
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getCategoryBadge(notification.category)}</TableCell>
                                    <TableCell>{getTypeBadge(notification.type)}</TableCell>
                                    <TableCell>{getStatusBadge(notification)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            {format(new Date(notification.createdAt), "dd/MM/yyyy", { locale: vi })}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {notification.expiresAt ? (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Calendar className="mr-1 h-3 w-3" />
                                                {format(new Date(notification.expiresAt), "dd/MM/yyyy", { locale: vi })}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">Không hết hạn</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" title="Xem chi tiết">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        title="Xóa thông báo"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Xóa thông báo</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Bạn có chắc chắn muốn xóa thông báo này? Hành động này không thể hoàn tác.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(notification.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Xóa
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Phân trang */}
            {data && (data.data?.totalPages || 1) > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Hiển thị {(pageNumber - 1) * pageSize + 1} đến {Math.min(pageNumber * pageSize, data.data?.totalCount || 1)} trong tổng
                        số {data.data?.totalCount} thông báo
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                            disabled={!data.data?.hasPreviousPage}
                        >
                            Trước
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, data.data?.totalPages || 1) }, (_, i) => {
                                const page = i + 1
                                return (
                                    <Button
                                        key={page}
                                        variant={page === pageNumber ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setPageNumber(page)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {page}
                                    </Button>
                                )
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPageNumber(Math.min(data.data?.totalPages || 1, pageNumber + 1))}
                            disabled={!data.data?.hasNextPage}
                        >
                            Sau
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

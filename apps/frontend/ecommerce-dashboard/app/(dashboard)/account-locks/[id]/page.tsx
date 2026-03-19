"use client"

import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import {
    ArrowLeft,
    Calendar,
    Clock,
    FileText,
    Lock,
    LockOpen,
    Shield,
    User,
    AlertTriangle,
    CheckCircle
} from "lucide-react"
import { useccountLockById, useUnlockUser } from "@/hooks/use-account-lock"
import { ELockType } from "@/types/account-lock"
import { Skeleton } from "@/components/ui/skeleton"

export default function AccountLockDetailPage() {
    const params = useParams()
    const router = useRouter()
    const lockId = params.id as string

    const { mutate: unlockUser, isPending: isUnlocking } = useUnlockUser()

    const { data: accountLockResult, isLoading, error } = useccountLockById(lockId)
    const accountLock = accountLockResult?.data

    const handleUnlock = () => {
        if (!accountLock) return

        unlockUser({ userId: accountLock.userId }, {
            onSuccess: () => {
                router.refresh()
            }
        })
    }

    const getLockTypeBadge = (lockType: ELockType) => {
        switch (lockType) {
            case ELockType.Temporary:
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Tạm thời</Badge>
            case ELockType.Permanent:
                return <Badge variant="destructive">Vĩnh viễn</Badge>
            default:
                return <Badge variant="outline">Không xác định</Badge>
        }
    }

    const getStatusBadge = (isActive: boolean, expiresAt?: string | null) => {
        if (!isActive) {
            return <Badge variant="outline" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Đã mở khóa
            </Badge>
        }

        if (expiresAt && new Date(expiresAt) < new Date()) {
            return <Badge variant="outline" className="bg-gray-100 text-gray-800">
                <Clock className="h-3 w-3 mr-1" />
                Hết hạn
            </Badge>
        }

        return <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Đang khóa
        </Badge>
    }

    const formatRemainingTime = (remainingMinutes?: number | null) => {
        if (!remainingMinutes || remainingMinutes <= 0) return "Hết hạn"

        if (remainingMinutes < 60) {
            return `${remainingMinutes} phút`
        } else if (remainingMinutes < 1440) {
            const hours = Math.floor(remainingMinutes / 60)
            const minutes = remainingMinutes % 60
            return `${hours} giờ ${minutes > 0 ? `${minutes} phút` : ''}`
        } else {
            const days = Math.floor(remainingMinutes / 1440)
            const hours = Math.floor((remainingMinutes % 1440) / 60)
            return `${days} ngày ${hours > 0 ? `${hours} giờ` : ''}`
        }
    }

    if (isLoading) {
        return (
            <DashboardShell>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                        <Skeleton className="h-8 w-64" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DashboardShell>
        )
    }

    if (error || !accountLock) {
        return (
            <DashboardShell>
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center">
                        <h2 className="text-lg font-semibold">Không tìm thấy thông tin khóa tài khoản</h2>
                        <p className="text-muted-foreground">
                            Thông tin khóa tài khoản không tồn tại hoặc đã bị xóa.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                </div>
            </DashboardShell>
        )
    }

    return (
        <DashboardShell>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Chi tiết khóa tài khoản</h1>
                            <p className="text-muted-foreground">
                                Thông tin chi tiết về việc khóa tài khoản người dùng
                            </p>
                        </div>
                    </div>

                    {accountLock.isActive && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                                    <LockOpen className="h-4 w-4 mr-2" />
                                    Mở khóa tài khoản
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận mở khóa tài khoản</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Bạn có chắc chắn muốn mở khóa tài khoản của <strong>{accountLock.userName}</strong>?
                                        <br />
                                        Hành động này sẽ cho phép người dùng truy cập lại vào hệ thống.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleUnlock}
                                        disabled={isUnlocking}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {isUnlocking ? "Đang xử lý..." : "Xác nhận mở khóa"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>

                {/* User Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Thông tin người dùng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="text-lg bg-red-100 text-red-600">
                                    {accountLock.userName?.charAt(0)?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="text-xl font-semibold">{accountLock.userName}</h3>
                                <p className="text-muted-foreground">{accountLock.userEmail}</p>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(accountLock.isActive, accountLock.expiresAt)}
                                    {getLockTypeBadge(accountLock.lockType)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Lock Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Thông tin khóa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Loại khóa</p>
                                    <div className="mt-1">
                                        {getLockTypeBadge(accountLock.lockType)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                                    <div className="mt-1">
                                        {getStatusBadge(accountLock.isActive, accountLock.expiresAt)}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Lý do khóa</p>
                                <p className="text-sm bg-muted p-3 rounded-md">{accountLock.reason}</p>
                            </div>

                            {accountLock.notes && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Ghi chú nội bộ</p>
                                    <p className="text-sm bg-muted p-3 rounded-md">{accountLock.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Thời gian
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Thời gian khóa</p>
                                <p className="text-sm font-medium">
                                    {format(new Date(accountLock.lockedAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                                </p>
                            </div>

                            {accountLock.expiresAt && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Thời gian hết hạn</p>
                                    <p className="text-sm font-medium">
                                        {format(new Date(accountLock.expiresAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                                    </p>
                                </div>
                            )}

                            {accountLock.unlockedAt && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Thời gian mở khóa</p>
                                    <p className="text-sm font-medium">
                                        {format(new Date(accountLock.unlockedAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                                    </p>
                                </div>
                            )}

                            {accountLock.lockType === ELockType.Temporary && accountLock.isActive && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Thời gian còn lại</p>
                                    <p className="text-sm font-medium text-orange-600">
                                        {formatRemainingTime(accountLock.remainingMinutes)}
                                    </p>
                                </div>
                            )}

                            <Separator />

                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Người thực hiện</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            <span className="font-medium">Khóa bởi:</span> {accountLock.lockedByUserName}
                                        </span>
                                    </div>
                                    {accountLock.unlockedByUserName && (
                                        <div className="flex items-center gap-2">
                                            <LockOpen className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                <span className="font-medium">Mở khóa bởi:</span> {accountLock.unlockedByUserName}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thao tác nhanh</CardTitle>
                        <CardDescription>
                            Các hành động liên quan đến tài khoản này
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/users/${accountLock.userId}`)}
                            >
                                <User className="h-4 w-4 mr-2" />
                                Xem hồ sơ người dùng
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/users/${accountLock.userId}/locks-history`)}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Lịch sử khóa tài khoản
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/account-locks`)}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Danh sách tài khoản bị khóa
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardShell>
    )
}
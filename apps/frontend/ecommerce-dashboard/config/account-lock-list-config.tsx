"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpDown, Eye, Lock, LockOpen, MoreHorizontal, Shield, User } from "lucide-react"
import type { ListConfig } from "@/types/list-config"
import { AccountLock, ELockType } from "@/types/account-lock"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useUnlockUser } from "@/hooks/use-account-lock"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow, format } from "date-fns"
import { vi } from "date-fns/locale"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useState } from "react"

const AccountLockActions = ({ accountLock }: { accountLock: AccountLock }) => {
    const router = useRouter()
    const { mutate: unlockUser, isPending } = useUnlockUser()
    const [showUnlockDialog, setShowUnlockDialog] = useState(false)

    const handleUnlock = () => {
        unlockUser({ userId: accountLock.userId }, {
            onSuccess: () => {
                setShowUnlockDialog(false)
            }
        })
    }

    return (
        <>
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
                            router.push(`/users/${accountLock.userId}`)
                        }}
                    >
                        <User className="h-4 w-4 mr-2" />
                        Xem hồ sơ người dùng
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            router.push(`/account-locks/${accountLock.id}`)
                        }}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Chi tiết khóa tài khoản
                    </DropdownMenuItem>
                    {accountLock.isActive && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setShowUnlockDialog(true)}
                                className="text-green-600"
                            >
                                <LockOpen className="h-4 w-4 mr-2" />
                                Mở khóa tài khoản
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận mở khóa tài khoản</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn mở khóa tài khoản của <strong>{accountLock.userName}</strong> ({accountLock.userEmail})?
                            <br />
                            <br />
                            Hành động này sẽ cho phép người dùng truy cập lại vào hệ thống.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUnlock}
                            disabled={isPending}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isPending ? "Đang xử lý..." : "Mở khóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
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
        return <Badge variant="outline" className="bg-green-100 text-green-800">Đã mở khóa</Badge>
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Hết hạn</Badge>
    }

    return <Badge variant="destructive">Đang khóa</Badge>
}

const formatRemainingTime = (remainingMinutes?: number | null) => {
    if (!remainingMinutes || remainingMinutes <= 0) return "Hết hạn"

    if (remainingMinutes < 60) {
        return `${remainingMinutes} phút`
    } else if (remainingMinutes < 1440) {
        const hours = Math.floor(remainingMinutes / 60)
        const minutes = remainingMinutes % 60
        return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    } else {
        const days = Math.floor(remainingMinutes / 1440)
        const hours = Math.floor((remainingMinutes % 1440) / 60)
        return `${days} ngày ${hours > 0 ? `${hours}h` : ''}`
    }
}

export const accountLockListConfig: ListConfig<AccountLock> = {
    id: "account-locks",
    title: "Danh sách tài khoản bị khóa",
    hideButtonAdd: true, // Hiển thị nút thêm mới
    addUrl: "/users",
    endpoint: "account-locks/paged",
    itemsName: "tài khoản bị khóa",
    itemName: "tài khoản bị khóa",
    columns: [
        {
            id: "user",
            accessorKey: "userName",
            header: "Người dùng",
            cell: ({ row }) => {
                const userName = row.original.userName
                const userEmail = row.original.userEmail
                const initials = userName?.charAt(0)?.toUpperCase() || "U"

                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-red-100 text-red-600">
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
            id: "lockType",
            accessorKey: "lockType",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const isCurrentlyDescending = column.getIsSorted() === "desc"
                            column.toggleSorting(!isCurrentlyDescending)
                        }}
                    >
                        Loại khóa
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => getLockTypeBadge(row.original.lockType),
        },
        {
            id: "status",
            accessorKey: "isActive",
            header: "Trạng thái",
            cell: ({ row }) => getStatusBadge(row.original.isActive, row.original.expiresAt),
        },
        {
            id: "reason",
            accessorKey: "reason",
            header: "Lý do",
            cell: ({ row }) => (
                <div className="max-w-[200px] line-clamp-2 text-sm" title={row.getValue("reason")}>
                    {row.getValue("reason")}
                </div>
            ),
        },
        {
            id: "remainingTime",
            header: "Thời gian còn lại",
            cell: ({ row }) => {
                const accountLock = row.original
                if (accountLock.lockType === ELockType.Permanent) {
                    return <span className="text-sm text-muted-foreground">Vĩnh viễn</span>
                }
                if (!accountLock.isActive) {
                    return <span className="text-sm text-muted-foreground">-</span>
                }
                return (
                    <span className="text-sm font-medium">
                        {formatRemainingTime(accountLock.remainingMinutes)}
                    </span>
                )
            },
        },
        {
            id: "lockedAt",
            accessorKey: "lockedAt",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const isCurrentlyDescending = column.getIsSorted() === "desc"
                            column.toggleSorting(!isCurrentlyDescending)
                        }}
                    >
                        Thời gian khóa
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const date = new Date(row.getValue("lockedAt"))
                return (
                    <div className="text-sm">
                        <div>{format(date, "dd/MM/yyyy HH:mm", { locale: vi })}</div>
                        <div className="text-muted-foreground">
                            {formatDistanceToNow(date, { addSuffix: true, locale: vi })}
                        </div>
                    </div>
                )
            },
        },
        {
            id: "lockedBy",
            accessorKey: "lockedByUserName",
            header: "Người khóa",
            cell: ({ row }) => {
                const lockedBy = row.original.lockedByUserName || "Không xác định"
                return (
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{lockedBy}</span>
                    </div>
                )
            }
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const accountLock = row.original
                return <AccountLockActions accountLock={accountLock} />
            },
        }
    ],
    filterFields: [
        {
            id: "searchTerm",
            label: "Tìm kiếm",
            type: "text",
            placeholder: "Tên người dùng, email, lý do...",
            defaultValue: "",
            apiParam: "searchTerm",
        },
        {
            id: "lockType",
            label: "Loại khóa",
            type: "select",
            options: [
                { value: "", label: "Tất cả" },
                { value: ELockType.Temporary.toString(), label: "Tạm thời" },
                { value: ELockType.Permanent.toString(), label: "Vĩnh viễn" },
            ],
            defaultValue: "",
            apiParam: "lockType",
        },
        {
            id: "isActive",
            label: "Trạng thái",
            type: "select",
            options: [
                { value: "", label: "Tất cả" },
                { value: "true", label: "Đang khóa" },
                { value: "false", label: "Đã mở khóa" },
            ],
            defaultValue: "",
            apiParam: "isActive",
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
        { id: "lockedAt", label: "Thời gian khóa", apiParam: "sortBy" },
        { id: "userName", label: "Tên người dùng", apiParam: "sortBy" },
        { id: "lockType", label: "Loại khóa", apiParam: "sortBy" },
    ],
    defaultSort: {
        sortBy: "lockedAt",
        isDescending: true,
    },
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    showRowNumbers: true,
    rowNumberColumnTitle: "STT",
}
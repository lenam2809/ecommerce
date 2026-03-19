"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Edit, Eye, MoreHorizontal, Trash, Lock, LockKeyhole, Activity } from "lucide-react"
import type { ListConfig } from "@/types/list-config"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { CustomerLevel, User, UserRole, UserStatus } from "@/types/user"
import { useDeleteUser } from "@/hooks/use-users"
import { LockUserDialog } from "@/components/users/lock-user-dialog"
import { useState } from "react"
import { UserActivityDialog } from "@/components/users/user-activity-dialog"

const UserActions = ({ user }: { user: User }) => {
    const router = useRouter()
    const { mutate: deleteUser, isPending } = useDeleteUser();
    const [lockDialogOpen, setLockDialogOpen] = useState(false)
    const [activityDialogOpen, setActivityDialogOpen] = useState(false)


    return (
        <>
            <DropdownMenu modal={false}>
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
                            router.push(`/users/${user.id}`) // Chuyển đến trang chi tiết
                        }}
                    >
                        <Eye className="h-4 w-4 mr-2" />Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setActivityDialogOpen(true)}
                    >
                        <Activity className="h-4 w-4 mr-2" />Xem hoạt động
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => {
                            router.push(`/users/${user.id}/edit`) // Chuyển đến trang chỉnh sửa
                        }}
                    >
                        <Edit className="h-4 w-4 mr-2" />Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            router.push(`/users/${user.id}/permissions`) // Chuyển đến trang chỉnh sửa
                        }}
                    >
                        <Edit className="h-4 w-4 mr-2" />Phân quyền
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setLockDialogOpen(true)}
                    >
                        <Lock className="h-4 w-4 mr-2" />Khóa tài khoản
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                            router.push(`/users/${user.id}/reset-password`) // Chuyển đến trang đổi mật khẩu
                        }}
                    >
                        <LockKeyhole className="h-4 w-4 mr-2" />Đổi mật khẩu
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => {
                            deleteUser(user.id)
                        }}
                    >
                        <Trash className="h-4 w-4 mr-2" />Xóa
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Lock User Dialog */}
            <LockUserDialog
                user={user}
                open={lockDialogOpen}
                onOpenChange={setLockDialogOpen}
                onSuccess={() => {
                    // Optional: Add any success handling here
                    // For example, you might want to refresh the user list
                }}
            />

            {/* User Activity Dialog */}
            {activityDialogOpen && (
                <UserActivityDialog
                    user={user}
                    open={activityDialogOpen}
                    onOpenChange={setActivityDialogOpen}
                />
            )}
        </>
    )
}

// Helper function to get status badge variant
const getStatusBadgeVariant = (status: UserStatus): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
        case UserStatus.Active:
            return "default"      // dùng "default" thay vì "success"
        case UserStatus.Inactive:
            return "secondary"
        case UserStatus.Suspended:
            return "outline"      // thay vì "warning"
        case UserStatus.Deleted:
            return "destructive"
        default:
            return "outline"
    }
}


// Helper function to get customer level badge variant
const getCustomerLevelBadgeVariant = (level: CustomerLevel): "default" | "destructive" | "outline" | "secondary" => {
    switch (level) {
        case CustomerLevel.Bronze:
            return "outline"
        case CustomerLevel.Silver:
            return "secondary"
        case CustomerLevel.Gold:
            return "default"
        case CustomerLevel.Diamond:
            return "destructive"
        default:
            return "outline"
    }
}

export const userListConfig: ListConfig<User> = {
    id: "users",
    title: "Danh sách người dùng",
    addUrl: "/users/new",
    endpoint: "users/paged",
    itemsName: "người dùng",
    itemName: "người dùng",
    columns: [
        {
            id: "avatar",
            accessorKey: "avatar",
            header: "Ảnh đại diện",
            enableHiding: false, // Không cho phép ẩn cột ảnh đại diện
            cell: ({ row }) => {
                const fullName = `${row.original.firstName} ${row.original.lastName}`;
                const initials = `${row.original.firstName.charAt(0)}${row.original.lastName.charAt(0)}`;

                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            {row.getValue("avatar") ? (
                                <AvatarImage src={row.getValue("avatar")} alt={fullName} />
                            ) : (
                                <AvatarFallback>{initials}</AvatarFallback>
                            )}
                        </Avatar>
                    </div>
                )
            },
        },
        {
            id: "email",
            accessorKey: "email",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const isCurrentlyDescending = column.getIsSorted() === "desc"
                            column.toggleSorting(!isCurrentlyDescending)
                        }}
                    >
                        Email
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-medium">{row.getValue("email")}</div>
        },
        {
            id: "fullName",
            accessorKey: "fullName",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const isCurrentlyDescending = column.getIsSorted() === "desc"
                            column.toggleSorting(!isCurrentlyDescending)
                        }}
                    >
                        Họ tên
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const firstName = row.original.firstName;
                const lastName = row.original.lastName;
                return <div className="font-medium">{lastName} {firstName}</div>
            },
        },
        {
            id: "phoneNumber",
            accessorKey: "phoneNumber",
            header: "Số điện thoại",
            cell: ({ row }) => <div>{row.getValue("phoneNumber") || "N/A"}</div>,
        },
        {
            id: "roles",
            accessorKey: "roles",
            header: "Vai trò",
            cell: ({ row }) => {
                const roles = row.getValue("roles") as string[];

                if (!roles || roles.length === 0) {
                    return <span className="text-muted-foreground">Không có vai trò</span>;
                }

                return <Badge variant="outline">{roles.join(", ")}</Badge>;
            },
        },
        {
            id: "customerLevel",
            accessorKey: "customerLevel",
            header: "Cấp độ",
            cell: ({ row }) => {
                const level = row.getValue("customerLevel") as CustomerLevel;
                return <Badge variant={getCustomerLevelBadgeVariant(level)}>{level}</Badge>
            },
        },
        {
            id: "promotionPoints",
            accessorKey: "promotionPoints",
            header: "Điểm thưởng",
            cell: ({ row }) => {
                const points = parseInt(row.getValue("promotionPoints"));
                return <div className="font-medium">{points}</div>
            },
        },
        {
            id: "status",
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status = row.getValue("status") as UserStatus;
                const statusText = {
                    [UserStatus.Active]: "Hoạt động",
                    [UserStatus.Inactive]: "Không hoạt động",
                    [UserStatus.Suspended]: "Khoá",
                    [UserStatus.Deleted]: "Xoá",
                }[status];
                return <Badge variant={getStatusBadgeVariant(status)}>{statusText}</Badge>
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const user = row.original;
                return <UserActions user={user} />
            },
        }
    ],
    defaultHiddenColumns: ["customerLevel", "promotionPoints"], // Default hidden columns
    filterFields: [
        {
            id: "searchTerm",
            label: "Tìm kiếm",
            type: "text",
            placeholder: "Nhập email, tên hoặc số điện thoại...",
            defaultValue: "",
            apiParam: "searchTerm",
        },
        {
            id: "roleFilter",
            label: "Vai trò",
            type: "multiselect",
            options: [
                { value: UserRole.Admin, label: "Quản trị viên" },
                { value: UserRole.Staff, label: "Nhân viên" },
                { value: UserRole.Customer, label: "Khách hàng" },
            ],
            defaultValue: "",
            apiParam: "roleFilter",
            isAdvanced: true,
        },
        {
            id: "customerLevel",
            label: "Cấp độ khách hàng",
            type: "select",
            options: [
                { value: "", label: "Tất cả cấp độ" },
                { value: CustomerLevel.Bronze, label: "Đồng" },
                { value: CustomerLevel.Silver, label: "Bạc" },
                { value: CustomerLevel.Gold, label: "Vàng" },
                { value: CustomerLevel.Diamond, label: "Kim cương" },
            ],
            defaultValue: "",
            apiParam: "CustomerLevelFilter",
            isAdvanced: true,
            valueType: "number",
        },
        {
            id: "status",
            label: "Trạng thái",
            type: "select",
            options: [
                { value: "", label: "Tất cả trạng thái" },
                { value: UserStatus.Active, label: "Hoạt động" },
                { value: UserStatus.Inactive, label: "Không hoạt động" },
                { value: UserStatus.Suspended, label: "Khoá" },
                { value: UserStatus.Deleted, label: "Xoá" },
            ],
            defaultValue: "",
            apiParam: "StatusFilter",
            isAdvanced: true,
        }
    ],
    sortOptions: [
        { id: "email", label: "Email", apiParam: "sortBy" },
        { id: "firstName", label: "Tên", apiParam: "sortBy" },
        { id: "lastName", label: "Họ", apiParam: "sortBy" },
        { id: "customerLevel", label: "Cấp độ", apiParam: "sortBy" },
        { id: "promotionPoints", label: "Điểm thưởng", apiParam: "sortBy" },
    ],
    defaultSort: {
        sortBy: "email",
        isDescending: false,
    },
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    showRowNumbers: true,
    rowNumberColumnTitle: "#",
}
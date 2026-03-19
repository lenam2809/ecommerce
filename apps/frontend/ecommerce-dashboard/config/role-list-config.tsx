// configurations/role-list-config.tsx
"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpDown, Edit, Eye, MoreHorizontal, Trash } from "lucide-react"
import type { ListConfig } from "@/types/list-config"
import { Role } from "@/types/role"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useDeleteRole } from "@/hooks/use-roles"

const RoleActions = ({ role }: { role: Role }) => {
    const router = useRouter()
    const { mutate: deleteRole, isPending } = useDeleteRole();

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
                        router.push(`/roles/${role.id}`) // Chuyển đến trang chi tiết
                    }}
                >
                    <Eye className="h-4 w-4 mr-2" />Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => {
                        router.push(`/roles/${role.id}/edit`) // Chuyển đến trang chỉnh sửa
                    }}
                >
                    <Edit className="h-4 w-4 mr-2" />Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => {
                        router.push(`/roles/${role.id}/permissions`) // Chuyển đến trang chỉnh sửa
                    }}
                >
                    <Edit className="h-4 w-4 mr-2" />Phân quyền
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        deleteRole(role.id)
                    }}
                    disabled={isPending}
                >
                    <Trash className="h-4 w-4 mr-2" />Xóa
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const roleListConfig: ListConfig<Role> = {
    id: "roles",
    title: "Vai trò hệ thống",
    addUrl: "/roles/new",
    endpoint: "roles/paged",
    itemsName: "vai trò",
    itemName: "vai trò",
    columns: [
        {
            id: "name",
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const isCurrentlyDescending = column.getIsSorted() === "desc"
                            column.toggleSorting(!isCurrentlyDescending)
                        }}
                    >
                        Tên vai trò
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const role = row.original;
                return <RoleActions role={role} />
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
    ],
    sortOptions: [
        { id: "name", label: "Tên vai trò", apiParam: "sortBy" },
    ],
    defaultSort: {
        sortBy: "name",
        isDescending: false,
    },
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    showRowNumbers: true,
    rowNumberColumnTitle: "#",
}
"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpDown, Edit, Eye, MoreHorizontal, Trash } from "lucide-react"
import type { ListConfig } from "@/types/list-config"
import { Category } from "@/types/category"
import { useRouter } from "next/navigation"
import { useDeleteCategory } from "@/hooks/use-categories"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const CategoryActions = ({ category }: { category: Category }) => {
    const router = useRouter()
    const { mutate: deleteCategory, isPending } = useDeleteCategory();

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
                        router.push(`/categories/${category.id}`) // Chuyển đến trang chi tiết
                    }}
                >
                    <Eye className="h-4 w-4 mr-2" />Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => {
                        router.push(`/categories/${category.id}/edit`) // Chuyển đến trang chỉnh sửa
                    }}
                >
                    <Edit className="h-4 w-4 mr-2" />Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        deleteCategory(category.id)
                    }}
                >
                    <Trash className="h-4 w-4 mr-2" />Xóa
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const categoryListConfig: ListConfig<Category> = {
    id: "categories",
    title: "Danh mục",
    addUrl: "/categories/new",
    endpoint: "categories/paged",
    itemsName: "danh mục",
    itemName: "danh mục",
    columns: [
        {
            id: "image",
            accessorKey: "image",
            header: "Ảnh đại diện",
            cell: ({ row }) => {
                const fullName = row.original.name;
                const initials = row.original.name.charAt(0);

                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            {row.getValue("image") ? (
                                <AvatarImage src={row.getValue("image")} alt={fullName} />
                            ) : (
                                <AvatarFallback>{initials}</AvatarFallback>
                            )}
                        </Avatar>
                    </div>
                )
            },
        },
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
                        Mã danh mục
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-medium">{row.getValue("code")}</div>,
        },
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
                        Tên danh mục
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="font-medium flex items-center gap-2">
                    {row.getValue("name")}

                    <Badge variant="outline" title="số sản phẩm">{row.original.productCount}</Badge>

                </div>
            ),
        },
        {
            id: "description",
            accessorKey: "description",
            header: "Ghi chú",
            cell: ({ row }) => <div>{row.getValue("description")}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const category = row.original;
                return <CategoryActions category={category} />
            },
        }
    ],
    defaultHiddenColumns: ["description"],
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
        { id: "name", label: "Tên danh mục", apiParam: "sortBy" },
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

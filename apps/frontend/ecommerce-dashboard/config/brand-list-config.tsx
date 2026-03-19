"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpDown, Edit, Eye, MoreHorizontal, Trash } from "lucide-react"
import type { ListConfig } from "@/types/list-config"
import { Brand } from "@/types/brand"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useDeleteBrand } from "@/hooks/use-brands"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const BrandActions = ({ brand }: { brand: Brand }) => {
    const router = useRouter()
    const { mutate: deleteBrand, isPending } = useDeleteBrand();

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
                        router.push(`/brands/${brand.id}`) // Chuyển đến trang chi tiết
                    }}
                >
                    <Eye className="h-4 w-4 mr-2" />Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => {
                        router.push(`/brands/${brand.id}/edit`) // Chuyển đến trang chỉnh sửa
                    }}
                >
                    <Edit className="h-4 w-4 mr-2" />Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        deleteBrand(brand.id)
                    }}
                >
                    <Trash className="h-4 w-4 mr-2" />Xóa
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const brandListConfig: ListConfig<Brand> = {
    id: "brands",
    title: "Thương hiệu",
    addUrl: "/brands/new",
    endpoint: "brands/paged",
    itemsName: "thương hiệu",
    itemName: "thương hiệu",
    columns: [
        {
            id: "logoUrl",
            accessorKey: "logoUrl",
            header: "Logo",
            cell: ({ row }) => {
                const name = row.original.name;
                const initials = row.original.name.charAt(0);

                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            {row.getValue("logoUrl") ? (
                                <AvatarImage src={row.getValue("logoUrl")} alt={name} />
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
                        Mã thương hiệu
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
                        Tên thương hiệu
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="font-medium flex items-center gap-2">
                    {row.getValue("name")}
                    <Badge variant="outline" title="số danh mục" >{row.original.categoryCount}</Badge>
                    <Badge variant="outline" title="số sản phẩm">{row.original.productCount}</Badge>

                </div>
            ),
        },
        {
            id: "description",
            accessorKey: "description",
            header: "Ghi chú",
            cell: ({ row }) =>
                <div className="max-w-[300px] line-clamp-2 text-sm text-muted-foreground" title={row.getValue("description")}>
                    {row.getValue("description")}
                </div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const brand = row.original;
                return <BrandActions brand={brand} />
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
        { id: "name", label: "Tên thương hiệu", apiParam: "sortBy" },
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

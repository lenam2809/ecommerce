"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Product } from "@/types/product"
import { DataTable } from "@/components/table/data-table"
import { FormSection } from "@/components/ui/form-section"
import { formatVND } from "@/lib/utils/currency"
import { ArrowUpDown, Eye, MoreHorizontal, Trash } from "lucide-react"
import { useDeleteProduct } from "@/hooks/use-products"
import { useRouter } from "next/navigation"
import { useState } from "react"

const ProductsByCategoryActions = ({ product }: { product: Product }) => {
    const router = useRouter()
    const [openMenu, setOpenMenu] = useState(false); // Thêm state để kiểm soát DropdownMenu

    const { mutate: deleteProduct } = useDeleteProduct();
    return (
        <DropdownMenu open={openMenu} onOpenChange={setOpenMenu}>
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
                        router.push(`/products/${product.id}`);
                    }}
                >
                    <Eye className="h-4 w-4 mr-2" />Xem chi tiết
                </DropdownMenuItem>


                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        deleteProduct(product.id);
                    }}
                >
                    <Trash className="h-4 w-4 mr-2" />Xóa
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "code",
        header: "Mã sản phẩm",
        cell: ({ row }) => (
            <div className="font-medium">
                {row.getValue("code")}
            </div>
        ),
    },
    {
        accessorKey: "name",
        header: "Tên sản phẩm",
        cell: ({ row }) => {
            return (
                <div className="flex space-x-2">
                    <span className="max-w-[200px] truncate font-medium">
                        {row.getValue("name")}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "stockQuantity",
        header: ({ column }) => {
            return (
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Số lượng
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => {
            const quantity = parseFloat(row.getValue("stockQuantity"))

            return (
                <Badge variant={quantity > 0 ? "default" : "destructive"}>
                    {quantity}
                </Badge>
            )
        },
    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="text-right"
                >
                    Giá
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => {
            return <div className="text-right font-medium">{formatVND(row.getValue("price"))}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original;
            return <ProductsByCategoryActions product={product} />
        },
    },
]

interface ProductTableProps {
    data: Product[]
}

export function ProductTable({ data }: ProductTableProps) {
    return (
        <FormSection title="Danh sách sản phẩm">
            <DataTable
                data={data}
                columns={columns}
                enableRowSelection={false}
                enableDragAndDrop={false}
                enableSorting={true}
                views={[{ id: "products", label: "Danh sách sản phẩm" }]}
                defaultView="products"
                showToolbar={false}         // 👈 ẩn toolbar
                showViewSelector={false}    // 👈 ẩn selector
            />

        </FormSection>

    )
}
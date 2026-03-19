"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Edit, Eye, MessageSquare, MoreHorizontal, Trash } from "lucide-react"
import type { ListConfig } from "@/types/list-config"
import { formatVND } from "@/lib/utils/currency"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { Product } from "@/types/product"
import { useState } from "react"
import { ProductReviewsDialog } from "@/components/products/product-reviews"
import { useDeleteProduct } from "@/hooks/use-products"
import { Truncate } from "@/components/ui/truncate"

const ProductActions = ({ product }: { product: Product }) => {
  const router = useRouter()
  const [showReviewsDialog, setShowReviewsDialog] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)

  const handleOpenReviews = () => {
    setOpenMenu(false)
    setShowReviewsDialog(true)
  }

  const { mutate: deleteProduct } = useDeleteProduct()

  return (
    <>
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
              router.push(`/products/${product.id}`)
              setOpenMenu(false)
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenReviews}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Danh sách đánh giá
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push(`/products/${product.id}/edit`)
              setOpenMenu(false)
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              deleteProduct(product.id)
              setOpenMenu(false)
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showReviewsDialog && (
        <ProductReviewsDialog product={product} open={showReviewsDialog} onOpenChange={setShowReviewsDialog} />
      )}
    </>
  )
}

export const productListConfig: ListConfig<Product> = {
  id: "products",
  title: "Danh sách sản phẩm",
  addUrl: "/products/new",
  endpoint: "products/paged",
  itemsName: "sản phẩm",
  itemName: "sản phẩm",
  columns: [
    {
      id: "mainImage",
      accessorKey: "mainImage",
      header: "Hình ảnh",
      size: 60,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.getValue("mainImage")} alt={row.getValue("mainImage")} />
          </Avatar>
        </div>
      ),
    },
    {
      id: "code",
      accessorKey: "code",
      size: 120,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => {
            const isCurrentlyDescending = column.getIsSorted() === "desc"
            column.toggleSorting(!isCurrentlyDescending)
          }}
        >
          Mã sản phẩm
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("code")}</div>,
    },
    {
      id: "name",
      accessorKey: "name",
      size: 200,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => {
            const isCurrentlyDescending = column.getIsSorted() === "desc"
            column.toggleSorting(!isCurrentlyDescending)
          }}
        >
          Tên
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("name") as string
        return (
          <Truncate maxWidth="240px" title={value}>
            {value}
          </Truncate>
        )
      },
    },
    {
      id: "categoryName",
      accessorKey: "categoryName",
      header: "Danh mục",
      size: 100,
      cell: ({ row }) => <Badge variant="outline">{row.getValue("categoryName")}</Badge>,
    },
    {
      id: "brandName",
      accessorKey: "brandName",
      size: 100,
      header: "Thương hiệu",
      cell: ({ row }) => <Badge variant="outline">{row.getValue("brandName")}</Badge>,
    },
    {
      id: "price",
      accessorKey: "price",
      size: 120,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => {
            const isCurrentlyDescending = column.getIsSorted() === "desc"
            column.toggleSorting(!isCurrentlyDescending)
          }}
        >
          Giá
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{formatVND(row.getValue("price"))}</div>,
    },
    {
      id: "rating",
      accessorKey: "rating",
      size: 120,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => {
            const isCurrentlyDescending = column.getIsSorted() === "desc"
            column.toggleSorting(!isCurrentlyDescending)
          }}
        >
          Đánh giá
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const rating = Number.parseFloat(row.getValue("rating"))
        return <div className="text-center font-medium">{rating.toFixed(1)} ★</div>
      },
    },
    {
      id: "stockQuantity",
      accessorKey: "stockQuantity",
      header: "Số lượng",
      size: 120,
      cell: ({ row }) => {
        const stock = Number.parseInt(row.getValue("stockQuantity"))
        const sold = row.original.soldQuantity

        return (
          <div className={stock < 10 ? "font-medium text-destructive" : "font-medium"}>
            {stock}
            <span className="ml-1 hidden md:inline text-muted-foreground">({sold})</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      size: 50,
      cell: ({ row }) => {
        const product = row.original
        return <ProductActions product={product} />
      },
    },
  ],
  defaultHiddenColumns: ["categoryName", "brandName"],
  filterFields: [
    {
      id: "searchTerm",
      label: "Tên sản phẩm",
      type: "text",
      placeholder: "Nhập từ khóa ...",
      defaultValue: "",
      apiParam: "searchTerm",
    },
    {
      id: "categoryIds",
      label: "Danh mục",
      type: "select",
      isAdvanced: true,
      optionsEndpoint: "categories/options",
      optionsValueField: "value",
      optionsLabelField: "label",
      defaultValue: [],
      apiParam: "categoryIds",
    },
    {
      id: "brandIds",
      label: "Thương hiệu",
      type: "select",
      isAdvanced: true,
      optionsEndpoint: "brands/options",
      optionsValueField: "value",
      optionsLabelField: "label",
      defaultValue: [],
      apiParam: "brandIds",
    },
    {
      id: "price",
      label: "Giá",
      type: "range",
      min: 0,
      max: 1_000_000_000,
      step: 1000,
      defaultValue: [0, 1_000_000_000],
      apiParam: "price",
      isAdvanced: true,
    },
    {
      id: "rating",
      label: "Đánh giá",
      type: "select",
      options: [
        { value: "0", label: "Chọn đánh giá" },
        { value: "1", label: "1+ Sao" },
        { value: "2", label: "2+ Sao" },
        { value: "3", label: "3+ Sao" },
        { value: "4", label: "4+ Sao" },
        { value: "5", label: "5 Sao" },
      ],
      defaultValue: "0",
      isAdvanced: true,
      apiParam: "rating",
    },
  ],
  sortOptions: [
    { id: "name", label: "Name", apiParam: "sortBy" },
    { id: "price", label: "Price", apiParam: "sortBy" },
    { id: "rating", label: "Rating", apiParam: "sortBy" },
  ],
  defaultSort: {
    sortBy: "name",
    isDescending: false,
  },
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
  relatedEndpoints: {
    categories: "categories",
    brands: "brands",
  },
  showRowNumbers: true,
  rowNumberColumnTitle: "#",
}

"use client"

import { logger } from '@/lib/logger'
import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Eye, ShoppingCart, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCustomers } from "@/hooks/use-customers"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { User } from "@/types/user"
import { formatDateDDMMYYYY, formatVND } from "@/lib/utils/currency"
import { Skeleton } from "../ui/skeleton"
import { useRouter } from "next/navigation"
import { OrdersByUserDialog } from "@/components/orders/orders-by-user"
import { useState } from "react"

const CustomerActions = ({ customer }: { customer: User }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [showOrdersDialog, setShowOrdersDialog] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const handleOpenOrders = () => {
    setOpenMenu(false); // Đóng DropdownMenu
    setShowOrdersDialog(true); // Mở OrdersByUserDialog
  };

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
              router.push(`/users/${customer.id}`);
              setOpenMenu(false);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleOpenOrders}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Xem đơn hàng
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              toast({
                title: "Contact customer",
                description: `Sending email to ${customer.email}`,
              });
              setOpenMenu(false);
            }}
          >
            <Mail className="h-4 w-4 mr-2" />
            Liên hệ khách hàng
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showOrdersDialog && (
        <OrdersByUserDialog
          user={customer}
          open={showOrdersDialog}
          onOpenChange={setShowOrdersDialog}
        />
      )}

    </>
  );
};

export function CustomersTable() {
  const { customers, isLoading, error } = useCustomers()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<User>[] = [
    {
      id: "fullName",
      accessorKey: "fullName",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Tên
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const customer = row.original
        const avatarUrl = customer.avatar || "/default-avatar.png" // Fallback avatar URL
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl} alt={row.getValue("fullName")} />
              {/* <AvatarFallback>{(row.getValue("fullName") as string).charAt(0)}</AvatarFallback> */}
            </Avatar>
            <div className="font-medium">{row.getValue("fullName")}</div>
          </div>
        )
      }
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "totalSpent",
      header: ({ column }) => {
        return (
          <Button variant="ghost" className="text-right" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Tổng tiền
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("totalSpent"))
        return <div className="text-right font-medium">{formatVND(amount)}</div>
      },
    },
    {
      accessorKey: "orderCount",
      header: ({ column }) => {
        return (
          <Button variant="ghost" className="text-right" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Số đơn hàng
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div className="text-right">{row.getValue("orderCount")}</div>
      },
    },
    {
      accessorKey: "lastOrder",
      header: ({ column }) => {
        return (
          <Button variant="ghost" className="text-right" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Đơn hàng gần nhất
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{formatDateDDMMYYYY(row.getValue("lastOrder"))}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const customer = row.original
        return <CustomerActions customer={customer} />
      },
    },
  ]

  const table = useReactTable({
    data: customers || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (error) {
    return <div className="text-red-500">Lỗi tải danh sách khách hàng:: {error.message}</div>
  }

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-[150px] ml-auto" />
        </div>
        <Skeleton className="h-[400px] w-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Tìm kiếm khác hàng"
          value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("fullName")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Hiển thị <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                logger.debug('column: ', column)
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Không tìm thấy khách hàng nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  )
}
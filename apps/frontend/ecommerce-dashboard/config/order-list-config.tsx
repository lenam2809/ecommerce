"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpDown,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Edit,
  Eye,
  MoreHorizontal,
  Package,
  RefreshCcw,
  RotateCcw,
  ShoppingBag,
  Trash,
  Truck,
  XCircle,
} from "lucide-react"
import type { ListConfig } from "@/types/list-config"
import { formatDateDDMMYYYY, formatVND } from "@/lib/utils/currency"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { EOrderStatus, getStatusBadgeVariant, getStatusColor, getStatusName, Order } from "@/types/order"
import { useUpdateOrderStatus } from "@/hooks/use-orders"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { IconCircleCheckFilled, IconLoader } from "@tabler/icons-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Calendar28 } from "@/components/ui/calendar28"
import { startOfDay } from "date-fns"
import { CopyTooltipText } from "@/components/ui/copy-tooltip-text"

const getStatusIcon = (status: EOrderStatus) => {
  switch (status) {
    case EOrderStatus.Pending:
      return <Clock className="h-4 w-4" />
    case EOrderStatus.Processing:
      return <Package className="h-4 w-4" />
    case EOrderStatus.Shipped:
      return <Truck className="h-4 w-4" />
    case EOrderStatus.Completed:
      return <CheckCircle className="h-4 w-4" />
    case EOrderStatus.Cancelled:
      return <XCircle className="h-4 w-4" />
    case EOrderStatus.Refunded:
      return <RefreshCcw className="h-4 w-4" />
    case EOrderStatus.Delivered:
      return <ShoppingBag className="h-4 w-4" />
    case EOrderStatus.ReturnRequested:
    case EOrderStatus.Returned:
      return <RotateCcw className="h-4 w-4" />
    default:
      return null
  }
}

export const OrderActions = ({ order }: { order: Order }) => {
  const router = useRouter()
  const { mutate: updateOrderStatus, isPending } = useUpdateOrderStatus()

  const [showDeliveryDateInput, setShowDeliveryDateInput] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<EOrderStatus | null>(null)
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date | null>(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow
  })

  const handleStatusUpdate = (status: EOrderStatus) => {
    if (status === order.status) return

    if (status === EOrderStatus.Processing || status === EOrderStatus.Shipped) {
      setSelectedStatus(status)
      setShowDeliveryDateInput(true)
    } else {
      updateOrderStatus({ id: order.id, status })
      toast({
        title: "Đang cập nhật trạng thái",
        description: `Đang chuyển sang: ${getStatusName(status)}`,
      })
    }
  }

  const handleConfirmDeliveryDate = () => {
    if (!selectedStatus || !expectedDeliveryDate) return

    updateOrderStatus(
      {
        id: order.id,
        status: selectedStatus,
        expectedDeliveryDate: expectedDeliveryDate,
      },
      {
        onSuccess: () => {
          setShowDeliveryDateInput(false)
          setExpectedDeliveryDate(null)
          setSelectedStatus(null)
        },
      },
    )

    toast({
      title: "Cập nhật thành công",
      description: `Đã chuyển sang trạng thái: ${getStatusName(selectedStatus)}`,
    })
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>
            <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Cập nhật đơn hàng
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={isPending}>
              <div className={cn("flex items-center", isPending && "opacity-50")}>
                <Package className="mr-2 h-4 w-4" />
                <span>Cập nhật trạng thái</span>
                {isPending && <Clock className="ml-2 h-3 w-3 animate-spin" />}
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-56" sideOffset={2} alignOffset={-5}>
                {Object.keys(EOrderStatus)
                  .filter((key) => !isNaN(Number(key)))
                  .map((key) => {
                    const status = Number(key) as EOrderStatus
                    return (
                      <DropdownMenuItem
                        key={key}
                        disabled={status === order.status}
                        onClick={() => handleStatusUpdate(status)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className={cn("mr-2", getStatusColor(status))}>{getStatusIcon(status)}</div>
                          {getStatusName(status)}
                        </div>
                        {status === order.status && (
                          <Badge variant="outline" className={cn("ml-2", getStatusColor(status))}>
                            Hiện tại
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    )
                  })}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(order.code)
              toast({
                title: "Đã sao chép mã đơn hàng",
                description: order.code,
              })
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Sao chép mã đơn hàng
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              // placeholder cho hành động xoá nếu backend hỗ trợ
              toast({
                title: "Chưa hỗ trợ xoá đơn hàng",
                description: "Tính năng xoá đơn hàng sẽ được hỗ trợ sau.",
                variant: "destructive",
              })
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Xoá đơn hàng
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeliveryDateInput} onOpenChange={setShowDeliveryDateInput}>
        <DialogContent>
          <DialogTitle>Chọn ngày dự kiến giao hàng</DialogTitle>
          <DialogDescription>
            Vui lòng chọn ngày dự kiến giao hàng cho đơn hàng này trước khi cập nhật trạng thái.
          </DialogDescription>
          <div className="py-4">
            <Calendar28
              selected={expectedDeliveryDate}
              onSelect={(date) => date && setExpectedDeliveryDate(date)}
              label="Ngày dự kiến giao"
              id="expected-delivery-date"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeliveryDateInput(false)
                setSelectedStatus(null)
              }}
            >
              Huỷ
            </Button>
            <Button onClick={handleConfirmDeliveryDate} disabled={!expectedDeliveryDate}>
              <Check className="mr-2 h-4 w-4" />
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const orderListConfig: ListConfig<Order> = {
  id: "orders",
  title: "Danh sách đơn hàng",
  addUrl: "/orders/new",
  endpoint: "orders/paged",
  itemsName: "đơn hàng",
  itemName: "đơn hàng",
  columns: [
    {
      id: "code",
      accessorKey: "code",
      enableHiding: false,
      header: "Mã đơn hàng",
      cell: ({ row }) => (
        <CopyTooltipText text={row.getValue("code")} className="text-left font-medium" />
      ),
    },
    {
      id: "customerName",
      meta: "Khách hàng",
      enableHiding: true,
      accessorKey: "customerName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => {
            const isCurrentlyDescending = column.getIsSorted() === "desc"
            column.toggleSorting(!isCurrentlyDescending)
          }}
        >
          Khách hàng
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("customerName")}</div>,
    },
    {
      id: "totalAmount",
      meta: "Tổng tiền",
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => {
            const isCurrentlyDescending = column.getIsSorted() === "desc"
            column.toggleSorting(!isCurrentlyDescending)
          }}
        >
          Tổng tiền
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{formatVND(row.getValue("totalAmount"))}</div>,
    },
    {
      id: "orderDate",
      meta: "Ngày đặt",
      enableHiding: false,
      accessorKey: "orderDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => {
            const isCurrentlyDescending = column.getIsSorted() === "desc"
            column.toggleSorting(!isCurrentlyDescending)
          }}
        >
          Ngày đặt
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("orderDate"))
        return <div>{date.toLocaleDateString("vi-VN")}</div>
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.getValue("status") as EOrderStatus
        const statusName = getStatusName(status)
        const variant = getStatusBadgeVariant(status)

        return (
          <Badge variant={variant} className="px-1.5 text-muted-foreground">
            {status === EOrderStatus.Completed ? (
              <IconCircleCheckFilled className="mr-1 h-4 w-4 fill-green-500 dark:fill-green-400" />
            ) : (
              <IconLoader className="mr-1 h-4 w-4" />
            )}
            {statusName}
          </Badge>
        )
      },
    },
    {
      id: "phone",
      accessorKey: "phone",
      header: "Số điện thoại",
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
    {
      id: "expectedDeliveryDate",
      accessorKey: "expectedDeliveryDate",
      header: "Dự kiến giao hàng",
      cell: ({ row }) => {
        const date = row.getValue("expectedDeliveryDate") as string | Date | number
        if (!date) return <div>-</div>
        return <div>{formatDateDDMMYYYY(date)}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original
        return <OrderActions order={order} />
      },
    },
  ],
  defaultHiddenColumns: ["expectedDeliveryDate"],
  filterFields: [
    {
      id: "searchTerm",
      label: "Tìm kiếm",
      type: "text",
      placeholder: "Tìm theo mã, khách hàng...",
      defaultValue: "",
      apiParam: "searchTerm",
    },
    {
      id: "status",
      label: "Trạng thái",
      type: "select",
      options: [
        { value: "", label: "Tất cả trạng thái" },
        { value: "Pending", label: "Chờ xử lý" },
        { value: "Processing", label: "Đang xử lý" },
        { value: "Shipped", label: "Đã giao vận chuyển" },
        { value: "Delivered", label: "Đã giao hàng" },
        { value: "Cancelled", label: "Đã huỷ" },
      ],
      defaultValue: "",
      apiParam: "status",
    },
    {
      id: "startDate",
      label: "Khoảng thời gian",
      type: "date",
      defaultValue: new Date(new Date().getFullYear(), 0, 1),
      apiParam: "startDate",
      isAdvanced: true,
    },
    {
      id: "endDate",
      label: "Khoảng thời gian",
      type: "date",
      defaultValue: startOfDay(new Date()),
      apiParam: "endDate",
      isAdvanced: true,
    },
    {
      id: "totalAmount",
      label: "Tổng tiền",
      type: "range",
      min: 0,
      max: 100000000,
      step: 1000,
      defaultValue: [0, 100000000],
      apiParam: "totalAmount",
      isAdvanced: true,
    },
  ],
  sortOptions: [
    { id: "orderDate", label: "Ngày đặt hàng", apiParam: "sortBy" },
    { id: "totalAmount", label: "Tổng tiền", apiParam: "sortBy" },
    { id: "status", label: "Trạng thái", apiParam: "sortBy" },
  ],
  defaultSort: {
    sortBy: "orderDate",
    isDescending: true,
  },
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
  showRowNumbers: true,
  rowNumberColumnTitle: "#",
}

"use client"

import { useParams } from "next/navigation"
import { useGetOrder } from "@/hooks/use-orders"
import { Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { OrderEditForm } from "@/components/orders/order-edit-form"

export default function EditOrderPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const { data, isLoading, error } = useGetOrder(orderId)
  const order = data?.data

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mt-2 text-sm text-muted-foreground">Đang tải dữ liệu đơn hàng...</span>
      </div>
    )
  }

  if (error || !order) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>
          Không thể tải thông tin đơn hàng. Vui lòng thử lại sau hoặc kiểm tra ID đơn hàng.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chỉnh sửa đơn hàng</CardTitle>
        <CardDescription>Cập nhật thông tin cho đơn hàng &quot;{order.code}&quot;.</CardDescription>
      </CardHeader>
      <CardContent>
        <OrderEditForm order={order} isDetail={false} />
      </CardContent>
    </Card>
  )
}

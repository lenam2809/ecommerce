"use client"

import { useParams } from "next/navigation"
import { useGetProduct } from "@/hooks/use-products"
import { ProductEditForm } from "@/components/products/product-edit-form"
import { Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DetailProductPage() {
  const params = useParams()
  const productId = params.productId as string
  const { data, isLoading, error } = useGetProduct(productId)
  const product = data?.data

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mt-2 text-sm text-muted-foreground">Đang tải dữ liệu sản phẩm...</span>
      </div>
    )
  }

  if (error || !product) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>
          Không thể tải thông tin sản phẩm. Vui lòng thử lại sau hoặc kiểm tra ID sản phẩm.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xem chi tiết sản phẩm</CardTitle>
        <CardDescription>Thông tin chi tiết của sản phẩm &quot;{product.name}&quot;.</CardDescription>
      </CardHeader>
      <CardContent>
        <ProductEditForm product={product} isDetail />
      </CardContent>
    </Card>
  )
}

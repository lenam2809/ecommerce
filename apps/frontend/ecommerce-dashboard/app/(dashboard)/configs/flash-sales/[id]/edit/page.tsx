"use client"

import { useParams } from "next/navigation"
import { useGetFlashSale, useUpdateFlashSale } from "@/hooks/use-flash-sales"
import { FlashSaleForm } from "@/components/flash-sales/flash-sale-form"
import { FlashSaleFormData } from "@/schemas/flash-sale/flash-sale-schema"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { IconBolt, IconAlertCircle } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"

export default function EditFlashSalePage() {
    const params = useParams()
    const id = params.id as string

    const { data: result, isLoading, error } = useGetFlashSale(id)
    const updateMutation = useUpdateFlashSale()
    const flashSale = result?.data

    const handleSubmit = async (formData: FlashSaleFormData) => {
        await updateMutation.mutateAsync({
            id,
            data: {
                id,
                code: formData.code || flashSale?.code || "",
                title: formData.title,
                subtitle: formData.subtitle || undefined,
                bannerImageUrl: formData.bannerImageUrl || undefined,
                startTime: formData.startTime,
                endTime: formData.endTime,
                isActive: formData.isActive,
                priority: formData.priority,
                items: formData.items.map((item) => ({
                    id: item.id,
                    productId: item.productId,
                    productVariantSkuId: item.productVariantSkuId || undefined,
                    flashSalePrice: item.flashSalePrice,
                    originalPrice: item.originalPrice,
                    totalQuota: item.totalQuota,
                    soldCount: item.soldCount,
                    maxPerCustomer: item.maxPerCustomer,
                    isHeroFeatured: item.isHeroFeatured,
                    badgeText: item.badgeText || undefined,
                    displayOrder: item.displayOrder,
                })),
            },
        })
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                <span className="text-sm text-muted-foreground">
                    Đang tải thông tin chiến dịch Flash Sale...
                </span>
            </div>
        )
    }

    if (error || !flashSale) {
        return (
            <Alert variant="destructive" className="max-w-2xl mx-auto my-8">
                <IconAlertCircle className="h-4 w-4" />
                <AlertTitle>Không tìm thấy chiến dịch</AlertTitle>
                <AlertDescription>
                    Chiến dịch Flash Sale không tồn tại hoặc đã bị xóa khỏi hệ thống.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <IconBolt className="h-7 w-7 text-brand" />
                    Chỉnh sửa Chiến dịch Flash Sale
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Cập nhật cấu hình khung giờ và danh mục sản phẩm khuyến mãi cho chiến dịch &quot;{flashSale.title}&quot;
                </p>
            </div>

            <FlashSaleForm
                initialData={flashSale}
                onSubmit={handleSubmit}
                isSubmitting={updateMutation.isPending}
            />
        </div>
    )
}

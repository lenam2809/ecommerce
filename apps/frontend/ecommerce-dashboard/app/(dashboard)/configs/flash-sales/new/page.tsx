"use client"

import { useCreateFlashSale } from "@/hooks/use-flash-sales"
import { FlashSaleForm } from "@/components/flash-sales/flash-sale-form"
import { FlashSaleFormData } from "@/schemas/flash-sale/flash-sale-schema"
import { IconBolt } from "@tabler/icons-react"

export default function NewFlashSalePage() {
    const createMutation = useCreateFlashSale()

    const handleSubmit = async (formData: FlashSaleFormData) => {
        await createMutation.mutateAsync({
            code: formData.code || undefined,
            title: formData.title,
            subtitle: formData.subtitle || undefined,
            bannerImageUrl: formData.bannerImageUrl || undefined,
            startTime: formData.startTime,
            endTime: formData.endTime,
            isActive: formData.isActive,
            priority: formData.priority,
            items: formData.items.map((item) => ({
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
        })
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <IconBolt className="h-7 w-7 text-brand" />
                    Tạo mới Chiến dịch Flash Sale
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Thiết lập khung giờ vàng và cấu hình các sản phẩm công nghệ giá sốc
                </p>
            </div>

            <FlashSaleForm
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending}
            />
        </div>
    )
}

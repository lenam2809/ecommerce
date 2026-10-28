"use client"

import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    flashSaleSchema,
    FlashSaleFormData,
} from "@/schemas/flash-sale/flash-sale-schema"
import { FlashSale } from "@/types/flash-sale"
import { Product } from "@/types/product"
import { FlashSaleProductPicker } from "./flash-sale-product-picker"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    IconBolt,
    IconDeviceLaptop,
    IconStar,
    IconTrash,
    IconDeviceFloppy,
    IconArrowLeft,
} from "@tabler/icons-react"

interface FlashSaleFormProps {
    initialData?: FlashSale
    onSubmit: (data: FlashSaleFormData) => Promise<void>
    isSubmitting?: boolean
}

const toDateTimeLocal = (iso?: string): string => {
    if (!iso) return ""
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ""
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function FlashSaleForm({
    initialData,
    onSubmit,
    isSubmitting = false,
}: FlashSaleFormProps) {
    const router = useRouter()

    const defaultValues: FlashSaleFormData = {
        id: initialData?.id,
        code: initialData?.code || "",
        title: initialData?.title || "",
        subtitle: initialData?.subtitle || "",
        bannerImageUrl: initialData?.bannerImageUrl || "",
        startTime: initialData?.startTime ? toDateTimeLocal(initialData.startTime) : "",
        endTime: initialData?.endTime ? toDateTimeLocal(initialData.endTime) : "",
        isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
        priority: initialData?.priority || 0,
        items: initialData?.items?.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            productImageUrl: item.productImageUrl,
            productVariantSkuId: item.productVariantSkuId || null,
            sku: item.sku || null,
            originalPrice: item.originalPrice,
            flashSalePrice: item.flashSalePrice,
            totalQuota: item.totalQuota,
            soldCount: item.soldCount || 0,
            maxPerCustomer: item.maxPerCustomer || 1,
            isHeroFeatured: item.isHeroFeatured || false,
            badgeText: item.badgeText || "",
            displayOrder: item.displayOrder || 0,
        })) || [],
    }

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FlashSaleFormData>({
        resolver: zodResolver(flashSaleSchema) as any,
        defaultValues,
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    })

    const itemsWatch = watch("items")
    const isActiveWatch = watch("isActive")

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

    const handleAddProduct = (product: Product) => {
        const imageUrl = typeof product.mainImage === "string" ? product.mainImage : undefined
        // Giá khuyến mãi mặc định giảm 15% so với giá niêm yết
        const defaultFlashPrice = Math.max(1, Math.round(product.price * 0.85))

        append({
            productId: product.id,
            productName: product.name,
            productImageUrl: imageUrl,
            productVariantSkuId: null,
            sku: product.sku || null,
            originalPrice: product.price,
            flashSalePrice: defaultFlashPrice,
            totalQuota: Math.max(10, Math.min(50, product.stockQuantity || 10)),
            soldCount: 0,
            maxPerCustomer: 1,
            isHeroFeatured: fields.length === 0, // Sản phẩm đầu tiên mặc định làm Hero
            badgeText: "HOT DEAL",
            displayOrder: fields.length + 1,
        })
    }

    const handleFormSubmit = async (data: FlashSaleFormData) => {
        // Chuyển đổi datetime-local sang ISO string
        const payload: FlashSaleFormData = {
            ...data,
            startTime: new Date(data.startTime).toISOString(),
            endTime: new Date(data.endTime).toISOString(),
        }
        await onSubmit(payload)
    }

    const selectedProductIds = itemsWatch?.map((i) => i.productId) || []

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Cấu hình cơ bản chiến dịch */}
            <Card className="border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <IconBolt className="h-5 w-5 text-brand" />
                        Thông tin Khung giờ Flash Sale
                    </CardTitle>
                    <CardDescription>
                        Cấu hình mã chiến dịch, tiêu đề hiển thị và khung giờ vàng giảm giá sốc
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="code">Mã chiến dịch (Code)</Label>
                            <Input
                                id="code"
                                placeholder="VD: FS-20261027-GOLD (Để trống tự sinh mã)"
                                className="font-mono text-sm uppercase"
                                {...register("code")}
                            />
                            {errors.code && (
                                <p className="text-xs text-destructive">{errors.code.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="title">Tiêu đề chiến dịch *</Label>
                            <Input
                                id="title"
                                placeholder="VD: Flash Sale Khung Giờ Vàng 12:00 - 14:00"
                                {...register("title")}
                            />
                            {errors.title && (
                                <p className="text-xs text-destructive">{errors.title.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="subtitle">Phụ đề / Khẩu hiệu (Subtitle)</Label>
                            <Input
                                id="subtitle"
                                placeholder="VD: Giảm tới 45% - Đổi mới 15 phút tại 45 Showroom"
                                {...register("subtitle")}
                            />
                            {errors.subtitle && (
                                <p className="text-xs text-destructive">{errors.subtitle.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="bannerImageUrl">Đường dẫn Banner (URL)</Label>
                            <Input
                                id="bannerImageUrl"
                                placeholder="https://example.com/flash-sale-banner.jpg"
                                {...register("bannerImageUrl")}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="startTime">Thời gian bắt đầu *</Label>
                            <Input
                                id="startTime"
                                type="datetime-local"
                                {...register("startTime")}
                            />
                            {errors.startTime && (
                                <p className="text-xs text-destructive">{errors.startTime.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="endTime">Thời gian kết thúc *</Label>
                            <Input
                                id="endTime"
                                type="datetime-local"
                                {...register("endTime")}
                            />
                            {errors.endTime && (
                                <p className="text-xs text-destructive">{errors.endTime.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                        <div className="space-y-1.5">
                            <Label htmlFor="priority">Mức độ ưu tiên hiển thị (Priority)</Label>
                            <Input
                                id="priority"
                                type="number"
                                placeholder="0"
                                className="font-mono"
                                {...register("priority")}
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Số càng cao càng ưu tiên hiển thị trên trang chủ và Banner
                            </p>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border bg-surface/30 self-end">
                            <div className="space-y-0.5">
                                <Label htmlFor="isActive" className="text-sm font-medium">
                                    Kích hoạt chiến dịch
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Bật để mở bán trong khung giờ quy định
                                </p>
                            </div>
                            <Switch
                                id="isActive"
                                checked={isActiveWatch}
                                onCheckedChange={(val) => setValue("isActive", val)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Danh sách sản phẩm tham gia Flash Sale */}
            <Card className="border-border shadow-sm">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <IconDeviceLaptop className="h-5 w-5 text-tech-blue" />
                                Danh mục Sản phẩm & Giá bán Flash Sale ({fields.length})
                            </CardTitle>
                            <CardDescription>
                                Thiết lập giá khuyến mãi, tự động tính % giảm và cấu hình Hero Featured Deal
                            </CardDescription>
                        </div>
                        <FlashSaleProductPicker
                            onSelectProduct={handleAddProduct}
                            selectedProductIds={selectedProductIds}
                        />
                    </div>
                    {errors.items && (
                        <p className="text-xs text-destructive font-medium pt-1">
                            {errors.items.message}
                        </p>
                    )}
                </CardHeader>
                <CardContent>
                    {fields.length === 0 ? (
                        <div className="py-16 text-center border border-dashed rounded-lg p-6 space-y-2">
                            <IconBolt className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-sm font-medium text-foreground">
                                Chưa có sản phẩm nào trong chiến dịch này
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Nhấn nút &quot;Thêm sản phẩm vào Flash Sale&quot; ở trên để chọn sản phẩm từ kho.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-lg border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-surface/50 text-xs">
                                        <TableHead className="w-[240px]">Sản phẩm & SKU</TableHead>
                                        <TableHead className="w-[130px]">Giá niêm yết</TableHead>
                                        <TableHead className="w-[180px]">Giá Flash Sale (VNĐ) *</TableHead>
                                        <TableHead className="w-[110px]">% Giảm</TableHead>
                                        <TableHead className="w-[110px]">Số lượng mở bán</TableHead>
                                        <TableHead className="w-[90px]">Max/Khách</TableHead>
                                        <TableHead className="w-[110px]">Tâm điểm Hero</TableHead>
                                        <TableHead className="w-[120px]">Badge Text</TableHead>
                                        <TableHead className="text-right w-[60px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => {
                                        const originalPrice = itemsWatch?.[index]?.originalPrice || 0
                                        const flashPrice = itemsWatch?.[index]?.flashSalePrice || 0
                                        const discountPercent =
                                            originalPrice > 0 && originalPrice > flashPrice
                                                ? Math.round(((originalPrice - flashPrice) / originalPrice) * 100)
                                                : 0

                                        const itemError = errors.items?.[index]

                                        return (
                                            <TableRow key={field.id} className="align-middle text-sm">
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                                                            {field.productImageUrl ? (
                                                                <img
                                                                    src={field.productImageUrl}
                                                                    alt={field.productName || "Product"}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <IconDeviceLaptop className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-xs text-foreground truncate max-w-[180px]">
                                                                {field.productName}
                                                            </p>
                                                            {field.sku && (
                                                                <span className="font-mono text-[10px] text-muted-foreground">
                                                                    {field.sku}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <span className="font-mono tabular-nums whitespace-nowrap price-tag text-xs text-muted-foreground line-through">
                                                        {formatCurrency(originalPrice)}
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <Input
                                                            type="number"
                                                            className="font-mono tabular-nums price-tag font-semibold text-brand text-xs h-8"
                                                            {...register(`items.${index}.flashSalePrice` as const)}
                                                        />
                                                        {itemError?.flashSalePrice && (
                                                            <p className="text-[10px] text-destructive leading-tight">
                                                                {itemError.flashSalePrice.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={`font-mono font-bold text-xs ${
                                                            discountPercent > 0
                                                                ? "bg-brand text-white border-brand"
                                                                : "bg-muted text-muted-foreground"
                                                        }`}
                                                    >
                                                        -{discountPercent}%
                                                    </Badge>
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        className="font-mono text-xs h-8"
                                                        {...register(`items.${index}.totalQuota` as const)}
                                                    />
                                                    {itemError?.totalQuota && (
                                                        <p className="text-[10px] text-destructive">
                                                            {itemError.totalQuota.message}
                                                        </p>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        className="font-mono text-xs h-8"
                                                        {...register(`items.${index}.maxPerCustomer` as const)}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <Switch
                                                            checked={itemsWatch?.[index]?.isHeroFeatured}
                                                            onCheckedChange={(checked) => {
                                                                setValue(`items.${index}.isHeroFeatured`, checked)
                                                            }}
                                                        />
                                                        {itemsWatch?.[index]?.isHeroFeatured && (
                                                            <IconStar className="h-4 w-4 text-brand fill-brand shrink-0" />
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        placeholder="VD: HOT DEAL"
                                                        className="text-xs h-8"
                                                        {...register(`items.${index}.badgeText` as const)}
                                                    />
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                        onClick={() => remove(index)}
                                                    >
                                                        <IconTrash className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Thanh Nút Thao tác Submit */}
            <div className="flex items-center justify-between pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/configs/flash-sales")}
                >
                    <IconArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
                </Button>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-brand hover:bg-brand/90 text-white font-medium"
                >
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Đang lưu chiến dịch..." : "Lưu chiến dịch Flash Sale"}
                </Button>
            </div>
        </form>
    )
}

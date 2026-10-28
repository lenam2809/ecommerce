import { z } from "zod";

export const flashSaleItemSchema = z.object({
    id: z.string().optional(),
    productId: z.string().min(1, "Vui lòng chọn sản phẩm"),
    productName: z.string().optional(),
    productImageUrl: z.string().optional().nullable(),
    productVariantSkuId: z.string().optional().nullable(),
    sku: z.string().optional().nullable(),
    originalPrice: z.coerce.number().min(0, "Giá gốc không được âm"),
    flashSalePrice: z.coerce.number().min(1, "Giá Flash Sale phải lớn hơn 0"),
    totalQuota: z.coerce.number().int().min(1, "Số lượng mở bán tối thiểu là 1"),
    soldCount: z.coerce.number().int().min(0).default(0),
    maxPerCustomer: z.coerce.number().int().min(1).default(1),
    isHeroFeatured: z.boolean().default(false),
    badgeText: z.string().max(50, "Badge không quá 50 ký tự").optional().nullable(),
    displayOrder: z.coerce.number().int().default(0),
}).refine(data => {
    if (data.originalPrice > 0 && data.flashSalePrice > data.originalPrice) {
        return false;
    }
    return true;
}, {
    message: "Giá Flash Sale không được cao hơn giá gốc của sản phẩm",
    path: ["flashSalePrice"],
});

export const flashSaleSchema = z.object({
    id: z.string().optional(),
    code: z.string().max(50, "Mã không được vượt quá 50 ký tự").optional(),
    title: z.string().min(1, "Tiêu đề chiến dịch là bắt buộc").max(200, "Tiêu đề tối đa 200 ký tự"),
    subtitle: z.string().max(200, "Phụ đề tối đa 200 ký tự").optional().nullable(),
    bannerImageUrl: z.string().optional().nullable(),
    startTime: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
    endTime: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
    isActive: z.boolean().default(true),
    priority: z.coerce.number().int().default(0),
    items: z.array(flashSaleItemSchema).min(1, "Chiến dịch Flash Sale cần ít nhất 1 sản phẩm"),
}).refine(data => {
    const start = new Date(data.startTime).getTime();
    const end = new Date(data.endTime).getTime();
    return end > start;
}, {
    message: "Thời gian kết thúc phải diễn ra sau thời gian bắt đầu",
    path: ["endTime"],
});

export type FlashSaleFormData = z.infer<typeof flashSaleSchema>;
export type FlashSaleItemFormData = z.infer<typeof flashSaleItemSchema>;

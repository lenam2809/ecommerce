import { z } from 'zod';

export const showroomFormSchema = z.object({
    id: z.string().optional(),
    code: z.string().min(1, 'Mã showroom không được để trống').max(50, 'Tối đa 50 ký tự'),
    name: z.string().min(1, 'Tên showroom không được để trống').max(200, 'Tối đa 200 ký tự'),
    region: z.string().min(1, 'Vui lòng chọn khu vực'),
    city: z.string().min(1, 'Tỉnh/Thành phố không được để trống'),
    province: z.string().optional(),
    district: z.string().min(1, 'Quận/Huyện không được để trống'),
    ward: z.string().optional(),
    address: z.string().min(1, 'Địa chỉ chi tiết không được để trống'),
    phone: z.string().min(1, 'Số hotline không được để trống').default('1800 6868'),
    openingHours: z.string().min(1, 'Giờ mở cửa không được để trống').default('08:00 - 21:30'),
    latitude: z.coerce.number().optional().nullable(),
    longitude: z.coerce.number().optional().nullable(),
    googleMapIframeUrl: z.string().optional().nullable(),
    isFlagship: z.boolean().default(false),
    hasInstantPickup: z.boolean().default(true),
    isActive: z.boolean().default(true),
    displayOrder: z.coerce.number().default(0),
});

export type ShowroomFormValues = z.infer<typeof showroomFormSchema>;

export const stockTransferFormSchema = z.object({
    fromShowroomId: z.string().min(1, 'Showroom xuất không được để trống'),
    toShowroomId: z.string().min(1, 'Vui lòng chọn showroom nhận'),
    productId: z.string().min(1, 'Vui lòng chọn sản phẩm'),
    productVariantSkuId: z.string().optional(),
    quantity: z.coerce.number().min(1, 'Số lượng điều chuyển tối thiểu là 1'),
    note: z.string().optional(),
}).refine(data => data.fromShowroomId !== data.toShowroomId, {
    message: 'Showroom nhận không được trùng với showroom xuất',
    path: ['toShowroomId'],
});

export type StockTransferFormValues = z.infer<typeof stockTransferFormSchema>;

export const updateInventoryFormSchema = z.object({
    quantity: z.coerce.number().min(0, 'Số lượng tồn không được âm'),
    reservedQuantity: z.coerce.number().min(0, 'Số lượng giữ chỗ không được âm'),
    isAvailableFor2hDelivery: z.boolean().default(true),
}).refine(data => data.quantity >= data.reservedQuantity, {
    message: 'Tồn kho không được nhỏ hơn số lượng giữ chỗ',
    path: ['quantity'],
});

export type UpdateInventoryFormValues = z.infer<typeof updateInventoryFormSchema>;

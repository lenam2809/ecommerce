import { z } from "zod";

// Schema validation cho form cập nhật sản phẩm
export const formUpdateSchema = z.object({
    id: z.string(),
    code: z.string()
        .min(1, { message: 'Mã sản phẩm không được để trống' })
        .max(20, { message: 'Mã sản phẩm không được vượt quá 20 ký tự' }),
    name: z.string()
        .min(1, { message: 'Tên sản phẩm không được để trống' })
        .max(255, { message: 'Tên sản phẩm không được vượt quá 255 ký tự' }),
    sku: z.string()
        .min(1, { message: 'SKU không được để trống' })
        .max(50, { message: 'SKU không được vượt quá 50 ký tự' }),
    price: z.coerce.number().min(0, { message: 'Giá sản phẩm không được âm' }),
    salePrice: z.coerce.number().min(0).optional(),
    rating: z.coerce.number().min(0).max(5).default(0).optional(),
    reviewCount: z.coerce.number().min(0).default(0).optional(),
    description: z.string().optional(),
    stockQuantity: z.coerce.number().min(0, { message: 'Số lượng trong kho không được âm' }),
    publishedDate: z.string().optional(),
    isActive: z.boolean().default(true).optional(),
    categoryId: z.string().min(1, { message: 'Danh mục sản phẩm không được để trống' }).optional(),
    brandId: z.string().min(1, { message: 'Thương hiệu sản phẩm không được để trống' }).optional(),
    mainImage: z.any()
        .refine(file =>
            // Nếu là File (upload mới) hoặc string (giữ nguyên URL cũ)
            file instanceof File || typeof file === 'string',
            { message: 'Hình ảnh chính là bắt buộc' }
        ).optional(),
    additionalImages: z.array(z.any()).optional(),
    specifications: z.array(z.object({
        id: z.string().optional(),
        name: z.string().min(1, { message: 'Tên thông số không được để trống' }),
        value: z.string().min(1, { message: 'Giá trị không được để trống' }),
        groupName: z.string().optional().default('Chung'),
        isKeySpec: z.boolean().optional().default(false),
        displayOrder: z.coerce.number().optional().default(0),
        filterKey: z.string().nullable().optional(),
        isHighlight: z.boolean().optional().default(false),
    })).optional(),
    warrantyMonths: z.coerce.number().min(0).optional().default(24),
    originBadge: z.string().optional(),
    addOnIds: z.array(z.string()).optional().default([]),
    colors: z.array(z.string()).optional(),
    sizes: z.array(z.string()).optional()
}).refine(data => {
    if (data.salePrice) {
        return data.salePrice <= data.price;
    }
    return true;
}, {
    message: 'Giá khuyến mãi phải nhỏ hơn hoặc bằng giá gốc',
    path: ['salePrice']
}).refine(data => {
    if (data.specifications) {
        const keySpecs = data.specifications.filter(s => s.isKeySpec);
        return keySpecs.length <= 2;
    }
    return true;
}, {
    message: 'Chỉ được chọn tối đa 2 thông số nổi bật (Key Specs)',
    path: ['specifications']
});

export type UpdateProductDto = z.infer<typeof formUpdateSchema>;
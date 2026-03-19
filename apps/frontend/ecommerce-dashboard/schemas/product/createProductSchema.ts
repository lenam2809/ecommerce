import { z } from "zod";

// Schema validation cho form
export const formCreateSchema = z.object({
    code: z.string()
        .min(1, { message: 'Mã sản phẩm không được để trống' })
        .max(20, { message: 'Mã sản phẩm không được vượt quá 20 ký tự' }),
    name: z.string()
        .min(1, { message: 'Tên sản phẩm không được để trống' })
        .max(255, { message: 'Tên sản phẩm không được vượt quá 255 ký tự' }),
    sku: z.string()
        .min(1, { message: 'SKU không được để trống' })
        .max(50, { message: 'SKU không được vượt quá 50 ký tự' }),
    price: z.number().min(0, { message: 'Giá sản phẩm không được âm' }),
    salePrice: z.number().optional(),
    rating: z.number().min(0).max(5).default(0).optional(),
    reviewCount: z.number().min(0).default(0).optional(),
    description: z.string().optional(),
    stockQuantity: z.number().min(0, { message: 'Số lượng trong kho không được âm' }),
    publishedDate: z.string().optional(),
    isActive: z.boolean().default(true).optional(),
    categoryId: z.string().min(1, { message: 'Danh mục sản phẩm không được để trống' }),
    brandId: z.string().min(1, { message: 'Thương hiệu sản phẩm không được để trống' }),
    mainImage: z.any()
        .refine(file => file instanceof File, { message: 'Hình ảnh chính là bắt buộc' }).optional(),
    additionalImages: z.array(z.any()).optional(),
    specifications: z.array(z.object({
        id: z.string().optional(),
        name: z.string().min(1, { message: 'Tên thông số không được để trống' }),
        value: z.string().min(1, { message: 'Giá trị không được để trống' })
    })).optional(),
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
});

export type CreateProductDto = z.infer<typeof formCreateSchema>;
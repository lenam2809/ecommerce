import { z } from "zod";

export const formUpdateCategorySchema = z.object({
    id: z.string(),

    code: z.string()
        .min(1, { message: 'Mã danh mục không được để trống' })
        .max(50, { message: 'Mã danh mục không được vượt quá 50 ký tự' }),

    name: z.string()
        .min(1, { message: 'Tên danh mục không được để trống' })
        .max(255, { message: 'Tên danh mục không được vượt quá 255 ký tự' }),

    description: z.string()
        .max(1000, { message: 'Mô tả không được vượt quá 1000 ký tự' })
        .nullable()
        .optional(),

    slug: z.string().nullable()
        .optional(),

    parentId: z.string()
        .nullable()
        .optional(),

    isActive: z.boolean().optional(),

    image: z.any()
        .refine(file =>
            // Nếu là File (upload mới) hoặc string (giữ nguyên URL cũ)
            file instanceof File || typeof file === 'string',
            { message: 'Hình ảnh chính là bắt buộc' }
        ).optional(),

    brandIds: z.array(z.string())
        .optional()
});

export type UpdateCategoryDto = z.infer<typeof formUpdateCategorySchema>;
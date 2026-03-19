import { z } from "zod";

export const formCreateCategorySchema = z.object({
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

    parentId: z.string()
        .uuid({ message: 'ID danh mục cha không hợp lệ' })
        .nullable()
        .optional(),

    isActive: z.boolean().default(true).optional(),



    image: z.any()
        .refine(file => file instanceof File, { message: 'Hình ảnh chính là bắt buộc' }).optional(),

    brandIds: z.array(z.string())
        .optional()
        .default([])
        .optional(),
});

export type CreateCategoryDto = z.infer<typeof formCreateCategorySchema>;

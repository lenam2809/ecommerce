import { z } from "zod";

export const formCreateBrandSchema = z.object({
    code: z.string()
        .min(1, { message: 'Mã thương hiệu không được để trống' })
        .max(20, { message: 'Mã thương hiệu không được vượt quá 20 ký tự' }),

    name: z.string()
        .min(1, { message: 'Tên thương hiệu không được để trống' })
        .max(100, { message: 'Tên thương hiệu không được vượt quá 100 ký tự' }),

    description: z.string()
        .max(500, { message: 'Mô tả không được vượt quá 500 ký tự' })
        .optional(),

    logo: z.any()
        .refine(file => file instanceof File, { message: 'Logo là bắt buộc' }).optional(),

    isActive: z.boolean()
        .default(true).optional(),

    categoryIds: z.array(z.string())
        .optional()
        .default([])
        .optional()
});

export type CreateBrandDto = z.infer<typeof formCreateBrandSchema>;
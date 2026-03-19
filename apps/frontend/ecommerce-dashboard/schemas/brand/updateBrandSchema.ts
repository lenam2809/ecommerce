import { z } from "zod";

export const formUpdateBrandSchema = z.object({
    id: z.string().uuid({ message: "ID thương hiệu không hợp lệ" }),
    code: z.string()
        .min(1, { message: 'Mã thương hiệu không được để trống' })
        .max(20, { message: 'Mã thương hiệu không được vượt quá 20 ký tự' }),

    name: z.string()
        .min(1, { message: 'Tên thương hiệu không được để trống' })
        .max(100, { message: 'Tên thương hiệu không được vượt quá 100 ký tự' }),

    description: z.string()
        .max(500, { message: 'Mô tả không được vượt quá 500 ký tự' })
        .optional(),
    slug: z.string().optional().nullable(),

    logo: z.any()
        .refine(file =>
            // Nếu là File (upload mới) hoặc string (giữ nguyên URL cũ)
            file instanceof File || typeof file === 'string',
            { message: 'Logo là bắt buộc' }
        ).optional(),
    isActive: z.boolean()
        .optional(),

    categoryIds: z.array(z.string())
        .optional()
});

export type UpdateBrandDto = z.infer<typeof formUpdateBrandSchema>;
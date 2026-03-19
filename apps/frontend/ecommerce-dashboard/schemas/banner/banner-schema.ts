import { z } from "zod";

export const formCreateBannerSchema = z.object({
    title: z.string()
        .min(1, { message: 'Tiêu đề không được để trống' })
        .max(100, { message: 'Tiêu đề không được vượt quá 100 ký tự' }),

    description: z.string()
        .max(500, { message: 'Mô tả không được vượt quá 500 ký tự' })
        .nullable()
        .optional(),

    image: z.any()
        .refine(file => file instanceof File, { message: 'Hình ảnh chính là bắt buộc' }).optional(),

    buttonText: z.string()
        .max(50, { message: 'Nội dung nút không được vượt quá 50 ký tự' })
        .nullable()
        .optional(),

    buttonLink: z.string()
        .max(255, { message: 'Đường dẫn nút không được vượt quá 255 ký tự' })
        .nullable()
        .optional(),

    isActive: z.boolean().default(true).optional()
});

export const formUpdateBannerSchema = z.object({
    id: z.string().uuid(),
    title: z.string()
        .min(1, { message: 'Tiêu đề không được để trống' })
        .max(100, { message: 'Tiêu đề không được vượt quá 100 ký tự' }),

    description: z.string()
        .max(500, { message: 'Mô tả không được vượt quá 500 ký tự' })
        .nullable()
        .optional(),

    image: z.any()
        .refine(file =>
            // Nếu là File (upload mới) hoặc string (giữ nguyên URL cũ)
            file instanceof File || typeof file === 'string',
            { message: 'Hình ảnh chính là bắt buộc' }
        ).optional(),

    buttonText: z.string()
        .max(50, { message: 'Nội dung nút không được vượt quá 50 ký tự' })
        .nullable()
        .optional(),

    buttonLink: z.string()
        .max(255, { message: 'Đường dẫn nút không được vượt quá 255 ký tự' })
        .nullable()
        .optional(),

    isActive: z.boolean().default(true).optional()
});

export type CreateBannerDto = z.infer<typeof formCreateBannerSchema>;
export type UpdateBannerDto = z.infer<typeof formUpdateBannerSchema>;
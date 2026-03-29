import { z } from "zod";

export const formCreateMarqueeSchema = z.object({
    content: z.string()
        .min(1, { message: 'Nội dung tin nhắn không được để trống' })
        .max(500, { message: 'Nội dung tin nhắn không được vượt quá 500 ký tự' }),

    linkUrl: z.string().max(255).nullable().optional(),
    icon: z.string().max(50).nullable().optional(),

    speed: z.coerce.number().int().min(1),

    priority: z.coerce.number()
        .int({ message: 'Thứ tự ưu tiên phải là số nguyên' })
        .min(0, { message: 'Thứ tự ưu tiên không được âm' }),

    isActive: z.boolean().default(true).optional(),

    startDate: z.date().nullable().optional(),
    endDate: z.date().nullable().optional(),
});

export const formUpdateMarqueeSchema = z.object({
    id: z.string().uuid({ message: 'ID không hợp lệ' }),

    content: z.string()
        .min(1, { message: 'Nội dung tin nhắn không được để trống' })
        .max(500, { message: 'Nội dung tin nhắn không được vượt quá 500 ký tự' }),

    linkUrl: z.string().max(255).nullable().optional(),
    icon: z.string().max(50).nullable().optional(),

    speed: z.coerce.number().int().min(1),

    priority: z.coerce.number()
        .int({ message: 'Thứ tự ưu tiên phải là số nguyên' })
        .min(0, { message: 'Thứ tự ưu tiên không được âm' }),

    isActive: z.boolean().default(true).optional(),

    startDate: z.date().nullable().optional(),
    endDate: z.date().nullable().optional(),
});

export type CreateMarqueeDto = z.infer<typeof formCreateMarqueeSchema>;
export type UpdateMarqueeDto = z.infer<typeof formUpdateMarqueeSchema>;

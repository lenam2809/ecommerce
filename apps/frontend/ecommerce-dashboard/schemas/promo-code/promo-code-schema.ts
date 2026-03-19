import { EPromoCodeType } from "@/types/promo-code";
import { z } from "zod";

// Schema cho form tạo mã khuyến mãi
const basePromoCodeSchema = z.object({
    code: z.string()
        .min(1, { message: 'Mã khuyến mãi không được để trống' })
        .max(50, { message: 'Mã khuyến mãi không được vượt quá 50 ký tự' }),

    description: z.string()
        .max(500, { message: 'Mô tả không được vượt quá 500 ký tự' })
        .nullable()
        .optional(),

    type: z.nativeEnum(EPromoCodeType).default(EPromoCodeType.PercentageDiscount).optional(),

    discountPercentage: z.number()
        .min(0, { message: 'Phần trăm giảm giá không được âm' })
        .max(100, { message: 'Phần trăm giảm giá không được vượt quá 100%' })
        .optional()
        .nullable(),

    discountAmount: z.number()
        .min(0, { message: 'Số tiền giảm giá không được âm' })
        .optional()
        .nullable(),

    freeShipping: z.boolean().default(false).optional(),

    validFrom: z.date({
        required_error: "Vui lòng chọn ngày bắt đầu",
    }),

    validTo: z.date({
        required_error: "Vui lòng chọn ngày kết thúc",
    }),

    usageLimit: z.number()
        .int({ message: 'Giới hạn sử dụng phải là số nguyên' })
        .min(0, { message: 'Giới hạn sử dụng không được âm' }),

    isActive: z.boolean().default(true).optional(),
});

export const formCreatePromoCodeSchema = basePromoCodeSchema.refine(data => {
    if (data.type === EPromoCodeType.PercentageDiscount) {
        return data.discountPercentage !== null && data.discountPercentage !== undefined;
    }
    return true;
}, {
    message: "Phần trăm giảm giá là bắt buộc khi chọn loại giảm giá theo phần trăm",
    path: ["discountPercentage"],
}).refine(data => {
    if (data.type === EPromoCodeType.FixedAmountDiscount) {
        return data.discountAmount !== null && data.discountAmount !== undefined;
    }
    return true;
}, {
    message: "Số tiền giảm giá là bắt buộc khi chọn loại giảm giá cố định",
    path: ["discountAmount"],
}).refine(data => {
    return data.validFrom < data.validTo;
}, {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["validTo"],
});

// Schema cho cập nhật mã khuyến mãi
export const formUpdatePromoCodeSchema = basePromoCodeSchema.extend({
    id: z.string().uuid({ message: 'ID không hợp lệ' }),
});

// Types từ schema
export type CreatePromoCodeDto = z.infer<typeof formCreatePromoCodeSchema>;
export type UpdatePromoCodeDto = z.infer<typeof formUpdatePromoCodeSchema>;
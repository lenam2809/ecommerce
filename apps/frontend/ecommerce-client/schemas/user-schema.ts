import { z } from "zod";

export const formUpdateUserSchema = z.object({
    id: z.string().nullable().optional(),
    firstName: z.string().min(1, "Tên là bắt buộc"),
    lastName: z.string().min(1, "Họ là bắt buộc"),
    phoneNumber: z.string().min(1, "Số điện thoại là bắt buộc"),
    avatar: z.any().optional(),
    email: z.string().nullable().optional(),

});

export const formAddressSchema = z.object({
    id: z.number(),
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    district: z.string().optional(),
    ward: z.string().optional(),
    isDefault: z.boolean(),
});

// Nếu cần TypeScript type từ schema (có thể dùng thay interface cũ):
export type FormAddressSchema = z.infer<typeof formAddressSchema>;
export type FormUpdateUserSchema = z.infer<typeof formUpdateUserSchema>;
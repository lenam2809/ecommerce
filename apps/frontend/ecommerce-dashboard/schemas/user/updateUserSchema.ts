import { CustomerLevel, UserRole, UserStatus } from "@/types/user";
import { z } from "zod";

export const formUpdateUserSchema = z.object({
    id: z.string().uuid({ message: "ID người dùng không hợp lệ" }),

    firstName: z.string()
        .min(1, { message: 'Tên không được để trống' })
        .max(50, { message: 'Tên không được vượt quá 50 ký tự' })
        .regex(/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/, {
            message: 'Tên chỉ được chứa chữ cái và khoảng trắng'
        }),

    lastName: z.string()
        .min(1, { message: 'Họ không được để trống' })
        .max(50, { message: 'Họ không được vượt quá 50 ký tự' })
        .regex(/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/, {
            message: 'Họ chỉ được chứa chữ cái và khoảng trắng'
        }),

    phoneNumber: z.string()
        .min(1, { message: 'Số điện thoại không được để trống' })
        .refine(val => !val || /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(val), {
            message: 'Số điện thoại không đúng định dạng'
        }),

    roles: z.nativeEnum(UserRole).default(UserRole.Customer).optional(),

    avatar: z.any()
        .refine(file =>
            file instanceof File || typeof file === 'string',
            { message: 'Hình ảnh chính là bắt buộc' }
        ).optional(),

    customerLevel: z.nativeEnum(CustomerLevel, {
        errorMap: () => ({ message: "Cấp độ khách hàng không hợp lệ" })
    }),

    promotionPoints: z.number().int().min(0, { message: 'Điểm thưởng không được âm' }),

    status: z.nativeEnum(UserStatus, {
        errorMap: () => ({ message: "Trạng thái người dùng không hợp lệ" })
    })
});

export type FormUpdateUserSchema = z.infer<typeof formUpdateUserSchema>;
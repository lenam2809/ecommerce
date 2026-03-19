import { CustomerLevel, UserRole, UserStatus } from "@/types/user";
import { z } from "zod";

export const formCreateUserSchema = z.object({
    email: z.string()
        .min(1, { message: 'Email không được để trống' })
        .email({ message: 'Email phải có định dạng hợp lệ' }),

    password: z.string()
        .min(1, { message: 'Mật khẩu không được để trống' })
        .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
        .regex(/[A-Z]/, { message: 'Mật khẩu phải chứa ít nhất một chữ hoa' })
        .regex(/[a-z]/, { message: 'Mật khẩu phải chứa ít nhất một chữ thường' })
        .regex(/[0-9]/, { message: 'Mật khẩu phải chứa ít nhất một chữ số' })
        .regex(/[^a-zA-Z0-9]/, { message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt' }),

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

    role: z.nativeEnum(UserRole).default(UserRole.Customer).optional(),

    avatar: z.instanceof(File, { message: 'Ảnh đại diện phải là một tệp hợp lệ' })
        .optional(),

    phoneNumber: z.string()
        .optional()
        .refine(val => !val || /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(val), {
            message: 'Số điện thoại không đúng định dạng'
        }),

    customerLevel: z.nativeEnum(CustomerLevel).default(CustomerLevel.Bronze).optional(),

    promotionPoints: z.number().int().min(0, { message: 'Điểm thưởng không được âm' }).default(0).optional(),

    status: z.nativeEnum(UserStatus).default(UserStatus.Active).optional()
});

export type FormCreateUserSchema = z.infer<typeof formCreateUserSchema>;
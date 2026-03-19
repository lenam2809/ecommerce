// schemas/role/role-schema.ts
import * as z from "zod";

// Schema cho việc tạo vai trò
export const formCreateRoleSchema = z.object({
    name: z.string()
        .min(3, { message: "Tên vai trò phải có ít nhất 3 ký tự" })
        .max(100, { message: "Tên vai trò không được vượt quá 100 ký tự" }),
    permissions: z.array(z.string()).optional(),
});

// Schema cho việc cập nhật vai trò
export const formUpdateRoleSchema = formCreateRoleSchema.extend({
    id: z.string(),
});

// Type definitions từ schema
export type CreateRoleDto = z.infer<typeof formCreateRoleSchema>;
export type UpdateRoleDto = z.infer<typeof formUpdateRoleSchema>;
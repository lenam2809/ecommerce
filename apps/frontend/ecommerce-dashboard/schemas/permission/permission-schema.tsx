// schemas/permission.ts
import * as z from "zod";

// Schema for creating a permission
export const formCreatePermissionSchema = z.object({
    name: z.string()
        .min(3, { message: "Tên quyền phải có ít nhất 3 ký tự" })
        .max(100, { message: "Tên quyền không được vượt quá 100 ký tự" }),
    description: z.string()
        .max(500, { message: "Mô tả không được vượt quá 500 ký tự" })
        .optional(),
    category: z.string()
        .max(500, { message: "Nhóm quyền không được vượt quá 500 ký tự" })
        .nullable()
        .optional(),
});

// Schema for updating a permission
export const formUpdatePermissionSchema = formCreatePermissionSchema.extend({
    id: z.string(),
});

// Type definitions from schemas
export type CreatePermissionDto = z.infer<typeof formCreatePermissionSchema>;
export type UpdatePermissionDto = z.infer<typeof formUpdatePermissionSchema>;
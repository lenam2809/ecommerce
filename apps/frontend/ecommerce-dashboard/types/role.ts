// types/role.ts
export interface Role {
    id: string;
    name: string;
    permissions?: string[]; // Danh sách quyền của vai trò
    createdAt?: string;
    updatedAt?: string;
}
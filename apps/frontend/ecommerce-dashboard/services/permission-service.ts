// services/permission-service.ts
import { Result } from '@/types';
import { BaseService } from './base-service';
import { Permission } from '@/types/permission';
import { CreatePermissionDto, UpdatePermissionDto } from '@/schemas/permission/permission-schema';

export class PermissionService extends BaseService {
    constructor() {
        super('/permissions'); // Endpoint là /permissions
    }

    // Ghi đè phương thức getAll kèm theo kiểu dữ liệu cụ thể
    async getAllPermissions(params?: any): Promise<Result<Permission[]>> {
        return this.getAll<Permission>(params);
    }

    // Ghi đè phương thức getById kèm theo kiểu dữ liệu cụ thể
    async getPermissionById(id: string): Promise<Result<Permission>> {
        return this.getById<Permission>(id);
    }

    // Ghi đè phương thức create kèm theo kiểu dữ liệu cụ thể
    async createPermission(data: CreatePermissionDto): Promise<Result<Permission>> {
        return this.create<Permission, CreatePermissionDto>(data);
    }

    // Ghi đè phương thức update kèm theo kiểu dữ liệu cụ thể
    async updatePermission(id: string, data: UpdatePermissionDto): Promise<Result<Permission>> {
        return this.update<Permission, UpdatePermissionDto>(id, data);
    }

    // Ghi đè phương thức delete kèm theo kiểu dữ liệu cụ thể
    async deletePermission(id: string): Promise<Result<Permission>> {
        return this.delete<Permission>(id);
    }

    // Phương thức để lấy quyền theo userId
    async getPermissionsByUserId(userId: string): Promise<Result<Permission[]>> {
        return this.get<Permission[]>(`/permissions/user/${userId}`);
    }

    // Phương thức để lấy quyền theo roleId
    async getPermissionsByRoleId(roleId: string): Promise<Result<Permission[]>> {
        return this.get<Permission[]>(`/permissions/role/${roleId}`);
    }

    // Phương thức để gán quyền cho người dùng
    async assignPermissionsToUser(userId: string, permissionIds: string[]): Promise<Result<any>> {
        return this.post<any>(`/permissions/assign/user/${userId}`, permissionIds);
    }

    // Phương thức để gán quyền cho vai trò
    async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<Result<any>> {
        return this.post<any>(`/permissions/assign/role/${roleId}`, permissionIds);
    }
}

// Khởi tạo và export instance để sử dụng xuyên suốt ứng dụng
export const permissionService = new PermissionService();
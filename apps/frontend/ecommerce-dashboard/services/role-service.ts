// services/role-service.ts
import { Result } from '@/types';
import { BaseService } from './base-service';
import { Role } from '@/types/role';
import { CreateRoleDto, UpdateRoleDto } from '@/schemas/role/role-schema';

export class RoleService extends BaseService {
    constructor() {
        super('/roles'); // Endpoint là /roles
    }

    // Ghi đè phương thức getAll kèm theo kiểu dữ liệu cụ thể
    async getAllRoles(params?: any): Promise<Result<Role[]>> {
        return this.getAll<Role>(params);
    }

    // Ghi đè phương thức getById kèm theo kiểu dữ liệu cụ thể
    async getRoleById(id: string): Promise<Result<Role>> {
        return this.getById<Role>(id);
    }

    // Ghi đè phương thức create kèm theo kiểu dữ liệu cụ thể
    async createRole(data: CreateRoleDto): Promise<Result<Role>> {
        return this.create<Role, CreateRoleDto>(data);
    }

    // Ghi đè phương thức update kèm theo kiểu dữ liệu cụ thể
    async updateRole(id: string, data: UpdateRoleDto): Promise<Result<Role>> {
        return this.update<Role, UpdateRoleDto>(id, data);
    }

    // Ghi đè phương thức delete kèm theo kiểu dữ liệu cụ thể
    async deleteRole(id: string): Promise<Result<Role>> {
        return this.delete<Role>(id);
    }

    // Phương thức để lấy vai trò theo userId
    async getRolesByUserId(userId: string): Promise<Result<Role[]>> {
        return this.get<Role[]>(`/roles/user/${userId}`);
    }

    // Phương thức để gán vai trò cho người dùng
    async assignRolesToUser(userId: string, roleIds: string[]): Promise<Result<any>> {
        return this.post<any>(`/roles/assign/user/${userId}`, roleIds);
    }
}

// Khởi tạo và export instance để sử dụng xuyên suốt ứng dụng
export const roleService = new RoleService();
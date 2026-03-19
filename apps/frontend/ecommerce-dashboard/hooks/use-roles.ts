// hooks/use-roles.ts
"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { roleService } from '@/services/role-service';
import { CreateRoleDto, UpdateRoleDto } from '@/schemas/role/role-schema';
import { OptionType } from '@/components/ui/select/single-select';
import { toast } from './use-toast';

// Key factory cho quản lý cache hiệu quả
const roleKeys = {
    all: ['roles'] as const,
    options: ['options/roles'] as const,
    lists: () => [...roleKeys.all, 'list'] as const,
    list: (params: any) => [...roleKeys.lists(), params] as const,
    details: () => [...roleKeys.all, 'detail'] as const,
    detail: (id: string) => [...roleKeys.details(), id] as const,
    userRoles: (userId: string) => [...roleKeys.all, 'user', userId] as const,
};

export const useGetRoles = (params: any = {}) => {
    return useQuery({
        queryKey: roleKeys.list(params),
        queryFn: () => roleService.getAllRoles(params),
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetOptionRoles = () => {
    return useQuery({
        queryKey: roleKeys.options,
        queryFn: () => roleService.getOptions<OptionType>(),
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetRole = (id: string) => {
    return useQuery({
        queryKey: roleKeys.detail(id),
        queryFn: () => roleService.getRoleById(id),
        enabled: !!id, // Chỉ chạy query khi có id
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetUserRoles = (userId: string) => {
    return useQuery({
        queryKey: roleKeys.userRoles(userId),
        queryFn: () => roleService.getRolesByUserId(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useCreateRole = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (roleData: CreateRoleDto) => roleService.createRole(roleData),
        onSuccess: () => {
            toast({
                title: "Thêm mới vai trò",
                description: `Thêm mới vai trò thành công!`,
            })
            // Invalidate và refetch
            queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
            router.push('/roles');
        },
        onError: (error: any) => {
            toast({
                title: "Thêm mới vai trò",
                description: error.response?.data?.message ||
                    'Có lỗi xảy ra khi thêm vai trò. Vui lòng thử lại sau.',
                variant: "destructive",
            })
        }
    });
};

export const useUpdateRole = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (roleData: UpdateRoleDto) =>
            roleService.updateRole(roleData.id, roleData),
        onSuccess: () => {
            toast({
                title: "Cập nhật vai trò",
                description: 'Cập nhật vai trò thành công!',
            })
            // Cập nhật cache cho cả danh sách và chi tiết vai trò
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
            router.push('/roles');
        },
        onError: (error: any) => {
            toast({
                title: "Cập nhật vai trò",
                description: error.response?.data?.message ||
                    'Có lỗi xảy ra khi cập nhật vai trò. Vui lòng thử lại sau.',
                variant: "destructive",
            })
        }
    });
};

export const useDeleteRole = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => roleService.deleteRole(id),
        onSuccess: () => {
            toast({
                title: "Xóa vai trò",
                description: 'Xóa vai trò thành công!',
            })
            // Invalidate và refetch
            queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        onError: (error: any) => {
            toast({
                title: "Xóa vai trò",
                description: error.response?.data?.message ||
                    'Có lỗi xảy ra khi xóa vai trò. Vui lòng thử lại sau.',
                variant: "destructive",
            })
        }
    });
};

export const useAssignRolesToUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, roleIds }: { userId: string, roleIds: string[] }) =>
            roleService.assignRolesToUser(userId, roleIds),
        onSuccess: (_, variables) => {
            toast({
                title: "Gán vai trò",
                description: 'Gán vai trò cho người dùng thành công!',
            })
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: roleKeys.userRoles(variables.userId) });
        },
        onError: (error: any) => {
            toast({
                title: "Gán vai trò",
                description: error.response?.data?.message ||
                    'Có lỗi xảy ra khi gán vai trò cho người dùng. Vui lòng thử lại sau.',
                variant: "destructive",
            })
        }
    });
};
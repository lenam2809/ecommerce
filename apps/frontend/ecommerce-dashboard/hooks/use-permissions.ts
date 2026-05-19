// hooks/use-permissions.ts
"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { permissionService } from '@/services/permission-service';
import { CreatePermissionDto, UpdatePermissionDto } from '@/schemas/permission/permission-schema';
import { OptionType } from '@/components/ui/select/single-select';
import { toast } from './use-toast';
import { handleApiError } from '@/lib/api-error';

// Key factory cho quản lý cache hiệu quả
const permissionKeys = {
    all: ['permissions'] as const,
    options: ['permissions/options'] as const,
    lists: () => [...permissionKeys.all, 'list'] as const,
    list: (params: any) => [...permissionKeys.lists(), params] as const,
    details: () => [...permissionKeys.all, 'detail'] as const,
    detail: (id: string) => [...permissionKeys.details(), id] as const,
    userPermissions: (userId: string) => [...permissionKeys.all, 'user', userId] as const,
    rolePermissions: (roleId: string) => [...permissionKeys.all, 'role', roleId] as const,
};

export const useGetPermissions = (params: any = {}) => {
    return useQuery({
        queryKey: permissionKeys.list(params),
        queryFn: () => permissionService.getAllPermissions(params),
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetOptionPermissions = () => {
    return useQuery({
        queryKey: permissionKeys.options,
        queryFn: () => permissionService.getOptions<OptionType>(),
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetPermission = (id: string) => {
    return useQuery({
        queryKey: permissionKeys.detail(id),
        queryFn: () => permissionService.getPermissionById(id),
        enabled: !!id, // Chỉ chạy query khi có id
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetUserPermissions = (userId: string) => {
    return useQuery({
        queryKey: permissionKeys.userPermissions(userId),
        queryFn: () => permissionService.getPermissionsByUserId(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetRolePermissions = (roleId: string) => {
    return useQuery({
        queryKey: permissionKeys.rolePermissions(roleId),
        queryFn: () => permissionService.getPermissionsByRoleId(roleId),
        enabled: !!roleId,
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useCreatePermission = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (permissionData: CreatePermissionDto) => permissionService.createPermission(permissionData),
        onSuccess: () => {
            toast({
                title: "Thêm mới quyền",
                description: `Thêm mới quyền thành công!`,
            })
            // Invalidate và refetch
            queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
            router.push('/permissions');
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'createPermission' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useUpdatePermission = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (permissionData: UpdatePermissionDto) =>
            permissionService.updatePermission(permissionData.id, permissionData),
        onSuccess: () => {
            toast({
                title: "Cập nhật quyền",
                description: 'Cập nhật quyền thành công!',
            })
            // Cập nhật cache cho cả danh sách và chi tiết quyền
            queryClient.invalidateQueries({ queryKey: permissionKeys.all });
            router.push('/permissions');
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'updatePermission' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useDeletePermission = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => permissionService.deletePermission(id),
        onSuccess: () => {
            toast({
                title: "Xóa quyền",
                description: 'Xóa quyền thành công!',
            })
            // Invalidate và refetch
            queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'deletePermission' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useAssignPermissionsToUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, permissionIds }: { userId: string, permissionIds: string[] }) =>
            permissionService.assignPermissionsToUser(userId, permissionIds),
        onSuccess: (_, variables) => {
            toast({
                title: "Gán quyền",
                description: 'Gán quyền cho người dùng thành công!',
            })
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: permissionKeys.userPermissions(variables.userId) });
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'assignPermissionsToUser' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useAssignPermissionsToRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roleId, permissionIds }: { roleId: string, permissionIds: string[] }) =>
            permissionService.assignPermissionsToRole(roleId, permissionIds),
        onSuccess: (_, variables) => {
            toast({
                title: "Gán quyền",
                description: 'Gán quyền cho vai trò thành công!',
            })
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: permissionKeys.rolePermissions(variables.roleId) });
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'assignPermissionsToRole' },
                devTitle: 'Lỗi',
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/user-service';
import { FormCreateUserSchema, FormUpdateUserSchema } from '@/schemas/user';
import { toast } from './use-toast';
import { OptionType } from '@/components/ui/select/single-select';
import { handleApiError } from '@/lib/api-error';

// Key factory for efficient cache management
export const userKeys = {
    all: ['users'] as const,
    options: ['users/options'] as const,
    lists: () => [...userKeys.all, 'list'] as const, // Tạo base key cho tất cả danh sách
    list: (params: any) => [...userKeys.lists(), params] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
    ordersByUser: (id: string) => [...userKeys.all, `orders-by-user/${id}`] as const,
};

export const useGetUsers = (params: any = {}) => {
    return useQuery({
        queryKey: userKeys.list(params),
        queryFn: () => userService.getAllUsers(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};


export const useGetUser = (id: string) => {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => userService.getUserById(id),
        enabled: !!id, // Only run query when id exists
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useGetOptionUsers = () => {
    return useQuery({
        queryKey: userKeys.options,
        queryFn: () => userService.getOptions<OptionType>(),
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetOrdersByUser = (id: string) => {
    return useQuery({
        queryKey: userKeys.ordersByUser(id),
        queryFn: () => userService.getOrdersByUserId(id),
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useCreateUser = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData: FormCreateUserSchema) => userService.createUser(userData),
        onSuccess: () => {
            toast({
                title: "Thêm mới người dùng",
                description: `Thêm mới người dùng thành công!`,
            })
            // Invalidate and refetch
            queryClient.invalidateQueries({
                queryKey: userKeys.all
            });
            router.push('/users');
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'createUser' },
                devTitle: "Thêm mới người dùng",
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useUpdateUser = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData: FormUpdateUserSchema) => userService.updateUser(userData),
        onSuccess: () => {
            toast({
                title: "Cập nhật người dùng",
                description: `Cập nhật người dùng thành công!`,
            })
            // Update cache for both list and detail
            queryClient.invalidateQueries({
                queryKey: userKeys.all
            });
            router.push('/users');
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'updateUser' },
                devTitle: "Cập nhật người dùng",
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useDeleteUser = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => userService.deleteUser(id),
        onSuccess: () => {
            toast({
                title: "Xóa người dùng",
                description: `Xóa người dùng thành công!`,
            })
            queryClient.invalidateQueries({
                queryKey: userKeys.all
            });
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'deleteUser' },
                devTitle: "Xóa người dùng",
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

// Additional hooks for specific user queries
export const useGetUsersByLevel = (level: string) => {
    return useQuery({
        queryKey: [...userKeys.lists(), { level }],
        queryFn: () => userService.getUsersByLevel(level as any),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useGetActiveUsers = () => {
    return useQuery({
        queryKey: [...userKeys.lists(), { status: 'Active' }],
        queryFn: () => userService.getActiveUsers(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountLockService } from '@/services/account-lock-service';
import {
    LockUserRequest,
    UnlockUserRequest,
    GetAccountLocksQuery,
} from '@/types/account-lock';
import { toast } from './use-toast';
import { handleApiError } from '@/lib/api-error';

// Key factory for efficient cache management
export const accountLockKeys = {
    all: ['account-locks'] as const,
    lists: () => [...accountLockKeys.all, 'list'] as const,
    list: (params: GetAccountLocksQuery) => [...accountLockKeys.lists(), params] as const,
    details: () => [...accountLockKeys.all, 'detail'] as const,
    detail: (userId: string) => [...accountLockKeys.details(), userId] as const,
    status: (userId: string) => [...accountLockKeys.all, 'status', userId] as const,
};



// Get account lock status for specific user
export const useGetAccountLockStatus = (userId: string) => {
    return useQuery({
        queryKey: accountLockKeys.status(userId),
        queryFn: () => accountLockService.getAccountLockStatus(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 1, // 1 minute (very short for lock status)
    });
};

// Check if user is locked (helper hook)
export const useIsUserLocked = (userId: string) => {
    return useQuery({
        queryKey: [...accountLockKeys.status(userId), 'is-locked'],
        queryFn: () => accountLockService.isUserLocked(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 1, // 1 minute
    });
};

// Lock user account
export const useLockUser = (onSuccessCallback?: (data: any) => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: LockUserRequest) => accountLockService.lockUser(request),
        onSuccess: (data, variables) => {
            toast({
                title: "Khóa tài khoản",
                description: `Khóa tài khoản người dùng thành công!`,
            });

            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: accountLockKeys.all
            });

            // Invalidate user lock status
            queryClient.invalidateQueries({
                queryKey: accountLockKeys.status(variables.userId)
            });

            // Invalidate user queries to update user status
            queryClient.invalidateQueries({
                queryKey: ['users']
            });

            if (onSuccessCallback) {
                onSuccessCallback(data);
            }
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'lockUser' },
                devTitle: "Khóa tài khoản",
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

// Unlock user account
export const useUnlockUser = (onSuccessCallback?: (data: any) => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: UnlockUserRequest) => accountLockService.unlockUser(request),
        onSuccess: (data, variables) => {
            toast({
                title: "Mở khóa tài khoản",
                description: `Mở khóa tài khoản người dùng thành công!`,
            });

            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: accountLockKeys.all
            });

            // Invalidate user lock status
            queryClient.invalidateQueries({
                queryKey: accountLockKeys.status(variables.userId)
            });

            // Invalidate user queries to update user status
            queryClient.invalidateQueries({
                queryKey: ['users']
            });

            if (onSuccessCallback) {
                onSuccessCallback(data);
            }
        },
        onError: (error: any) => {
            handleApiError({
                error,
                context: { operation: 'unlockUser' },
                devTitle: "Mở khóa tài khoản",
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

export const useccountLockById = (id: string) => {
    return useQuery({
        queryKey: accountLockKeys.detail(id),
        queryFn: () => accountLockService.getAccountLockById(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}



// Custom hook for real-time lock status checking
export const useAccountLockStatus = (userId: string, polling = false) => {
    return useQuery({
        queryKey: accountLockKeys.status(userId),
        queryFn: () => accountLockService.getAccountLockStatus(userId),
        enabled: !!userId,
        staleTime: polling ? 0 : 1000 * 60 * 1, // No cache if polling
        refetchInterval: polling ? 1000 * 30 : false, // Poll every 30 seconds if enabled
    });
};
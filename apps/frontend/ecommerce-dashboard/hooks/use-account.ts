"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountService, UpdateProfileRequest, ChangePasswordRequest } from '@/services/account-service';
import { toast } from './use-toast';
import { handleApiError } from '@/lib/api-error';

// Key factory for efficient cache management
export const accountKeys = {
    profile: ['account', 'profile'] as const,
};

// Hook to get the current user's profile
export const useGetProfile = () => {
    return useQuery({
        queryKey: accountKeys.profile,
        queryFn: () => accountService.getProfile(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Hook to update the user's profile
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (profileData: UpdateProfileRequest) => accountService.updateProfile(profileData),
        onSuccess: () => {
            toast({
                title: "Cập nhật thông tin",
                description: "Cập nhật thông tin cá nhân thành công!",
            });
            // Invalidate and refetch profile data
            queryClient.invalidateQueries({
                queryKey: accountKeys.profile
            });
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'updateProfile' },
                devTitle: "Cập nhật thông tin",
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};

// Hook to change the user's password
export const useChangePassword = (onSuccessCallback?: () => void) => {
    return useMutation({
        mutationFn: (passwordData: ChangePasswordRequest) => accountService.changePassword(passwordData),
        onSuccess: () => {
            toast({
                title: "Đổi mật khẩu",
                description: "Thay đổi mật khẩu thành công!",
            });

            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        onError: (error: unknown) => {
            handleApiError({
                error,
                context: { operation: 'changePassword' },
                devTitle: "Đổi mật khẩu",
                notify: (ui) => toast({ title: ui.title, description: ui.description, variant: ui.variant }),
            })
        }
    });
};
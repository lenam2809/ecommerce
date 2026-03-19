"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountService, UpdateProfileRequest, ChangePasswordRequest } from '@/services/account-service';
import { toast } from './use-toast';

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
        onError: (error: any) => {
            toast({
                title: "Cập nhật thông tin",
                description: error.response?.data?.message ||
                    'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại sau.',
                variant: "destructive",
            });
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
        onError: (error: any) => {
            toast({
                title: "Đổi mật khẩu",
                description: error.response?.data?.message ||
                    'Có lỗi xảy ra khi thay đổi mật khẩu. Vui lòng thử lại sau.',
                variant: "destructive",
            });
        }
    });
};
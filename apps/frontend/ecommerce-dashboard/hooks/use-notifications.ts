"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification-service';
import {
    SendPromotionNotificationCommand,
    SendMaintenanceNotificationCommand,
    ENotificationCategory
} from '@/types/notification';
import { toast } from './use-toast';

const notificationKeys = {
    all: ['notifications'] as const,
    user: ['user-notifications'] as const,
    system: ['system-notifications'] as const,
    unreadCount: (userId: string) => ['unread-notifications-count', userId] as const,
    statistics: ['notifications-statistics'] as const,
    userList: (params: any) => [...notificationKeys.user, 'list', params] as const,
    systemList: (params: any) => [...notificationKeys.system, 'list', params] as const,
};

export const useGetUserNotifications = (params: {
    pageNumber?: number;
    pageSize?: number;
    isRead?: boolean;
    category?: ENotificationCategory;
    sortBy?: string;
    isDescending?: boolean;
}, userId: string) => {
    return useQuery({
        queryKey: notificationKeys.userList({ ...params, userId }),
        queryFn: () => notificationService.getUserNotifications({ ...params }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!userId,
    });
};

export const useGetSystemNotifications = (params: {
    pageNumber?: number;
    pageSize?: number;
    includeExpired?: boolean;
    sortBy?: string;
    isDescending?: boolean;
}) => {
    return useQuery({
        queryKey: notificationKeys.systemList(params),
        queryFn: () => notificationService.getSystemNotifications(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useGetUnreadCount = (userId: string) => {
    return useQuery({
        queryKey: notificationKeys.unreadCount(userId),
        queryFn: () => notificationService.getUnreadCount(userId),
        staleTime: 1000 * 30, // 30 seconds
        enabled: !!userId,
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ notificationId, userId }: { notificationId: string, userId: string }) =>
            notificationService.markAsRead(notificationId, userId),
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(userId) });
            queryClient.invalidateQueries({ queryKey: notificationKeys.user });
        },
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => notificationService.markAllAsRead(userId),
        onSuccess: (_, userId) => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(userId) });
            queryClient.invalidateQueries({ queryKey: notificationKeys.user });
        },
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationService.deleteNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi xóa thông báo",
                description: error.response?.data?.message || 'Không xóa được thông báo',
                variant: "destructive",
            });
        }
    });
};

export const useGetStatistics = (params: {
    userId?: string;
    fromDate?: string;
    toDate?: string;
}) => {
    return useQuery({
        queryKey: [...notificationKeys.statistics, params],
        queryFn: () => notificationService.getStatistics(params),
        staleTime: 1000 * 60 * 5, // 5 phút
        // Thêm các tùy chọn để ngăn gọi lại không cần thiết
        refetchOnWindowFocus: false, // Ngăn gọi lại khi cửa sổ được focus
        refetchOnMount: false, // Ngăn gọi lại khi component mount
    });
};

export const useSendPromotionNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SendPromotionNotificationCommand) =>
            notificationService.sendPromotionNotification(data),
        onSuccess: () => {
            toast({
                title: "Gửi thông báo khuyến mãi",
                description: "Thông báo khuyến mãi đã được gửi thành công!",
            });
            queryClient.invalidateQueries({ queryKey: notificationKeys.system });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi gửi thông báo khuyến mãi",
                description: error.response?.data?.message || 'Đã có lỗi xảy ra khi gửi thông báo khuyến mãi. Vui lòng thử lại sau.',
                variant: "destructive",
            });
        }
    });
};

export const useSendMaintenanceNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SendMaintenanceNotificationCommand) =>
            notificationService.sendMaintenanceNotification(data),
        onSuccess: () => {
            toast({
                title: "Gửi thông báo bảo trì",
                description: "Thông báo bảo trì đã được gửi thành công!",
            });
            queryClient.invalidateQueries({ queryKey: notificationKeys.system });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi khi gửi thông báo bảo trì",
                description: error.response?.data?.message || 'Đã có lỗi xảy ra khi gửi thông báo bảo trì. Vui lòng thử lại sau.',
                variant: "destructive",
            });
        }
    });
};
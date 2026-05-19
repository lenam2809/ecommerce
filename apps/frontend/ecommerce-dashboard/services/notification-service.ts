import { BaseService } from './base-service';
import {
    PaginatedNotifications,
    NotificationStatisticsDto,
    SendPromotionNotificationCommand,
    SendMaintenanceNotificationCommand,
    ENotificationCategory
} from '@/types/notification';
import api from '@/lib/axios';
import { Result } from '@/types';

export class NotificationService extends BaseService {
    constructor() {
        super('/notification');
    }

    async getUserNotifications(params: {
        pageNumber?: number;
        pageSize?: number;
        isRead?: boolean;
        category?: ENotificationCategory;
        sortBy?: string;
        isDescending?: boolean;
    }): Promise<Result<PaginatedNotifications>> {
        return this.get<PaginatedNotifications>('/notification', { params });
    }

    async getUnreadCount(userId: string): Promise<number> {
        const response = await api.get(`${this.endpoint}/unread-count`, { params: { userId } });
        return response.data;
    }

    async markAsRead(notificationId: string, userId: string): Promise<boolean> {
        const response = await api.put(`${this.endpoint}/${notificationId}/mark-read`, { userId });
        return response.data;
    }

    async markAllAsRead(userId: string): Promise<boolean> {
        const response = await api.put(`${this.endpoint}/mark-all-read`, { userId });
        return response.data;
    }

    async deleteNotification(id: string): Promise<void> {
        await api.delete(`${this.endpoint}/${id}`);
    }

    async getStatistics(params: {
        userId?: string;
        fromDate?: string;
        toDate?: string;
    }): Promise<NotificationStatisticsDto> {
        const response = await api.get(`${this.endpoint}/statistics`, { params });
        return response.data;
    }

    async getSystemNotifications(params: {
        pageNumber?: number;
        pageSize?: number;
        includeExpired?: boolean;
        sortBy?: string;
        isDescending?: boolean;
    }): Promise<Result<PaginatedNotifications>> {
        return this.get<PaginatedNotifications>('/notification/system', { params });
    }


    async sendPromotionNotification(data: SendPromotionNotificationCommand): Promise<boolean> {
        const response = await api.post(`/notification/send-promotion`, data);
        return response.data;
    }

    async sendMaintenanceNotification(data: SendMaintenanceNotificationCommand): Promise<boolean> {
        const response = await api.post(`${this.endpoint}/send-maintenance`, data);
        return response.data;
    }
}

export const notificationService = new NotificationService();

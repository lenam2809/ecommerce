export enum ENotificationCategory {
    System = 'System',
    Promotion = 'Promotion',
    Order = 'Order',
    Account = 'Account'
}

export enum ENotificationType {
    Info = 'Info',
    Warning = 'Warning',
    Error = 'Error',
    Success = 'Success'
}

export interface NotificationDto {
    id: string;
    title: string;
    content: string;
    category: ENotificationCategory;
    type: ENotificationType;
    isRead: boolean;
    recipientId: string;
    actionUrl?: string;
    imageUrl?: string;
    expiresAt?: string;
    createdAt: string;
    readAt?: string;
}

export interface PaginatedNotifications {
    items: NotificationDto[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface NotificationStatisticsDto {
    totalNotifications: number;
    readNotifications: number;
    unreadNotifications: number;
    expiredNotifications: number;
    notificationsByCategory: Record<string, number>;
    notificationsByType: Record<string, number>;
    notificationsByMonth: Record<string, number>;
}

export interface SendPromotionNotificationCommand {
    title: string;
    message: string;
    expiresAt?: Date;
    targetUserId?: string;
    targetGroup?: string;
    actionUrl?: string;
    imageUrl?: string;
}

export interface SendMaintenanceNotificationCommand {
    title: string;
    message: string;
    scheduledTime: Date;
    durationMinutes: number;
    actionUrl?: string;
}
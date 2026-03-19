export interface PaginatedList<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

export interface UserActivity {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    activityType: string;
    description: string;
    ipAddress: string;
    userAgent: string;
    location: string;
    timestamp: string;
    additionalData?: Record<string, any>;
}

export interface GetUserActivitiesQuery {
    userId?: string; // Null = current user, Admin có thể xem user khác
    pageNumber?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    activityType?: string;
    searchTerm?: string;
    sortBy?: string;
    isDescending?: boolean;
}

export enum ActivityType {
    Login = "Login",
    Logout = "Logout",
    Register = "Register",
    PasswordChange = "PasswordChange",
    ProfileUpdate = "ProfileUpdate",
    OrderCreated = "OrderCreated",
    OrderUpdated = "OrderUpdated",
    OrderCancelled = "OrderCancelled",
    AccountLocked = "AccountLocked",
    AccountUnlocked = "AccountUnlocked",
    PermissionChanged = "PermissionChanged",
    DataExport = "DataExport",
    SecurityAlert = "SecurityAlert",
}
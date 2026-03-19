export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    permissions: string[];
    customerLevel: number;
    phone?: string;
    avatar?: string;
    fullName?: string;
    phoneNumber?: string;
    promotionPoints?: number;
    status?: number;
    createdAt?: string;
    updatedAt?: string;
    lastLogin?: string | null;
    orderCount?: number;
    totalSpent?: number;
    lastOrder?: Date | string;
}

export enum UserStatus {
    Active = 0,
    Inactive = 1,
    Suspended = 2,
    Deleted = 3,
}

export enum CustomerLevel {
    Bronze = 0,
    Silver = 1,
    Gold = 2,
    Diamond = 3,
}

export enum UserRole {
    Admin = "Admin",
    Manager = "Manager",
    Staff = "Staff",
    Customer = "Customer",
}


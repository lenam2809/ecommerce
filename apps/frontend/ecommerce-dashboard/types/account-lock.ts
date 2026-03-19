export interface AccountLock {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    reason: string;
    lockType: ELockType;
    lockTypeText: string;
    lockedAt: string;
    unlockedAt?: string | null;
    expiresAt?: string | null;
    isActive: boolean;
    lockedByUserName: string;
    unlockedByUserName?: string | null;
    notes?: string;
    remainingMinutes?: number | null;
}

export enum ELockType {
    Temporary = 0,
    Permanent = 1,
}

export interface LockUserRequest {
    userId: string;
    reason: string;
    lockType?: ELockType;
    durationMinutes?: number; // Chỉ áp dụng cho Temporary lock
    notes?: string;
}

export interface UnlockUserRequest {
    userId: string;
}

export interface GetAccountLocksQuery {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    lockType?: ELockType;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    isDescending?: boolean;
}

export interface AccountLockStatus {
    userId: string;
    isLocked: boolean;
    lockInfo?: AccountLock;
}
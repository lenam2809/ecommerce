import api from '@/lib/axios';
import { BaseService } from './base-service';
import { Result } from '@/types';
import { logger } from '@/lib/logger';
import {
    LockUserRequest,
    UnlockUserRequest,
    AccountLockStatus,
    AccountLock
} from '@/types/account-lock';

export class AccountLockService extends BaseService {
    constructor() {
        super('/account-locks'); // Endpoint là /accountlocks
    }

    // Lock user account
    async lockUser(request: LockUserRequest): Promise<Result<boolean>> {
        const response = await api.post(`${this.endpoint}/lock`, request);
        return response.data;
    }

    // Unlock user account
    async unlockUser(request: UnlockUserRequest): Promise<Result<boolean>> {
        const response = await api.post(`${this.endpoint}/unlock`, request);
        return response.data;
    }

    // Get account lock status
    async getAccountLockStatus(userId: string): Promise<Result<AccountLockStatus>> {
        const response = await api.get(`${this.endpoint}/status/${userId}`);
        return response.data;
    }

    async getAccountLockById(id: string): Promise<Result<AccountLock>> {
        const response = await api.get(`${this.endpoint}/${id}`);
        return response.data;
    }

    // Helper method to check if user is locked
    async isUserLocked(userId: string): Promise<boolean> {
        try {
            const result = await this.getAccountLockStatus(userId);
            return result.success && result.data?.isLocked === true;
        } catch (error) {
            logger.error('Error checking user lock status:', error);
            return false;
        }
    }
}

// Initialize and export instance
export const accountLockService = new AccountLockService();
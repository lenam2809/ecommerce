import api from '@/lib/axios';
import { BaseService } from './base-service';
import { Result } from '@/types';
import { UserActivity, GetUserActivitiesQuery, PaginatedList } from '@/types/user-activity';

export class UserActivityService extends BaseService {
    constructor() {
        super('/useractivities'); // Endpoint là /useractivities
    }

    // Get user activities (current user or specified user for admin)
    async getUserActivities(query?: GetUserActivitiesQuery): Promise<Result<PaginatedList<UserActivity>>> {
        const response = await api.get(`${this.endpoint}`, {
            params: query
        });
        return response.data;
    }

    // Get activities by specific user (Admin only)
    async getActivitiesByUser(userId: string, query?: GetUserActivitiesQuery): Promise<Result<PaginatedList<UserActivity>>> {
        const response = await api.get(`${this.endpoint}/user/${userId}`, {
            params: query
        });
        return response.data;
    }

}

// Initialize and export instance
export const userActivityService = new UserActivityService();
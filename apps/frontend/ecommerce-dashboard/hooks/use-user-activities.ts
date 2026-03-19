"use client"

import { useQuery } from '@tanstack/react-query';
import { userActivityService } from '@/services/user-activity-service';
import { GetUserActivitiesQuery } from '@/types/user-activity';

// Key factory for efficient cache management
export const userActivityKeys = {
    all: ['user-activities'] as const,
    lists: () => [...userActivityKeys.all, 'list'] as const,
    list: (params: GetUserActivitiesQuery) => [...userActivityKeys.lists(), params] as const,
    byUser: (userId: string) => [...userActivityKeys.all, 'by-user', userId] as const,
    byUserWithParams: (userId: string, params: GetUserActivitiesQuery) =>
        [...userActivityKeys.byUser(userId), params] as const,
};

// Get user activities (current user or specified user for admin)
export const useGetUserActivities = (query?: GetUserActivitiesQuery) => {
    return useQuery({
        queryKey: userActivityKeys.list(query || {}),
        queryFn: () => userActivityService.getUserActivities(query),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};



// Get activities by specific user (Admin only)
export const useGetActivitiesByUser = (userId: string, query?: GetUserActivitiesQuery) => {
    return useQuery({
        queryKey: userActivityKeys.byUserWithParams(userId, query || {}),
        queryFn: () => userActivityService.getActivitiesByUser(userId, query),
        enabled: !!userId,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};






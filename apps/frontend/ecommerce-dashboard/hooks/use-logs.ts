"use client"

import { useQuery } from '@tanstack/react-query';
import { logService } from '@/services/log-service';

// Key factory cho quản lý cache hiệu quả
const logKeys = {
    all: ['logs'] as const,
    audit: () => [...logKeys.all, 'audit'] as const,
    auditList: (params: any) => [...logKeys.audit(), 'list', params] as const,
    auditDetail: (id: string) => [...logKeys.audit(), 'detail', id] as const,
    system: () => [...logKeys.all, 'system'] as const,
    systemList: (params: any) => [...logKeys.system(), 'list', params] as const,
    systemDetail: (id: string) => [...logKeys.system(), 'detail', id] as const,
};

export const useGetAuditLogs = (params: any = {}) => {
    return useQuery({
        queryKey: logKeys.auditList(params),
        queryFn: () => logService.getAuditLogs(params),
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetSystemLogs = (params: any = {}) => {
    return useQuery({
        queryKey: logKeys.systemList(params),
        queryFn: () => logService.getSystemLogs(params),
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetAuditLog = (id: string) => {
    return useQuery({
        queryKey: logKeys.auditDetail(id),
        queryFn: () => logService.getAuditLogById(id),
        enabled: !!id, // Chỉ chạy query khi có id
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useGetSystemLog = (id: string) => {
    return useQuery({
        queryKey: logKeys.systemDetail(id),
        queryFn: () => logService.getSystemLogById(id),
        enabled: !!id, // Chỉ chạy query khi có id
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};
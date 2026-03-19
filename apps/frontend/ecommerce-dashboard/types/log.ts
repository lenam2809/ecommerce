// Định nghĩa kiểu dữ liệu cho AuditLog và SystemLog
export type AuditLog = {
    id: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    timestamp: string;
    oldValues: Record<string, any>;
    newValues: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
};

export type SystemLog = {
    id: string;
    level: string;
    message: string;
    timestamp: string;
    exception?: string;
    source?: string;
    userId?: string;
    requestId?: string;
};

// types/log-entry.ts
export interface LogEntryDto {
    id: string
    timestamp: string
    level: string
    levelText: string
    message: string
    eventName: string
    sourceContext: string
    ipAddress: string
    userAgent: string
    applicationUserId?: string
    userName: string
    properties: { key: string; value: string }[]
}
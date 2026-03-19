import { Result } from '@/types';
import { BaseService } from './base-service';
import { AuditLog, LogEntryDto, SystemLog } from '@/types/log';



export class LogService extends BaseService {
    constructor() {
        super('/logs'); // Endpoint là /logs
    }

    // Lấy danh sách audit logs
    async getAuditLogs(params?: any): Promise<Result<AuditLog[]>> {
        return this.get<AuditLog[]>('/logs/audit', params);
    }

    // Lấy danh sách system logs
    async getSystemLogs(params?: any): Promise<Result<SystemLog[]>> {
        return this.get<SystemLog[]>('/logs/system', params);
    }

    // Lấy chi tiết audit log
    async getAuditLogById(id: string): Promise<Result<AuditLog>> {
        return this.getById<AuditLog>(id);
    }

    // Lấy chi tiết system log
    async getSystemLogById(id: string): Promise<Result<LogEntryDto>> {
        return this.get<LogEntryDto>(`/logs/system/${id}`);
    }
}

// Khởi tạo và export instance để sử dụng xuyên suốt ứng dụng
export const logService = new LogService();
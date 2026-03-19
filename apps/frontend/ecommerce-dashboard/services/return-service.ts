import api from '@/lib/axios';
import { BaseService } from './base-service';
import { Result } from '@/types';
import { ReturnRequest, ReturnRequestList, EReturnStatus } from '@/types/return-request';

export class ReturnService extends BaseService {
    constructor() {
        super('/returns');
    }

    /**
     * Admin: Lấy tất cả yêu cầu đổi/trả (filter theo status)
     */
    async getAllReturns(status?: EReturnStatus): Promise<Result<ReturnRequestList[]>> {
        const params = status !== undefined ? { status } : undefined;
        return this.get<ReturnRequestList[]>('/returns', params);
    }

    /**
     * Xem chi tiết yêu cầu đổi/trả
     */
    async getReturnById(id: string): Promise<Result<ReturnRequest>> {
        return this.get<ReturnRequest>(`/returns/${id}`);
    }

    /**
     * Lấy đổi/trả theo đơn hàng
     */
    async getByOrderId(orderId: string): Promise<Result<ReturnRequestList[]>> {
        return this.get<ReturnRequestList[]>(`/returns/order/${orderId}`);
    }

    /**
     * Admin: Duyệt yêu cầu đổi/trả
     */
    async approve(id: string, data: { staffNote?: string; finalRefundAmount: number }): Promise<Result<boolean>> {
        const response = await api.put(`/returns/${id}/approve`, data);
        return response.data;
    }

    /**
     * Admin: Từ chối yêu cầu đổi/trả
     */
    async reject(id: string, data: { rejectionReason: string }): Promise<Result<boolean>> {
        const response = await api.put(`/returns/${id}/reject`, data);
        return response.data;
    }

    /**
     * Admin: Cập nhật trạng thái RMA
     */
    async updateStatus(id: string, data: { newStatus: EReturnStatus; note?: string }): Promise<Result<boolean>> {
        const response = await api.put(`/returns/${id}/status`, data);
        return response.data;
    }
}

export const returnService = new ReturnService();

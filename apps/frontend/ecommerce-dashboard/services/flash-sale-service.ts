import api from '@/lib/axios';
import { BaseService } from './base-service';
import { Result } from '@/types';
import {
    FlashSale,
    CreateFlashSaleInput,
    UpdateFlashSaleInput,
} from '@/types/flash-sale';

export class FlashSaleService extends BaseService {
    constructor() {
        super('/promotions');
    }

    /**
     * Lấy danh sách các chiến dịch Flash Sale
     */
    async getAllFlashSales(params?: { isActive?: boolean }): Promise<Result<FlashSale[]>> {
        return this.get<FlashSale[]>('/promotions/flash-sales', params);
    }

    /**
     * Chi tiết 1 chiến dịch Flash Sale kèm danh sách sản phẩm
     */
    async getFlashSaleById(id: string): Promise<Result<FlashSale>> {
        return this.get<FlashSale>(`/promotions/flash-sales/${id}`);
    }

    /**
     * Lấy thông tin chương trình Flash Sale đang hoạt động kèm đếm ngược
     */
    async getCurrentFlashSale(): Promise<Result<FlashSale>> {
        return this.get<FlashSale>('/promotions/flash-sale/current');
    }

    /**
     * Tạo mới chiến dịch Flash Sale & các mặt hàng
     */
    async createFlashSale(data: CreateFlashSaleInput): Promise<Result<FlashSale>> {
        const response = await api.post('/promotions/flash-sales', data);
        return response.data;
    }

    /**
     * Cập nhật thông tin chiến dịch và mặt hàng Flash Sale
     */
    async updateFlashSale(id: string, data: UpdateFlashSaleInput): Promise<Result<FlashSale>> {
        const response = await api.put(`/promotions/flash-sales/${id}`, data);
        return response.data;
    }

    /**
     * Xóa chiến dịch Flash Sale
     */
    async deleteFlashSale(id: string): Promise<Result<boolean>> {
        const response = await api.delete(`/promotions/flash-sales/${id}`);
        return response.data;
    }
}

export const flashSaleService = new FlashSaleService();

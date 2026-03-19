import { Result } from '@/types';
import { BaseService } from './base-service';
import { CreatePromoCodeDto, UpdatePromoCodeDto } from '@/schemas/promo-code/promo-code-schema';
import { PromoCode } from '@/types/promo-code';

export class PromoCodeService extends BaseService {
    constructor() {
        super('/promo-codes'); // Endpoint là /promo-codes
    }

    // Ghi đè phương thức getAll kèm theo kiểu dữ liệu cụ thể
    async getAllPromoCodes(params?: any): Promise<Result<PromoCode[]>> {
        return this.getAll<PromoCode>(params);
    }

    // Ghi đè phương thức getById kèm theo kiểu dữ liệu cụ thể
    async getPromoCodeById(id: string): Promise<Result<PromoCode>> {
        return this.getById<PromoCode>(id);
    }

    // Lấy danh sách mã khuyến mãi đang hoạt động
    async getActivePromoCodes(): Promise<Result<PromoCode[]>> {
        return this.get<PromoCode[]>('/active');
    }

    // Ghi đè phương thức create kèm theo kiểu dữ liệu cụ thể
    async createPromoCode(data: CreatePromoCodeDto): Promise<Result<PromoCode>> {
        return this.create<PromoCode, CreatePromoCodeDto>(data);
    }

    // Ghi đè phương thức update kèm theo kiểu dữ liệu cụ thể
    async updatePromoCode(id: string, data: UpdatePromoCodeDto): Promise<Result<PromoCode>> {
        return this.update<PromoCode, UpdatePromoCodeDto>(id, data);
    }

    // Ghi đè phương thức delete kèm theo kiểu dữ liệu cụ thể
    async deletePromoCode(id: string): Promise<Result<PromoCode>> {
        return this.delete<PromoCode>(id);
    }

    // Áp dụng mã khuyến mãi
    async applyPromoCode(code: string, cartId: string): Promise<Result<any>> {
        return this.post<any>('/apply', { code, cartId });
    }
}

// Khởi tạo và export instance để sử dụng xuyên suốt ứng dụng
export const promoCodeService = new PromoCodeService();
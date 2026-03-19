import { BaseService } from './base-service';
import { Result } from '@/types';
import { ReturnRequest, ReturnRequestList, CreateReturnRequest } from '@/types/return-request';

class ReturnService extends BaseService {
    constructor() {
        super('/returns');
    }

    /**
     * Tạo yêu cầu đổi/trả hàng
     */
    async createReturn(data: CreateReturnRequest): Promise<Result<string>> {
        return await this.create<string, CreateReturnRequest>(data);
    }

    /**
     * Lấy danh sách đổi/trả của khách hàng hiện tại
     */
    async getMyReturns(): Promise<Result<ReturnRequestList[]>> {
        return await this.get<ReturnRequestList[]>('/returns/my-returns');
    }

    /**
     * Xem chi tiết yêu cầu đổi/trả
     */
    async getReturnById(id: string): Promise<Result<ReturnRequest>> {
        return await this.getById<ReturnRequest>(id);
    }
}

const returnService = new ReturnService();
export default returnService;

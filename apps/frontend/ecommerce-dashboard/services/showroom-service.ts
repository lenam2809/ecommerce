import { Result } from '@/types';
import { BaseService } from './base-service';
import {
    Showroom,
    ShowroomInventoryItem,
    CreateShowroomDto,
    UpdateShowroomDto,
    UpdateShowroomInventoryDto,
    StockTransferRequest,
    ShowroomFilterParams
} from '@/types/showroom';

export class ShowroomService extends BaseService {
    constructor() {
        super('/showrooms');
    }

    /**
     * Lấy toàn bộ Showrooms cho trang quản trị kèm số liệu tồn kho
     */
    async getAdminShowrooms(params?: ShowroomFilterParams): Promise<Result<Showroom[]>> {
        return this.get<Showroom[]>('/showrooms/admin', params);
    }

    /**
     * Lấy danh sách showroom hoạt động (public hoặc theo tỉnh)
     */
    async getAllShowrooms(province?: string): Promise<Result<Showroom[]>> {
        return this.getAll<Showroom>({ province });
    }

    /**
     * Lấy chi tiết một Showroom theo Id
     */
    async getShowroomById(id: string): Promise<Result<Showroom>> {
        return this.getById<Showroom>(id);
    }

    /**
     * Tạo mới Showroom
     */
    async createShowroom(data: CreateShowroomDto): Promise<Result<Showroom>> {
        return this.create<Showroom, CreateShowroomDto>(data);
    }

    /**
     * Cập nhật Showroom
     */
    async updateShowroom(id: string, data: UpdateShowroomDto): Promise<Result<Showroom>> {
        return this.update<Showroom, UpdateShowroomDto>(id, data);
    }

    /**
     * Xóa mềm Showroom
     */
    async deleteShowroom(id: string): Promise<Result<boolean>> {
        return this.delete<boolean>(id);
    }

    /**
     * Lấy danh sách tồn kho O2O tại một cơ sở Showroom
     */
    async getShowroomInventory(showroomId: string, search?: string): Promise<Result<ShowroomInventoryItem[]>> {
        return this.get<ShowroomInventoryItem[]>(`/showrooms/${showroomId}/inventory`, { search });
    }

    /**
     * Cập nhật nhanh số lượng và cờ giao 2H của SKU tại Showroom
     */
    async updateShowroomInventory(
        showroomId: string,
        data: UpdateShowroomInventoryDto
    ): Promise<Result<ShowroomInventoryItem>> {
        return this.put<ShowroomInventoryItem>(`/showrooms/${showroomId}/inventory`, data);
    }

    /**
     * Điều chuyển tồn kho an toàn giữa 2 cơ sở Showroom
     */
    async transferStock(data: StockTransferRequest): Promise<Result<boolean>> {
        return this.post<boolean>('/showrooms/transfer-stock', data);
    }
}

export const showroomService = new ShowroomService();

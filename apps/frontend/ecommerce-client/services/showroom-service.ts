import { BaseService } from './base-service';
import { Result } from '@/types';
import { Showroom, ShowroomStock } from '@/types/showroom';

class ShowroomService extends BaseService {
  constructor() {
    super('/showrooms');
  }

  async getShowrooms(params?: { province?: string; region?: string }): Promise<Result<Showroom[]>> {
    return await this.get<Showroom[]>('/showrooms', params);
  }

  async checkProductStock(productId: string, skuId?: string): Promise<Result<ShowroomStock[]>> {
    return await this.get<ShowroomStock[]>('/showrooms/check-stock', { productId, skuId });
  }
}

const showroomService = new ShowroomService();
export default showroomService;

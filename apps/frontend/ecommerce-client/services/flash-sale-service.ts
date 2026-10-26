import { BaseService } from './base-service';
import { Result } from '@/types';
import { FlashSale } from '@/types/flash-sale';

class FlashSaleService extends BaseService {
  constructor() {
    super('/promotions');
  }

  async getCurrentFlashSale(): Promise<Result<FlashSale>> {
    return await this.get<FlashSale>('/promotions/flash-sale/current');
  }
}

const flashSaleService = new FlashSaleService();
export default flashSaleService;

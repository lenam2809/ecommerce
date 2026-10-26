import { CreateOrderRequest, Order } from '@/types/order';
import { BaseService } from './base-service';
import { Result } from '@/types';

class CheckoutService extends BaseService {
  constructor() {
    super('/orders');
  }

  async checkout(orderData: CreateOrderRequest): Promise<Result<string>> {
    const payload: CreateOrderRequest = {
      ...orderData,
      invoice: orderData.invoice || orderData.invoiceInfo,
      showroomId: orderData.showroomId || orderData.pickupShowroomId,
      pickupShowroomId: orderData.pickupShowroomId || orderData.showroomId,
    };
    return await this.create<string, CreateOrderRequest>(payload);
  }

  async getOrderById(id: string): Promise<Result<Order>> {
    return await this.getById<Order>(id);
  }
}

const checkoutService = new CheckoutService();
export default checkoutService;

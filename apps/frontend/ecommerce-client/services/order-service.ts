import { CreateOrderRequest, Order, OrderFilters, OrdersResponse, UpdateOrderRequest, OrderStatus } from '@/types/order';
import { BaseService } from './base-service';
import { Result } from '@/types';

class OrderService extends BaseService {
    constructor() {
        super('/orders');
    }

    async getOrders(filters: OrderFilters = {}): Promise<Result<OrdersResponse>> {
        return await this.get<OrdersResponse>('/orders/paged', filters);
    }

    async getMyOrders(): Promise<Result<Order[]>> {
        return await this.get<Order[]>('/orders/my-orders');
    }

    async getOrderById(id: string): Promise<Result<Order>> {
        return await this.getById<Order>(id);
    }

    async createOrder(orderData: CreateOrderRequest): Promise<Result<string>> {
        return await this.create<string, CreateOrderRequest>(orderData);
    }

    async updateOrder(id: string, orderData: UpdateOrderRequest): Promise<Result<void>> {
        return await this.update<void, UpdateOrderRequest>(id, orderData);
    }

    async updateOrderStatus(id: string, status: OrderStatus): Promise<Result<Order>> {
        return await this.put<Order>(`/${id}/status`, status);
    }

    async deleteOrder(id: string): Promise<Result<void>> {
        return await this.delete<void>(id);
    }
}

const orderService = new OrderService();
export default orderService;

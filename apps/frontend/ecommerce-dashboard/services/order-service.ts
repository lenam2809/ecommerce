import api from '@/lib/axios';
import { BaseService } from './base-service';
import { Result } from '@/types';
import { EOrderStatus, GetOrderHistoryOverviewParams, GetOrderHistoryParams, Order, OrderHistory, OrderHistoryOverview } from '@/types/order';

export class OrderService extends BaseService {
    constructor() {
        super('/orders'); // Endpoint is /orders
    }

    // Override the getAll method with specific type
    async getAllOrders(params?: any): Promise<Result<Order[]>> {
        return this.getAll<Order>(params);
    }

    // Override the getById method with specific type
    async getOrderById(id: string): Promise<Result<Order>> {
        return this.getById(id);
    }

    // Update order status
    async updateOrderStatus(id: string, status: EOrderStatus, expectedDeliveryDate?: Date): Promise<Result<Order>> {
        const response = await api.put(`/orders/${id}/status`, { status, expectedDeliveryDate });
        return response.data;
    }

    // Delete order
    async deleteOrder(id: string): Promise<Result<Order>> {
        return this.delete<Order>(id);
    }

    // Create new order
    async createOrder(orderData: any): Promise<Result<Order>> {
        const response = await api.post('/orders', orderData);
        return response.data;
    }

    async updateOrder(orderData: any): Promise<Result<Order>> {
        const response = await api.put(`/orders/${orderData.id}`, orderData);
        return response.data;
    }

    // Get order history - lấy lịch sử thay đổi của một đơn hàng cụ thể
    async getOrderHistory(params: GetOrderHistoryParams): Promise<Result<OrderHistory[]>> {
        const { orderId, pageNumber = 1, pageSize = 20 } = params;
        const response = await api.get(`/orders/${orderId}/history`, {
            params: { pageNumber, pageSize }
        });
        return response.data;
    }

    // Get order history overview - Admin endpoint: thống kê tổng quan lịch sử đơn hàng
    async getOrderHistoryOverview(params?: GetOrderHistoryOverviewParams): Promise<Result<OrderHistoryOverview>> {
        const response = await api.get('/orders/history-overview', {
            params: params ? {
                fromDate: params.fromDate,
                toDate: params.toDate
            } : undefined
        });
        return response.data;
    }
}

// Initialize and export instance for use throughout the application
export const orderService = new OrderService();
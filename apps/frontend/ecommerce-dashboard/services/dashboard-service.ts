import api from '@/lib/axios';
import { BaseService } from './base-service';
import { Result } from '@/types';

export interface RevenueByDateData {
    date: string;
    revenue: number;
}

export interface CustomersByDateData {
    date: string;
    newUsers: number;
}

export interface OrdersByDateData {
    date: string;
    newOrders: number;
}

export interface ProductsByDateData {
    date: string;
    newProducts: number;
}

export interface TopProduct {
    productId: string;
    productName: string;
    quantitySold: number;
}

export interface CardData {
    title: string
    value: string
    description: string
    trend: {
        value: string
        direction: "up" | "down"
    }
    footer: {
        status: string
        description: string
    }
}

export class DashboardService extends BaseService {
    constructor() {
        super('/dashboard'); // Base endpoint for dashboard
    }

    async getKpis(): Promise<Result<CardData[]>> {
        const response = await api.get(`${this.endpoint}/kpis`);
        return response.data;
    }

    async getRevenueData(days: number = 30): Promise<Result<RevenueByDateData[]>> {
        const response = await api.get(`${this.endpoint}/revenue-by-date`, {
            params: { days }
        });
        return response.data;
    }

    async getCustomersByDate(days: number = 30): Promise<Result<CustomersByDateData[]>> {
        const response = await api.get(`${this.endpoint}/customers-by-date`, {
            params: { days }
        });
        return response.data;
    }

    async getOrdersByDate(days: number = 30): Promise<Result<OrdersByDateData[]>> {
        const response = await api.get(`${this.endpoint}/orders-by-date`, {
            params: { days }
        });
        return response.data;
    }

    async getProductsByDate(days: number = 30): Promise<Result<ProductsByDateData[]>> {
        const response = await api.get(`${this.endpoint}/products-by-date`, {
            params: { days }
        });
        return response.data;
    }

    async getTopProducts(top: number = 5): Promise<Result<TopProduct[]>> {
        const response = await api.get(`${this.endpoint}/top-products`, {
            params: { top }
        });
        return response.data;
    }
}

// Export an instance of the service
export const dashboardService = new DashboardService();
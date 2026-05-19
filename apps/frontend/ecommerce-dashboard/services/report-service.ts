// services/report-service.ts
import { BaseService } from './base-service';
import {
    RevenueByMonthData,
    RevenueComparisonData,
    RevenueByCategoryData,
    RevenueByMonthFilters,
    RevenueComparisonFilters,
    RevenueByCategoryFilters,
    RevenueTrendData,
    RevenueTrendFilters,
    OrderStatusFilters,
    OrderStatusData,
    OrderRatioFilters,
    OrderRatioData,
    AverageOrderValueFilters,
    AverageOrderValueData,
    TopProductsFilters,
    TopProductData,
    LowStockProductsFilters,
    LowStockProductData,
    ProductReturnRateFilters,
    ProductReturnRateData,
    ProductsByCategoryFilters,
    ProductsByCategoryData,
    ProductPerformanceFilters,
    ProductPerformanceData,
    RecentOrderData,
    OrderOverviewData,
    RecentOrdersFilters,
    OrderOverviewFilters,
    RecentTransactionData,
    RecentTransactionsFilters,
    RevenueOverviewData,
    RevenueOverviewFilters,
    TopUsersFilters,
    TopUserData,
    UserActivityFilters,
    UserActivityData,
    UserSegmentationFilters,
    UserSegmentationData
} from '@/types/report';

export class ReportService extends BaseService {
    constructor() {
        super('/reports');
    }

    async getRevenueByMonth(filters: RevenueByMonthFilters) {
        return this.get<RevenueByMonthData[]>('/reports/revenue-by-month', filters);
    }

    async getRevenueComparison(filters: RevenueComparisonFilters) {
        return this.get<RevenueComparisonData[]>('/reports/revenue-comparison', filters);
    }

    async getRevenueByCategory(filters: RevenueByCategoryFilters) {
        return this.get<RevenueByCategoryData[]>('/reports/revenue-by-category', filters);
    }

    async getRevenueTrend(filters: RevenueTrendFilters) {
        return this.get<RevenueTrendData[]>('/reports/revenue-trend', filters);
    }

    async getOrderStatus(filters: OrderStatusFilters) {
        return this.get<OrderStatusData[]>('/reports/order-status', filters);
    }

    async getOrderRatio(filters: OrderRatioFilters) {
        return this.get<OrderRatioData[]>('/reports/order-ratio', filters);
    }

    async getAverageOrderValue(filters: AverageOrderValueFilters) {
        return this.get<AverageOrderValueData[]>('/reports/average-order-value', filters);
    }

    // Product Reports
    async getTopProducts(filters: TopProductsFilters) {
        return this.get<TopProductData[]>('/reports/top-products', filters);
    }

    async getLowStockProducts(filters: LowStockProductsFilters) {
        return this.get<LowStockProductData[]>('/reports/low-stock-products', filters);
    }

    async getProductReturnRate(filters: ProductReturnRateFilters) {
        return this.get<ProductReturnRateData[]>('/reports/product-return-rate', filters);
    }

    async getProductsByCategory(filters: ProductsByCategoryFilters) {
        return this.get<ProductsByCategoryData[]>('/reports/products-by-category', filters);
    }

    async getProductPerformance(filters: ProductPerformanceFilters) {
        return this.get<ProductPerformanceData[]>('/reports/product-performance', filters);
    }

    async getRevenueOverview(filters: RevenueOverviewFilters) {
        return this.get<RevenueOverviewData>('/reports/revenue-overview', filters);
    }

    async getRecentTransactions(filters: RecentTransactionsFilters) {
        return this.get<RecentTransactionData[]>('/reports/recent-transactions', filters);
    }

    async getOrderOverview(filters: OrderOverviewFilters) {
        return this.get<OrderOverviewData>('/reports/order-overview', filters);
    }

    async getRecentOrders(filters: RecentOrdersFilters) {
        return this.get<RecentOrderData[]>('/reports/recent-orders', filters);
    }

    // Thêm các phương thức mới vào ReportService class
    async getTopUsers(filters: TopUsersFilters) {
        return this.get<TopUserData[]>('/reports/top-users', filters);
    }

    async getUserActivity(filters: UserActivityFilters) {
        return this.get<UserActivityData[]>('/reports/user-activity', filters);
    }

    async getUserSegmentation(filters: UserSegmentationFilters) {
        return this.get<UserSegmentationData[]>('/reports/user-segmentation', filters);
    }
}

export const reportService = new ReportService();

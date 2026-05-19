// hooks/use-report.ts
"use client"

import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/report-service';
import {
    RevenueByMonthFilters,
    RevenueComparisonFilters,
    RevenueByCategoryFilters,
    RevenueTrendFilters,
    OrderStatusFilters,
    OrderRatioFilters,
    AverageOrderValueFilters,
    TopProductsFilters,
    LowStockProductsFilters,
    ProductReturnRateFilters,
    ProductsByCategoryFilters,
    ProductPerformanceFilters,
    RevenueOverviewFilters,
    RecentTransactionsFilters,
    OrderOverviewFilters,
    RecentOrdersFilters,
    TopUsersFilters,
    UserActivityFilters,
    UserSegmentationFilters
} from '@/types/report';

const reportKeys = {
    all: ['reports'] as const,
    revenueByMonth: (filters: RevenueByMonthFilters) => [...reportKeys.all, 'revenue-by-month', filters] as const,
    revenueComparison: (filters: RevenueComparisonFilters) => [...reportKeys.all, 'revenue-comparison', filters] as const,
    revenueByCategory: (filters: RevenueByCategoryFilters) => [...reportKeys.all, 'revenue-by-category', filters] as const,
    revenueTrend: (filters: RevenueTrendFilters) => [...reportKeys.all, 'revenue-trend', filters] as const,
    orderStatus: (filters: OrderStatusFilters) => [...reportKeys.all, 'order-status', filters] as const,
    orderRatio: (filters: OrderRatioFilters) => [...reportKeys.all, 'order-ratio', filters] as const,
    averageOrderValue: (filters: AverageOrderValueFilters) => [...reportKeys.all, 'average-order-value', filters] as const,
    // Product Reports
    topProducts: (filters: TopProductsFilters) => [...reportKeys.all, 'top-products', filters] as const,
    lowStockProducts: (filters: LowStockProductsFilters) => [...reportKeys.all, 'low-stock-products', filters] as const,
    productReturnRate: (filters: ProductReturnRateFilters) => [...reportKeys.all, 'product-return-rate', filters] as const,
    productsByCategory: (filters: ProductsByCategoryFilters) => [...reportKeys.all, 'products-by-category', filters] as const,
    productPerformance: (filters: ProductPerformanceFilters) => [...reportKeys.all, 'product-performance', filters] as const,

    topUsers: (filters: TopUsersFilters) => [...reportKeys.all, 'top-users', filters] as const,
    userActivity: (filters: UserActivityFilters) => [...reportKeys.all, 'user-activity', filters] as const,
    userSegmentation: (filters: UserSegmentationFilters) => [...reportKeys.all, 'user-segmentation', filters] as const,
};

export const useRevenueByMonth = (filters: RevenueByMonthFilters) => {
    return useQuery({
        queryKey: reportKeys.revenueByMonth(filters),
        queryFn: () => reportService.getRevenueByMonth(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useRevenueComparison = (filters: RevenueComparisonFilters) => {
    return useQuery({
        queryKey: reportKeys.revenueComparison(filters),
        queryFn: () => reportService.getRevenueComparison(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useRevenueByCategory = (filters: RevenueByCategoryFilters) => {
    return useQuery({
        queryKey: reportKeys.revenueByCategory(filters),
        queryFn: () => reportService.getRevenueByCategory(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useRevenueTrend = (filters: RevenueTrendFilters) => {
    return useQuery({
        queryKey: reportKeys.revenueTrend(filters),
        queryFn: () => reportService.getRevenueTrend(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useOrderStatus = (filters: OrderStatusFilters) => {
    return useQuery({
        queryKey: reportKeys.orderStatus(filters),
        queryFn: () => reportService.getOrderStatus(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useOrderRatio = (filters: OrderRatioFilters) => {
    return useQuery({
        queryKey: reportKeys.orderRatio(filters),
        queryFn: () => reportService.getOrderRatio(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useAverageOrderValue = (filters: AverageOrderValueFilters) => {
    return useQuery({
        queryKey: reportKeys.averageOrderValue(filters),
        queryFn: () => reportService.getAverageOrderValue(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Product Reports
export const useTopProducts = (filters: TopProductsFilters) => {
    return useQuery({
        queryKey: reportKeys.topProducts(filters),
        queryFn: () => reportService.getTopProducts(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useLowStockProducts = (filters: LowStockProductsFilters) => {
    return useQuery({
        queryKey: reportKeys.lowStockProducts(filters),
        queryFn: () => reportService.getLowStockProducts(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useProductReturnRate = (filters: ProductReturnRateFilters) => {
    return useQuery({
        queryKey: reportKeys.productReturnRate(filters),
        queryFn: () => reportService.getProductReturnRate(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useProductsByCategory = (filters: ProductsByCategoryFilters) => {
    return useQuery({
        queryKey: reportKeys.productsByCategory(filters),
        queryFn: () => reportService.getProductsByCategory(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useProductPerformance = (filters: ProductPerformanceFilters) => {
    return useQuery({
        queryKey: reportKeys.productPerformance(filters),
        queryFn: () => reportService.getProductPerformance(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};


// New hooks for the new APIs
export const useRevenueOverview = (filters: RevenueOverviewFilters) => {
    return useQuery({
        queryKey: ["revenue-overview", filters],
        queryFn: () => reportService.getRevenueOverview(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useRecentTransactions = (filters: RecentTransactionsFilters) => {
    return useQuery({
        queryKey: ["recent-transactions", filters],
        queryFn: () => reportService.getRecentTransactions(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useOrderOverview = (filters: OrderOverviewFilters) => {
    return useQuery({
        queryKey: ["order-overview", filters],
        queryFn: () => reportService.getOrderOverview(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useRecentOrders = (filters: RecentOrdersFilters) => {
    return useQuery({
        queryKey: ["recent-orders", filters],
        queryFn: () => reportService.getRecentOrders(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};


export const useTopUsers = (filters: TopUsersFilters) => {
    return useQuery({
        queryKey: reportKeys.topUsers(filters),
        queryFn: () => reportService.getTopUsers(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useUserActivity = (filters: UserActivityFilters) => {
    return useQuery({
        queryKey: reportKeys.userActivity(filters),
        queryFn: () => reportService.getUserActivity(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useUserSegmentation = (filters: UserSegmentationFilters) => {
    return useQuery({
        queryKey: reportKeys.userSegmentation(filters),
        queryFn: () => reportService.getUserSegmentation(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

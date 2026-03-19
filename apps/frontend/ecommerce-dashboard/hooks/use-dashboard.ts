"use client";

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard-service';

// Key factory for dashboard queries
const dashboardKeys = {
    all: ['dashboard'] as const,
    kpis: () => [...dashboardKeys.all, 'kpis'] as const,
    revenue: (days: number) => [...dashboardKeys.all, 'revenue', days] as const,
    customers: (days: number) => [...dashboardKeys.all, 'customers', days] as const,
    orders: (days: number) => [...dashboardKeys.all, 'orders', days] as const,
    products: (days: number) => [...dashboardKeys.all, 'products', days] as const,
    topProducts: (top: number) => [...dashboardKeys.all, 'top-products', top] as const,
};

export const useKpiData = () => {
    return useQuery({
        queryKey: dashboardKeys.kpis(),
        queryFn: () => dashboardService.getKpis(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useRevenueData = (days: number = 30) => {
    return useQuery({
        queryKey: dashboardKeys.revenue(days),
        queryFn: () => dashboardService.getRevenueData(days),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useCustomersData = (days: number = 30) => {
    return useQuery({
        queryKey: dashboardKeys.customers(days),
        queryFn: () => dashboardService.getCustomersByDate(days),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useOrdersData = (days: number = 30) => {
    return useQuery({
        queryKey: dashboardKeys.orders(days),
        queryFn: () => dashboardService.getOrdersByDate(days),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useProductsData = (days: number = 30) => {
    return useQuery({
        queryKey: dashboardKeys.products(days),
        queryFn: () => dashboardService.getProductsByDate(days),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};


export const useTopProductsData = (top: number = 5) => {
    return useQuery({
        queryKey: dashboardKeys.topProducts(top),
        queryFn: () => dashboardService.getTopProducts(top),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
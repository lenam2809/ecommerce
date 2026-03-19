// types/report.ts
export interface RevenueByMonthData {
    name: string;
    total: number;
    month: number;
    year: number;
}

export interface RevenueComparisonData {
    name: string;
    current: number;
    previous: number;
    growthRate: number;
    month: number;
    year: number;
}

export interface RevenueByCategoryData {
    name: string;
    value: number;
    percentage: number;
}

export interface RevenueTrendData {
    name: string;
    revenue: number;
    week: number;
    year: number;
    startDate: string;
    endDate: string;
}

export interface OrderStatusData {
    name: string;
    value: number;
    percentage: number;
    status: string;
}

export interface OrderRatioData {
    name: string;
    month: number;
    year: number;
    success: number;
    cancel: number;
    totalOrders: number;
}

export interface AverageOrderValueData {
    name: string;
    month: number;
    year: number;
    aov: number;
    totalOrders: number;
    totalRevenue: number;
}

// Product Report Types
export interface TopProductData {
    productId: string;
    name: string;
    sku: string;
    revenue: number;
    totalQuantitySold: number;
    totalOrders: number;
    averageOrderValue: number;
}

export interface LowStockProductData {
    productId: string;
    name: string;
    sku: string;
    currentStock: number;
    minimumStock: number;
    stockStatus: string;
    price: number;
    categoryName: string;
}

export interface ProductReturnRateData {
    productId: string;
    name: string;
    sku: string;
    totalSold: number;
    totalReturned: number;
    returnRate: number;
    revenue: number;
    categoryName: string;
}

export interface ProductsByCategoryData {
    categoryId: string;
    name: string;
    productCount: number;
    totalRevenue: number;
    percentage: number;
    totalQuantitySold: number;
    averageProductPrice: number;
}

export interface ProductPerformanceData {
    productId: string;
    name: string;
    sku: string;
    revenue: number;
    quantitySold: number;
    totalOrders: number;
    returnRate: number;
    currentStock: number;
    categoryName: string;
    rating: number;
    reviewCount: number;
}

export interface RevenueOverviewData {
    totalRevenue: number;
    thisMonthRevenue: number;
    thisWeekRevenue: number;
    todayRevenue: number;
    monthGrowthPercentage: number;
    weekGrowthPercentage: number;
    dayGrowthPercentage: number;
}

export interface RecentTransactionData {
    customerName: string;
    customerEmail: string;
    amount: number;
    orderDate: string;
}

export interface OrderOverviewData {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    canceledOrders: number;
    totalGrowthPercentage: number;
    completedGrowthPercentage: number;
    pendingGrowthPercentage: number;
    canceledGrowthPercentage: number;
}

export interface RecentOrderData {
    orderId: string;
    orderCode: string;
    customerName: string;
    itemCount: number;
    totalAmount: number;
}


// Filter interfaces
export interface RevenueByMonthFilters {
    year: number;
    monthsCount: number;
}

export interface RevenueComparisonFilters {
    currentYear: number;
    previousYear: number;
    monthsCount: number;
}

export interface RevenueByCategoryFilters {
    startDate: Date;
    endDate: Date;
    topN: number;
}

export interface RevenueTrendFilters {
    startDate: Date;
    endDate: Date;
    weeksCount: number;
}

export interface OrderStatusFilters {
    startDate?: Date;
    endDate?: Date;
}

export interface OrderRatioFilters {
    startDate?: Date;
    endDate?: Date;
    monthsCount?: number;
}

export interface AverageOrderValueFilters {
    startDate?: Date;
    endDate?: Date;
    monthsCount?: number;
}


export interface TopProductsFilters {
    startDate?: Date;
    endDate?: Date;
    topN?: number;
    categoryId?: string;
    orderBy?: 'Revenue' | 'Quantity' | 'Orders';
}

export interface LowStockProductsFilters {
    minStock?: number;
    categoryId?: string;
    stockStatus?: 'Critical' | 'Low' | 'All';
}

export interface ProductReturnRateFilters {
    startDate?: Date;
    endDate?: Date;
    topN?: number;
    categoryId?: string;
    minReturnRate?: number;
}

export interface ProductsByCategoryFilters {
    startDate?: Date;
    endDate?: Date;
    includeInactive?: boolean;
}

export interface ProductPerformanceFilters {
    startDate?: Date;
    endDate?: Date;
    categoryId?: string;
    topN?: number;
}

// New interfaces for the new APIs
export interface RevenueOverviewFilters {
    startDate?: Date;
    endDate?: Date;
}

export interface RecentTransactionsFilters {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
}

export interface OrderOverviewFilters {
    startDate?: Date;
    endDate?: Date;
}

export interface RecentOrdersFilters {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
}


// Thêm các interface mới
export interface TopUserData {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    totalSpent: number;
    orderCount: number;
    lastActivity: string;
    customerLevel: string;
}

export interface UserActivityData {
    date: string;
    logins: number;
    purchases: number;
    pageViews: number;
}

export interface UserSegmentationData {
    segment: string;
    count: number;
    percentage: number;
}

export interface TopUsersFilters {
    topN?: number;
    orderBy?: 'TotalSpent' | 'OrderCount' | 'LastActivity';
    startDate?: Date;
    endDate?: Date;
}

export interface UserActivityFilters {
    days?: number;
    activityType?: 'All' | 'Purchases' | 'Logins' | 'PageViews';
}

export interface UserSegmentationFilters {
    includeInactive?: boolean;
    startDate?: Date;
    endDate?: Date;
}


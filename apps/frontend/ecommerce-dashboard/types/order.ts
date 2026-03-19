// Define the Order interface based on the OrderDto.cs
export interface OrderItem {
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    name: string;
    image: string;
    color: string;
    size: string;
    dateAdded: string;
}

export interface Order {
    id: string;
    code: string;
    applicationUserId: string;
    totalAmount: number;
    orderDate: string;
    shippingAddress: string;
    phone: string;
    email: string;
    status: EOrderStatus;
    statusName: string;
    discountCode: string;
    deliveryInstructions: string;
    expectedDeliveryDate: string;
    createdAt: string;
    updatedAt: string;
    customerName: string;
    orderItems: OrderItem[];
}


export enum EOrderStatus {
    Pending,
    Processing,
    Shipped,
    Completed,
    Cancelled,
    Refunded,
    Delivered,
    ReturnRequested,
    Returned
}

export const getStatusBadgeVariant = (status: EOrderStatus): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
        case EOrderStatus.Pending:
            return 'outline';
        case EOrderStatus.Processing:
            return 'secondary';
        case EOrderStatus.Shipped:
            return 'default';
        case EOrderStatus.Delivered:
            return 'secondary';
        case EOrderStatus.Cancelled:
            return 'destructive';
        default:
            return 'outline';
    }
};

// Hàm lấy tên trạng thái
export const getStatusName = (status: EOrderStatus) => {
    switch (status) {
        case EOrderStatus.Pending:
            return "Chờ xác nhận";
        case EOrderStatus.Processing:
            return "Đang xử lý";
        case EOrderStatus.Shipped:
            return "Đã gửi hàng";
        case EOrderStatus.Completed:
            return "Hoàn thành";
        case EOrderStatus.Cancelled:
            return "Đã hủy";
        case EOrderStatus.Refunded:
            return "Đã hoàn tiền";
        case EOrderStatus.Delivered:
            return "Đã giao hàng";
        case EOrderStatus.ReturnRequested:
            return "Yêu cầu trả hàng";
        case EOrderStatus.Returned:
            return "Đã trả hàng";
        default:
            return "Không xác định";
    }
};

// Hàm lấy màu sắc cho từng trạng thái
export const getStatusColor = (status: EOrderStatus) => {
    switch (status) {
        case EOrderStatus.Pending:
            return "text-amber-500 bg-amber-50";
        case EOrderStatus.Processing:
            return "text-blue-500 bg-blue-50";
        case EOrderStatus.Shipped:
            return "text-indigo-500 bg-indigo-50";
        case EOrderStatus.Completed:
            return "text-green-600 bg-green-50";
        case EOrderStatus.Cancelled:
            return "text-red-500 bg-red-50";
        case EOrderStatus.Refunded:
            return "text-orange-500 bg-orange-50";
        case EOrderStatus.Delivered:
            return "text-green-500 bg-green-50";
        case EOrderStatus.ReturnRequested:
            return "text-purple-500 bg-purple-50";
        case EOrderStatus.Returned:
            return "text-gray-500 bg-gray-50";
        default:
            return "";
    }
};


// Types cho Order History dựa trên OrderHistoryDto.cs
export interface OrderHistory {
    id: string;
    orderId: string;
    fromStatus: string;
    toStatus: string;
    notes: string;
    changedBy: string;
    changeSource: string;
    changedAt: string;
    previousTotalAmount?: number;
    newTotalAmount?: number;
    previousShippingAddress?: string;
    newShippingAddress?: string;
    previousExpectedDeliveryDate?: string;
    newExpectedDeliveryDate?: string;
    previousDiscountCode?: string;
    newDiscountCode?: string;
    additionalData?: Record<string, any>;

    // Computed properties
    statusChangeDescription: string;
    changeType: string;
    hasAmountChange: boolean;
    hasAddressChange: boolean;
    hasDeliveryDateChange: boolean;
}

// Types cho Order History Overview
export interface OrderHistoryOverview {
    period: {
        from?: string;
        to?: string;
    };
    summary: {
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
    };
    statusDistribution: Array<{
        status: string;
        count: number;
        percentage: number;
    }>;
    dailyTrends: Array<{
        date: string;
        orderCount: number;
        revenue: number;
    }>;
}

// Types cho My Order History Stats
export interface MyOrderHistoryStats {
    totalOrders: number;
    statusBreakdown: Record<string, number>;
    monthlyOrderCount: Array<{
        period: string;
        count: number;
        totalAmount: number;
    }>;
    totalSpent: number;
    averageOrderValue: number;
}

// Enum cho Change Type
export enum OrderChangeType {
    STATUS_CHANGE = "STATUS_CHANGE",
    AMOUNT_CHANGE = "AMOUNT_CHANGE",
    ADDRESS_CHANGE = "ADDRESS_CHANGE",
    DELIVERY_DATE_CHANGE = "DELIVERY_DATE_CHANGE",
    INFO_UPDATE = "INFO_UPDATE"
}

// Parameters cho GetOrderHistory query
export interface GetOrderHistoryParams {
    orderId: string;
    pageNumber?: number;
    pageSize?: number;
}

// Parameters cho GetOrderHistoryOverview query
export interface GetOrderHistoryOverviewParams {
    fromDate?: string;
    toDate?: string;
}


export interface OrderItem {
    productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    image: string;
    color: string;
    size: string;
}

export interface Order {
    id: string;
    code: string;
    applicationUserId?: string | null;
    userName?: string;
    isGuestOrder?: boolean;
    guestName?: string;
    guestEmail?: string;
    guestId?: string;
    orderDate: string;
    status: string;
    totalAmount: number;
    shippingAddress: string;
    phone: string;
    email: string;
    discountCode?: string;
    deliveryInstructions?: string;
    expectedDeliveryDate?: string;
    orderItems: OrderItem[];
}

export interface OrdersResponse {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    isFirstPage: boolean;
    isLastPage: boolean;
    items: Order[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface OrderFilters {
    status?: string;
    startDate?: string;
    endDate?: string;
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
}

export interface CreateOrderItemRequest {
    productId: string;
    quantity: number;
    color?: string;
    size?: string;
}

export interface CreateOrderRequest {
    applicationUserId?: string;
    shippingAddress: string;
    phone: string;
    email: string;
    guestName?: string;
    guestId?: string;
    discountCode?: string;
    deliveryInstructions?: string;
    expectedDeliveryDate?: string;
    orderItems: CreateOrderItemRequest[];
}

export interface UpdateOrderRequest {
    id: string;
    shippingAddress?: string;
    phone?: string;
    email?: string;
    discountCode?: string;
    deliveryInstructions?: string;
    expectedDeliveryDate?: string;
}

export interface UpdateOrderStatusRequest {
    id: string;
    status: number; // EOrderStatus enum value
}

// Order Status Enum values to match backend
export enum OrderStatus {
    Pending = 0,
    Processing = 1,
    Shipped = 2,
    Delivered = 3,
    Cancelled = 4,
    Returned = 5
}

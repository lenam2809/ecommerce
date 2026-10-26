export interface OrderInvoice {
    requireInvoice: boolean;
    taxCode?: string;
    companyName?: string;
    companyAddress?: string;
    invoiceEmail?: string;
    invoiceFileUrl?: string;
}

export interface OrderItemSerial {
    id: string;
    serialNumber: string;
    imei?: string;
    warrantyMonths: number;
    activatedAt?: string;
    warrantyExpiresAt?: string;
    warrantyStatus: string;
}

export interface OrderItem {
    id?: string;
    productId: string;
    name: string;
    productName?: string;
    unitPrice: number;
    price?: number;
    quantity: number;
    image: string;
    imageUrl?: string;
    color?: string;
    size?: string;
    addOnId?: string;
    addOnName?: string;
    addOnPrice?: number;
    assignedSerials?: OrderItemSerial[];
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
    subtotal?: number;
    shippingCost?: number;
    discountAmount?: number;
    depositAmount?: number;
    depositRequired?: number;
    depositStatus?: number;
    deliveryMethod?: string;
    deliveryType?: number;
    showroomId?: string;
    pickupShowroomId?: string;
    shippingAddress: string;
    phone: string;
    email: string;
    paymentMethod?: string;
    paymentStatus?: string;
    transactionId?: string;
    discountCode?: string;
    deliveryInstructions?: string;
    expectedDeliveryDate?: string;
    requireInvoice?: boolean;
    invoice?: OrderInvoice;
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
    productVariantSkuId?: string;
    quantity: number;
    color?: string;
    size?: string;
    addOnId?: string;
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
    deliveryMethod?: string;
    deliveryType?: number;
    showroomId?: string;
    pickupShowroomId?: string;
    depositAmount?: number;
    invoice?: OrderInvoice;
    invoiceInfo?: OrderInvoice;
    requireInvoice?: boolean;
    taxCode?: string;
    companyName?: string;
    companyAddress?: string;
    invoiceEmail?: string;
    paymentMethod?: string;
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

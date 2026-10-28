export type ShowroomRegion = 'HCM' | 'HN' | 'DN' | 'CT' | 'Other';

export interface Showroom {
    id: string;
    code: string;
    name: string;
    region: ShowroomRegion | string;
    city: string;
    province: string;
    district: string;
    ward?: string;
    address: string;
    phone: string;
    openingHours: string;
    latitude?: number;
    longitude?: number;
    googleMapIframeUrl?: string;
    isFlagship: boolean;
    hasInstantPickup: boolean;
    isActive: boolean;
    displayOrder: number;
    totalSkusWithStock?: number;
    totalStockQuantity?: number;
}

export interface ShowroomInventoryItem {
    showroomId: string;
    productId: string;
    productVariantSkuId?: string;
    productName: string;
    productImage: string;
    skuCode: string;
    variantInfo: string;
    price: number;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    isAvailableFor2hDelivery: boolean;
    updatedAt?: string;
}

export interface CreateShowroomDto {
    code: string;
    name: string;
    region: string;
    city: string;
    province: string;
    district: string;
    ward?: string;
    address: string;
    phone: string;
    openingHours: string;
    latitude?: number;
    longitude?: number;
    googleMapIframeUrl?: string;
    isFlagship: boolean;
    hasInstantPickup: boolean;
    isActive: boolean;
    displayOrder: number;
}

export interface UpdateShowroomDto extends CreateShowroomDto {
    id: string;
}

export interface UpdateShowroomInventoryDto {
    showroomId: string;
    productId: string;
    productVariantSkuId?: string;
    quantity: number;
    reservedQuantity: number;
    isAvailableFor2hDelivery: boolean;
}

export interface StockTransferRequest {
    fromShowroomId: string;
    toShowroomId: string;
    productId: string;
    productVariantSkuId?: string;
    quantity: number;
    note?: string;
}

export interface ShowroomFilterParams {
    region?: string;
    search?: string;
    isActive?: boolean;
}

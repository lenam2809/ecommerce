export interface Showroom {
    id: string;
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

export interface ShowroomStock {
    showroomId: string;
    code: string;
    name: string;
    region: string;
    city: string;
    province: string;
    district: string;
    address: string;
    phone: string;
    quantity: number;
    stockQuantity: number;
    isAvailable: boolean;
    isAvailableFor2hDelivery: boolean;
    hasInstantPickup: boolean;
}

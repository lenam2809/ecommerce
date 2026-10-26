export interface FlashSaleItem {
    id: string;
    flashSaleId: string;
    productId: string;
    productName: string;
    productSlug: string;
    productImageUrl?: string;
    productVariantSkuId?: string;
    sku?: string;
    flashSalePrice: number;
    flashPrice: number;
    originalPrice: number;
    discountPercentage: number;
    totalQuota: number;
    quantityLimit: number;
    soldCount: number;
    soldQuantity: number;
    remainingQuantity: number;
    maxPerCustomer: number;
    isHeroFeatured: boolean;
    badgeText?: string;
    displayOrder: number;
    keySpecs: string[];
}

export interface FlashSale {
    id: string;
    code: string;
    title: string;
    subtitle?: string;
    bannerImageUrl?: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    priority: number;
    timeRemainingSeconds: number;
    items: FlashSaleItem[];
}

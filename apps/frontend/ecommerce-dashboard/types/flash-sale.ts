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
    flashPrice?: number;
    originalPrice: number;
    discountPercentage: number;
    totalQuota: number;
    quantityLimit?: number;
    soldCount: number;
    soldQuantity?: number;
    remainingQuantity: number;
    maxPerCustomer: number;
    isHeroFeatured: boolean;
    badgeText?: string;
    displayOrder: number;
    keySpecs?: string[];
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

export interface FlashSaleItemInput {
    id?: string;
    productId: string;
    productVariantSkuId?: string;
    flashSalePrice: number;
    originalPrice: number;
    totalQuota: number;
    soldCount?: number;
    maxPerCustomer?: number;
    isHeroFeatured?: boolean;
    badgeText?: string;
    displayOrder?: number;
}

export interface CreateFlashSaleInput {
    code?: string;
    title: string;
    subtitle?: string;
    bannerImageUrl?: string;
    startTime: string;
    endTime: string;
    isActive?: boolean;
    priority?: number;
    items: FlashSaleItemInput[];
}

export interface UpdateFlashSaleInput {
    id: string;
    code: string;
    title: string;
    subtitle?: string;
    bannerImageUrl?: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    priority: number;
    items: FlashSaleItemInput[];
}

export type FlashSaleCampaignStatus = "ongoing" | "upcoming" | "ended";

export const getFlashSaleStatus = (sale: { startTime: string; endTime: string; isActive?: boolean }): FlashSaleCampaignStatus => {
    const now = new Date().getTime();
    const start = new Date(sale.startTime).getTime();
    const end = new Date(sale.endTime).getTime();

    if (now < start) return "upcoming";
    if (now > end) return "ended";
    return "ongoing";
};

export const getFlashSaleStatusBadge = (status: FlashSaleCampaignStatus): { label: string; className: string } => {
    switch (status) {
        case "ongoing":
            return {
                label: "Đang diễn ra",
                className: "bg-brand/10 text-brand border-brand/20",
            };
        case "upcoming":
            return {
                label: "Sắp diễn ra",
                className: "bg-tech-blue/10 text-tech-blue border-tech-blue/20",
            };
        case "ended":
            return {
                label: "Đã kết thúc",
                className: "bg-muted text-muted-foreground border-border",
            };
    }
};

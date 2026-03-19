export interface PromoCode {
    id: string;
    code: string;
    description?: string;
    type: EPromoCodeType;
    discountPercentage: number;
    discountAmount: number;
    freeShipping: boolean;
    validFrom: Date;
    validTo: Date;
    usageLimit: number;
    timesUsed: number;
    isActive: boolean;
    isExpired: boolean;
    isAvailable: boolean;
}

export enum EPromoCodeType {
    PercentageDiscount,
    FixedAmountDiscount,
    FreeShipping,
    Mixed
}




import { ProductAddOn } from './product-addon'

export interface ProductSpecification {
    id?: string;
    name: string;
    value: string;
    groupName?: string;
    isKeySpec?: boolean;
    displayOrder?: number;
    filterKey?: string | null;
    isHighlight?: boolean;
}

export interface Product {
    id: string;
    code: string;
    name: string;
    sku: string;
    price: number;
    salePrice?: number;
    rating: number;
    reviewCount: number;
    description: string;
    stockQuantity: number;
    soldQuantity: number;
    publishedDate?: string;
    isActive: boolean;
    categoryId: string;
    brandId: string;
    mainImage: string | File;
    additionalImages?: Array<string | File>;
    specifications?: ProductSpecification[];
    colors?: string[];
    sizes?: string[];
    warrantyMonths?: number;
    warrantyPolicy?: string;
    originBadge?: string;
    addOnIds?: string[];
    addOns?: ProductAddOn[];
    availableAddOns?: ProductAddOn[];
}
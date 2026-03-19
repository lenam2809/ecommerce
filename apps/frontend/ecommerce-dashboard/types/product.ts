export interface ProductSpecification {
    name: string;
    value: string;
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
}
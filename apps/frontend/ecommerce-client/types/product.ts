export interface ProductSpecification {
    id?: string;
    name: string;
    value: string;
    specKey?: string;
    specValue?: string;
    groupName?: string;
    isKeySpec?: boolean;
    displayOrder?: number;
    isHighlight?: boolean;
}

export interface ProductAddOn {
    id: string;
    productId?: string;
    categoryId?: string;
    brandId?: string;
    code: string;
    name: string;
    description?: string;
    addOnType?: string;
    price: number;
    originalPrice?: number;
    durationMonths?: number;
    isActive: boolean;
    displayOrder?: number;
}

export interface ComparisonSpecRow {
    name: string;
    values: Record<string, string>;
}

export interface ComparisonSpecGroup {
    groupName: string;
    specs: ComparisonSpecRow[];
}

export interface ProductComparison {
    products: Product[];
    specGroups: ComparisonSpecGroup[];
}

export interface Product {
    id: string;
    code?: string;
    sku?: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number;
    rating: number;
    reviewCount?: number;
    mainImage: string;
    additionalImages?: string[];
    categoryId: string;
    categoryName: string;
    categorySlug: string;
    brandId?: string;
    brandSlug?: string;
    brandName?: string;
    description?: string;
    specifications?: ProductSpecification[];
    keySpecs?: string[];
    addOns?: ProductAddOn[];
    availableAddOns?: ProductAddOn[];
    variants?: {
        colors?: string[];
        sizes?: string[];
    };
    stockQuantity?: number;
    soldQuantity?: number;
}

export interface ProductsResponse {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    isFirstPage: boolean;
    isLastPage: boolean;
    items: Product[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface ProductFilters {
    q?: string;
    categoryIds?: string;
    categoryId?: string;
    brandIds?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    sortBy?: string;
    isDescending?: string;
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    keyword?: string;
}

export interface Review {
    id: string;
    userName: string;
    userAvatar: string;
    rating: number;
    date: string; // ISO format string (e.g., "2024-04-02T12:00:00Z")
    content: string;
    likes: number;
    replies: number;
    isVerified: boolean;
    helpfulCount: number;
    imageUrls?: string[]; // Danh sách ảnh dưới dạng URL
    productId: string;
    applicationUserId: string;
}

export interface ReviewsResponse {
    reviews: Review[];
    rating: number;
    reviewCount: number;
    ratingDistribution: RatingDistribution[];
}

export interface RatingDistribution {
    stars: number; // Số sao (1-5)
    percentage: number; // Phần trăm số lượng đánh giá
}

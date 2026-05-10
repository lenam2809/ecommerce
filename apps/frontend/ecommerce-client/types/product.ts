export interface Product {
    id: string;
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
    description?: string;
    specifications?: { name: string; value: string }[];
    variants?: {
        colors?: string[];
        sizes?: string[];
    };
    stockQuantity?: number;
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

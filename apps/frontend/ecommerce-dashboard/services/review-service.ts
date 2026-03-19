import api from '@/lib/axios';
import { Result } from '@/types';

export interface ReviewDto {
    id: string;
    userName: string;
    userAvatar: string;
    rating: number;
    date: string;
    content: string;
    likes: number;
    replies: number;
    isVerified: boolean;
    helpfulCount: number;
    imageUrls: string[];
    productId: string;
    applicationUserId: string;
}

export interface RatingDistributionDto {
    stars: number;
    percentage: number;
}

export interface ReviewsResponseDto {
    reviews: ReviewDto[];
    rating: number;
    reviewCount: number;
    ratingDistribution: RatingDistributionDto[];
}

export interface CreateReviewReplyRequest {
    content: string;
}

export interface ReviewReplyDto {
    Id: string;
    ReviewId: string;
    UserId: string;
    UserName: string;
    UserAvatar: string;
    Content: string;
    Date: string;
    Likes: number;
    IsVerified: boolean;
    IsLikedByCurrentUser: boolean;
}


export class ReviewService {
    // Lấy danh sách đánh giá của sản phẩm
    async getProductReviews(productId: string): Promise<Result<ReviewsResponseDto>> {
        const response = await api.get(`/reviews?productId=${productId}`);
        return response.data;
    }

    // Like/Unlike đánh giá
    async likeReview(reviewId: string): Promise<Result<void>> {
        const response = await api.post(`/reviews/${reviewId}/like`);
        return response.data;
    }

    // trả lời đánh giá
    async replyReview(reviewId: string, data: CreateReviewReplyRequest): Promise<Result<ReviewReplyDto>> {
        const response = await api.post(`/reviews/${reviewId}/replies`, data);
        return response.data;
    }

    // Tạo đánh giá mới (nếu cần)
    async createReview(reviewData: {
        productId: string;
        rating: number;
        content: string;
        images?: File[];
    }): Promise<Result<ReviewDto>> {
        const formData = new FormData();
        formData.append('productId', reviewData.productId);
        formData.append('rating', reviewData.rating.toString());
        formData.append('content', reviewData.content);

        if (reviewData.images && reviewData.images.length > 0) {
            reviewData.images.forEach(image => {
                formData.append('images', image);
            });
        }

        const response = await api.post('/reviews', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
}

export const reviewService = new ReviewService();
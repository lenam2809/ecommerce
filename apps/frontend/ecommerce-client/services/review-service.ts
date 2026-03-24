import { Review, ReviewsResponse } from '@/types/product';
import { BaseService } from './base-service';
import { Result } from "@/types";
import api from '@/lib/api';
import { AxiosResponse } from 'axios';
import { handleApiError } from '@/lib/api-error';
import { AppToaster } from '@/components/toast/app-toaster';

export interface CreateReviewRequest {
    productId: string;
    userId: string;
    rating: number;
    content: string;
    images?: File[];
}

export interface CreateReviewResponse {
    id: string;
    productId: string;
    userId: string;
    rating: number;
    content: string;
    date: string;
    imageUrls?: string[];
}

class ReviewService extends BaseService {
    constructor() {
        super('/reviews');
    }

    async getProductReviews(productId: string): Promise<Result<ReviewsResponse>> {
        return await this.get<ReviewsResponse>('/reviews', { productId });
    }

    async createReview(data: CreateReviewRequest): Promise<Result<CreateReviewResponse>> {
        try {
            const formData = new FormData();
            formData.append('productId', data.productId);
            formData.append('userId', data.userId);
            formData.append('rating', data.rating.toString());
            formData.append('content', data.content);

            if (data.images && data.images.length > 0) {
                data.images.forEach((image) => {
                    formData.append('images', image);
                });
            }

            const response: AxiosResponse<Result<CreateReviewResponse>> = await api.post('/reviews', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            handleApiError({
                error,
                context: { endpoint: '/reviews', operation: 'createReview' },
                devTitle: 'Lỗi khi tạo đánh giá',
                notify: ({ title, description, id }) => {
                    AppToaster.error(title, { description, id })
                },
            })
            throw error;
        }
    }

    async likeReview(reviewId: string): Promise<Result<void>> {
        return await this.post<void>(`/reviews/${reviewId}/like`, {});
    }

    async getReviewReplies(reviewId: string): Promise<Result<Review[]>> {
        return await this.get<Review[]>(`/reviews/${reviewId}/replies`);
    }

    async createReviewReply(reviewId: string, content: string): Promise<Result<Review>> {
        return await this.post<Review>(`/reviews/${reviewId}/replies`, { content });
    }
}

const reviewService = new ReviewService();
export default reviewService;
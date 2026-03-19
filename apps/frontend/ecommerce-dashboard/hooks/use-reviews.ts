"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateReviewReplyRequest, reviewService } from '@/services/review-service';
import { toast } from './use-toast';

// Key factory cho quản lý cache hiệu quả
const reviewKeys = {
    all: ['reviews'] as const,
    lists: () => [...reviewKeys.all, 'list'] as const,
    list: (productId: string) => [...reviewKeys.lists(), productId] as const,
};

export const useGetProductReviews = (productId: string) => {
    return useQuery({
        queryKey: reviewKeys.list(productId),
        queryFn: () => reviewService.getProductReviews(productId),
        enabled: !!productId, // Chỉ chạy query khi có productId
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useLikeReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reviewId: string) => reviewService.likeReview(reviewId),
        onSuccess: () => {
            // Invalidate tất cả queries liên quan đến reviews
            queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi",
                description: error.response?.data?.message || 'Có lỗi xảy ra khi thực hiện thao tác.',
                variant: "destructive",
            });
        }
    });
};

export const useReplyReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId, data }: { reviewId: string; data: CreateReviewReplyRequest }) =>
            reviewService.replyReview(reviewId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi",
                description: error.response?.data?.message || 'Có lỗi xảy ra khi thực hiện thao tác.',
                variant: "destructive",
            });
        },
    });
};


export const useCreateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reviewData: {
            productId: string;
            rating: number;
            content: string;
            images?: File[];
        }) => reviewService.createReview(reviewData),
        onSuccess: (_, variables) => {
            toast({
                title: "Thành công",
                description: 'Đánh giá của bạn đã được gửi thành công!',
            });
            // Invalidate reviews của sản phẩm
            queryClient.invalidateQueries({ queryKey: reviewKeys.list(variables.productId) });
        },
        onError: (error: any) => {
            toast({
                title: "Lỗi",
                description: error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.',
                variant: "destructive",
            });
        }
    });
};
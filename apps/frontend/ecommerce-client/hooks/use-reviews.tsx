"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import reviewService, { CreateReviewRequest } from "@/services/review-service";
import { AppToaster } from "@/components/toast/app-toaster"; // Assuming you're using sonner for notifications

export function useProductReviews(productId: string) {
    return useQuery({
        queryKey: ["reviews", productId],
        queryFn: () => reviewService.getProductReviews(productId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!productId,
        select: (data) => {
            return data.data;
        },
        throwOnError: true,
    });
}

export function useCreateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateReviewRequest) => reviewService.createReview(data),
        onSuccess: (result, variables) => {
            // Invalidate and refetch product reviews
            queryClient.invalidateQueries({
                queryKey: ["reviews", variables.productId]
            });

            // Also invalidate product data to update review count/rating
            queryClient.invalidateQueries({
                queryKey: ["product", variables.productId]
            });

            if (result.success) {
                AppToaster.success("Đánh giá được tạo thành công!");
            }
        },
    });
}

export function useLikeReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reviewId: string) => reviewService.likeReview(reviewId),
        onSuccess: (result, reviewId) => {
            // Invalidate all review queries to update like counts
            queryClient.invalidateQueries({
                queryKey: ["reviews"]
            });

            if (result.success) {
                AppToaster.success("Đã thích!");
            }
        },
    });
}

export function useReviewReplies(reviewId: string) {
    return useQuery({
        queryKey: ["review-replies", reviewId],
        queryFn: () => reviewService.getReviewReplies(reviewId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!reviewId,
        select: (data) => {
            return data.data;
        },
        throwOnError: true,
    });
}

export function useCreateReviewReply(productId: string | undefined, content: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId, content }: { reviewId: string; content: string }) =>
            reviewService.createReviewReply(reviewId, content),
        onSuccess: (result, variables) => {
            // Invalidate review replies
            queryClient.invalidateQueries({
                queryKey: ["review-replies", variables.reviewId]
            });

            // Also invalidate main reviews to update reply count
            queryClient.invalidateQueries({
                queryKey: ["reviews"]
            });

            if (result.success) {
                AppToaster.success("Trả lời đánh giá thành công!");
            }
        },
    });
}
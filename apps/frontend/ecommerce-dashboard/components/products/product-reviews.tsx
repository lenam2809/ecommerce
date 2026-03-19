"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Star,
    ThumbsUp,
    MessageCircle,
    Verified,
    Loader2
} from "lucide-react";
import { Product } from "@/types/product";
import { useGetProductReviews, useLikeReview, useReplyReview } from "@/hooks/use-reviews";
import { ReviewDto, RatingDistributionDto } from "@/services/review-service";
import { Textarea } from '../ui/textarea';

interface ProductReviewsDialogProps {
    product: Product;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={`${star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                        }`}
                />
            ))}
        </div>
    );
};

const RatingDistribution = ({
    rating,
    reviewCount,
    ratingDistribution
}: {
    rating: number;
    reviewCount: number;
    ratingDistribution: RatingDistributionDto[];
}) => {
    return (
        <div className="space-y-4">
            <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500">{rating.toFixed(1)}</div>
                <StarRating rating={Math.floor(rating)} size={20} />
                <p className="text-sm text-muted-foreground mt-1">
                    {reviewCount} đánh giá
                </p>
            </div>

            <div className="space-y-2">
                {ratingDistribution.map((dist) => (
                    <div key={dist.stars} className="flex items-center gap-2 text-sm">
                        <span className="w-2">{dist.stars}</span>
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <Progress value={dist.percentage} className="flex-1 h-2" />
                        <span className="w-8 text-right">{dist.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ReviewItem = ({ review }: { review: ReviewDto }) => {
    const { mutate: likeReview, isPending: isLiking } = useLikeReview();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState("");

    const { mutate: replyReview, isPending: isReplying } = useReplyReview();


    const handleLike = () => {
        likeReview(review.id);
    };

    const handleReplySubmit = () => {
        if (!replyContent.trim()) return;
        replyReview({
            reviewId: review.id,
            data: {
                content: replyContent,
            },
        }, {
            onSuccess: () => {
                setReplyContent("");
                setShowReplyForm(false);
            },
        });
    };


    return (
        <Card className="mb-4">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={review.userAvatar} alt={review.userName} />
                        <AvatarFallback>{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{review.userName}</span>
                            {review.isVerified && (
                                <Badge variant="secondary" className="text-xs">
                                    <Verified size={12} className="mr-1" />
                                    Đã mua hàng
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} />
                            <span className="text-sm text-muted-foreground">
                                {new Date(review.date).toLocaleDateString('vi-VN')}
                            </span>
                        </div>

                        <p className="text-sm leading-relaxed">{review.content}</p>

                        {review.imageUrls && review.imageUrls.length > 0 && (
                            <div className="flex gap-2 mt-2">
                                {review.imageUrls.map((url, index) => (
                                    <div key={index} className="relative w-16 h-16 rounded border overflow-hidden">
                                        <img
                                            src={url}
                                            alt={`Review image ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-4 pt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLike}
                                disabled={isLiking}
                                className="text-muted-foreground hover:text-primary"
                            >
                                {isLiking ? (
                                    <Loader2 size={14} className="mr-1 animate-spin" />
                                ) : (
                                    <ThumbsUp size={14} className="mr-1" />
                                )}
                                Hữu ích ({review.likes})
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-primary"
                                onClick={() => setShowReplyForm(!showReplyForm)}
                            >
                                <MessageCircle size={14} className="mr-1" />
                                Trả lời
                            </Button>


                            {review.replies > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-primary"
                                >
                                    <MessageCircle size={14} className="mr-1" />
                                    {review.replies} phản hồi
                                </Button>
                            )}
                        </div>

                        {showReplyForm && (
                            <div className="mt-4 space-y-2">
                                <Textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Nhập nội dung trả lời..."
                                    rows={3}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setShowReplyForm(false)}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={handleReplySubmit}
                                        disabled={isReplying}
                                    >
                                        {isReplying && <Loader2 size={14} className="mr-2 animate-spin" />}
                                        Gửi trả lời
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export const ProductReviewsDialog: React.FC<ProductReviewsDialogProps> = ({
    product,
    open,
    onOpenChange,
}) => {
    const {
        data: reviewsData,
        isLoading,
        error
    } = useGetProductReviews(product.id);

    const handleOpenChange = (open: boolean) => {
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
            <DialogContent className="!max-w-6xl max-h-[80vh]" forceMount>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageCircle size={20} />
                        Đánh giá sản phẩm: {product.name}
                    </DialogTitle>
                    <DialogDescription className="mb-4">
                        Xem và quản lý đánh giá của sản phẩm {product.name}
                    </DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Đang tải đánh giá...</span>
                    </div>
                )}

                {error && (
                    <div className="text-center py-8 text-red-500">
                        Có lỗi xảy ra khi tải đánh giá. Vui lòng thử lại sau.
                    </div>
                )}

                {reviewsData?.success && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <Card>
                                <CardContent className="p-4">
                                    <RatingDistribution
                                        rating={reviewsData.data?.rating || 0}
                                        reviewCount={reviewsData.data?.reviewCount || 0}
                                        ratingDistribution={reviewsData.data?.ratingDistribution || []}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2">
                            <ScrollArea className="h-[500px] pr-4">
                                {reviewsData.data?.reviews.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Chưa có đánh giá nào cho sản phẩm này.
                                    </div>
                                ) : (
                                    <div>
                                        {reviewsData.data?.reviews.map((review) => (
                                            <ReviewItem key={review.id} review={review} />
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
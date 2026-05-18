"use client"

import { logger } from '@/lib/logger'
import { useCallback, useEffect, useState } from "react"
import { useProductReviews } from "@/hooks/use-products"
import { useAuth } from "@/hooks/use-auth"
import { useSignalR } from "@/hubs/signalr-context"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AppToaster } from "@/components/toast/app-toaster"
import { RatingDistribution, Review } from "@/types/product"
import { RatingSummary } from "./reviews/rating-summary"
import { ReviewForm } from "./reviews/review-form"
import { ReviewItem } from "./reviews/review-item"
import { ReviewsFilter } from "./reviews/reviews-filter"
import { ReviewsLoadingSkeleton } from "./reviews/reviews-loading-skeleton"
import { ReviewsError } from "./reviews/reviews-error"
import { Button } from "@/components/ui/button"
import { useCreateReview, useCreateReviewReply } from "@/hooks/use-reviews"
import { CreateReviewRequest } from "@/services/review-service"

interface ProductReviewsProps {
  productId: string | undefined
}

interface TypingUser {
  userId: string
  userName: string
  isTyping: boolean
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { isAuthenticated, user } = useAuth()
  const {
    joinProductGroup,
    leaveProductGroup,
    sendTypingIndicator,
    onNewReview,
    onRatingUpdated,
    onReviewLikeUpdated,
    onUserTyping,
    // B4 FIX: Dùng off* methods để cleanup handlers khi unmount
    offNewReview,
    offRatingUpdated,
    offReviewLikeUpdated,
    offUserTyping,
    isConnected
  } = useSignalR()

  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  const queryClient = useQueryClient()
  const { data, isLoading, error, refetch } = useProductReviews(productId || "")
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution[]>([])

  useEffect(() => {
    if (data) {
      setReviews(data.reviews || [])
      setRating(data.rating || 0)
      setReviewCount(data.reviewCount || 0)
      setRatingDistribution(data.ratingDistribution || [])
    }
  }, [data])

  useEffect(() => {
    if (productId && isConnected) {
      joinProductGroup(productId)
      return () => {
        leaveProductGroup(productId)
      }
    }
  }, [productId, isConnected, joinProductGroup, leaveProductGroup])

  useEffect(() => {
    if (!isConnected) return

    const handleNewReview = (newReview: Review) => {
      setReviews(prev => [newReview, ...prev])
      // Chỉ thông báo nếu review không phải do chính người dùng hiện tại gửi
      if (newReview.applicationUserId !== user?.id) {
        AppToaster.info('Có đánh giá mới!')
      }
    }

    const handleRatingUpdated = (data: { ProductId: string; NewRating: number; ReviewCount: number }) => {
      if (data.ProductId === productId) {
        setRating(data.NewRating)
        setReviewCount(data.ReviewCount)
        queryClient.invalidateQueries({ queryKey: ["product", productId, "reviews"] })
      }
    }

    const handleReviewLikeUpdated = (data: { ReviewId: string; LikeCount: number }) => {
      setReviews(prev =>
        prev.map(review =>
          review.id === data.ReviewId
            ? { ...review, likes: data.LikeCount }
            : review
        )
      )
    }

    const handleUserTyping = (data: { ProductId: string; UserId: string; UserName: string; IsTyping: boolean }) => {
      if (data.ProductId === productId) {
        setTypingUsers(prev => {
          const filtered = prev.filter(user => user.userId !== data.UserId)
          if (data.IsTyping) {
            return [...filtered, {
              userId: data.UserId,
              userName: data.UserName,
              isTyping: true
            }]
          }
          return filtered
        })

        setTimeout(() => {
          setTypingUsers(prev => prev.filter(user => user.userId !== data.UserId))
        }, 3000)
      }
    }

    onNewReview(handleNewReview)
    onRatingUpdated(handleRatingUpdated)
    onReviewLikeUpdated(handleReviewLikeUpdated)
    onUserTyping(handleUserTyping)

    return () => {
      // B4 FIX: Dọi dẹp đúng handler specific khi component unmount hoặc productId thay đổi
      // Tránh memory leak và handler duplication sau mỗi lần re-render
      offNewReview(handleNewReview)
      offRatingUpdated(handleRatingUpdated)
      offReviewLikeUpdated(handleReviewLikeUpdated)
      offUserTyping(handleUserTyping)
    }
  }, [isConnected, productId, onNewReview, onRatingUpdated, onReviewLikeUpdated, onUserTyping,
      offNewReview, offRatingUpdated, offReviewLikeUpdated, offUserTyping, queryClient])


  const likeReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`/api/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to like review')
      }

      return response.json()
    }
  })

  const handleTyping = useCallback(() => {
    if (!isTyping && productId) {
      setIsTyping(true)
      sendTypingIndicator(productId, true)
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    const timeout = setTimeout(() => {
      setIsTyping(false)
      if (productId) {
        sendTypingIndicator(productId, false)
      }
    }, 1000)

    setTypingTimeout(timeout)
  }, [isTyping, productId, sendTypingIndicator, typingTimeout])

  const createReviewMutation = useCreateReview();

  const handleSubmitReview = (rating: number, content: string) => {
    const reviewData: CreateReviewRequest = {
      productId: productId || "",
      rating,
      content,
    }
    createReviewMutation.mutate({
      ...reviewData,
      productId: productId || "",
    });
  }

  const handleLikeReview = (reviewId: string) => {
    likeReviewMutation.mutate(reviewId)
  }

  const handleSortChange = (value: string) => {
    // Implement sorting logic here
    logger.debug("Sort by:", value)
  }

  const handleLoginRequest = () => {
    // Implement login logic here
    logger.debug("Login requested")
  }

  if (isLoading) {
    return <ReviewsLoadingSkeleton />
  }

  if (error) {
    return <ReviewsError onRetry={() => refetch()} />
  }

  return (
    <div>
      <RatingSummary
        rating={rating}
        reviewCount={reviewCount}
        ratingDistribution={ratingDistribution}
      />

      <ReviewForm
        onSubmit={handleSubmitReview}
        isAuthenticated={isAuthenticated}
        onLoginRequest={handleLoginRequest}
      />

      <ReviewsFilter
        reviewCount={reviewCount}
        onSortChange={handleSortChange}
      />

      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <ReviewItem
              key={`${review.id}-${index}`}
              review={review}
              onLike={handleLikeReview}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này</p>
          </div>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="mt-6 text-center">
          <Button variant="outline" className="border-[#2A5CAA] text-[#2A5CAA]">
            Xem thêm đánh giá
          </Button>
        </div>
      )}
    </div>
  )
}

using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Reviews.Commands.LikeReview
{
    public class LikeReviewCommandHandler : IRequestHandler<LikeReviewCommand, Result<int>>
    {
        private readonly IReviewRepository _reviewRepo;
        private readonly IReviewLikeRepository _reviewLikeRepo;
        private readonly INotificationService _notification;

        public LikeReviewCommandHandler(
            IReviewRepository reviewRepo, IReviewLikeRepository reviewLikeRepo, INotificationService notification)
        {
            _reviewRepo = reviewRepo;
            _reviewLikeRepo = reviewLikeRepo;
            _notification = notification;
        }

        public async Task<Result<int>> Handle(LikeReviewCommand command, CancellationToken cancellationToken)
        {
            var review = await _reviewRepo.GetByIdAsync(command.ReviewId, cancellationToken);
            if (review == null) return Result<int>.NotFound("Không tìm thấy đánh giá");

            var existingLike = await _reviewLikeRepo.GetByUserAndReviewAsync(command.UserId, command.ReviewId);

            if (existingLike != null)
            {
                // Unlike
                _reviewLikeRepo.Delete(existingLike);
                review.Likes = Math.Max(0, review.Likes - 1);
            }
            else
            {
                // Like
                var newLike = new ReviewLike
                {
                    ReviewId = command.ReviewId,
                    UserId = command.UserId,
                    CreatedAt = DateTime.Now
                };
                await _reviewLikeRepo.AddAsync(newLike, cancellationToken);
                review.Likes++;
            }

            _reviewRepo.Update(review);
            await _reviewRepo.SaveChangesAsync(cancellationToken);

            // Broadcast cập nhật like qua SignalR
            await _notification.SendReviewLikeUpdateNotificationAsync(review.ProductId, command.ReviewId, review.Likes);


            return Result<int>.Success(review.Likes);
        }
    }
}


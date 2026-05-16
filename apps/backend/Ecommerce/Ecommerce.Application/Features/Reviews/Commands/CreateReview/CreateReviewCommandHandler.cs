using AutoMapper;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reviews.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using System.Text.Encodings.Web;

namespace Ecommerce.Application.Features.Reviews.Commands.CreateReview
{
    public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, Result<ReviewDto>>
    {
        private readonly IReviewRepository _reviewRepo;
        private readonly IProductRepository _productRepo;
        private readonly IFileStorageService _fileStorage;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public CreateReviewCommandHandler(
            IReviewRepository reviewRepo,
            IProductRepository productRepo,
            IFileStorageService fileStorage,
            IMapper mapper,
            INotificationService notificationService,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService)
        {
            _reviewRepo = reviewRepo;
            _productRepo = productRepo;
            _fileStorage = fileStorage;
            _mapper = mapper;
            _notificationService = notificationService;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<Result<ReviewDto>> Handle(CreateReviewCommand command, CancellationToken cancellationToken)
        {
            if (command.Rating < 1 || command.Rating > 5)
            {
                return Result<ReviewDto>.ValidationError("Điểm đánh giá phải từ 1 đến 5.");
            }

            var currentUserId = _currentUserService.UserId;
            if (!currentUserId.HasValue)
            {
                return Result<ReviewDto>.Unauthorized();
            }

            var product = await _productRepo.GetByIdAsync(command.ProductId, cancellationToken);
            if (product == null)
            {
                return Result<ReviewDto>.NotFound("Không tìm thấy sản phẩm");
            }

            var user = await _unitOfWork.Users.GetByIdAsync(currentUserId.Value);
            if (user == null)
            {
                return Result<ReviewDto>.Unauthorized("Không thể xác định người dùng hiện tại.");
            }

            if (await _reviewRepo.ExistsForProductByUserAsync(command.ProductId, currentUserId.Value, cancellationToken))
            {
                return Result<ReviewDto>.Conflict("Bạn đã đánh giá sản phẩm này.");
            }

            var isVerifiedPurchase = await _reviewRepo.HasDeliveredPurchaseAsync(
                command.ProductId,
                currentUserId.Value,
                cancellationToken);

            var review = new Review
            {
                ProductId = command.ProductId,
                ApplicationUserId = currentUserId.Value,
                Rating = command.Rating,
                Content = SanitizePlainText(command.Content),
                UserAvatar = user.Avatar ?? string.Empty,
                UserName = user.UserName ?? user.Email ?? "User",
                Likes = 0,
                Replies = 0,
                IsVerified = isVerifiedPurchase,
                HelpfulCount = 0,
                Date = DateTime.UtcNow
            };

            foreach (var image in command.Images)
            {
                var imageUrl = await _fileStorage.SaveFileAsync(image, "reviews");
                review.Images.Add(new ReviewImage { Url = imageUrl });
            }

            await _reviewRepo.AddAsync(review, cancellationToken);
            await _unitOfWork.CompleteAsync(cancellationToken);

            var (newRating, reviewCount) = await UpdateProductRating(product, cancellationToken);
            await _unitOfWork.CompleteAsync(cancellationToken);

            var reviewDto = _mapper.Map<ReviewDto>(review);
            var updatedImageUrls = new List<string>();

            foreach (var image in reviewDto.Images)
            {
                var imageUrl = await _fileStorage.GetFileUrlAsync(image);
                updatedImageUrls.Add(imageUrl);
            }

            reviewDto.Images = updatedImageUrls;
            reviewDto.UserAvatar = await _fileStorage.GetFileUrlAsync(reviewDto.UserAvatar);

            await _notificationService.SendReviewNotificationAsync(command.ProductId, reviewDto, cancellationToken);
            await _notificationService.SendRatingNotificationAsync(command.ProductId, newRating, reviewCount, cancellationToken);

            return Result<ReviewDto>.Success(reviewDto);
        }

        private async Task<(double rating, int count)> UpdateProductRating(
            Product product,
            CancellationToken cancellationToken)
        {
            var (avgRating, reviewCount) = await _reviewRepo.GetRatingSummaryAsync(product.Id, cancellationToken);

            product.UpdateRating(avgRating, reviewCount);
            _productRepo.Update(product);

            return (avgRating, reviewCount);
        }

        private static string SanitizePlainText(string content)
        {
            var normalized = (content ?? string.Empty)
                .Replace("\0", string.Empty)
                .Trim();

            return HtmlEncoder.Default.Encode(normalized);
        }
    }
}

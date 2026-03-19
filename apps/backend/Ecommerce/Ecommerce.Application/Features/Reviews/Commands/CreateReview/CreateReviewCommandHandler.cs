using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reviews.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;


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



        public CreateReviewCommandHandler(
            IReviewRepository reviewRepo,
            IProductRepository productRepo,
            IFileStorageService fileStorage,
            IMapper mapper,
            INotificationService notificationService,
            IUnitOfWork unitOfWork)
        {
            _reviewRepo = reviewRepo;
            _productRepo = productRepo;
            _fileStorage = fileStorage;
            _mapper = mapper;
            _notificationService = notificationService;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<ReviewDto>> Handle(CreateReviewCommand command, CancellationToken cancellationToken)
        {
            var product = await _productRepo.GetByIdAsync(command.ProductId, cancellationToken);
            if (product == null) return Result<ReviewDto>.NotFound("Không tìm thấy sản phẩm");

            var user = await _unitOfWork.Users.GetByIdAsync(command.UserId);
            var review = new Review
            {
                ProductId = command.ProductId,
                ApplicationUserId = command.UserId,
                Rating = command.Rating,
                Content = command.Content,
                UserAvatar = user.Avatar,
                UserName = user.UserName,
                Likes = 0,
                Replies = 0,
                HelpfulCount = 0,
                Date = DateTime.Now
            };

            // Upload images
            foreach (var image in command.Images)
            {
                var imageUrl = await _fileStorage.SaveFileAsync(image, image.FileName);
                review.Images.Add(new ReviewImage { Url = imageUrl });
            }

            await _reviewRepo.AddAsync(review, cancellationToken);

            // Cập nhật rating của sản phẩm
            var (newRating, reviewCount) = await UpdateProductRating(product);
            await _productRepo.SaveChangesAsync(cancellationToken);

            // Map review to DTO
            var reviewDto = _mapper.Map<ReviewDto>(review);
            var updatedImageUrls = new List<string>();

            foreach (var image in reviewDto.Images)
            {
                // Chuyển đổi URL hình ảnh sang DTO
                var imageUrl = await _fileStorage.GetFileUrlAsync(image);
                updatedImageUrls.Add(imageUrl);
            }
            reviewDto.Images = updatedImageUrls;
            reviewDto.UserAvatar = await _fileStorage.GetFileUrlAsync(reviewDto.UserAvatar);


            // Broadcast review mới qua SignalR
            await _notificationService.SendReviewNotificationAsync(command.ProductId, reviewDto, cancellationToken);

            // Broadcast cập nhật rating
            await _notificationService.SendRatingNotificationAsync(command.ProductId, newRating, reviewCount, cancellationToken);

            return Result<ReviewDto>.Success(reviewDto);
        }

        private async Task<(double rating, int count)> UpdateProductRating(Product product)
        {
            var avgRating = await _reviewRepo.GetAverageRatingAsync(product.Id);
            var reviewCount = await _reviewRepo.CountAsync(x => x.ProductId == product.Id);

            product.UpdateRating(avgRating, reviewCount);
            _productRepo.Update(product);

            return (avgRating, reviewCount);
        }
    }
}


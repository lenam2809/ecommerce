using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Queries.GetProductReviews;
using Ecommerce.Application.Features.Reviews.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Reviews.Commands.CreateReviewReply
{
    public class CreateReviewReplyCommandHandler : IRequestHandler<CreateReviewReplyCommand, Result<ReviewReplyDto>>
    {
        private readonly IReviewReplyRepository _reviewReplyRepository;
        private readonly IReviewRepository _reviewRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        private readonly INotificationService _notificationService;
        private readonly ICacheService _cacheService;

        public CreateReviewReplyCommandHandler(
            IReviewReplyRepository reviewReplyRepository,
            IReviewRepository reviewRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IFileStorageService fileStorageService,
            INotificationService notificationService,
            ICacheService cacheService)
        {
            _reviewReplyRepository = reviewReplyRepository;
            _reviewRepository = reviewRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
            _notificationService = notificationService;
            _cacheService = cacheService;
        }

        public async Task<Result<ReviewReplyDto>> Handle(CreateReviewReplyCommand command, CancellationToken cancellationToken)
        {
            // Kiểm tra review có tồn tại không
            var review = await _reviewRepository.GetByIdAsync(command.ReviewId, cancellationToken);
            if (review == null)
                return Result<ReviewReplyDto>.NotFound("Không tìm thấy đánh giá.");

            // Lấy thông tin user
            var user = await _unitOfWork.Users.GetByIdAsync(command.UserId);
            if (user == null)
                return Result<ReviewReplyDto>.NotFound("Không tìm thấy người dùng.");

            // Tạo review reply mới
            var reviewReply = new ReviewReply
            {
                ReviewId = command.ReviewId,
                UserId = command.UserId,
                UserName = user.UserName,
                UserAvatar = user.Avatar,
                Content = command.Content,
                Date = DateTime.Now,
                Likes = 0,
                IsVerified = true // Hoặc logic khác để xác định verified
            };

            await _reviewReplyRepository.AddAsync(reviewReply, cancellationToken);

            // Cập nhật số lượng replies trong review
            review.Replies = await _reviewReplyRepository.CountRepliesAsync(command.ReviewId, cancellationToken);
            _reviewRepository.Update(review);

            await _unitOfWork.CompleteAsync(cancellationToken);

            // Map to DTO
            var replyDto = _mapper.Map<ReviewReplyDto>(reviewReply);

            // Update avatar URL
            if (!string.IsNullOrEmpty(replyDto.UserAvatar))
            {
                replyDto.UserAvatar = await _fileStorageService.GetFileUrlAsync(replyDto.UserAvatar);
            }

            // Gửi notification
            await _notificationService.SendReviewReplyNotificationAsync(command.ReviewId, replyDto, cancellationToken);

            // Xóa cache liên quan
            await _cacheService.RemoveAsync(CacheKeys.GetProductReviews(new GetProductReviewsQuery(review.ProductId)));

            return Result<ReviewReplyDto>.Success(replyDto);
        }
    }
}


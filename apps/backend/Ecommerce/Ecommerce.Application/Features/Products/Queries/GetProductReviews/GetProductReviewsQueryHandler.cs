using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProductReviews
{
    public class GetProductReviewsQueryHandler : IRequestHandler<GetProductReviewsQuery, Result<ReviewsResponseDto>>
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        private readonly ICacheService _cacheService;


        public GetProductReviewsQueryHandler(IReviewRepository reviewRepository,
            IMapper mapper,
            IFileStorageService fileStorageService,
            ICacheService cacheService)
        {
            _reviewRepository = reviewRepository;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
            _cacheService = cacheService;
        }

        public async Task<Result<ReviewsResponseDto>> Handle(GetProductReviewsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Tạo cache key dựa trên thông tin người dùng hiện tại và bộ lọc
                string cacheKey = $"get_product_reviews_{request.ProductId}";

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<ReviewsResponseDto>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<ReviewsResponseDto>.Success(cachedResult);
                }

                var data = await _reviewRepository.GetProductReviewsAsync(request.ProductId);

                var reviewDto = _mapper.Map<List<ReviewDto>>(data.Reviews);


                foreach (var review in reviewDto)
                {
                    var updatedImageUrls = new List<string>();
                    foreach (var image in review.ImageUrls)
                    {
                        var updatedImageUrl = await _fileStorageService.GetFileUrlAsync(image);
                        updatedImageUrls.Add(updatedImageUrl);
                    }
                    review.ImageUrls = updatedImageUrls;
                    review.UserAvatar = await _fileStorageService.GetFileUrlAsync(review.UserAvatar);
                }

                var result = new ReviewsResponseDto
                {
                    Reviews = reviewDto,
                    Rating = data.Rating,
                    ReviewCount = data.ReviewCount,
                    RatingDistribution = _mapper.Map<List<RatingDistributionDto>>(data.RatingDistribution)
                };

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(10));

                return Result<ReviewsResponseDto>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<ReviewsResponseDto>.BadRequest(ex.Message);

            }
        }
    }
}


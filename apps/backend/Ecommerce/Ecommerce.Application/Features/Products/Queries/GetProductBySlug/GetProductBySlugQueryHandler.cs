using AutoMapper;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Products.Queries.GetProductBySlug
{
    public class GetProductBySlugQueryHandler : IRequestHandler<GetProductBySlugQuery, Result<ProductDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        private readonly ICacheService _cacheService;
        private readonly IUserActivityService _userActivityService;
        private readonly ICurrentUserService _currentUserService;

        public GetProductBySlugQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            IFileStorageService fileStorageService,
            ICacheService cacheService,
            IUserActivityService userActivityService,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
            _cacheService = cacheService;
            _userActivityService = userActivityService;
            _currentUserService = currentUserService;
        }

        public async Task<Result<ProductDto>> Handle(GetProductBySlugQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // C2: Cache key bao gồm user context để tránh rỏ rỉ giá cá nhân
                // D2: Dùng CacheKeys class thay vì magic string
                var userId = _currentUserService.UserId ?? Guid.Empty;
                string cacheKey = $"{CacheKeys.GetProductBySlug(request)}:user:{userId}";

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<ProductDto>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<ProductDto>.Success(cachedResult);
                }

                // B1 FIX: Gộp 2 query thành 1 düy nhất với Include + AsNoTracking
                // Trước: FirstOrDefaultAsync(slug) => GetByIdWithIncludeAsync(id) = 2 round-trips
                // Sau: một query duy nhất lấy đủ dữ liệu cần thiết
                var product = await _unitOfWork.Products
                    .GetQueryable()
                    .AsNoTracking()
                    .Include(p => p.Brand)
                    .Include(p => p.Category)
                    .Include(p => p.Variants)
                        .ThenInclude(variant => variant.Colors)
                    .Include(p => p.Variants)
                        .ThenInclude(variant => variant.Sizes)
                    .Include(p => p.Specifications)
                    .Include(p => p.Images)
                    .FirstOrDefaultAsync(p => p.Slug == request.Slug, cancellationToken);

                if (product == null)
                {
                    return Result<ProductDto>.NotFound($"Không tìm thấy sản phẩm có slug {request.Slug}");
                }

                var productDto = _mapper.Map<ProductDto>(product);

                productDto.MainImage = await _fileStorageService.GetFileUrlAsync(productDto.MainImage);

                for (int i = 0; i < productDto.AdditionalImages.Count; i++)
                {
                    productDto.AdditionalImages[i] = await _fileStorageService.GetFileUrlAsync(productDto.AdditionalImages[i]);
                }

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, productDto, TimeSpan.FromMinutes(10));
                await _userActivityService.LogActivityAsync("ViewProductBySlug", $"Xem sản phẩm {productDto.Name} có slug {productDto.Slug}", new { ProductId = productDto.Id });

                return Result<ProductDto>.Success(productDto);
            }
            catch (Exception ex)
            {
                return Result<ProductDto>.BadRequest(ex.Message);
            }
        }
    }
}


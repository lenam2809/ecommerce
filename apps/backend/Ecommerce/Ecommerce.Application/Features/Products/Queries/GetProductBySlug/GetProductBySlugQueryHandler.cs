using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
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

        public GetProductBySlugQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            IFileStorageService fileStorageService,
            ICacheService cacheService,
            IUserActivityService userActivityService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
            _cacheService = cacheService;
            _userActivityService = userActivityService;
        }

        public async Task<Result<ProductDto>> Handle(GetProductBySlugQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Tạo cache key dựa trên thông tin người dùng hiện tại và bộ lọc
                string cacheKey = $"get_product_by_slug_{request.Slug}";

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<ProductDto>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<ProductDto>.Success(cachedResult);
                }

                var result = await _unitOfWork.Products.FirstOrDefaultAsync(
                product => product.Slug == request.Slug,
                cancellationToken);

                if (result == null)
                {
                    return Result<ProductDto>.NotFound($"Không tìm thấy sản phẩm có slug {request.Slug}");
                }

                var product = await _unitOfWork.Products.GetByIdWithIncludeAsync(result.Id,
                    query => query.AsNoTracking()
                        .Include(entity => entity.Brand)
                        .Include(entity => entity.Category)
                        .Include(entity => entity.Variants)
                            .ThenInclude(variant => variant.Colors)
                        .Include(entity => entity.Variants)
                            .ThenInclude(variant => variant.Sizes)
                        .Include(entity => entity.Specifications)
                        .Include(entity => entity.Images),
                    cancellationToken);

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


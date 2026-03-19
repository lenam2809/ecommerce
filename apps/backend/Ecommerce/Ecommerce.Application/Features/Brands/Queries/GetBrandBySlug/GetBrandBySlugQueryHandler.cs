using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Brands.Dto;
using Ecommerce.Application.Features.CategoryBrands.Queries.GetCategoryBrandsByBrandId;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetBrandBySlug
{
    public class GetBrandBySlugQueryHandler : IRequestHandler<GetBrandBySlugQuery, Result<BrandDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IMediator _mediator;
        private readonly IFileStorageService _fileStorageService;
        private readonly ICacheService _cacheService;


        public GetBrandBySlugQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            IMediator mediator,
            IFileStorageService fileStorageService,
            ICacheService cacheService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _mediator = mediator;
            _fileStorageService = fileStorageService;
            _cacheService = cacheService;
        }

        public async Task<Result<BrandDto>> Handle(GetBrandBySlugQuery request, CancellationToken cancellationToken)
        {
            try
            {
                string cacheKey = CacheKeys.GetBrandBySlug(request);

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<BrandDto>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<BrandDto>.Success(cachedResult);
                }

                if (string.IsNullOrWhiteSpace(request.Slug))
                {
                    return Result<BrandDto>.BadRequest("Slug không được để trống");
                }

                // Lấy brand theo slug
                var brand = await _unitOfWork.Brands.FirstOrDefaultAsync(
                    b => b.Slug.ToLower() == request.Slug.ToLower() && b.IsActive,
                    cancellationToken);

                if (brand == null)
                {
                    return Result<BrandDto>.NotFound("Không tìm thấy thương hiệu với slug này");
                }

                var brandDto = _mapper.Map<BrandDto>(brand);

                // Chuyển đổi hình ảnh từ đường dẫn sang URL
                if (!string.IsNullOrEmpty(brandDto.LogoUrl))
                {
                    brandDto.LogoUrl = await _fileStorageService.GetFileUrlAsync(brandDto.LogoUrl);
                }

                // Lấy danh sách CategoryBrands
                var categoryBrandsResult = await _mediator.Send(new GetCategoryBrandsByBrandIdQuery
                {
                    BrandId = brand.Id
                }, cancellationToken);

                if (categoryBrandsResult.IsSuccess)
                {
                    brandDto.CategoryBrands = categoryBrandsResult.Value ?? [];
                    brandDto.CategoryIds = brandDto.CategoryBrands.Select(cb => cb.CategoryId).ToList();
                }

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, brandDto, ECachePolicy.Long.ToTimeSpan());

                return Result<BrandDto>.Success(brandDto);
            }
            catch (Exception ex)
            {
                return Result<BrandDto>.BadRequest(ex.Message);
            }
        }
    }
}


using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Brands.Dto;
using Ecommerce.Application.Features.CategoryBrands.Queries.GetAllCategoryBrands;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetAllBrands
{
    public class GetAllBrandsQueryHandler : IRequestHandler<GetAllBrandsQuery, Result<List<BrandDto>>>
    {
        private readonly IBrandRepository _repository;
        private readonly IMapper _mapper;
        private readonly IMediator _mediator;
        private readonly IFileStorageService _fileStorageService;
        private readonly ICacheService _cacheService;

        public GetAllBrandsQueryHandler(IBrandRepository repository,
            IMapper mapper,
            IMediator mediator,
            IFileStorageService fileStorageService,
            ICacheService cacheService)
        {
            _repository = repository;
            _mapper = mapper;
            _mediator = mediator;
            _fileStorageService = fileStorageService;
            _cacheService = cacheService;
        }

        public async Task<Result<List<BrandDto>>> Handle(GetAllBrandsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                string cacheKey = CacheKeys.GetAllBrands();

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<List<BrandDto>>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<List<BrandDto>>.Success(cachedResult);
                }


                var brands = await _repository.GetAllAsync(cancellationToken);
                var brandDtos = _mapper.Map<List<BrandDto>>(brands);
                // Lấy tất cả CategoryBrands
                var categoryBrandsResult = await _mediator.Send(new GetAllCategoryBrandsQuery(), cancellationToken);

                if (categoryBrandsResult.IsSuccess && categoryBrandsResult.Value != null)
                {
                    // Group CategoryBrands theo BrandId
                    var categoryBrandsByBrand = categoryBrandsResult.Value
                        .GroupBy(cb => cb.BrandId)
                        .ToDictionary(g => g.Key, g => g.ToList());

                    // Gán CategoryBrands cho từng Brand
                    foreach (var brandDto in brandDtos)
                    {
                        if (categoryBrandsByBrand.TryGetValue(brandDto.Id, out var categoryBrands))
                        {
                            brandDto.CategoryBrands = categoryBrands;
                            brandDto.CategoryIds = categoryBrands.Select(cb => cb.CategoryId).ToList();
                        }
                    }
                }

                // Chuyển đổi hình ảnh từ đường dẫn sang URL
                foreach (var brandDto in brandDtos)
                {
                    if (!string.IsNullOrEmpty(brandDto.LogoUrl))
                    {
                        brandDto.LogoUrl = await _fileStorageService.GetFileUrlAsync(brandDto.LogoUrl);
                    }
                }

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, brandDtos, ECachePolicy.Long.ToTimeSpan());

                return Result<List<BrandDto>>.Success(brandDtos);
            }
            catch (Exception ex)
            {
                return Result<List<BrandDto>>.BadRequest(ex.Message);
            }

        }


    }
}


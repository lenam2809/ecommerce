using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Brands.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetBrandsByCategoryId
{
    public class GetBrandsByCategoryIdQueryHandler : IRequestHandler<GetBrandsByCategoryIdQuery, Result<List<BrandDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        private readonly ICacheService _cacheService;


        public GetBrandsByCategoryIdQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            IFileStorageService fileStorageService,
            ICacheService cacheService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
            _cacheService = cacheService;
        }

        public async Task<Result<List<BrandDto>>> Handle(GetBrandsByCategoryIdQuery request, CancellationToken cancellationToken)
        {
            try
            {

                string cacheKey = CacheKeys.GetBrandsByCategoryId(request);

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<List<BrandDto>>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<List<BrandDto>>.Success(cachedResult);
                }

                // Kiểm tra category có tồn tại không
                var categoryExists = await _unitOfWork.Categories.ExistsAsync(request.CategoryId, cancellationToken);
                if (!categoryExists)
                {
                    return Result<List<BrandDto>>.NotFound("Danh mục không tồn tại");
                }

                // Lấy danh sách CategoryBrand theo CategoryId
                var categoryBrands = await _unitOfWork.CategoryBrands
                    .FindAsync(cb => cb.CategoryId == request.CategoryId, cancellationToken);

                if (!categoryBrands.Any())
                {
                    return Result<List<BrandDto>>.Success(new List<BrandDto>());
                }

                // Lấy danh sách BrandId
                var brandIds = categoryBrands.Select(cb => cb.BrandId).ToList();

                // Lấy danh sách Brand
                var brands = await _unitOfWork.Brands
                    .FindAsync(b => brandIds.Contains(b.Id) && b.IsActive, cancellationToken);

                // Map sang BrandDto
                var brandDtos = _mapper.Map<List<BrandDto>>(brands);

                // Chuyển đổi LogoUrl thành URL đầy đủ
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


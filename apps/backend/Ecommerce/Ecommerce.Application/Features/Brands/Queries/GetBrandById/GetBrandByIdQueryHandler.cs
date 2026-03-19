using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Brands.Dto;
using Ecommerce.Application.Features.CategoryBrands.Queries.GetCategoryBrandsByBrandId;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetBrandById
{
    public class GetBrandByIdQueryHandler : IRequestHandler<GetBrandByIdQuery, Result<BrandDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IMediator _mediator;
        private readonly IFileStorageService _fileStorageService;
        private readonly ICacheService _cacheService;


        public GetBrandByIdQueryHandler(IUnitOfWork unitOfWork,
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

        public async Task<Result<BrandDto>> Handle(GetBrandByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                string cacheKey = CacheKeys.GetBrandById(request);

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<BrandDto>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<BrandDto>.Success(cachedResult);
                }

                var brand = await _unitOfWork.Brands.GetByIdAsync(request.Id, cancellationToken);

                if (brand == null)
                {
                    return Result<BrandDto>.NotFound("Thương hiệu không tồn tại");
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
                    BrandId = request.Id
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


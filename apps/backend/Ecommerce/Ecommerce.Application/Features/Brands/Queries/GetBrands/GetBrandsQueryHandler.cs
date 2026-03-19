using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Brands.Dto;
using Ecommerce.Application.Features.Brands.Queries.GetCategories;
using Ecommerce.Application.Features.CategoryBrands.Queries.GetAllCategoryBrands;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using System.Linq.Expressions;

namespace Ecommerce.Application.Features.Brands.Queries.GetBrands
{
    [Authorize(Policy = EPermissions.ViewBrands)]
    public class GetBrandsQueryHandler : IRequestHandler<GetBrandsQuery, Result<PaginatedList<BrandDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;
        private readonly IMediator _mediator;
        private readonly IFileStorageService _fileStorageService;

        public GetBrandsQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnhancedLogger logger,
            IMediator mediator,
            IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mediator = mediator;
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<PaginatedList<BrandDto>>> Handle(GetBrandsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Xây dựng biểu thức filter từ các tham số truy vấn
                Expression<Func<Brand, bool>> filter = brand =>
                    (string.IsNullOrEmpty(request.SearchTerm)
                    || brand.Name.Contains(request.SearchTerm)
                    || brand.Description.Contains(request.SearchTerm));
                ;
                // Xây dựng sắp xếp từ tham số SortBy và IsDescending
                Func<IQueryable<Brand>, IOrderedQueryable<Brand>> orderBy = query =>
                {
                    return request.SortBy.ToLower() switch
                    {
                        "code" => request.IsDescending
                           ? query.OrderByDescending(c => c.Code)
                           : query.OrderBy(c => c.Code),
                        "name" => request.IsDescending
                           ? query.OrderByDescending(c => c.Name)
                           : query.OrderBy(c => c.Name),
                        "createdat" => request.IsDescending
                            ? query.OrderByDescending(c => c.CreatedAt)
                            : query.OrderBy(c => c.CreatedAt),
                        _ => query.OrderBy(c => c.Id)
                    };
                };

                // Gọi phương thức GetPaginatedAsync
                var paginatedResult = await _unitOfWork.Brands
                    .GetPaginatedAsync(
                        filter: filter,
                        orderBy: orderBy,
                        pageIndex: request.PageNumber,
                        pageSize: request.PageSize,
                        cancellationToken: cancellationToken
                        );

                // Ánh xạ kết quả sang DTO
                var brandDtos = _mapper.Map<List<BrandDto>>(paginatedResult.Items);

                // Chuyển đổi hình ảnh từ đường dẫn sang URL
                foreach (var brandDto in brandDtos)
                {
                    if (!string.IsNullOrEmpty(brandDto.LogoUrl))
                    {
                        brandDto.LogoUrl = await _fileStorageService.GetFileUrlAsync(brandDto.LogoUrl);
                    }
                }

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
                            brandDto.CategoryIds = [.. categoryBrands.Select(cb => cb.CategoryId)];
                            brandDto.CategoryCount = categoryBrands.Count;
                        }
                    }
                }

                foreach (var brandDto in brandDtos)
                {
                    // Chuyển đổi các thuộc tính cần thiết
                    brandDto.ProductCount = await _unitOfWork.Brands.CountProductsByBrandIdAsync(brandDto.Id, cancellationToken);
                }
                // Tạo kết quả trả về
                var result = new PaginatedList<BrandDto>(
                    brandDtos,
                    paginatedResult.TotalCount,
                    paginatedResult.PageIndex,
                    paginatedResult.PageSize);


                return Result<PaginatedList<BrandDto>>.Success(result);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi
                await _logger.LogExceptionAsync(ex, "GetBrandsQueryHandler.Handle");
                return Result<PaginatedList<BrandDto>>.BadRequest(ex.Message);
            }
        }
    }
}


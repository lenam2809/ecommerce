using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Categories.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using System.Linq.Expressions;

namespace Ecommerce.Application.Features.Categories.Queries.GetCategories
{
    [Authorize(Policy = EPermissions.ViewCategories)]
    public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, Result<PaginatedList<CategoryDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;
        private readonly IFileStorageService _fileStorageService;

        public GetCategoriesQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnhancedLogger logger,
            IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _fileStorageService = fileStorageService ?? throw new ArgumentNullException(nameof(fileStorageService));
        }

        public async Task<Result<PaginatedList<CategoryDto>>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Xây dựng biểu thức filter từ các tham số truy vấn
                Expression<Func<Category, bool>> filter = category =>
                    (string.IsNullOrEmpty(request.SearchTerm) || category.Name.Contains(request.SearchTerm) || category.Description.Contains(request.SearchTerm));

                // Xây dựng sắp xếp từ tham số SortBy và IsDescending
                Func<IQueryable<Category>, IOrderedQueryable<Category>> orderBy = query =>
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
                var paginatedResult = await _unitOfWork.Categories
                    .GetPaginatedAsync(
                        filter: filter,
                        orderBy: orderBy,
                        pageIndex: request.PageNumber,
                        pageSize: request.PageSize,
                        cancellationToken: cancellationToken
                        );

                // Ánh xạ kết quả sang DTO
                var brandDtos = _mapper.Map<List<CategoryDto>>(paginatedResult.Items);

                // Cập nhật URL cho hình ảnh
                foreach (var categoryDto in brandDtos)
                {
                    categoryDto.Image = await _fileStorageService.GetFileUrlAsync(categoryDto.Image);
                    categoryDto.ProductCount = await _unitOfWork.Categories.CountProductsByCategoryIdAsync(categoryDto.Id, cancellationToken);
                }
                // Tạo kết quả trả về
                var result = new PaginatedList<CategoryDto>(
                    brandDtos,
                    paginatedResult.TotalCount,
                    paginatedResult.PageIndex,
                    paginatedResult.PageSize);

                return Result<PaginatedList<CategoryDto>>.Success(result);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi
                await _logger.LogExceptionAsync(ex, "GetCategoriesQueryHandler.Handle");
                return Result<PaginatedList<CategoryDto>>.BadRequest($"Lỗi khi lấy danh sách danh mục: {ex.Message}");
            }
        }
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Permissions.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using System.Linq.Expressions;

namespace Ecommerce.Application.Features.Permissions.Queries.GetPermissions
{
    public class GetPermissionsQueryHandler : IRequestHandler<GetPermissionsQuery, Result<PaginatedList<PermissionDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;

        public GetPermissionsQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<Result<PaginatedList<PermissionDto>>> Handle(GetPermissionsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Xây dựng biểu thức filter từ các tham số truy vấn
                Expression<Func<Permission, bool>> filter = brand =>
                    (string.IsNullOrEmpty(request.SearchTerm)
                    || brand.Name.Contains(request.SearchTerm)
                    || brand.Description.Contains(request.SearchTerm));
                ;
                // Xây dựng sắp xếp từ tham số SortBy và IsDescending
                Func<IQueryable<Permission>, IOrderedQueryable<Permission>> orderBy = query =>
                {
                    return request.SortBy.ToLower() switch
                    {
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
                var paginatedResult = await _unitOfWork.Permissions
                    .GetPaginatedAsync(
                        filter: filter,
                        orderBy: orderBy,
                        pageIndex: request.PageNumber,
                        pageSize: request.PageSize,
                        cancellationToken: cancellationToken
                        );

                // Ánh xạ kết quả sang DTO
                var brandDtos = _mapper.Map<List<PermissionDto>>(paginatedResult.Items);


                // Tạo kết quả trả về
                var result = new PaginatedList<PermissionDto>(
                    brandDtos,
                    paginatedResult.TotalCount,
                    paginatedResult.PageIndex,
                    paginatedResult.PageSize);

                return Result<PaginatedList<PermissionDto>>.Success(result);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi
                await _logger.LogExceptionAsync(ex, "GetPermissionsQueryHandler.Handle");
                return Result<PaginatedList<PermissionDto>>.BadRequest(ex.Message);
            }

        }
    }
}


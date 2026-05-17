using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Roles.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Roles.Queries.GetRoles
{
    public class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, Result<PaginatedList<RoleDto>>>
    {
        private readonly RoleManager<Role> _roleManager;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;

        public GetRolesQueryHandler(
            RoleManager<Role> roleManager,
            IMapper mapper,
            IEnhancedLogger logger)
        {
            _roleManager = roleManager;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<Result<PaginatedList<RoleDto>>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Truy vấn cơ bản
                var query = _roleManager.Roles.AsQueryable();

                // Áp dụng filter tìm kiếm
                if (!string.IsNullOrEmpty(request.SearchTerm))
                {
                    query = query.Where(r => r.Name.Contains(request.SearchTerm) ||
                                           r.NormalizedName.Contains(request.SearchTerm.ToUpper()));
                }

                // Đếm tổng số bản ghi
                var totalItems = await query.CountAsync(cancellationToken);

                // Áp dụng sắp xếp
                query = request.SortBy.ToLower() switch
                {
                    "name" => request.IsDescending
                       ? query.OrderByDescending(r => r.Name)
                       : query.OrderBy(r => r.Name),
                    _ => query.OrderBy(r => r.Name)
                };

                // Phân trang
                var pagedRoles = await query
                    .Skip((request.PageNumber - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync(cancellationToken);

                // Map sang DTO
                var roleDtos = _mapper.Map<List<RoleDto>>(pagedRoles);

                // Tạo kết quả phân trang
                var result = new PaginatedList<RoleDto>(
                    roleDtos,
                    totalItems,
                    request.PageNumber,
                    request.PageSize);

                return Result<PaginatedList<RoleDto>>.Success(result);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi
                await _logger.LogExceptionAsync(ex, "GetRolesQueryHandler.Handle");
                return Result<PaginatedList<RoleDto>>.BadRequest(ex.Message);
            }
        }
    }
}


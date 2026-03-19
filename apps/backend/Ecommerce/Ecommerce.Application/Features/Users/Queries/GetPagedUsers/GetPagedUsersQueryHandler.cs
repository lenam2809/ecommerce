using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Users.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Ecommerce.Application.Features.Users.Queries.GetPagedUsers
{
    public class GetPagedUsersQueryHandler : IRequestHandler<GetPagedUsersQuery, Result<PaginatedList<UserDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICacheService _cacheService;
        private readonly IFileStorageService _fileService;

        public GetPagedUsersQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService,
            ICacheService cacheService,
            IFileStorageService fileService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _cacheService = cacheService;
            _fileService = fileService;
        }

        public async Task<Result<PaginatedList<UserDto>>> Handle(GetPagedUsersQuery request, CancellationToken cancellationToken)
        {
            try
            {
                string filterRaw = $"{request.SearchTerm?.Trim().ToLowerInvariant()}" +
                    $"_{request.RoleFilter}" +
                    $"_{request.StatusFilter}" +
                    $"_{request.CustomerLevelFilter}" +
                    $"_{request.SortBy?.Trim().ToLowerInvariant()}" +
                    $"_{request.IsDescending}";

                string filterHash = Convert.ToBase64String(System.Security.Cryptography.MD5.Create()
                    .ComputeHash(System.Text.Encoding.UTF8.GetBytes(filterRaw)));


                string cacheKey = $"get_paged_users_{_currentUserService.UserId}_{request.PageNumber}_{request.PageSize}_{filterHash}";


                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<PaginatedList<UserDto>>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<PaginatedList<UserDto>>.Success(cachedResult);
                }
                // Updated the problematic line to ensure null-checks are properly handled.
                Expression<Func<ApplicationUser, bool>> filter = product =>
                    (string.IsNullOrEmpty(request.SearchTerm)
                    || (product.Email != null && product.Email.Contains(request.SearchTerm)) // Added null-check for product.Email
                    || product.FirstName.Contains(request.SearchTerm)
                    || product.LastName.Contains(request.SearchTerm)
                    || (product.PhoneNumber != null && product.PhoneNumber.Contains(request.SearchTerm))
                    ) &&
                    (string.IsNullOrWhiteSpace(request.RoleFilter) || product.UserRoles.Any(ur => ur.Role.Name == request.RoleFilter)) &&
                    (!request.StatusFilter.HasValue || product.Status == request.StatusFilter.Value) &&
                    (!request.CustomerLevelFilter.HasValue || product.CustomerLevel == request.CustomerLevelFilter.Value);

                // Xây dựng sắp xếp từ tham số SortBy và IsDescending
                Func<IQueryable<ApplicationUser>, IOrderedQueryable<ApplicationUser>> orderBy = query =>
                {
                    return request.SortBy.ToLower() switch
                    {
                        "firstname" => request.IsDescending
                            ? query.OrderByDescending(p => p.FirstName)
                            : query.OrderBy(p => p.FirstName),
                        "lastname" => request.IsDescending
                            ? query.OrderByDescending(p => p.LastName)
                            : query.OrderBy(p => p.LastName),
                        "email" => request.IsDescending
                            ? query.OrderByDescending(p => p.Email)
                            : query.OrderBy(p => p.Email),
                        "customerlevel" => request.IsDescending
                            ? query.OrderByDescending(p => p.CustomerLevel)
                            : query.OrderBy(p => p.CustomerLevel),
                        "status" => request.IsDescending
                            ? query.OrderByDescending(p => p.Status)
                            : query.OrderBy(p => p.Status),
                        "promotionpoints" => request.IsDescending
                            ? query.OrderByDescending(p => p.PromotionPoints)
                            : query.OrderBy(p => p.PromotionPoints),
                        "createdat" => request.IsDescending
                            ? query.OrderByDescending(p => p.CreatedAt)
                            : query.OrderBy(p => p.CreatedAt),
                        "updatedat" => request.IsDescending
                            ? query.OrderByDescending(p => p.UpdatedAt)
                            : query.OrderBy(p => p.UpdatedAt),
                        _ => request.IsDescending
                            ? query.OrderByDescending(p => p.UserName)
                            : query.OrderBy(p => p.UserName)
                    };
                };

                // Gọi phương thức GetPaginatedAsync
                var paginatedResult = await _unitOfWork.Users
                    .GetPaginatedAsync(
                        filter: filter,
                        orderBy: orderBy,
                        pageIndex: request.PageNumber,
                        pageSize: request.PageSize,
                        cancellationToken: cancellationToken,
                        includeFunc: query => query
                            .Include(p => p.UserPermissions)
                            .Include(p => p.UserRoles)
                                .ThenInclude(ur => ur.Role)
                        );

                // Ánh xạ kết quả sang DTO
                var userDtos = _mapper.Map<List<UserDto>>(paginatedResult.Items);

                // Lấy vai trò cho mỗi người dùng
                foreach (var userDto in userDtos)
                {
                    var user = paginatedResult.Items.FirstOrDefault(u => u.Id == userDto.Id);
                    if (user != null)
                    {
                        userDto.Roles = await _unitOfWork.Users.GetRolesAsync(user);
                    }
                }

                foreach (var userDto in userDtos)
                {
                    userDto.Avatar = await _fileService.GetFileUrlAsync(userDto.Avatar);
                    userDto.PhoneNumber = string.IsNullOrEmpty(userDto.PhoneNumber) ? "Chưa cập nhật" : userDto.PhoneNumber;
                }
                // Tạo kết quả trả về
                var result = new PaginatedList<UserDto>(
                    userDtos,
                    paginatedResult.TotalCount,
                    paginatedResult.PageIndex,
                    paginatedResult.PageSize);

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(10));

                return Result<PaginatedList<UserDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<PaginatedList<UserDto>>.BadRequest(ex.Message);
            }
        }
    }
}


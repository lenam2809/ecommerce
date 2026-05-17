using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Users.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.Users.Queries.GetUsers
{
    [Authorize(Policy = EPermissions.ViewUsers)]
    public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, Result<List<UserDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICacheService _cacheService;

        public GetUsersQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService,
            ICacheService cacheService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _cacheService = cacheService;
        }

        public async Task<Result<List<UserDto>>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
        {
            try
            {
                if (_currentUserService.UserId == null)
                {
                    return Result<List<UserDto>>.Unauthorized();
                }

                // Tạo cache key dựa trên thông tin người dùng hiện tại và bộ lọc
                string cacheKey = $"users_{_currentUserService.UserId}_{request.RoleFilter ?? "all"}";

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<List<UserDto>>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<List<UserDto>>.Success(cachedResult);
                }

                // Nếu không có trong cache, truy vấn từ database
                var currentUser = await _unitOfWork.Users.GetByIdAsync(_currentUserService.UserId.Value);
                var currentUserRoles = await _unitOfWork.Users.GetRolesAsync(currentUser);
                var users = await _unitOfWork.Users.GetAllAsync();
                var userDtos = new List<UserDto>();

                foreach (var user in users)
                {
                    var userRoles = await _unitOfWork.Users.GetRolesAsync(user);

                    // Apply role filter if specified
                    if (!string.IsNullOrEmpty(request.RoleFilter) && !userRoles.Contains(request.RoleFilter))
                    {
                        continue;
                    }

                    // Staff can't see Admin users
                    if (currentUserRoles.Contains(EUserRoles.Staff) && userRoles.Contains(EUserRoles.Admin))
                    {
                        continue;
                    }

                    // Customer can only see their own profile
                    if (currentUserRoles.Contains(EUserRoles.Customer) && user.Id != _currentUserService.UserId)
                    {
                        continue;
                    }

                    var userDto = _mapper.Map<UserDto>(user);
                    userDto.Roles = userRoles.ToList();
                    userDtos.Add(userDto);
                }

                // Lưu kết quả vào cache trong 10 phút
                // Có thể điều chỉnh thời gian tùy thuộc vào tần suất cập nhật dữ liệu người dùng
                await _cacheService.SetAsync(cacheKey, userDtos, TimeSpan.FromMinutes(10));

                return Result<List<UserDto>>.Success(userDtos);
            }
            catch (Exception ex)
            {
                return Result<List<UserDto>>.BadRequest(ex.Message);

            }

        }
    }
}

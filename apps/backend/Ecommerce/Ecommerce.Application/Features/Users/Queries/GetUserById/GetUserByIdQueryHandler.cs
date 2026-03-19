using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Users.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.Users.Queries.GetUserById
{
    [Authorize(Policy = "ViewUsers")]
    public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, Result<UserDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly IFileStorageService _fileStorageService;
        private readonly ICacheService _cacheService;

        public GetUserByIdQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService,
            IFileStorageService fileStorageService,
            ICacheService cacheService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _fileStorageService = fileStorageService;
            _cacheService = cacheService;
        }

        public async Task<Result<UserDto>> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // IDOR Check
                if (request.Id != _currentUserService.UserId &&
                    !_currentUserService.IsInRole(Ecommerce.Domain.Enums.EUserRoles.Admin) &&
                    !_currentUserService.IsInRole(Ecommerce.Domain.Enums.EUserRoles.Staff))
                {
                    return Result<UserDto>.Forbidden("Bạn không có quyền xem thông tin người dùng này.");
                }

                // Tạo cache key
                string cacheKey = $"user_by_id_{request.Id}";

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<UserDto>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<UserDto>.Success(cachedResult);
                }


                // Lấy thông tin người dùng từ cơ sở dữ liệu
                var user = await _unitOfWork.Users.GetByIdAsync(request.Id);

                // Kiểm tra nếu không tìm thấy người dùng
                if (user == null)
                {
                    return Result<UserDto>.NotFound($"Không tìm thấy người dùng với ID: {request.Id}");
                }

                // Map thông tin từ entity sang DTO
                var userDto = _mapper.Map<UserDto>(user);

                // Nếu người dùng có ảnh đại diện, lấy đường dẫn từ dịch vụ lưu trữ
                if (!string.IsNullOrEmpty(user.Avatar))
                {
                    userDto.Avatar = await _fileStorageService.GetFileUrlAsync(user.Avatar);
                }

                // Lấy danh sách vai trò của người dùng
                var roles = await _unitOfWork.Users.GetRolesAsync(user);
                userDto.Roles = roles;

                // Lấy danh sách quyền của người dùng
                var permissions = await _unitOfWork.Users.GetPermissionNamesAsync(user);
                userDto.Permissions = [.. permissions];

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, userDto, TimeSpan.FromMinutes(10));

                // Trả về kết quả thành công với thông tin người dùng
                return Result<UserDto>.Success(userDto);
            }
            catch (Exception ex)
            {
                return Result<UserDto>.BadRequest(ex.Message);
            }

        }
    }
}


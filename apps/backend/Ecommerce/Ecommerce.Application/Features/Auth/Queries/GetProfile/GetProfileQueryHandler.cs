using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Users.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Auth.Queries.GetProfile
{
    public class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, Result<UserDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly IFileStorageService _fileStorageService;


        public GetProfileQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService,
            IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<UserDto>> Handle(GetProfileQuery request, CancellationToken cancellationToken)
        {
            try
            {


                if (_currentUserService.UserId == null)
                {
                    return Result<UserDto>.Unauthorized("Người dùng chưa được xác thực.");
                }

                // Get current user roles
                var currentUser = await _unitOfWork.Users.GetByIdAsync(_currentUserService.UserId.Value);
                var currentUserRoles = await _unitOfWork.Users.GetRolesAsync(currentUser);

                // Get target user roles
                var userRoles = await _unitOfWork.Users.GetRolesAsync(currentUser);
                var userPermissions = await _unitOfWork.Users.GetPermissionNamesAsync(currentUser);

                // Customer can only view their own profile
                if (currentUserRoles.Contains(EUserRoles.Customer) && currentUser.Id != _currentUserService.UserId)
                {
                    return Result<UserDto>.Forbidden("Bạn không có quyền xem hồ sơ này.");
                }

                // Staff cannot view admin profiles
                if (currentUserRoles.Contains(EUserRoles.Staff) && userRoles.Contains(EUserRoles.Admin))
                {
                    return Result<UserDto>.Forbidden("Bạn không có quyền xem hồ sơ này.");
                }

                var userDto = _mapper.Map<UserDto>(currentUser);
                userDto.Roles = [.. userRoles];
                userDto.Avatar = await _fileStorageService.GetFileUrlAsync(userDto.Avatar);
                userDto.Permissions = [.. userPermissions];

                return Result<UserDto>.Success(userDto);
            }
            catch (Exception ex)
            {
                return Result<UserDto>.BadRequest(ex.Message);
            }

        }
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Permissions.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.Permissions.Queries.GetPermissionsByUserId
{
    [Authorize(Policy = "ViewPermissions")]
    public class GetPermissionsByUserIdQueryHandler : IRequestHandler<GetPermissionsByUserIdQuery, Result<List<PermissionDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetPermissionsByUserIdQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<List<PermissionDto>>> Handle(GetPermissionsByUserIdQuery request, CancellationToken cancellationToken)
        {
            // Kiểm tra người dùng tồn tại
            var user = await _unitOfWork.Users.GetByIdAsync(request.UserId);
            if (user == null)
            {
                return Result<List<PermissionDto>>.NotFound($"Không tìm thấy người dùng với ID: {request.UserId}");
            }

            // Lấy danh sách tất cả quyền
            var allPermissions = await _unitOfWork.Permissions.GetAllAsync(cancellationToken);

            // Lấy danh sách quyền đã gán cho người dùng
            var userPermissions = await _unitOfWork.Users.GetPermissionsAsync(user);
            var userPermissionIds = userPermissions.Select(p => p.Id).ToHashSet();

            // Tạo danh sách DTO, đánh dấu những quyền đã được gán
            var permissionDtos = allPermissions.Select(p => new PermissionDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                IsSelected = userPermissionIds.Contains(p.Id)
            }).ToList();

            return Result<List<PermissionDto>>.Success(permissionDtos);
        }
    }
}


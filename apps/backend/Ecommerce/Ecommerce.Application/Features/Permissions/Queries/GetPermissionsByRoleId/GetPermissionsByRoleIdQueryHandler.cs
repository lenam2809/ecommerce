using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Permissions.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.Permissions.Queries.GetPermissionsByRoleId
{
    [Authorize(Policy = EPermissions.ViewPermissions)]
    public class GetPermissionsByRoleIdQueryHandler : IRequestHandler<GetPermissionsByRoleIdQuery, Result<List<PermissionDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetPermissionsByRoleIdQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<List<PermissionDto>>> Handle(GetPermissionsByRoleIdQuery request, CancellationToken cancellationToken)
        {
            // Kiểm tra vai trò tồn tại
            var role = await _unitOfWork.Roles.GetByIdAsync(request.RoleId);
            if (role == null)
            {
                return Result<List<PermissionDto>>.NotFound($"Không tìm thấy vai trò với ID: {request.RoleId}");
            }

            // Lấy danh sách tất cả quyền
            var allPermissions = await _unitOfWork.Permissions.GetAllAsync();

            // Lấy danh sách quyền đã gán cho vai trò
            var rolePermissions = await _unitOfWork.Roles.GetPermissionsAsync(role);
            var rolePermissionIds = rolePermissions.Select(p => p.Id).ToHashSet();

            // Tạo danh sách DTO, đánh dấu những quyền đã được gán
            var permissionDtos = allPermissions.Select(p => new PermissionDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                IsSelected = rolePermissionIds.Contains(p.Id)
            }).ToList();

            return Result<List<PermissionDto>>.Success(permissionDtos);
        }
    }
}


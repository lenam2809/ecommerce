using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Roles.Dto;
using Ecommerce.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Ecommerce.Application.Features.Roles.Queries.GetRoleById
{
    //[Authorize(Policy = "ViewRoles")]
    public class GetRoleByIdQueryHandler : IRequestHandler<GetRoleByIdQuery, Result<RoleDto>>
    {
        private readonly IMapper _mapper;
        private readonly RoleManager<Role> _roleManager;
        public GetRoleByIdQueryHandler(
            RoleManager<Role> roleManager,
            IMapper mapper)
        {
            _roleManager = roleManager;
            _mapper = mapper;
        }

        public async Task<Result<RoleDto>> Handle(GetRoleByIdQuery request, CancellationToken cancellationToken)
        {

            var role = await _roleManager.FindByIdAsync(request.Id.ToString());
            // Kiểm tra nếu không tìm thấy quyền
            if (role == null)
            {
                return Result<RoleDto>.NotFound($"Không tìm thấy vai trò với ID: {request.Id}");
            }

            // Map thành DTO và trả về kết quả
            var result = _mapper.Map<RoleDto>(role);

            return Result<RoleDto>.Success(result);
        }
    }
}


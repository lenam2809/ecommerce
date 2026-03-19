using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Roles.Dto;
using Ecommerce.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Roles.Queries.GetRolesByUserId
{
    //[Authorize(Policy = "ViewRoles")]
    public class GetRolesByUserIdQueryHandler : IRequestHandler<GetRolesByUserIdQuery, Result<List<RoleDto>>>
    {
        private readonly IMapper _mapper;
        private readonly RoleManager<Role> _roleManager;
        public GetRolesByUserIdQueryHandler(
            RoleManager<Role> roleManager,
            IMapper mapper)
        {
            _roleManager = roleManager;
            _mapper = mapper;
        }

        public async Task<Result<List<RoleDto>>> Handle(GetRolesByUserIdQuery request, CancellationToken cancellationToken)
        {
            var roles = await _roleManager.Roles
                .Where(r => r.UserRoles.Select(u => u.UserId).Contains(request.UserId))
                .ToListAsync(cancellationToken);

            // Map thành DTO và trả về kết quả
            var result = _mapper.Map<List<RoleDto>>(roles);

            return Result<List<RoleDto>>.Success(result);
        }
    }

}


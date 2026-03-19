using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Roles.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Roles.Queries.GetAllRoles
{
    //[Authorize(Policy = "ViewRoles")]
    public class GetAllRolesQueryHandler : IRequestHandler<GetAllRolesQuery, Result<List<RoleDto>>>
    {
        private readonly RoleManager<Role> _roleManager;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;

        public GetAllRolesQueryHandler(
            RoleManager<Role> roleManager,
            IMapper mapper,
            IEnhancedLogger logger)
        {
            _roleManager = roleManager;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<Result<List<RoleDto>>> Handle(GetAllRolesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var roles = await _roleManager.Roles
                    .OrderBy(r => r.Name)
                    .ToListAsync(cancellationToken);

                var roleDtos = _mapper.Map<List<RoleDto>>(roles);

                return Result<List<RoleDto>>.Success(roleDtos);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "GetAllRolesQueryHandler.Handle");
                return Result<List<RoleDto>>.BadRequest(ex.Message);
            }
        }
    }
}


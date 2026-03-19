using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Roles.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Roles.Queries.GetRoles
{
    public class GetRolesQuery : IRequest<Result<PaginatedList<RoleDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SearchTerm { get; set; } = string.Empty;
        public string SortBy { get; set; } = "name";
        public bool IsDescending { get; set; } = false;
    }
}


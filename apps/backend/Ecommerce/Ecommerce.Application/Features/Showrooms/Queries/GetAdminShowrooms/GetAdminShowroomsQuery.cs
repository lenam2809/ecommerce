using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Showrooms.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Showrooms.Queries.GetAdminShowrooms
{
    public class GetAdminShowroomsQuery : IRequest<Result<List<AdminShowroomDto>>>
    {
        public string? Region { get; set; }
        public string? Search { get; set; }
        public bool? IsActive { get; set; }
    }
}

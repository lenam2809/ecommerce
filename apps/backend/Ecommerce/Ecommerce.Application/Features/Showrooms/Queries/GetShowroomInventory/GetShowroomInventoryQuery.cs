using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Showrooms.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Showrooms.Queries.GetShowroomInventory
{
    public class GetShowroomInventoryQuery : IRequest<Result<List<ShowroomInventoryDto>>>
    {
        public Guid ShowroomId { get; set; }
        public string? Search { get; set; }
    }
}

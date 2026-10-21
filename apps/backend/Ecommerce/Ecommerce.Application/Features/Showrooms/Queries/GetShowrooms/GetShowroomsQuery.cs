using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Showrooms.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Showrooms.Queries.GetShowrooms
{
    public class GetShowroomsQuery : IRequest<Result<List<ShowroomDto>>>
    {
        public string? Province { get; set; }
    }
}

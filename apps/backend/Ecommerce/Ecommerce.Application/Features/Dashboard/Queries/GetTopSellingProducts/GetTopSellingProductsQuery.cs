using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Dashboard.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Dashboard.Queries.GetTopSellingProducts
{
    public class GetTopSellingProductsQuery : IRequest<Result<List<TopProductDto>>>
    {
        public int Top { get; set; } = 5;
    }
}


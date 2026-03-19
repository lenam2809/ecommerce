using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Dashboard.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Dashboard.Queries.GetProductsByDate
{
    public class GetProductsByDateQuery : IRequest<Result<List<ProductsByDateDto>>>
    {
        public int Days { get; set; } = 30;
    }
}


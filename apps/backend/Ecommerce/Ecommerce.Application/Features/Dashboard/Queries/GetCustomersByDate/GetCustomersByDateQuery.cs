using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Dashboard.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Dashboard.Queries.GetCustomersByDate
{
    public class GetCustomersByDateQuery : IRequest<Result<List<CustomersByDateDto>>>
    {
        public int Days { get; set; } = 30;
    }
}


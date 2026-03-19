using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.CustomerAddresses.Dto;
using MediatR;

namespace Ecommerce.Application.Features.CustomerAddresses.Queries.GetCustomerAddresses
{
    public class GetCustomerAddressesQuery : IRequest<Result<List<CustomerAddressDto>>>
    {
        public Guid ApplicationUserId { get; set; }
    }
}


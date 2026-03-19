using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.CustomerAddresses.Dto;
using MediatR;

namespace Ecommerce.Application.Features.CustomerAddresses.Queries.GetCustomerAddressById
{
    public class GetCustomerAddressByIdQuery : IRequest<Result<CustomerAddressDto>>
    {
        public Guid Id { get; set; }
        public Guid ApplicationUserId { get; set; }
    }
}


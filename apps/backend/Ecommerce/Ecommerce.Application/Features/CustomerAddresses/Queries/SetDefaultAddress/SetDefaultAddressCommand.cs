using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.CustomerAddresses.Queries.SetDefaultAddress
{
    public class SetDefaultAddressCommand : IRequest<Result<Unit>>
    {
        public Guid AddressId { get; set; }
        public Guid ApplicationUserId { get; set; }
    }
}


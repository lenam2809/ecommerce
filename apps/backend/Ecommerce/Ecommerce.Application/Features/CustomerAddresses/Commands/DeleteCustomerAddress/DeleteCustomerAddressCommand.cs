using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.CustomerAddresses.Commands.DeleteCustomerAddress
{
    public class DeleteCustomerAddressCommand : IRequest<Result<Unit>>
    {
        public Guid Id { get; set; }
        public Guid ApplicationUserId { get; set; }
    }
}


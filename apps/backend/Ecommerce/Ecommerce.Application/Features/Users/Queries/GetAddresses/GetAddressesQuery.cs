using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Users.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Users.Queries.GetAddresses
{
    public class GetAddressesQuery : IRequest<Result<List<UserDto>>>
    {
    }
}


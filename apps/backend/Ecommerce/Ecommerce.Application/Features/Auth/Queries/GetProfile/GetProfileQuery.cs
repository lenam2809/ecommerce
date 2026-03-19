using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Users.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Auth.Queries.GetProfile
{
    public class GetProfileQuery : IRequest<Result<UserDto>> { }
}


using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Auth.Commands.RegisterUser
{
    public class RegisterCommand : IRequest<Result<Guid>>
    {
        public required string Email { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Password { get; set; }
        public required string ConfirmPassword { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
    }
}


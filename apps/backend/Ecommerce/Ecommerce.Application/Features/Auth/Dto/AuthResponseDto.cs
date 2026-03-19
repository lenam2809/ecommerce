using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Features.Auth.Dto
{
    public class AuthResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Avatar { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = [];
        public List<string> Permissions { get; set; } = [];
        public ECustomerLevel CustomerLevel { get; set; }
    }
}


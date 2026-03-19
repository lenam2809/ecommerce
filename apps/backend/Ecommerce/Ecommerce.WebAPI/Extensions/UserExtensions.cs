using System.Security.Claims;

namespace Ecommerce.WebAPI.Extensions
{
    public static class UserExtensions
    {
        public static Guid GetUserId(this ClaimsPrincipal user)
        {
            var userId = user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userId ?? Guid.Empty.ToString());
        }

        public static bool IsInRole(this ClaimsPrincipal user, string role)
        {
            return user.Claims.Any(c => c.Type == ClaimTypes.Role && c.Value == role);
        }
    }
}


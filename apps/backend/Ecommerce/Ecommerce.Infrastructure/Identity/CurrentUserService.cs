using Ecommerce.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Ecommerce.Infrastructure.Identity
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

        public Guid? UserId
        {
            get
            {
                var userIdClaim = User?.FindFirstValue(ClaimTypes.NameIdentifier);
                return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
            }
        }

        public string Email => User?.FindFirstValue(ClaimTypes.Email) ?? string.Empty;

        public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

        public List<string> UserRoles => User?.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList() ?? [];

        public string FullName => User?.FindFirstValue(ClaimTypes.Name) ?? string.Empty;


        public string GetClaim(string claimType)
        {
            return User?.FindFirstValue(claimType);
        }

        public bool IsInRole(string role)
        {
            return User?.IsInRole(role) ?? false;
        }

        public bool HasClaim(string claimType, string claimValue = null)
        {
            if (User == null) return false;

            if (string.IsNullOrEmpty(claimValue))
            {
                return User.HasClaim(c => c.Type == claimType);
            }

            return User.HasClaim(claimType, claimValue);
        }

        public async Task<bool> IsInRoleAsync(string role)
        {
            if (User == null || !IsAuthenticated || string.IsNullOrEmpty(role))
            {
                return false;
            }

            return User.IsInRole(role);
        }

        public string? GuestId => _httpContextAccessor.HttpContext?
            .Request.Headers["X-Guest-ID"].FirstOrDefault();
    }

}


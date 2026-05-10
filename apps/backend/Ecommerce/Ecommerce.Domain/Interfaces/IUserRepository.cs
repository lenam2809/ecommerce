using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;
using Microsoft.AspNetCore.Identity;

namespace Ecommerce.Domain.Interfaces
{
    public interface IUserRepository : IRepository<ApplicationUser>
    {
        Task<ApplicationUser?> GetByIdAsync(Guid id);
        Task<ApplicationUser?> GetByEmailAsync(string email);
        Task<ApplicationUser?> GetByLoginAsync(string loginProvider, string providerKey);
        Task<IEnumerable<ApplicationUser>> GetAllAsync();
        Task<ApplicationUser?> AddAsync(ApplicationUser user, string password);
        Task<IdentityResult> AddLoginAsync(ApplicationUser user, UserLoginInfo loginInfo);
        Task UpdateAsync(ApplicationUser user);
        Task DeleteAsync(ApplicationUser user);
        Task<bool> CheckPasswordAsync(ApplicationUser user, string password);
        Task<IEnumerable<string>> GetRolesAsync(ApplicationUser user);
        Task<IEnumerable<Permission>> GetPermissionsAsync(ApplicationUser user);
        Task<IEnumerable<string>> GetPermissionNamesAsync(ApplicationUser user);
        IQueryable<Permission> GetPermissionsQuery(ApplicationUser user);
        Task<bool> AddToRoleAsync(ApplicationUser user, string role);
        Task<bool> RemoveFromRoleAsync(ApplicationUser user, string role);
        Task<bool> AddPermissionAsync(ApplicationUser user, Permission permission);
        Task<bool> RemovePermissionAsync(ApplicationUser user, Permission permission);
        Task<bool> IsInRoleAsync(ApplicationUser user, string role);
        Task<bool> HasPermissionAsync(ApplicationUser user, string permissionName);
        Task RefreshUserClaimsAsync(ApplicationUser user);
        Task RefreshUserClaimsInRoleAsync(string roleName);
        Task<IdentityResult> ChangePasswordAsync(ApplicationUser user, string currentPassword, string newPassword);
        Task<IdentityResult> ResetPasswordAsync(ApplicationUser user, string newPassword);
        Task<IdentityResult> AccessFailedAsync(ApplicationUser user);
        Task<IdentityResult> ResetAccessFailedCountAsync(ApplicationUser user);
        Task<int> GetAccessFailedCountAsync(ApplicationUser user);
    }
}


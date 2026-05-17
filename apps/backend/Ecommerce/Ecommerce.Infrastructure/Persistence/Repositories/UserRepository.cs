using Ecommerce.Application.Policies;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class UserRepository : BaseRepository<ApplicationUser>, IUserRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<Role> _roleManager;

        public UserRepository(
            UserManager<ApplicationUser> userManager,
            RoleManager<Role> roleManager,
            ApplicationDbContext context) : base(context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<ApplicationUser?> GetByIdAsync(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user != null)
            {
                user.RefreshTokens = await _context.RefreshTokens
                    .Where(rt => rt.ApplicationUserId == id)
                    .ToListAsync();
            }
            return user;
        }

        public async Task<ApplicationUser?> GetByEmailAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }

        public async Task<ApplicationUser?> GetByLoginAsync(string loginProvider, string providerKey)
        {
            return await _userManager.FindByLoginAsync(loginProvider, providerKey);
        }

        public async Task<IEnumerable<ApplicationUser>> GetAllAsync()
        {
            return await _userManager.Users.ToListAsync();
        }

        public async Task<ApplicationUser?> AddAsync(ApplicationUser user, string password)
        {
            var result = await _userManager.CreateAsync(user, password);
            if (result.Succeeded)
            {
                return user;
            }
            return null;
        }

        public async Task<IdentityResult> AddLoginAsync(ApplicationUser user, UserLoginInfo loginInfo)
        {
            return await _userManager.AddLoginAsync(user, loginInfo);
        }

        public async Task UpdateAsync(ApplicationUser user)
        {
            await _userManager.UpdateAsync(user);
        }

        public async Task DeleteAsync(ApplicationUser user)
        {
            await _userManager.DeleteAsync(user);
        }

        public async Task<bool> CheckPasswordAsync(ApplicationUser user, string password)
        {
            return await _userManager.CheckPasswordAsync(user, password);
        }

        public async Task<IEnumerable<string>> GetRolesAsync(ApplicationUser user)
        {
            return await _userManager.GetRolesAsync(user);
        }

        public async Task<IEnumerable<Permission>> GetPermissionsAsync(ApplicationUser user)
        {
            // Kiểm tra xem user có role Admin không
            var isAdmin = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == user.Id &&
                       _context.Roles.Any(r => r.Id == ur.RoleId && r.Name == EUserRoles.Admin));

            if (isAdmin)
            {
                // Nếu là Admin, trả về tất cả các permissions
                return await _context.Permissions.ToListAsync();
            }

            // Lấy danh sách RoleId của user
            var roleIds = await _context.UserRoles
                .Where(ur => ur.UserId == user.Id)
                .Select(ur => ur.RoleId)
                .ToListAsync();

            // Lấy danh sách quyền từ UserPermissions
            var userPermissions = await _context.UserPermissions
                .Where(up => up.ApplicationUserId == user.Id)
                .Select(up => up.Permission)
                .ToListAsync();

            // Nếu user không có role nào
            if (roleIds.Count == 0)
            {
                return userPermissions.Distinct();
            }

            // Lấy danh sách quyền từ RolePermissions
            var rolePermissions = await _context.RolePermissions
                .Where(rp => roleIds.Contains(rp.RoleId))
                .Select(rp => rp.Permission)
                .ToListAsync();

            // Gộp danh sách và loại bỏ quyền trùng lặp
            return userPermissions.Union(rolePermissions).Distinct();
        }

        public async Task<IEnumerable<string>> GetPermissionNamesAsync(ApplicationUser user)
        {
            // Kiểm tra xem user có role Admin không
            var isAdmin = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == user.Id &&
                       _context.Roles.Any(r => r.Id == ur.RoleId && r.Name == EUserRoles.Admin));

            if (isAdmin)
            {
                // Nếu là Admin, trả về tất cả các permissions
                return await _context.Permissions.Select(x => x.Name).ToListAsync();
            }

            // Lấy danh sách RoleId của user
            var roleIds = await _context.UserRoles
                .Where(ur => ur.UserId == user.Id)
                .Select(ur => ur.RoleId)
                .ToListAsync();

            // Lấy danh sách quyền từ UserPermissions
            var userPermissions = await _context.UserPermissions
                .Where(up => up.ApplicationUserId == user.Id)
                .Select(up => up.Permission.Name)
                .ToListAsync();

            // Nếu user không có role nào
            if (roleIds.Count == 0)
            {
                return userPermissions.Distinct();
            }

            // Lấy danh sách quyền từ RolePermissions
            var rolePermissions = await _context.RolePermissions
                .Where(rp => roleIds.Contains(rp.RoleId))
                .Select(rp => rp.Permission.Name)
                .ToListAsync();

            // Gộp danh sách và loại bỏ quyền trùng lặp
            return userPermissions.Union(rolePermissions).Distinct();
        }


        public IQueryable<Permission> GetPermissionsQuery(ApplicationUser user)
        {
            var roleIdsQuery = _context.UserRoles
                .Where(ur => ur.UserId == user.Id)
                .Select(ur => ur.RoleId);

            var userPermissions = _context.UserPermissions
                .Where(up => up.ApplicationUserId == user.Id)
                .Select(up => up.Permission);

            var rolePermissions = _context.RolePermissions
                .Where(rp => roleIdsQuery.Contains(rp.RoleId))
                .Select(rp => rp.Permission);

            return userPermissions.Union(rolePermissions).Distinct();
        }

        public async Task<bool> AddToRoleAsync(ApplicationUser user, string role)
        {
            var result = await _userManager.AddToRoleAsync(user, role);
            return result.Succeeded;
        }

        public async Task<bool> RemoveFromRoleAsync(ApplicationUser user, string role)
        {
            var result = await _userManager.RemoveFromRoleAsync(user, role);
            return result.Succeeded;
        }

        public async Task<bool> AddPermissionAsync(ApplicationUser user, Permission permission)
        {
            var userPermission = new UserPermission
            {
                ApplicationUserId = user.Id,
                PermissionId = permission.Id
            };

            await _context.UserPermissions.AddAsync(userPermission);
            return true;
        }

        public async Task<bool> RemovePermissionAsync(ApplicationUser user, Permission permission)
        {
            var userPermission = await _context.UserPermissions
                .FirstOrDefaultAsync(up => up.ApplicationUserId == user.Id && up.PermissionId == permission.Id);

            if (userPermission != null)
            {
                _context.UserPermissions.Remove(userPermission);
                return true;
            }
            return false;
        }

        // Add these methods to the UserRepository class

        public async Task<bool> IsInRoleAsync(ApplicationUser user, string role)
        {
            return await _userManager.IsInRoleAsync(user, role);
        }

        public async Task<IdentityResult> ChangePasswordAsync(ApplicationUser user, string currentPassword, string newPassword)
        {
            return await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        }

        public async Task<IdentityResult> ResetPasswordAsync(ApplicationUser user, string newPassword)
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            return await _userManager.ResetPasswordAsync(user, token, newPassword);
        }

        public async Task<bool> HasPermissionAsync(ApplicationUser user, string permissionName)
        {
            if (user == null || string.IsNullOrEmpty(permissionName))
            {
                return false;
            }

            var permissions = await GetPermissionsAsync(user);
            return permissions.Any(p => p.Name.Equals(permissionName, StringComparison.OrdinalIgnoreCase));
        }

        public async Task RefreshUserClaimsAsync(ApplicationUser user)
        {
            if (user == null)
            {
                return;
            }

            // Remove existing claims
            var existingClaims = await _userManager.GetClaimsAsync(user);
            foreach (var claim in existingClaims)
            {
                await _userManager.RemoveClaimAsync(user, claim);
            }

            // Add role claims
            var roles = await _userManager.GetRolesAsync(user);
            foreach (var roleName in roles)
            {
                var role = await _roleManager.FindByNameAsync(roleName);
                if (role != null)
                {
                    var roleClaims = await _roleManager.GetClaimsAsync(role);
                    foreach (var claim in roleClaims)
                    {
                        await _userManager.AddClaimAsync(user, claim);
                    }
                }
            }

            // Add direct permissions as claims
            var permissions = await GetPermissionsAsync(user);
            foreach (var permission in permissions)
            {
                await _userManager.AddClaimAsync(user, new Claim(AuthorizationClaimTypes.Permission, permission.Name));
            }
        }

        public async Task RefreshUserClaimsInRoleAsync(string roleName)
        {
            if (string.IsNullOrEmpty(roleName))
            {
                return;
            }

            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null)
            {
                return;
            }

            // Get all users in this role
            var usersInRole = await _userManager.GetUsersInRoleAsync(roleName);

            // Refresh claims for each user
            foreach (var user in usersInRole)
            {
                await RefreshUserClaimsAsync(user);
            }
        }

        public async Task<IdentityResult> AccessFailedAsync(ApplicationUser user)
        {
            return await _userManager.AccessFailedAsync(user);
        }

        public async Task<IdentityResult> ResetAccessFailedCountAsync(ApplicationUser user)
        {
            return await _userManager.ResetAccessFailedCountAsync(user);
        }

        public async Task<int> GetAccessFailedCountAsync(ApplicationUser user)
        {
            return await _userManager.GetAccessFailedCountAsync(user);
        }
    }
}


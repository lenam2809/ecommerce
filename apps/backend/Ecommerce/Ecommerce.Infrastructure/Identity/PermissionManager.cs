using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Identity
{
    public class PermissionManager : IPermissionManager
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<Domain.Entities.Role> _roleManager;

        public PermissionManager(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<Domain.Entities.Role> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<IList<string>> GetPermissionsForUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new List<string>();
            }

            var roles = await _userManager.GetRolesAsync(user);
            var roleIds = await _roleManager.Roles
                .Where(r => roles.Contains(r.Name))
                .Select(r => r.Id)
                .ToListAsync();

            // Get permissions for all the user's roles
            var permissions = await _context.RolePermissions
                .Where(rp => roleIds.Contains(rp.RoleId))
                .Include(rp => rp.Permission)
                .Select(rp => rp.Permission.Name)
                .Distinct()
                .ToListAsync();

            return permissions;
        }

        public async Task<bool> AddPermissionToRoleAsync(string roleName, string permissionName)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null)
            {
                return false;
            }

            var permission = await _context.Permissions.FirstOrDefaultAsync(p => p.Name == permissionName);
            if (permission == null)
            {
                // Create the permission if it doesn't exist
                permission = new Permission { Name = permissionName, Description = string.Empty };
                await _context.Permissions.AddAsync(permission);
                await _context.SaveChangesAsync();
            }

            // Check if the role already has this permission
            var existingRolePermission = await _context.RolePermissions
                .FirstOrDefaultAsync(rp => rp.RoleId == role.Id && rp.PermissionId == permission.Id);

            if (existingRolePermission != null)
            {
                // Role already has this permission
                return true;
            }

            // Add permission to role
            var rolePermission = new RolePermission
            {
                RoleId = role.Id,
                PermissionId = permission.Id
            };

            await _context.RolePermissions.AddAsync(rolePermission);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> RemovePermissionFromRoleAsync(string roleName, string permissionName)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null)
            {
                return false;
            }

            var permission = await _context.Permissions.FirstOrDefaultAsync(p => p.Name == permissionName);
            if (permission == null)
            {
                return false;
            }

            var rolePermission = await _context.RolePermissions
                .FirstOrDefaultAsync(rp => rp.RoleId == role.Id && rp.PermissionId == permission.Id);

            if (rolePermission == null)
            {
                // Role doesn't have this permission
                return true;
            }

            _context.RolePermissions.Remove(rolePermission);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<IList<string>> GetAllPermissionsAsync()
        {
            return await _context.Permissions
                .Select(p => p.Name)
                .ToListAsync();
        }

        public async Task<IList<string>> GetPermissionsForRoleAsync(string roleName)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null)
            {
                return new List<string>();
            }

            var permissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == role.Id)
                .Include(rp => rp.Permission)
                .Select(rp => rp.Permission.Name)
                .ToListAsync();

            return permissions;
        }
    }
}


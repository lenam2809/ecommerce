using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class RoleRepository : BaseRepository<Role>, IRoleRepository
    {
        public RoleRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Role> GetByNameAsync(string name)
        {
            return await _context.Roles
                .FirstOrDefaultAsync(r => r.Name == name);
        }

        public async Task<ICollection<Permission>> GetPermissionsAsync(Role role)
        {
            return await _context.RolePermissions
                .Where(rp => rp.RoleId == role.Id)
                .Select(rp => rp.Permission)
                .ToListAsync();
        }

        public async Task AddPermissionAsync(Role role, Permission permission)
        {
            // Kiểm tra xem quyền đã được gán cho vai trò chưa
            var exists = await _context.RolePermissions
                .AnyAsync(rp => rp.RoleId == role.Id && rp.PermissionId == permission.Id);

            if (!exists)
            {
                _context.RolePermissions.Add(new RolePermission
                {
                    RoleId = role.Id,
                    PermissionId = permission.Id
                });
            }
        }

        public async Task RemovePermissionAsync(Role role, Permission permission)
        {
            var rolePermission = await _context.RolePermissions
                .FirstOrDefaultAsync(rp => rp.RoleId == role.Id && rp.PermissionId == permission.Id);

            if (rolePermission != null)
            {
                _context.RolePermissions.Remove(rolePermission);
            }
        }

        public async Task<bool> HasPermissionAsync(Role role, string permissionName)
        {
            return await _context.RolePermissions
                .Where(rp => rp.RoleId == role.Id)
                .Join(_context.Permissions,
                    rp => rp.PermissionId,
                    p => p.Id,
                    (rp, p) => p.Name)
                .AnyAsync(name => name == permissionName);
        }
    }
}


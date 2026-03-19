using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Infrastructure.Persistence.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Infrastructure.Persistence.Repositories
{
    public class PermissionRepository : BaseRepository<Permission>, IPermissionRepository
    {
        public PermissionRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Permission> GetByNameAsync(string name)
        {
            return await _context.Permissions
                .FirstOrDefaultAsync(p => p.Name == name);
        }

        public async Task<bool> IsAssignedToAnyUser(Guid permissionId)
        {
            return await _context.UserPermissions
                .AnyAsync(up => up.PermissionId == permissionId);
        }

        public async Task<bool> IsAssignedToAnyRole(Guid permissionId)
        {
            return await _context.RolePermissions
                .AnyAsync(rp => rp.PermissionId == permissionId);
        }

        public async Task<IEnumerable<ApplicationUser>> GetUsersWithPermissionAsync(Guid permissionId)
        {
            // Lấy người dùng có permission trực tiếp
            var usersWithDirectPermission = await _context.UserPermissions
                .Where(up => up.PermissionId == permissionId)
                .Select(up => up.ApplicationUser)
                .ToListAsync();

            // Lấy người dùng có permission thông qua vai trò
            var usersWithRolePermission = await _context.RolePermissions
                .Where(rp => rp.PermissionId == permissionId)
                .Join(_context.UserRoles,
                    rp => rp.RoleId,
                    ur => ur.RoleId,
                    (rp, ur) => ur.UserId)
                .Join(_context.Users,
                    userId => userId,
                    user => user.Id,
                    (userId, user) => user)
                .ToListAsync();

            // Kết hợp và loại bỏ trùng lặp
            return usersWithDirectPermission
                .Concat(usersWithRolePermission)
                .DistinctBy(u => u.Id)
                .ToList();
        }
    }
}


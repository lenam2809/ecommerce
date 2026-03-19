using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IRoleRepository : IRepository<Role>
    {
        /// <summary>
        /// Lấy vai trò theo tên
        /// </summary>
        Task<Role> GetByNameAsync(string name);

        /// <summary>
        /// Lấy danh sách quyền của vai trò
        /// </summary>
        Task<ICollection<Permission>> GetPermissionsAsync(Role role);

        /// <summary>
        /// Thêm quyền cho vai trò
        /// </summary>
        Task AddPermissionAsync(Role role, Permission permission);

        /// <summary>
        /// Xóa quyền khỏi vai trò
        /// </summary>
        Task RemovePermissionAsync(Role role, Permission permission);

        /// <summary>
        /// Kiểm tra vai trò có quyền hay không
        /// </summary>
        Task<bool> HasPermissionAsync(Role role, string permissionName);
    }
}


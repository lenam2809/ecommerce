using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Base;

namespace Ecommerce.Domain.Interfaces
{
    public interface IPermissionRepository : IRepository<Permission>
    {
        /// <summary>
        /// Lấy permission theo tên
        /// </summary>
        Task<Permission> GetByNameAsync(string name);

        /// <summary>
        /// Kiểm tra permission đã được gán cho bất kỳ user nào chưa
        /// </summary>
        Task<bool> IsAssignedToAnyUser(Guid permissionId);

        /// <summary>
        /// Kiểm tra permission đã được gán cho bất kỳ role nào chưa
        /// </summary>
        Task<bool> IsAssignedToAnyRole(Guid permissionId);

        /// <summary>
        /// Lấy danh sách user có permission
        /// </summary>
        Task<IEnumerable<ApplicationUser>> GetUsersWithPermissionAsync(Guid permissionId);

    }
}


namespace Ecommerce.Application.Common.Interfaces
{
    public interface IPermissionManager
    {
        /// <summary>
        /// Lấy danh sách quyền của một người dùng.
        /// </summary>
        Task<IList<string>> GetPermissionsForUserAsync(string userId);

        /// <summary>
        /// Thêm quyền vào vai trò.
        /// </summary>
        Task<bool> AddPermissionToRoleAsync(string roleName, string permissionName);

        /// <summary>
        /// Xóa quyền khỏi vai trò.
        /// </summary>
        Task<bool> RemovePermissionFromRoleAsync(string roleName, string permissionName);

        /// <summary>
        /// Lấy danh sách tất cả quyền trong hệ thống.
        /// </summary>
        Task<IList<string>> GetAllPermissionsAsync();

        /// <summary>
        /// Lấy danh sách quyền của một vai trò.
        /// </summary>
        Task<IList<string>> GetPermissionsForRoleAsync(string roleName);
    }

}


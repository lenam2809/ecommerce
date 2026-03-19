namespace Ecommerce.Application.Common.Interfaces
{
    /// <summary>
    /// Interface định nghĩa các phương thức dùng để làm mới (xoá) cache liên quan đến người dùng, vai trò và tenant.
    /// Dùng trong các hệ thống có sử dụng cache để đảm bảo dữ liệu không bị cũ khi có thay đổi.
    /// </summary>
    public interface ICacheInvalidationService
    {
        /// <summary>
        /// Xoá cache của một người dùng cụ thể theo Id.
        /// </summary>
        /// <param name="userId">Id của người dùng cần xoá cache.</param>
        Task InvalidateUserCache(Guid userId);

        /// <summary>
        /// Xoá cache liên quan đến một vai trò cụ thể.
        /// </summary>
        /// <param name="role">Tên vai trò cần xoá cache.</param>
        Task InvalidateRoleCache(string role);

        /// <summary>
        /// Xoá toàn bộ cache của tất cả người dùng.
        /// </summary>
        Task InvalidateAllUsersCache();

        /// <summary>
        /// Xoá cache của một tenant cụ thể theo Id.
        /// </summary>
        /// <param name="tenantId">Id của tenant cần xoá cache.</param>
        Task InvalidateTenantCache(Guid tenantId);

        /// <summary>
        /// Xoá toàn bộ cache của tất cả các tenant.
        /// </summary>
        Task InvalidateAllTenantsCache();

        /// <summary>
        /// Xóa cache liên quan đến sản phẩm (Chi tiết và Danh sách).
        /// </summary>
        /// <param name="productId">Id sản phẩm.</param>
        Task InvalidateProductCache(Guid productId);

        Task InvalidateCategoryCache(Guid categoryId);
        Task InvalidateBrandCache(Guid brandId);
        
        Task InvalidateBannerCache(Guid bannerId);
        Task InvalidateAboutCache(Guid aboutId);
        Task InvalidateContactCache(Guid contactId);
    }

}


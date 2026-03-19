namespace Ecommerce.Application.Common.Interfaces
{
    /// <summary>
    /// Service để merge giỏ hàng guest vào giỏ hàng user sau khi đăng nhập
    /// </summary>
    public interface IMergeCartService
    {
        /// <summary>
        /// Merge guest cart vào user cart khi user đăng nhập
        /// </summary>
        /// <param name="userId">ID của user đã đăng nhập</param>
        /// <param name="guestId">Guest ID từ cookie/localStorage</param>
        /// <param name="cancellationToken">Cancellation token</param>
        Task MergeGuestCartToUserAsync(Guid userId, string guestId, CancellationToken cancellationToken = default);
    }
}

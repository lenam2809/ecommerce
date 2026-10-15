namespace Ecommerce.Application.Common.Constants
{
    /// <summary>
    /// 🔒 SECURITY (H6): hằng số cho định danh giỏ hàng guest.
    /// GuestId được SERVER cấp qua httpOnly cookie (GuestCartMiddleware), không còn
    /// nhận từ header X-Guest-ID do client tự đặt — chặn việc giả mạo/chiếm giỏ của guest khác.
    /// </summary>
    public static class GuestCartConstants
    {
        public const string GuestIdCookieName = "guest_id";
        public const string GuestIdItemKey = "guest_id";
    }
}

namespace Ecommerce.Domain.Enums
{
    public enum ELogType
    {
        Default,       // Mặc định nếu không xác định
        Security,      // Đăng nhập, đăng xuất, thay đổi mật khẩu
        Transaction,   // Mua hàng, thanh toán, hoàn tiền
        UserActivity,  // Xem trang, thêm vào giỏ hàng, tìm kiếm sản phẩm
        System,         // Lỗi hệ thống, cảnh báo, thông tin hệ thống
        AccessControl,
        Configuration,
        Performance,
        Database,
        Integration,
        Notification,
        Validation
    }
}


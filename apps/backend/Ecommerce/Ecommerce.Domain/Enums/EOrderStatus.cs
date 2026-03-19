namespace Ecommerce.Domain.Enums
{
    public enum EOrderStatus
    {
        Pending,            // Chờ xử lý (đơn hàng mới được tạo)
        Processing,         // Đang xử lý (kiểm tra tồn kho, đóng gói, v.v.)
        Shipped,            // Đã gửi hàng (đơn hàng đã được chuyển đi)
        Completed,          // Hoàn tất (khách đã nhận hàng, giao dịch thành công)
        Cancelled,          // Đã hủy (do khách hủy hoặc lỗi hệ thống)
        Refunded,           // Đã hoàn tiền (sau khi trả hàng hoặc đơn bị hủy)
        Delivered,          // Đã giao (xác nhận bên vận chuyển giao hàng thành công)
        ReturnRequested,    // Yêu cầu trả hàng (khách yêu cầu trả hàng)
        Returned            // Đã trả hàng (hàng được gửi trả thành công)
    }

}


namespace Ecommerce.Domain.Enums
{
    /// <summary>
    /// Trạng thái quy trình đổi/trả hàng (RMA)
    /// </summary>
    public enum EReturnStatus
    {
        Requested,              // Đã gửi yêu cầu
        UnderReview,            // Đang xem xét
        Approved,               // Đã duyệt
        Rejected,               // Từ chối
        ItemReceived,           // Đã nhận hàng trả về
        QualityCheck,           // Kiểm tra chất lượng
        RefundProcessing,       // Đang xử lý hoàn tiền
        ExchangeProcessing,     // Đang xử lý đổi hàng
        Completed               // Hoàn tất
    }
}

namespace Ecommerce.Domain.Enums
{
    /// <summary>
    /// Trạng thái của từng đơn vị tồn kho (IMEI/Serial Number)
    /// </summary>
    public enum EInventoryStatus
    {
        Available,          // Có sẵn trong kho
        Reserved,           // Đã giữ cho đơn hàng (checkout)
        Sold,               // Đã bán
        Defective,          // Lỗi/hư hỏng
        ReturnedToStock     // Trả về kho (sau khi RMA)
    }
}

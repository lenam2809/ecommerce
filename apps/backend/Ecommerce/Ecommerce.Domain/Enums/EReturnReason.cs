namespace Ecommerce.Domain.Enums
{
    /// <summary>
    /// Lý do đổi/trả hàng
    /// </summary>
    public enum EReturnReason
    {
        Defective,          // Sản phẩm lỗi
        WrongItem,          // Giao sai hàng
        NotAsDescribed,     // Không đúng mô tả
        DamagedInShipping,  // Hư hỏng khi vận chuyển
        ChangedMind,        // Đổi ý (chỉ cho phép trong 7 ngày)
        Other               // Lý do khác
    }
}

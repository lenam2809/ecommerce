using System.Text.Json.Serialization;

namespace Ecommerce.Application.Features.Orders.Dto
{
    public class OrderHistoryDto
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public string FromStatus { get; set; } = string.Empty;
        public string ToStatus { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string ChangedBy { get; set; } = string.Empty;
        public string ChangeSource { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; }
        public decimal? PreviousTotalAmount { get; set; }
        public decimal? NewTotalAmount { get; set; }
        public string PreviousShippingAddress { get; set; } = string.Empty;
        public string NewShippingAddress { get; set; } = string.Empty;
        public DateTime? PreviousExpectedDeliveryDate { get; set; }
        public DateTime? NewExpectedDeliveryDate { get; set; }
        public string PreviousDiscountCode { get; set; } = string.Empty;
        public string NewDiscountCode { get; set; } = string.Empty;

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public Dictionary<string, object> AdditionalData { get; set; } = [];

        // Computed properties for display
        public string StatusChangeDescription => GetStatusChangeDescription();
        public string ChangeType => GetChangeType();
        public bool HasAmountChange => PreviousTotalAmount != NewTotalAmount;
        public bool HasAddressChange => PreviousShippingAddress != NewShippingAddress;
        public bool HasDeliveryDateChange => PreviousExpectedDeliveryDate != NewExpectedDeliveryDate;

        private string GetStatusChangeDescription()
        {
            if (FromStatus == ToStatus)
                return "Cập nhật thông tin đơn hàng";

            return (FromStatus, ToStatus) switch
            {
                ("Pending", "Processing") => "Xác nhận đơn hàng",
                ("Processing", "Shipped") => "Giao hàng",
                ("Shipped", "Delivered") => "Hoàn thành giao hàng",
                ("Delivered", "Completed") => "Hoàn thành đơn hàng",
                (_, "Cancelled") => "Hủy đơn hàng",
                (_, "ReturnRequested") => "Yêu cầu trả hàng",
                ("ReturnRequested", "Returned") => "Trả hàng",
                ("Returned", "Refunded") => "Hoàn tiền",
                _ => $"Thay đổi từ {FromStatus} thành {ToStatus}"
            };
        }

        private string GetChangeType()
        {
            if (FromStatus != ToStatus)
                return "STATUS_CHANGE";

            if (HasAmountChange)
                return "AMOUNT_CHANGE";

            if (HasAddressChange)
                return "ADDRESS_CHANGE";

            if (HasDeliveryDateChange)
                return "DELIVERY_DATE_CHANGE";

            return "INFO_UPDATE";
        }
    }
}


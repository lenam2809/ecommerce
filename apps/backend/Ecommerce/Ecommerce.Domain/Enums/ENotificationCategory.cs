namespace Ecommerce.Domain.Enums
{
    /// <summary>
    /// Danh mục thông báo
    /// </summary>
    public enum ENotificationCategory
    {
        System = 1,         // Thông báo hệ thống
        Order = 2,          // Thông báo đơn hàng
        Promotion = 3,      // Thông báo khuyến mãi
        Account = 4,        // Thông báo tài khoản
        Product = 5,        // Thông báo sản phẩm
        Review = 6,         // Thông báo đánh giá
        Security = 7,       // Thông báo bảo mật
        Marketing = 8,      // Thông báo marketing
        Customer = 9,       // Thông báo khách hàng
        Maintenance = 10    // Thông báo bảo trì
    }

    /// <summary>
    /// Mức độ ưu tiên thông báo
    /// </summary>
    public enum ENotificationPriority
    {
        Low = 1,      // Thấp
        Normal = 2,   // Bình thường
        High = 3,     // Cao
        Critical = 4  // Khẩn cấp
    }

    /// <summary>
    /// Trạng thái thông báo
    /// </summary>
    public enum ENotificationStatus
    {
        Pending = 1,    // Chờ gửi
        Sent = 2,       // Đã gửi
        Delivered = 3,  // Đã nhận
        Read = 4,       // Đã đọc
        Failed = 5,     // Thất bại
        Expired = 6     // Hết hạn
    }

    /// <summary>
    /// Loại thông báo
    /// </summary>
    public enum ENotificationType
    {
        Default,
        // Order notifications
        NewOrder,
        OrderStatusChanged,
        OrderConfirmed,
        OrderShipped,
        OrderDelivered,
        OrderCancelled,
        HighValueOrder,

        // Customer notifications
        NewCustomer,
        CustomerLevelUpgraded,
        CustomerBirthday,

        // Promotion notifications
        NewPromotion,
        PromotionExpiring,
        FlashSale,
        SpecialOffer,

        // Product notifications
        NewProduct,
        ProductOutOfStock,
        ProductBackInStock,
        PriceChanged,

        // Review notifications
        NewReview,
        ReviewReply,
        RatingUpdated,

        // System notifications
        SystemMaintenance,
        SystemUpdate,
        SecurityAlert,
        BackupCompleted,

        // Account notifications
        Welcome,
        PasswordChanged,
        ProfileUpdated,
        LoginAlert,

        // Marketing notifications
        Newsletter,
        Survey,
        Announcement,
        Event
    }
}


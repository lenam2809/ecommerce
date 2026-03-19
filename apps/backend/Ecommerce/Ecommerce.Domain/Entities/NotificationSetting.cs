using Ecommerce.Domain.Enums;

namespace Ecommerce.Domain.Entities
{
    /// <summary>
    /// Entity để lưu trữ cài đặt thông báo của người dùng
    /// </summary>
    public class NotificationSetting : BaseEntity
    {
        public Guid UserId { get; set; }
        public ApplicationUser User { get; set; } = null!;

        public ENotificationType NotificationType { get; set; }

        // Cài đặt nhận thông báo qua các kênh
        public bool EnableRealtime { get; set; } = true;  // Nhận thông báo realtime
        public bool EnableEmail { get; set; } = true;     // Nhận thông báo email
        public bool EnableSms { get; set; } = false;      // Nhận thông báo SMS (future)
        public bool EnablePush { get; set; } = true;      // Nhận push notification (future)

        // Thời gian không muốn nhận thông báo (Do Not Disturb)
        public TimeOnly? DoNotDisturbStart { get; set; }
        public TimeOnly? DoNotDisturbEnd { get; set; }

        // Tần suất nhận thông báo
        public ENotificationFrequency Frequency { get; set; } = ENotificationFrequency.Immediate;

        public bool IsActive { get; set; } = true;
    }

    /// <summary>
    /// Tần suất nhận thông báo
    /// </summary>
    public enum ENotificationFrequency
    {
        Immediate = 1,  // Ngay lập tức
        Hourly = 2,     // Mỗi giờ
        Daily = 3,      // Hàng ngày
        Weekly = 4,     // Hàng tuần
        Never = 5       // Không bao giờ
    }
}


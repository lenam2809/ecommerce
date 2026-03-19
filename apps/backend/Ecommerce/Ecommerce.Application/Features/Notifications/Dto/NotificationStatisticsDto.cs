namespace Ecommerce.Application.Features.Notifications.Dto
{
    public class NotificationStatisticsDto
    {
        public int TotalNotifications { get; set; }
        public int ReadNotifications { get; set; }
        public int UnreadNotifications { get; set; }
        public int ExpiredNotifications { get; set; }
        public Dictionary<string, int> NotificationsByCategory { get; set; } = new();
        public Dictionary<string, int> NotificationsByType { get; set; } = new();
        public Dictionary<string, int> NotificationsByMonth { get; set; } = new();

    }
}


namespace Ecommerce.Application.Common.Interfaces
{
    public interface IPushNotificationService
    {
        /// <summary>
        /// Gửi thông báo đến một người dùng cụ thể
        /// </summary>
        /// <param name="userId">ID của người dùng</param>
        /// <param name="title">Tiêu đề thông báo</param>
        /// <param name="message">Nội dung thông báo</param>
        /// <param name="data">Dữ liệu bổ sung đi kèm thông báo (nếu có)</param>
        /// <returns>Task</returns>
        Task SendNotificationAsync(Guid userId, string title, string message, Dictionary<string, string>? data = null);

        /// <summary>
        /// Gửi thông báo đến nhiều người dùng cùng lúc
        /// </summary>
        /// <param name="userIds">Danh sách ID của những người dùng</param>
        /// <param name="title">Tiêu đề thông báo</param>
        /// <param name="message">Nội dung thông báo</param>
        /// <param name="data">Dữ liệu bổ sung đi kèm thông báo (nếu có)</param>
        /// <returns>Task</returns>
        Task SendBulkNotificationAsync(List<Guid> userIds, string title, string message, Dictionary<string, string>? data = null);

        /// <summary>
        /// Gửi thông báo đến một nhóm người dùng dựa trên chủ đề/topic
        /// </summary>
        /// <param name="topic">Chủ đề/topic của thông báo</param>
        /// <param name="title">Tiêu đề thông báo</param>
        /// <param name="message">Nội dung thông báo</param>
        /// <param name="data">Dữ liệu bổ sung đi kèm thông báo (nếu có)</param>
        /// <returns>Task</returns>
        Task SendNotificationToTopicAsync(string topic, string title, string message, Dictionary<string, string>? data = null);

        /// <summary>
        /// Đăng ký token thiết bị cho người dùng
        /// </summary>
        /// <param name="userId">ID của người dùng</param>
        /// <param name="deviceToken">Token của thiết bị</param>
        /// <param name="deviceType">Loại thiết bị (Android, iOS, Web)</param>
        /// <returns>Task</returns>
        Task RegisterDeviceTokenAsync(Guid userId, string deviceToken, string deviceType);

        /// <summary>
        /// Hủy đăng ký token thiết bị cho người dùng
        /// </summary>
        /// <param name="userId">ID của người dùng</param>
        /// <param name="deviceToken">Token của thiết bị</param>
        /// <returns>Task</returns>
        Task UnregisterDeviceTokenAsync(Guid userId, string deviceToken);

        /// <summary>
        /// Đăng ký người dùng cho một chủ đề/topic
        /// </summary>
        /// <param name="userId">ID của người dùng</param>
        /// <param name="topic">Chủ đề/topic</param>
        /// <returns>Task</returns>
        Task SubscribeToTopicAsync(Guid userId, string topic);

        /// <summary>
        /// Hủy đăng ký người dùng khỏi một chủ đề/topic
        /// </summary>
        /// <param name="userId">ID của người dùng</param>
        /// <param name="topic">Chủ đề/topic</param>
        /// <returns>Task</returns>
        Task UnsubscribeFromTopicAsync(Guid userId, string topic);
    }
}


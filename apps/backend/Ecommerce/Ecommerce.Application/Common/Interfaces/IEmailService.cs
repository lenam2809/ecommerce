namespace Ecommerce.Application.Common.Interfaces
{
    public interface IEmailService
    {
        /// <summary>
        /// Gửi email đến một địa chỉ email cụ thể
        /// </summary>
        /// <param name="to">Địa chỉ email người nhận</param>
        /// <param name="subject">Tiêu đề email</param>
        /// <param name="message">Nội dung email dạng text</param>
        /// <param name="htmlContent">Nội dung email dạng HTML (nếu có)</param>
        /// <param name="attachments">Danh sách các tệp đính kèm (nếu có)</param>
        /// <returns>Task</returns>
        Task SendEmailAsync(string to, string subject, string message, string? htmlContent = null, List<EmailAttachment>? attachments = null);

        /// <summary>
        /// Gửi email đến nhiều địa chỉ email cùng lúc
        /// </summary>
        /// <param name="recipients">Danh sách địa chỉ email người nhận</param>
        /// <param name="subject">Tiêu đề email</param>
        /// <param name="message">Nội dung email dạng text</param>
        /// <param name="htmlContent">Nội dung email dạng HTML (nếu có)</param>
        /// <param name="attachments">Danh sách các tệp đính kèm (nếu có)</param>
        /// <returns>Task</returns>
        Task SendBulkEmailAsync(List<string> recipients, string subject, string message, string? htmlContent = null, List<EmailAttachment>? attachments = null);

        /// <summary>
        /// Gửi email với tệp đính kèm
        /// </summary>
        /// <param name="to">Địa chỉ email người nhận</param>
        /// <param name="subject">Tiêu đề email</param>
        /// <param name="message">Nội dung email dạng text</param>
        /// <param name="attachmentFilePath">Đường dẫn đến tệp đính kèm</param>
        /// <param name="attachmentFileName">Tên tệp đính kèm</param>
        /// <param name="htmlContent">Nội dung email dạng HTML (nếu có)</param>
        /// <returns>Task</returns>
        Task SendEmailWithAttachmentAsync(string to, string subject, string message, string attachmentFilePath, string attachmentFileName, string? htmlContent = null);


        Task SendOrderConfirmationEmailAsync(string to, string orderCode, string customerName, decimal totalAmount);
        Task SendOrderStatusUpdateEmailAsync(string to, string orderCode, string customerName, string status);
    }

    /// <summary>
    /// Đối tượng chứa thông tin của tệp đính kèm
    /// </summary>
    public class EmailAttachment
    {
        /// <summary>
        /// Dữ liệu của tệp đính kèm
        /// </summary>
        public required byte[] Content { get; set; }

        /// <summary>
        /// Tên tệp đính kèm
        /// </summary>
        public required string FileName { get; set; }

        /// <summary>
        /// Loại nội dung (MIME type)
        /// </summary>
        public required string ContentType { get; set; }
    }
}


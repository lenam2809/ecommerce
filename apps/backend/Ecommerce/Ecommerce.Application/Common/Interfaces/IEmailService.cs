namespace Ecommerce.Application.Common.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default);

        /// <summary>
        /// Gui email den mot dia chi email cu the.
        /// </summary>
        Task SendEmailAsync(string to, string subject, string message, string? htmlContent = null, List<EmailAttachment>? attachments = null);

        /// <summary>
        /// Gui email den nhieu dia chi email cung luc.
        /// </summary>
        Task SendBulkEmailAsync(List<string> recipients, string subject, string message, string? htmlContent = null, List<EmailAttachment>? attachments = null);

        /// <summary>
        /// Gui email voi tep dinh kem.
        /// </summary>
        Task SendEmailWithAttachmentAsync(string to, string subject, string message, string attachmentFilePath, string attachmentFileName, string? htmlContent = null);

        Task SendOrderConfirmationEmailAsync(string to, string orderCode, string customerName, decimal totalAmount);
        Task SendOrderStatusUpdateEmailAsync(string to, string orderCode, string customerName, string status);
    }

    public interface IEmailQueue
    {
        ValueTask QueueEmailAsync(EmailMessage message, CancellationToken cancellationToken = default);
        ValueTask<EmailMessage> DequeueAsync(CancellationToken cancellationToken);
    }

    public interface IEmailTemplateRenderer
    {
        Task<string> RenderAsync(string templateName, IReadOnlyDictionary<string, string> values, CancellationToken cancellationToken = default);
    }

    public sealed record EmailMessage(
        string To,
        string Subject,
        string Body,
        string? PlainTextBody = null,
        IReadOnlyCollection<EmailAttachment>? Attachments = null);

    /// <summary>
    /// Doi tuong chua thong tin cua tep dinh kem.
    /// </summary>
    public class EmailAttachment
    {
        public required byte[] Content { get; set; }
        public required string FileName { get; set; }
        public required string ContentType { get; set; }
    }
}

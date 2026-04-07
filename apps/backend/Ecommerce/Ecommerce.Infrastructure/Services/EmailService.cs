using Ecommerce.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;

        public EmailService(ILogger<EmailService> logger)
        {
            _logger = logger;
        }

        public Task SendEmailAsync(string to, string subject, string message, string? htmlContent = null, List<EmailAttachment>? attachments = null)
        {
            _logger.LogInformation("Sending email to {To}. Subject: {Subject}. Message: {Message}", to, subject, message);
            return Task.CompletedTask;
        }

        public Task SendBulkEmailAsync(List<string> recipients, string subject, string message, string? htmlContent = null, List<EmailAttachment>? attachments = null)
        {
            _logger.LogInformation("Sending bulk email to {Count} recipients. Subject: {Subject}", recipients.Count, subject);
            return Task.CompletedTask;
        }

        public Task SendEmailWithAttachmentAsync(string to, string subject, string message, string attachmentFilePath, string attachmentFileName, string? htmlContent = null)
        {
            _logger.LogInformation("Sending email with attachment to {To}. Subject: {Subject}. Attachment: {FileName}", to, subject, attachmentFileName);
            return Task.CompletedTask;
        }

        public Task SendOrderConfirmationEmailAsync(string to, string orderCode, string customerName, decimal totalAmount)
        {
            _logger.LogInformation("Sending order confirmation email to {To} for order {OrderCode}. Total: {TotalAmount}", to, orderCode, totalAmount);
            return Task.CompletedTask;
        }

        public Task SendOrderStatusUpdateEmailAsync(string to, string orderCode, string customerName, string status)
        {
            _logger.LogInformation("Sending order status update email to {To} for order {OrderCode}. New Status: {Status}", to, orderCode, status);
            return Task.CompletedTask;
        }
    }
}

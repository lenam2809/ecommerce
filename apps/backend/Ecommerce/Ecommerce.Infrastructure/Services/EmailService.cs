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
            _logger.LogInformation("Sending email with subject {Subject}. AttachmentCount: {AttachmentCount}", subject, attachments?.Count ?? 0);
            return Task.CompletedTask;
        }

        public Task SendBulkEmailAsync(List<string> recipients, string subject, string message, string? htmlContent = null, List<EmailAttachment>? attachments = null)
        {
            _logger.LogInformation("Sending bulk email to {Count} recipients. Subject: {Subject}", recipients.Count, subject);
            return Task.CompletedTask;
        }

        public Task SendEmailWithAttachmentAsync(string to, string subject, string message, string attachmentFilePath, string attachmentFileName, string? htmlContent = null)
        {
            _logger.LogInformation("Sending email with attachment {FileName}. Subject: {Subject}", attachmentFileName, subject);
            return Task.CompletedTask;
        }

        public Task SendOrderConfirmationEmailAsync(string to, string orderCode, string customerName, decimal totalAmount)
        {
            _logger.LogInformation("Sending order confirmation email for order {OrderCode}. Total: {TotalAmount}", orderCode, totalAmount);
            return Task.CompletedTask;
        }

        public Task SendOrderStatusUpdateEmailAsync(string to, string orderCode, string customerName, string status)
        {
            _logger.LogInformation("Sending order status update email for order {OrderCode}. New Status: {Status}", orderCode, status);
            return Task.CompletedTask;
        }
    }
}

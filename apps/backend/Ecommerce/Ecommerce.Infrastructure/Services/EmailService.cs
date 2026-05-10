using Ecommerce.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;

namespace Ecommerce.Infrastructure.Services
{
    public sealed class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default)
        {
            ValidateEmail(message.To);

            var smtpSection = _configuration.GetSection("Email:Smtp");
            var host = smtpSection["Host"] ?? _configuration["Email:SmtpServer"];
            var port = smtpSection.GetValue<int?>("Port") ?? _configuration.GetValue<int?>("Email:Port") ?? 587;
            var username = smtpSection["Username"] ?? _configuration["Email:Username"];
            var password = smtpSection["Password"] ?? _configuration["Email:Password"];
            var enableSsl = smtpSection.GetValue<bool?>("EnableSsl") ?? true;
            var fromAddress = _configuration["Email:FromAddress"] ?? _configuration["Email:SenderEmail"];
            var fromName = _configuration["Email:FromName"] ?? _configuration["Email:SenderName"] ?? "ShopViet";

            if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(fromAddress))
            {
                _logger.LogWarning("SMTP email is not configured. Skipping email with subject {Subject}", message.Subject);
                return;
            }

            using var mail = new MailMessage
            {
                From = new MailAddress(fromAddress, fromName),
                Subject = message.Subject,
                Body = message.Body,
                IsBodyHtml = true
            };
            mail.To.Add(message.To);

            foreach (var attachment in message.Attachments ?? Array.Empty<EmailAttachment>())
            {
                mail.Attachments.Add(new Attachment(new MemoryStream(attachment.Content), attachment.FileName, attachment.ContentType));
            }

            using var client = new SmtpClient(host, port)
            {
                EnableSsl = enableSsl
            };

            if (!string.IsNullOrWhiteSpace(username))
            {
                client.Credentials = new NetworkCredential(username, password);
            }

            await client.SendMailAsync(mail, cancellationToken);
            _logger.LogInformation("Sent email with subject {Subject}", message.Subject);
        }

        public Task SendEmailAsync(string to, string subject, string message, string? htmlContent = null, List<EmailAttachment>? attachments = null)
        {
            return SendEmailAsync(new EmailMessage(to, subject, htmlContent ?? WebUtility.HtmlEncode(message), message, attachments));
        }

        public async Task SendBulkEmailAsync(List<string> recipients, string subject, string message, string? htmlContent = null, List<EmailAttachment>? attachments = null)
        {
            foreach (var recipient in recipients.Distinct(StringComparer.OrdinalIgnoreCase))
            {
                await SendEmailAsync(recipient, subject, message, htmlContent, attachments);
            }
        }

        public async Task SendEmailWithAttachmentAsync(string to, string subject, string message, string attachmentFilePath, string attachmentFileName, string? htmlContent = null)
        {
            var bytes = await File.ReadAllBytesAsync(attachmentFilePath);
            await SendEmailAsync(to, subject, message, htmlContent, new List<EmailAttachment>
            {
                new()
                {
                    Content = bytes,
                    FileName = attachmentFileName,
                    ContentType = "application/octet-stream"
                }
            });
        }

        public Task SendOrderConfirmationEmailAsync(string to, string orderCode, string customerName, decimal totalAmount)
        {
            var body = $"<p>Xin chao {WebUtility.HtmlEncode(customerName)}, don hang {WebUtility.HtmlEncode(orderCode)} da duoc ghi nhan. Tong tien: {totalAmount:N0} VND.</p>";
            return SendEmailAsync(to, $"Xac nhan don hang {orderCode}", body, body);
        }

        public Task SendOrderStatusUpdateEmailAsync(string to, string orderCode, string customerName, string status)
        {
            var body = $"<p>Xin chao {WebUtility.HtmlEncode(customerName)}, don hang {WebUtility.HtmlEncode(orderCode)} da chuyen sang trang thai {WebUtility.HtmlEncode(status)}.</p>";
            return SendEmailAsync(to, $"Cap nhat don hang {orderCode}", body, body);
        }

        private static void ValidateEmail(string email)
        {
            _ = new MailAddress(email);
        }
    }
}

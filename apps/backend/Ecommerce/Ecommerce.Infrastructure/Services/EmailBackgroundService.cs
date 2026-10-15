using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Services
{
    public sealed class EmailBackgroundService : BackgroundService
    {
        private readonly IEmailQueue _queue;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<EmailBackgroundService> _logger;
        private readonly ILogSanitizer _sanitizer;

        public EmailBackgroundService(
            IEmailQueue queue,
            IServiceScopeFactory scopeFactory,
            ILogger<EmailBackgroundService> logger,
            ILogSanitizer sanitizer)
        {
            _queue = queue;
            _scopeFactory = scopeFactory;
            _logger = logger;
            _sanitizer = sanitizer;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                EmailMessage message;
                try
                {
                    message = await _queue.DequeueAsync(stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }

                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
                    await emailService.SendEmailAsync(message, stoppingToken);
                }
                catch (Exception ex)
                {
                    // 🔒 SECURITY (M4): không truyền exception thô vào Serilog; subject có thể chứa dữ liệu KH
                    _logger.LogError(
                        "Failed to send queued email with subject {Subject}. Error: {Error}",
                        _sanitizer.Sanitize(message.Subject),
                        _sanitizer.Sanitize(ex.Message));
                }
            }
        }
    }
}

using Ecommerce.Application.Common.Interfaces;
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

        public EmailBackgroundService(
            IEmailQueue queue,
            IServiceScopeFactory scopeFactory,
            ILogger<EmailBackgroundService> logger)
        {
            _queue = queue;
            _scopeFactory = scopeFactory;
            _logger = logger;
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
                    _logger.LogError(ex, "Failed to send queued email with subject {Subject}", message.Subject);
                }
            }
        }
    }
}

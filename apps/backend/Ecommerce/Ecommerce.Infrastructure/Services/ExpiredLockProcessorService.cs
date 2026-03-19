using Ecommerce.Application.Common.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Services
{
    public class ExpiredLockProcessorService : BackgroundService
    {
        private readonly ILogger<ExpiredLockProcessorService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly TimeSpan _interval = TimeSpan.FromMinutes(5); // Chạy mỗi 5 phút

        public ExpiredLockProcessorService(
            ILogger<ExpiredLockProcessorService> logger,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var accountLockService = scope.ServiceProvider.GetRequiredService<IAccountLockService>();
                        await accountLockService.ProcessExpiredLocksAsync();

                        _logger.LogInformation("Processed expired account locks at {Time}", DateTime.Now);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing expired account locks");
                }

                await Task.Delay(_interval, stoppingToken);
            }
        }
    }
}


using Microsoft.Extensions.Diagnostics.HealthChecks;
using StackExchange.Redis;

namespace Ecommerce.WebAPI.HealthChecks
{
    public class RedisHealthCheck : IHealthCheck
    {
        private readonly IConnectionMultiplexer _connectionMultiplexer;

        public RedisHealthCheck(IConnectionMultiplexer connectionMultiplexer)
        {
            _connectionMultiplexer = connectionMultiplexer;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                var database = _connectionMultiplexer.GetDatabase();
                var pong = await database.PingAsync();

                return HealthCheckResult.Healthy($"Redis responded in {pong.TotalMilliseconds:N0} ms.");
            }
            catch (Exception ex)
            {
                return HealthCheckResult.Unhealthy("Redis is unavailable.", ex);
            }
        }
    }
}

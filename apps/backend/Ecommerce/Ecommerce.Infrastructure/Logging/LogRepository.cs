using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Logging;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.Channels;

namespace Ecommerce.Infrastructure.Logging
{
    public class LogRepository : ILogRepository
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly Channel<LogEntry> _logChannel;

        public LogRepository(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
            _logChannel = Channel.CreateUnbounded<LogEntry>();

            // Start background processing
            _ = Task.Run(ProcessLogQueueAsync);
        }

        public async Task<IEnumerable<LogEntry>> GetLogsAsync(DateTime? startDate = null, DateTime? endDate = null, ELogLevel? level = null)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                var query = dbContext.LogEntries.AsQueryable();

                if (startDate.HasValue)
                    query = query.Where(l => l.Timestamp >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(l => l.Timestamp <= endDate.Value);

                if (level.HasValue)
                    query = query.Where(l => l.Level == (ELogLevel)level.Value);

                return await query
                    .OrderByDescending(l => l.Timestamp)
                    .Take(1000)
                    .Select(l => new LogEntry
                    {
                        Id = l.Id,
                        Timestamp = l.Timestamp,
                        Level = (ELogLevel)l.Level,
                        Message = l.Message,
                        EventName = l.EventName,
                        SourceContext = l.SourceContext
                    })
                    .ToListAsync();
            }
        }

        public async Task SaveLogAsync(LogEntry SystemLog)
        {
            // Đưa log vào channel để xử lý bất đồng bộ
            await _logChannel.Writer.WriteAsync(SystemLog);
        }

        private async Task ProcessLogQueueAsync()
        {
            await foreach (var systemLog in _logChannel.Reader.ReadAllAsync())
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                    var dbLog = new LogEntry
                    {
                        Level = systemLog.Level,
                        Message = systemLog.Message,
                        EventName = systemLog.EventName,
                        SourceContext = systemLog.SourceContext,
                        ApplicationUserId = systemLog.ApplicationUserId,
                        IpAddress = systemLog.IpAddress,
                        Timestamp = systemLog.Timestamp,
                        Properties = systemLog.Properties
                    };

                    dbContext.LogEntries.Add(dbLog);
                    await dbContext.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Log persistence failed: {ex.Message}");
                }
            }
        }
    }

}


using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Logging;
using Ecommerce.Infrastructure.Persistence;
using System.Threading.Channels;

namespace Ecommerce.Infrastructure.Logging
{
    public class AuditLogRepository : IAuditLogger
    {
        private readonly ApplicationDbContext _context;
        private readonly Channel<AuditLog> _auditChannel;
        private readonly ICurrentUserService _currentUserService;

        public AuditLogRepository(
            ApplicationDbContext context,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
            _auditChannel = Channel.CreateUnbounded<AuditLog>();
            _ = ProcessAuditQueueAsync();
        }

        public async Task LogAuditAsync(
            string entityName,
            string actionType,
            string oldValues,
            string newValues,
            Guid? userId = null)
        {
            var auditLog = new AuditLog
            {
                EntityName = entityName,
                ActionType = actionType,
                OldValues = oldValues,
                NewValues = newValues,
                UserId = userId ?? _currentUserService.UserId,
                CreatedAt = DateTime.Now
            };

            await _auditChannel.Writer.WriteAsync(auditLog);
        }

        private async Task ProcessAuditQueueAsync()
        {
            await foreach (var auditLog in _auditChannel.Reader.ReadAllAsync())
            {
                try
                {
                    _context.AuditLogs.Add(auditLog);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    // Logging fallback
                    Console.Error.WriteLine($"Audit log failed: {ex.Message}");
                }
            }
        }
    }
}


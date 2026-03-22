using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Logging;
using Ecommerce.Infrastructure.Persistence;
using System.Threading.Channels;

namespace Ecommerce.Infrastructure.Logging
{
    public class AuditLogRepository : IAuditLogger
    {
        private readonly Channel<AuditLog> _auditChannel;
        public ChannelReader<AuditLog> Reader => _auditChannel.Reader;

        public AuditLogRepository()
        {
            _auditChannel = Channel.CreateUnbounded<AuditLog>();
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
                UserId = userId,
                CreatedAt = DateTime.Now
            };

            await _auditChannel.Writer.WriteAsync(auditLog);
        }
    }
}


using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.AuditLogs.Dto;
using MediatR;

namespace Ecommerce.Application.Features.AuditLogs.Queries.GetLogEntryById
{
    public class GetLogEntryByIdQuery : IRequest<Result<LogEntryDto>>
    {
        public Guid Id { get; set; }
    }
}


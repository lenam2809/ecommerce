using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.AuditLogs.Dto;
using MediatR;

namespace Ecommerce.Application.Features.AuditLogs.Queries.GetAuditLogById
{
    public class GetAuditLogByIdQuery : IRequest<Result<AuditLogDto>>
    {
        public Guid Id { get; set; }
    }
}


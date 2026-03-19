using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.AuditLogs.Dto;
using MediatR;

namespace Ecommerce.Application.Features.AuditLogs.Queries.GetAuditLogs
{
    public class GetAuditLogsQuery : IRequest<Result<PaginatedList<AuditLogDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? ActionType { get; set; } // Create, Update, Delete
        public string? EntityName { get; set; }
        public string? SearchTerm { get; set; } // Tìm kiếm trong EntityName, ActionType
        public string SortBy { get; set; } = "CreatedAt";
        public bool IsDescending { get; set; } = true;
    }
}


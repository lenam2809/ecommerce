using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.AuditLogs.Dto;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.AuditLogs.Queries.GetLogEntries
{
    public class GetLogEntriesQuery : IRequest<Result<PaginatedList<LogEntryDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public ELogLevel? Level { get; set; }
        public string? EventName { get; set; }
        public string? SearchTerm { get; set; } // Tìm kiếm trong Message, EventName
        public string SortBy { get; set; } = "Timestamp";
        public bool IsDescending { get; set; } = true;
    }
}


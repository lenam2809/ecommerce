using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.AuditLogs.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Ecommerce.Application.Features.AuditLogs.Queries.GetLogEntries
{
    public class GetLogEntriesQueryHandler : IRequestHandler<GetLogEntriesQuery, Result<PaginatedList<LogEntryDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICacheService _cacheService;

        public GetLogEntriesQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnhancedLogger logger,
            ICurrentUserService currentUserService,
            ICacheService cacheService)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
            _cacheService = cacheService;
        }

        public async Task<Result<PaginatedList<LogEntryDto>>> Handle(GetLogEntriesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var currentUserId = _currentUserService.UserId;
                var isAdmin = await _currentUserService.IsInRoleAsync(EUserRoles.Admin);

                // Xây dựng biểu thức filter
                Expression<Func<LogEntry, bool>> filter = logEntry =>
                    // Phân quyền: Admin xem tất cả, user thường chỉ xem log của mình
                    (isAdmin || logEntry.ApplicationUserId == currentUserId) &&
                    // Lọc theo khoảng thời gian
                    (!request.StartDate.HasValue || logEntry.Timestamp >= request.StartDate.Value) &&
                    (!request.EndDate.HasValue || logEntry.Timestamp <= request.EndDate.Value) &&
                    // Lọc theo Level
                    (!request.Level.HasValue || logEntry.Level == request.Level.Value) &&
                    // Lọc theo EventName
                    (string.IsNullOrEmpty(request.EventName) || logEntry.EventName.Contains(request.EventName)) &&
                    // Tìm kiếm theo từ khóa
                    (string.IsNullOrEmpty(request.SearchTerm) ||
                     logEntry.Message.Contains(request.SearchTerm) ||
                     logEntry.EventName.Contains(request.SearchTerm) ||
                     logEntry.SourceContext.Contains(request.SearchTerm));

                // Xây dựng sắp xếp
                Func<IQueryable<LogEntry>, IOrderedQueryable<LogEntry>> orderBy = query =>
                {
                    return request.SortBy.ToLower() switch
                    {
                        "level" => request.IsDescending
                            ? query.OrderByDescending(l => l.Level)
                            : query.OrderBy(l => l.Level),
                        "eventname" => request.IsDescending
                            ? query.OrderByDescending(l => l.EventName)
                            : query.OrderBy(l => l.EventName),
                        "message" => request.IsDescending
                            ? query.OrderByDescending(l => l.Message)
                            : query.OrderBy(l => l.Message),
                        "timestamp" => request.IsDescending
                            ? query.OrderByDescending(l => l.Timestamp)
                            : query.OrderBy(l => l.Timestamp),
                        _ => query.OrderByDescending(l => l.Timestamp)
                    };
                };

                // Lấy dữ liệu phân trang
                var paginatedResult = await _unitOfWork.LogEntries
                    .GetPaginatedAsync(
                        filter: filter,
                        orderBy: orderBy,
                        pageIndex: request.PageNumber,
                        pageSize: request.PageSize,
                        cancellationToken: cancellationToken,
                        includeFunc: l => l.Include(x => x.User).Include(x => x.Properties)
                        );

                // Ánh xạ sang DTO
                var logEntryDtos = paginatedResult.Items.Select(logEntry => new LogEntryDto
                {
                    Id = logEntry.Id,
                    Timestamp = logEntry.Timestamp,
                    Level = logEntry.Level,
                    LevelText = logEntry.Level.ToString(),
                    Message = logEntry.Message,
                    EventName = logEntry.EventName,
                    SourceContext = logEntry.SourceContext,
                    IpAddress = logEntry.IpAddress,
                    UserAgent = logEntry.UserAgent,
                    ApplicationUserId = logEntry.ApplicationUserId,
                    UserName = logEntry.User?.UserName ?? "System",
                    Properties = logEntry.Properties?.Select(p => new LogPropertyDto
                    {
                        Key = p.Key,
                        Value = p.Value
                    }).ToList() ?? []
                }).ToList();

                // Tạo kết quả phân trang
                var result = new PaginatedList<LogEntryDto>(
                    logEntryDtos,
                    paginatedResult.TotalCount,
                    paginatedResult.PageIndex,
                    paginatedResult.PageSize);

                await _logger.LogAsync(
                    ELogLevel.Information,
                    "Retrieved {Count} log entries for {UserId}",
                    "GetLogEntries",
                    properties: new Dictionary<string, object?>
                    {
                        { "Count", logEntryDtos.Count },
                        { "UserId", currentUserId?.ToString() ?? "Anonymous" }
                    });

                return Result<PaginatedList<LogEntryDto>>.Success(result);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "GetLogEntriesQueryHandler.Handle");
                return Result<PaginatedList<LogEntryDto>>.BadRequest(ex.Message);
            }
        }
    }
}


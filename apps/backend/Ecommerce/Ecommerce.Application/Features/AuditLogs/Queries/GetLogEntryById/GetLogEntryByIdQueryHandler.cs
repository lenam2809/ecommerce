using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.AuditLogs.Dto;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.AuditLogs.Queries.GetLogEntryById
{
    public class GetLogEntryByIdQueryHandler : IRequestHandler<GetLogEntryByIdQuery, Result<LogEntryDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICacheService _cacheService;

        public GetLogEntryByIdQueryHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            ICurrentUserService currentUserService,
            ICacheService cacheService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _currentUserService = currentUserService;
            _cacheService = cacheService;
        }

        public async Task<Result<LogEntryDto>> Handle(GetLogEntryByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var currentUserId = _currentUserService.UserId;
                var currentUserRole = _currentUserService.UserRoles;
                var isAdmin = currentUserRole.Contains("Admin");


                var logEntry = await _unitOfWork.LogEntries.GetByIdWithIncludeAsync(request.Id,
                    query => query.Include(l => l.User).Include(l => l.Properties),
                    cancellationToken);

                if (logEntry == null)
                {
                    return Result<LogEntryDto>.NotFound("Log entry không tồn tại");
                }

                // Kiểm tra quyền truy cập
                if (!isAdmin && logEntry.ApplicationUserId != currentUserId)
                {
                    return Result<LogEntryDto>.Forbidden("Bạn không có quyền truy cập log entry này");
                }

                var logEntryDto = new LogEntryDto
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
                    }).ToList() ?? new List<LogPropertyDto>()
                };

                return Result<LogEntryDto>.Success(logEntryDto);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "GetLogEntryByIdQueryHandler.Handle");
                return Result<LogEntryDto>.BadRequest(ex.Message);
            }
        }
    }
}


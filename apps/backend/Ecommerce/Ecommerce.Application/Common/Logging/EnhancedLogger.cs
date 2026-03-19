using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Application.Common.Logging
{
    public class EnhancedLogger : IEnhancedLogger
    {
        private readonly ILogger<EnhancedLogger> _logger;
        private readonly IAuditLogger _auditLogger;
        private readonly IPerformanceLogger _performanceLogger;
        private readonly ILogRepository _logRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICurrentUserService _currentUserService;
        private readonly ISeriLogger _seriLogger;

        public EnhancedLogger(
            ILogger<EnhancedLogger> logger,
            IAuditLogger auditLogger,
            IPerformanceLogger performanceLogger,
            ILogRepository logRepository,
            IHttpContextAccessor httpContextAccessor,
            ICurrentUserService currentUserService,
            ISeriLogger seriLogger)
        {
            _logger = logger;
            _auditLogger = auditLogger;
            _performanceLogger = performanceLogger;
            _logRepository = logRepository;
            _httpContextAccessor = httpContextAccessor;
            _currentUserService = currentUserService;
            _seriLogger = seriLogger;
        }

        // Triển khai các phương thức từ các interface

        public async Task LogAuditAsync(
            string entityName,
            string actionType,
            string oldValues,
            string newValues,
            Guid? userId = null)
        {
            await _auditLogger.LogAuditAsync(
                entityName, actionType, oldValues, newValues, userId);
        }

        public async Task LogPerformanceAsync(
            string methodName,
            string className,
            long executionTimeMs,
            Guid? userId = null)
        {
            await _performanceLogger.LogPerformanceAsync(
                methodName, className, executionTimeMs, userId);
        }

        // Các phương thức khác từ IBusinessLogger
        public void Log(ELogLevel level, string message,
            string eventName,
            Dictionary<string, object>? properties = null)
        {
            var logEntry = new LogEntry
            {
                Level = level,
                Message = message,
                SourceContext = eventName,
                EventName = eventName,
                Timestamp = DateTime.Now,
                IpAddress = GetIPAddress(),
                UserAgent = GetUserAgent(),
                ApplicationUserId = _currentUserService.UserId,
                Properties = properties?.Select(p => new LogProperty
                {
                    Key = p.Key,
                    Value = p.Value?.ToString() // Chuyển object thành chuỗi để lưu
                }).ToList() ?? new List<LogProperty>()
            };
            LogSerilog(level, message);
            _ = _logRepository.SaveLogAsync(logEntry);
        }

        public async Task LogAsync(
    ELogLevel level,
    string message,
    string eventName,
    ELogType logType = ELogType.Default,
    Dictionary<string, object>? properties = null)
        {
            // Ghi log vào Serilog cho mọi loại
            LogSerilog(level, message);

            switch (logType)
            {
                case ELogType.Security:
                case ELogType.Transaction:
                case ELogType.AccessControl:
                case ELogType.Configuration:
                    // Những log có thay đổi dữ liệu quan trọng --> AuditLog
                    await LogAuditAsync(
                        entityName: eventName,
                        actionType: logType.ToString(),
                        oldValues: "", // có thể custom sau nếu cần
                        newValues: message
                    );
                    break;

                case ELogType.UserActivity:
                case ELogType.Performance:
                    // Log hiệu năng hoặc hành vi người dùng → PerformanceLog
                    await LogPerformanceAsync(
                        methodName: eventName,
                        className: logType.ToString(),
                        executionTimeMs: properties?.GetValueOrDefault("ExecutionTime") as long? ?? 0
                    );
                    break;

                case ELogType.System:
                case ELogType.Database:
                case ELogType.Integration:
                case ELogType.Notification:
                case ELogType.Validation:
                case ELogType.Default:
                default:
                    // Log tổng quát → LogEntry
                    var logEntry = new LogEntry
                    {
                        Level = level,
                        Message = message,
                        SourceContext = eventName,
                        EventName = eventName,
                        Timestamp = DateTime.Now,
                        IpAddress = GetIPAddress(),
                        UserAgent = GetUserAgent(),
                        ApplicationUserId = _currentUserService.UserId,
                        Properties = properties?.Select(p => new LogProperty
                        {
                            Key = p.Key,
                            Value = p.Value?.ToString()
                        }).ToList() ?? new List<LogProperty>()
                    };

                    await _logRepository.SaveLogAsync(logEntry);
                    break;
            }
        }



        public async Task SaveLogAsync(LogEntry logEntry)
        {
            await _logRepository.SaveLogAsync(logEntry);
        }

        public async Task<IEnumerable<LogEntry>> GetLogsAsync(
            DateTime? startDate = null,
            DateTime? endDate = null,
            ELogLevel? level = null)
        {
            return await _logRepository.GetLogsAsync(startDate, endDate, level);
        }

        private string? GetIPAddress()
        {
            return _httpContextAccessor.HttpContext?.Connection
                .RemoteIpAddress?.ToString();
        }

        private string? GetUserAgent()
        {
            return _httpContextAccessor.HttpContext?.Request
                .Headers["User-Agent"].ToString();
        }

        private void LogSerilog(ELogLevel level, string message)
        {
            switch (level)
            {
                case ELogLevel.Debug:
                    _seriLogger.LogDebug(message);
                    break;
                case ELogLevel.Information:
                    _seriLogger.LogInformation(message);
                    break;
                case ELogLevel.Warning:
                    _seriLogger.LogWarning(message);
                    break;
                case ELogLevel.Error:
                    _seriLogger.LogError(message);
                    break;
                default:
                    _seriLogger.LogInformation(message);
                    break;
            }
        }

        public async Task LogExceptionAsync(Exception ex, string eventName)
        {
            var stackTrace = ex.StackTrace ?? "Không có StackTrace, lỗi không xác định.";
            var message = ex.Message ?? "Không có thông tin lỗi chi tiết.";
            var logEntry = new LogEntry
            {
                Id = Guid.NewGuid(),
                Level = ELogLevel.Error,
                Message = message,
                SourceContext = eventName,
                EventName = eventName,
                Timestamp = DateTime.Now,
                IpAddress = GetIPAddress(),
                UserAgent = GetUserAgent(),
                ApplicationUserId = _currentUserService.UserId,
                Properties =
                [
                    new LogProperty { Key = "StackTrace", Value = stackTrace },
                    new LogProperty { Key = "InnerException", Value = message }
                ]
            };

            LogSerilog(ELogLevel.Error, message);
            await _logRepository.SaveLogAsync(logEntry);
        }

    }
}


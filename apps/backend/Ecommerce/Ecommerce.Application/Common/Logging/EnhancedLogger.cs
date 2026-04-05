using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace Ecommerce.Application.Common.Logging
{
    public class EnhancedLogger : IEnhancedLogger
    {
        private static readonly Regex BearerTokenRegex = new(@"(?i)\bBearer\s+[A-Za-z0-9\-\._~\+\/]+=*", RegexOptions.Compiled);
        private static readonly Regex JwtRegex = new(@"\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b", RegexOptions.Compiled);
        private static readonly Regex PasswordRegex = new(@"(?i)(password|pwd|pass)\s*[:=]\s*([^\s,;]+)", RegexOptions.Compiled);
        private static readonly Regex EmailRegex = new(@"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", RegexOptions.Compiled | RegexOptions.IgnoreCase);
        private static readonly Regex PhoneRegex = new(@"\b(?:\+?\d{1,3}[\s\-.]?)?(?:\(?\d{2,4}\)?[\s\-.]?)?\d{3,4}[\s\-.]?\d{3,4}\b", RegexOptions.Compiled);
        private static readonly Regex CreditCardRegex = new(@"\b(?:\d[ -]*?){13,19}\b", RegexOptions.Compiled);

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

        public async Task LogAuditAsync(
            string entityName,
            string actionType,
            string oldValues,
            string newValues,
            Guid? userId = null)
        {
            await _auditLogger.LogAuditAsync(
                entityName,
                actionType,
                SanitizeSensitiveData(oldValues),
                SanitizeSensitiveData(newValues),
                userId);
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

        public void Log(ELogLevel level, string message,
            string eventName,
            Dictionary<string, object>? properties = null)
        {
            var sanitizedMessage = SanitizeSensitiveData(message);

            var logEntry = new LogEntry
            {
                Level = level,
                Message = sanitizedMessage,
                SourceContext = eventName,
                EventName = eventName,
                Timestamp = DateTime.Now,
                IpAddress = GetIPAddress(),
                UserAgent = GetUserAgent(),
                ApplicationUserId = _currentUserService.UserId,
                Properties = properties?.Select(p => new LogProperty
                {
                    Key = p.Key,
                    Value = SanitizeSensitiveData(p.Value?.ToString())
                }).ToList() ?? new List<LogProperty>()
            };

            LogSerilog(level, sanitizedMessage);
            _ = _logRepository.SaveLogAsync(logEntry);
        }

        public async Task LogAsync(
            ELogLevel level,
            string message,
            string eventName,
            ELogType logType = ELogType.Default,
            Dictionary<string, object>? properties = null)
        {
            var sanitizedMessage = SanitizeSensitiveData(message);
            LogSerilog(level, sanitizedMessage);

            switch (logType)
            {
                case ELogType.Security:
                case ELogType.Transaction:
                case ELogType.AccessControl:
                case ELogType.Configuration:
                    await LogAuditAsync(
                        entityName: eventName,
                        actionType: logType.ToString(),
                        oldValues: string.Empty,
                        newValues: sanitizedMessage);
                    break;

                case ELogType.UserActivity:
                case ELogType.Performance:
                    await LogPerformanceAsync(
                        methodName: eventName,
                        className: logType.ToString(),
                        executionTimeMs: properties?.GetValueOrDefault("ExecutionTime") as long? ?? 0);
                    break;

                case ELogType.System:
                case ELogType.Database:
                case ELogType.Integration:
                case ELogType.Notification:
                case ELogType.Validation:
                case ELogType.Default:
                default:
                    var logEntry = new LogEntry
                    {
                        Level = level,
                        Message = sanitizedMessage,
                        SourceContext = eventName,
                        EventName = eventName,
                        Timestamp = DateTime.Now,
                        IpAddress = GetIPAddress(),
                        UserAgent = GetUserAgent(),
                        ApplicationUserId = _currentUserService.UserId,
                        Properties = properties?.Select(p => new LogProperty
                        {
                            Key = p.Key,
                            Value = SanitizeSensitiveData(p.Value?.ToString())
                        }).ToList() ?? new List<LogProperty>()
                    };

                    await _logRepository.SaveLogAsync(logEntry);
                    break;
            }
        }

        public async Task SaveLogAsync(LogEntry logEntry)
        {
            logEntry.Message = SanitizeSensitiveData(logEntry.Message);
            if (logEntry.Properties != null)
            {
                foreach (var property in logEntry.Properties)
                {
                    property.Value = SanitizeSensitiveData(property.Value);
                }
            }

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
            _logger.LogInformation("{Level} {Message}", level, message);

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
            var stackTrace = SanitizeSensitiveData(ex.StackTrace ?? "No stack trace available.");
            var message = SanitizeSensitiveData(ex.Message ?? "No exception details available.");
            var innerException = SanitizeSensitiveData(ex.InnerException?.ToString() ?? "N/A");

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
                    new LogProperty { Key = "InnerException", Value = innerException }
                ]
            };

            LogSerilog(ELogLevel.Error, message);
            await _logRepository.SaveLogAsync(logEntry);
        }

        private static string SanitizeSensitiveData(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return input ?? string.Empty;
            }

            var sanitized = input;
            sanitized = BearerTokenRegex.Replace(sanitized, "Bearer [REDACTED_TOKEN]");
            sanitized = JwtRegex.Replace(sanitized, "[REDACTED_JWT]");
            sanitized = PasswordRegex.Replace(sanitized, "$1=[REDACTED_PASSWORD]");
            sanitized = EmailRegex.Replace(sanitized, "[REDACTED_EMAIL]");
            sanitized = PhoneRegex.Replace(sanitized, "[REDACTED_PHONE]");
            sanitized = CreditCardRegex.Replace(sanitized, match => IsLikelyCreditCard(match.Value) ? "[REDACTED_CARD]" : match.Value);
            return sanitized;
        }

        private static bool IsLikelyCreditCard(string rawValue)
        {
            var digits = new string(rawValue.Where(char.IsDigit).ToArray());
            if (digits.Length < 13 || digits.Length > 19)
            {
                return false;
            }

            var sum = 0;
            var alternate = false;
            for (var i = digits.Length - 1; i >= 0; i--)
            {
                var n = digits[i] - '0';
                if (alternate)
                {
                    n *= 2;
                    if (n > 9)
                    {
                        n -= 9;
                    }
                }

                sum += n;
                alternate = !alternate;
            }

            return sum % 10 == 0;
        }
    }
}

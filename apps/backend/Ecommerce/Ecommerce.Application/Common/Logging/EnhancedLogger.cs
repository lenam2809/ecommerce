using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using System.Globalization;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace Ecommerce.Application.Common.Logging
{
    public class EnhancedLogger : IEnhancedLogger
    {
        private static readonly Regex MessagePropertyRegex = new(@"\{(?<name>[^}:]+)(?:[^}]*)\}", RegexOptions.Compiled);

        private readonly IAuditLogger _auditLogger;
        private readonly IPerformanceLogger _performanceLogger;
        private readonly ILogRepository _logRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICurrentUserService _currentUserService;
        private readonly ISeriLogger _seriLogger;
        private readonly ILogSanitizer _sanitizer;
        private readonly IHostEnvironment _hostEnvironment;

        public EnhancedLogger(
            IAuditLogger auditLogger,
            IPerformanceLogger performanceLogger,
            ILogRepository logRepository,
            IHttpContextAccessor httpContextAccessor,
            ICurrentUserService currentUserService,
            ISeriLogger seriLogger,
            ILogSanitizer sanitizer,
            IHostEnvironment hostEnvironment)
        {
            _auditLogger = auditLogger;
            _performanceLogger = performanceLogger;
            _logRepository = logRepository;
            _httpContextAccessor = httpContextAccessor;
            _currentUserService = currentUserService;
            _seriLogger = seriLogger;
            _sanitizer = sanitizer;
            _hostEnvironment = hostEnvironment;
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
                _sanitizer.Sanitize(oldValues),
                _sanitizer.Sanitize(newValues),
                userId);
        }

        public async Task LogPerformanceAsync(
            string methodName,
            string className,
            long executionTimeMs,
            Guid? userId = null)
        {
            await _performanceLogger.LogPerformanceAsync(
                methodName,
                className,
                executionTimeMs,
                userId);
        }

        public void Log(
            ELogLevel level,
            string messageTemplate,
            string eventName,
            Dictionary<string, object?>? properties = null)
        {
            var sanitizedProperties = EnrichWithGlobalContext(SanitizeProperties(properties));
            var logEntry = CreateLogEntry(level, messageTemplate, eventName, sanitizedProperties);

            LogSerilog(level, messageTemplate, eventName, sanitizedProperties);
            _ = _logRepository.SaveLogAsync(logEntry);
        }

        public async Task LogAsync(
            ELogLevel level,
            string messageTemplate,
            string eventName,
            ELogType logType = ELogType.Default,
            Dictionary<string, object?>? properties = null)
        {
            var sanitizedProperties = EnrichWithGlobalContext(SanitizeProperties(properties));
            var logEntry = CreateLogEntry(level, messageTemplate, eventName, sanitizedProperties);

            LogSerilog(level, messageTemplate, eventName, sanitizedProperties);

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
                        newValues: logEntry.Message);
                    break;

                case ELogType.UserActivity:
                case ELogType.Performance:
                    await LogPerformanceAsync(
                        methodName: eventName,
                        className: logType.ToString(),
                        executionTimeMs: GetExecutionTimeMs(sanitizedProperties));
                    break;

                default:
                    await _logRepository.SaveLogAsync(logEntry);
                    break;
            }
        }

        public async Task SaveLogAsync(LogEntry logEntry)
        {
            logEntry.Message = _sanitizer.Sanitize(logEntry.Message);
            if (logEntry.Properties != null)
            {
                foreach (var property in logEntry.Properties)
                {
                    property.Value = Convert.ToString(
                        _sanitizer.SanitizePropertyValue(property.Key, property.Value),
                        CultureInfo.InvariantCulture) ?? string.Empty;
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

        public async Task LogExceptionAsync(
            Exception ex,
            string eventName,
            Dictionary<string, object?>? properties = null,
            ELogLevel level = ELogLevel.Error)
        {
            var sanitizedProperties = EnrichWithGlobalContext(SanitizeProperties(properties));
            var rootCause = GetRootCause(ex);

            sanitizedProperties["ExceptionType"] = ex.GetType().FullName;
            sanitizedProperties["ExceptionMessage"] = _sanitizer.Sanitize(ex.Message ?? "No exception details available.");
            sanitizedProperties["StackTrace"] = _sanitizer.Sanitize(ex.StackTrace ?? "No stack trace available.");
            sanitizedProperties["InnerException"] = _sanitizer.Sanitize(BuildInnerExceptionChain(ex));
            sanitizedProperties["RootCauseType"] = rootCause.GetType().FullName;
            sanitizedProperties["RootCauseMessage"] = _sanitizer.Sanitize(rootCause.Message);

            const string messageTemplate = "Exception in {EventName}: {ExceptionMessage}";
            var renderProperties = new Dictionary<string, object?>(sanitizedProperties, StringComparer.OrdinalIgnoreCase)
            {
                ["EventName"] = eventName
            };

            var logEntry = new LogEntry
            {
                Id = Guid.NewGuid(),
                Level = level,
                Message = RenderMessage(messageTemplate, renderProperties),
                SourceContext = eventName,
                EventName = eventName,
                Timestamp = DateTime.UtcNow,
                IpAddress = GetClientIpAddress(),
                UserAgent = GetUserAgent(),
                ApplicationUserId = _currentUserService.UserId,
                Properties = CreateLogProperties(sanitizedProperties)
            };

            LogSerilog(level, messageTemplate, eventName, renderProperties, ex);
            await _logRepository.SaveLogAsync(logEntry);
        }

        private string? GetClientIpAddress()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var forwardedFor = httpContext?.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(forwardedFor))
            {
                return forwardedFor.Split(',')[0].Trim();
            }

            return httpContext?.Connection.RemoteIpAddress?.ToString();
        }

        private string? GetUserAgent()
        {
            return _httpContextAccessor.HttpContext?.Request.Headers["User-Agent"].ToString();
        }

        private void LogSerilog(
            ELogLevel level,
            string messageTemplate,
            string eventName,
            IReadOnlyDictionary<string, object?> properties,
            Exception? exception = null)
        {
            var serilogProperties = BuildSerilogProperties(eventName, level, properties);

            switch (level)
            {
                case ELogLevel.Debug:
                    _seriLogger.LogDebug(messageTemplate, serilogProperties);
                    break;
                case ELogLevel.Information:
                    _seriLogger.LogInformation(messageTemplate, serilogProperties);
                    break;
                case ELogLevel.Warning:
                    _seriLogger.LogWarning(messageTemplate, serilogProperties);
                    break;
                case ELogLevel.Error:
                    if (exception != null)
                    {
                        _seriLogger.LogError(exception, messageTemplate, serilogProperties);
                    }
                    else
                    {
                        _seriLogger.LogError(messageTemplate, serilogProperties);
                    }
                    break;
                default:
                    _seriLogger.LogInformation(messageTemplate, serilogProperties);
                    break;
            }
        }

        private LogEntry CreateLogEntry(
            ELogLevel level,
            string messageTemplate,
            string eventName,
            IReadOnlyDictionary<string, object?> sanitizedProperties)
        {
            return new LogEntry
            {
                Level = level,
                Message = RenderMessage(messageTemplate, sanitizedProperties),
                SourceContext = eventName,
                EventName = eventName,
                Timestamp = DateTime.UtcNow,
                IpAddress = GetClientIpAddress(),
                UserAgent = GetUserAgent(),
                ApplicationUserId = _currentUserService.UserId,
                Properties = CreateLogProperties(sanitizedProperties)
            };
        }

        private Dictionary<string, object?> SanitizeProperties(Dictionary<string, object?>? properties)
        {
            var sanitized = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
            if (properties == null)
            {
                return sanitized;
            }

            foreach (var property in properties)
            {
                sanitized[property.Key] = _sanitizer.SanitizePropertyValue(property.Key, property.Value);
            }

            return sanitized;
        }

        private List<LogProperty> CreateLogProperties(IReadOnlyDictionary<string, object?> properties)
        {
            return properties.Select(property => new LogProperty
            {
                Key = property.Key,
                Value = Convert.ToString(property.Value, CultureInfo.InvariantCulture) ?? string.Empty
            }).ToList();
        }

        private Dictionary<string, object?> BuildSerilogProperties(
            string eventName,
            ELogLevel level,
            IReadOnlyDictionary<string, object?> properties)
        {
            var serilogProperties = new Dictionary<string, object?>(properties, StringComparer.OrdinalIgnoreCase)
            {
                ["EventName"] = eventName,
                ["SourceContext"] = eventName,
                ["LogLevel"] = level.ToString(),
                ["ClientIP"] = GetClientIpAddress(),
                ["IpAddress"] = GetClientIpAddress(),
                ["UserAgent"] = GetUserAgent(),
                ["ApplicationUserId"] = _currentUserService.UserId
            };

            return serilogProperties;
        }

        private Dictionary<string, object?> EnrichWithGlobalContext(IReadOnlyDictionary<string, object?> properties)
        {
            var enrichedProperties = new Dictionary<string, object?>(properties, StringComparer.OrdinalIgnoreCase);
            var userId = _currentUserService.UserId?.ToString() ?? "anonymous";
            var userName = GetUserName();
            var correlationId = GetCorrelationId();
            var clientIp = GetClientIpAddress();
            var userAgent = GetUserAgent();

            enrichedProperties.TryAdd("CorrelationId", correlationId);
            enrichedProperties.TryAdd("RequestId", _httpContextAccessor.HttpContext?.TraceIdentifier);
            enrichedProperties.TryAdd("UserId", userId);
            enrichedProperties.TryAdd("UserName", userName);
            enrichedProperties.TryAdd("ClientIP", clientIp);
            enrichedProperties.TryAdd("IpAddress", clientIp);
            enrichedProperties.TryAdd("UserAgent", userAgent);
            enrichedProperties.TryAdd("EnvironmentName", _hostEnvironment.EnvironmentName);
            enrichedProperties.TryAdd("MachineName", Environment.MachineName);

            return enrichedProperties;
        }

        private string GetCorrelationId()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.Items.TryGetValue("CorrelationId", out var correlationIdValue) == true &&
                correlationIdValue is string correlationId &&
                !string.IsNullOrWhiteSpace(correlationId))
            {
                return correlationId;
            }

            return httpContext?.Request.Headers["X-Correlation-ID"].FirstOrDefault()
                ?? httpContext?.TraceIdentifier
                ?? Guid.NewGuid().ToString("N");
        }

        private string GetUserName()
        {
            if (!string.IsNullOrWhiteSpace(_currentUserService.FullName))
            {
                return _currentUserService.FullName;
            }

            var user = _httpContextAccessor.HttpContext?.User;
            return user?.FindFirstValue(ClaimTypes.Name)
                ?? user?.FindFirstValue(ClaimTypes.Email)
                ?? user?.Identity?.Name
                ?? "anonymous";
        }

        private static Exception GetRootCause(Exception exception)
        {
            var current = exception;
            while (current.InnerException != null)
            {
                current = current.InnerException;
            }

            return current;
        }

        private static string BuildInnerExceptionChain(Exception exception)
        {
            var messages = new List<string>();
            var current = exception.InnerException;
            var depth = 0;

            while (current != null)
            {
                messages.Add($"[{depth}] {current.GetType().FullName}: {current.Message}");
                current = current.InnerException;
                depth++;
            }

            return messages.Count == 0 ? "N/A" : string.Join(" --> ", messages);
        }

        private static long GetExecutionTimeMs(IReadOnlyDictionary<string, object?> properties)
        {
            if (!properties.TryGetValue("ExecutionTimeMs", out var executionTime) || executionTime == null)
            {
                return 0;
            }

            return executionTime switch
            {
                long longValue => longValue,
                int intValue => intValue,
                _ when long.TryParse(Convert.ToString(executionTime, CultureInfo.InvariantCulture), out var parsed) => parsed,
                _ => 0
            };
        }

        private static string RenderMessage(string messageTemplate, IReadOnlyDictionary<string, object?> properties)
        {
            return MessagePropertyRegex.Replace(messageTemplate, match =>
            {
                var propertyName = match.Groups["name"].Value.TrimStart('@', '$');
                if (!properties.TryGetValue(propertyName, out var value))
                {
                    return match.Value;
                }

                return Convert.ToString(value, CultureInfo.InvariantCulture) ?? string.Empty;
            });
        }
    }
}

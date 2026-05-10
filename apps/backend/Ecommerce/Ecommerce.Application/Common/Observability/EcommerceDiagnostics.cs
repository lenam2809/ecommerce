using System.Diagnostics.Metrics;

namespace Ecommerce.Application.Common.Observability
{
    public static class EcommerceDiagnostics
    {
        public const string MeterName = "Ecommerce.Application";

        public static readonly Meter Meter = new(MeterName, "1.0.0");

        public static readonly Counter<long> HttpRequests = Meter.CreateCounter<long>(
            "ecommerce_http_requests_total",
            description: "Total HTTP requests processed by the API.");

        public static readonly Histogram<double> HttpRequestDuration = Meter.CreateHistogram<double>(
            "ecommerce_http_request_duration_ms",
            description: "HTTP request duration in milliseconds.");

        public static readonly Counter<long> HttpRequestErrors = Meter.CreateCounter<long>(
            "ecommerce_http_request_errors_total",
            description: "Total HTTP requests that completed with a 5xx status code.");

        public static readonly Histogram<double> MethodExecutionDuration = Meter.CreateHistogram<double>(
            "ecommerce_method_execution_duration_ms",
            description: "Application method execution duration captured by PerformanceLogger.");

        public static readonly Counter<long> SlowMethods = Meter.CreateCounter<long>(
            "ecommerce_slow_methods_total",
            description: "Application methods that exceeded the configured slow threshold.");
    }
}

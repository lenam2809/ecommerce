namespace Ecommerce.WebAPI.Configuration
{
    public sealed class RequestLoggingOptions
    {
        public const string SectionName = "RequestLogging";

        public string CorrelationIdHeaderName { get; set; } = "X-Correlation-ID";

        public bool LogSuccessfulRequests { get; set; } = true;

        public List<RequestLoggingRuleOptions> NoisySuccessSamplingRules { get; set; } = [];

        public List<RequestLoggingRuleOptions> ImportantInformationRules { get; set; } = [];
    }

    public sealed class RequestLoggingRuleOptions
    {
        public string? Method { get; set; }

        public string PathPrefix { get; set; } = "/";

        public double SuccessSampleRate { get; set; } = 1d;
    }
}

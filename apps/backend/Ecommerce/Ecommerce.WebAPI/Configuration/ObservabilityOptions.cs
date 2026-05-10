namespace Ecommerce.WebAPI.Configuration
{
    public class ObservabilityOptions
    {
        public const string SectionName = "Observability";

        public string ServiceName { get; set; } = "ecommerce-api";

        public string ServiceVersion { get; set; } = "1.0.0";

        public string OtlpEndpoint { get; set; } = "http://jaeger:4317";

        public bool EnableConsoleExporter { get; set; }
    }
}

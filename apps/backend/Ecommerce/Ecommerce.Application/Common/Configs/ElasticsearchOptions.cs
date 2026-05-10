namespace Ecommerce.Application.Common.Configs
{
    public class ElasticsearchOptions
    {
        public const string SectionName = "Elasticsearch";

        public bool UseElasticsearch { get; set; } = true;
        public string Uri { get; set; } = "http://localhost:9200";
        public string DefaultIndex { get; set; } = "products";
        public string? IndexName { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }
        public bool EnableSsl { get; set; }
        public bool RunStartupReindex { get; set; } = true;
        public bool RunDailyReindex { get; set; } = true;
        public int DailyReindexHourUtc { get; set; } = 19;

        public string ResolvedIndexName =>
            !string.IsNullOrWhiteSpace(DefaultIndex)
                ? DefaultIndex
                : !string.IsNullOrWhiteSpace(IndexName)
                    ? IndexName!
                    : "products";
    }
}

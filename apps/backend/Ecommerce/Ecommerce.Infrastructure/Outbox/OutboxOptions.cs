namespace Ecommerce.Infrastructure.Outbox;

public sealed class OutboxOptions
{
    public const string SectionName = "Outbox";

    public bool Enabled { get; set; } = true;
    public int BatchSize { get; set; } = 20;
    public int MaxRetryCount { get; set; } = 5;
    public int PollIntervalSeconds { get; set; } = 10;
}

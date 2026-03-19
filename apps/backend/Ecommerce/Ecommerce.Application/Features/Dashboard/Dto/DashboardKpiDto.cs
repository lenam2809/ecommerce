namespace Ecommerce.Application.Features.Dashboard.Dto
{
    public class DashboardKpiDto
    {
        public required string Title { get; set; }
        public required string Value { get; set; }
        public required string Description { get; set; }
        public required TrendData Trend { get; set; }
        public required FooterData Footer { get; set; }
    }

    public class TrendData
    {
        public required string Value { get; set; }
        public required string Direction { get; set; } // "up" or "down"
    }

    public class FooterData
    {
        public required string Status { get; set; }
        public required string Description { get; set; }
    }
}


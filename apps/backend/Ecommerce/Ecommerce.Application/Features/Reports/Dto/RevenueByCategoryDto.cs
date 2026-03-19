namespace Ecommerce.Application.Features.Reports.Dto
{
    // DTO cho báo cáo doanh thu theo danh mục
    public class RevenueByCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public decimal Percentage { get; set; }
    }

    // DTO cho báo cáo doanh thu theo tháng
    public class RevenueByMonthDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
    }

    // DTO cho báo cáo so sánh doanh thu
    public class RevenueComparisonDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Current { get; set; }
        public decimal Previous { get; set; }
        public decimal GrowthRate { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
    }

    // DTO cho báo cáo xu hướng doanh thu
    public class RevenueTrendDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int Week { get; set; }
        public int Year { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    // DTO cho tổng quan báo cáo
    public class ReportSummaryDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal TotalOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public decimal GrowthRate { get; set; }
        public int TotalProducts { get; set; }
        public int TotalCustomers { get; set; }
    }
}


namespace Ecommerce.Application.Features.Reports.Dto
{
    public class OrderStatusDto
    {
        public string Name { get; set; } = string.Empty;
        public int Value { get; set; }
        public double Percentage { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class OrderRatioDto
    {
        public string Name { get; set; } = string.Empty;
        public int Month { get; set; }
        public int Year { get; set; }
        public double Success { get; set; }
        public double Cancel { get; set; }
        public int TotalOrders { get; set; }
    }

    public class AverageOrderValueDto
    {
        public string Name { get; set; } = string.Empty;
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal AOV { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}


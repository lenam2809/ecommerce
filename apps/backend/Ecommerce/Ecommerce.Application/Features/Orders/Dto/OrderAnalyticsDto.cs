namespace Ecommerce.Application.Features.Orders.Dto
{
    public class OrderAnalyticsDto
    {
        public int TotalOrders { get; set; }
        public decimal TotalSales { get; set; }
        public int PendingOrders { get; set; }
        public int ProcessingOrders { get; set; }
        public int ShippedOrders { get; set; }
        public int DeliveredOrders { get; set; }
        public int CancelledOrders { get; set; }
        public int ReturnedOrders { get; set; }
        public List<OrdersPerDayDto> OrdersPerDay { get; set; } = [];
        public List<BestSellingProductDto> BestSellingProducts { get; set; } = [];
    }

    public class OrdersPerDayDto
    {
        public DateTime Date { get; set; }
        public int OrderCount { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class BestSellingProductDto
    {
        public Guid ProductId { get; set; }
        public required string Name { get; set; }
        public required string Image { get; set; }
        public int TotalSold { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}


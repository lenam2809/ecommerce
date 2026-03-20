namespace Ecommerce.Application.Features.Reports.Dto
{
    public class RecentOrderDto
    {
        public required string OrderId { get; set; }
        public required string OrderCode { get; set; }
        public required string CustomerName { get; set; }
        public int ItemCount { get; set; }
        public decimal TotalAmount { get; set; }
    }
}


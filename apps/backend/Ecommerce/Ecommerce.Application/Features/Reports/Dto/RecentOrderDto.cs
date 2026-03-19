namespace Ecommerce.Application.Features.Reports.Dto
{
    public class RecentOrderDto
    {
        public string OrderId { get; set; }
        public string OrderCode { get; set; }
        public string CustomerName { get; set; }
        public int ItemCount { get; set; }
        public decimal TotalAmount { get; set; }
    }
}


namespace Ecommerce.Application.Features.Reports.Dto
{
    public class RecentTransactionDto
    {
        public required string CustomerName { get; set; }
        public required string CustomerEmail { get; set; }
        public decimal Amount { get; set; }
        public required string OrderDate { get; set; }
    }
}


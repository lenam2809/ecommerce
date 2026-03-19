namespace Ecommerce.Application.Features.Dashboard.Dto
{

    public class RevenueByDateDto
    {
        public DateOnly Date { get; set; }
        public decimal Revenue { get; set; }
    }

    public class CustomersByDateDto
    {
        public DateOnly Date { get; set; }
        public int NewUsers { get; set; }
    }

    public class OrdersByDateDto
    {
        public DateOnly Date { get; set; }
        public int NewOrders { get; set; }
    }

    public class ProductsByDateDto
    {
        public DateOnly Date { get; set; }
        public int NewProducts { get; set; }
    }

}


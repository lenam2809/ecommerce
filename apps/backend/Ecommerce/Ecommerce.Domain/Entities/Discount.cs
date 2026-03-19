namespace Ecommerce.Domain.Entities
{
    public class Discount : BaseEntity
    {
        public required string Code { get; set; }
        public required string Description { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int UsageLimit { get; set; }
        public int CurrentUsageCount { get; set; }

        public virtual ICollection<Product> ApplicableProducts { get; set; } = new List<Product>();
    }
}


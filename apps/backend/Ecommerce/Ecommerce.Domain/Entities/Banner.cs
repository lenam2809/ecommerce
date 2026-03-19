namespace Ecommerce.Domain.Entities
{
    public class Banner : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string ButtonText { get; set; } = string.Empty;
        public string ButtonLink { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}


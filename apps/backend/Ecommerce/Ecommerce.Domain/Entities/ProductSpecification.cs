namespace Ecommerce.Domain.Entities
{
    public class ProductSpecification : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string GroupName { get; set; } = "Chung";
        public int DisplayOrder { get; set; } = 0;
        public bool IsHighlight { get; set; } = false;
        public bool IsKeySpec { get; set; } = false;
        public string? FilterKey { get; set; }
        public Guid ProductId { get; set; }
        public virtual Product Product { get; set; } = null!;

        public string SpecKey
        {
            get => Name;
            set => Name = value;
        }

        public string SpecValue
        {
            get => Value;
            set => Value = value;
        }
    }
}


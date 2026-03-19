namespace Ecommerce.Domain.Entities
{
    // Domain/Entities/Contact.cs
    public class Contact : BaseEntity
    {
        public required ContactInfo Phone { get; set; }
        public required ContactInfo Email { get; set; }
        public required ContactInfo Office { get; set; }
        public bool IsActive { get; set; } = false;
        public ICollection<SocialLink> SocialLinks { get; set; } = [];
        public ICollection<FaqItem> Faqs { get; set; } = [];
    }

    // Value Objects
    public class ContactInfo
    {
        public required string Value { get; set; }
        public required string Description { get; set; }
    }

    public class SocialLink
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Url { get; set; }
    }

    public class FaqItem
    {
        public Guid Id { get; set; }
        public required string Question { get; set; }
        public required string Answer { get; set; }
    }
}


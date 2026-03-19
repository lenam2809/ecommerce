namespace Ecommerce.Domain.Entities
{
    // Domain/Entities/About.cs
    public class About : BaseEntity
    {
        public required HeroSection Hero { get; set; }
        public ICollection<ValueItem> Values { get; set; } = [];
        public required HistorySection History { get; set; }
        public ICollection<TeamMember> Team { get; set; } = [];
        public required CtaSection Cta { get; set; }
        public bool IsActive { get; set; } = false;
    }

    // Value Objects
    public class HeroSection
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
    }

    public class ValueItem
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
    }

    public class HistorySection
    {
        public required string Title { get; set; }
        public ICollection<HistoryParagraph> Paragraphs { get; set; } = [];
    }

    public class HistoryParagraph
    {
        public Guid Id { get; set; }
        public required string Content { get; set; }
    }

    public class TeamMember
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Role { get; set; }
        public required string ImageUrl { get; set; }
        public required string Bio { get; set; }
    }

    public class CtaSection
    {
        public required string Title { get; set; }
        public required string Description { get; set; }
    }
}


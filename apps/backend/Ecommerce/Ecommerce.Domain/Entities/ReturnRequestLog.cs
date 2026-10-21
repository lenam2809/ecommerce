namespace Ecommerce.Domain.Entities
{
    public class ReturnRequestLog : BaseEntity
    {
        public Guid ReturnRequestId { get; set; }
        public int Step { get; set; } = 1;
        public string Action { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? ActorName { get; set; }
        public string? Location { get; set; }
        public string? Note { get; set; }
        public string? ProcessingMethod { get; set; }
        public DateTime LoggedAt { get; set; } = DateTime.UtcNow;

        public string? TechnicianNote
        {
            get => Note;
            set => Note = value;
        }

        public string? Author
        {
            get => ActorName;
            set => ActorName = value;
        }

        // Navigation properties
        public virtual ReturnRequest ReturnRequest { get; set; } = null!;
    }
}

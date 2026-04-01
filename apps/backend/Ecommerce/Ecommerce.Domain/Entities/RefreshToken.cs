namespace Ecommerce.Domain.Entities
{
    public class RefreshToken : BaseEntity
    {
        public required string Token { get; set; }
        /// <summary>HMAC-SHA256 hash of Token. Used for DB lookups — raw token is never persisted.</summary>
        public string? TokenHash { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool IsRevoked { get; set; }
        public Guid ApplicationUserId { get; set; }

        // Navigation property
        public virtual ApplicationUser ApplicationUser { get; set; } = null!;
    }
}


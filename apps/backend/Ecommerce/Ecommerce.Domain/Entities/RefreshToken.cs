namespace Ecommerce.Domain.Entities
{
    public class RefreshToken : BaseEntity
    {
        public required string Token { get; set; }
        /// <summary>HMAC-SHA256 hash of Token. Used for DB lookups — raw token is never persisted.</summary>
        public string? TokenHash { get; set; }
        /// <summary>SHA256 hash of User-Agent string used when this token was issued.</summary>
        public string? UserAgentHash { get; set; }
        /// <summary>IP subnet fingerprint (first 3 octets for IPv4).</summary>
        public string? IpSubnet { get; set; }
        /// <summary>Token family identifier for replay detection and cascading revocation.</summary>
        public Guid FamilyId { get; set; } = Guid.NewGuid();
        /// <summary>Previous token in the same family (rotation chain).</summary>
        public Guid? ParentTokenId { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool IsRevoked { get; set; }
        public Guid ApplicationUserId { get; set; }

        // Navigation property
        public virtual ApplicationUser ApplicationUser { get; set; } = null!;
    }
}


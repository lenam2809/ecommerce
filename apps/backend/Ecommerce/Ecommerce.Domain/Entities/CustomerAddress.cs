using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class CustomerAddress : BaseEntity
    {
        [ForeignKey(nameof(ApplicationUser))]
        public Guid ApplicationUserId { get; set; }
        public required string AddressType { get; set; } // Home, Work, etc.
        public required string FullName { get; set; }
        public required string Street { get; set; }
        public required string City { get; set; }
        public required string State { get; set; }
        public required string PostalCode { get; set; }
        public required string Country { get; set; }
        public required string Phone { get; set; }
        public bool IsDefault { get; set; }

        public virtual ApplicationUser ApplicationUser { get; set; } = null!;
    }
}


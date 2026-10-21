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

        private string? _receiverName;
        public string ReceiverName
        {
            get => !string.IsNullOrWhiteSpace(_receiverName) ? _receiverName : (!string.IsNullOrWhiteSpace(FullName) ? FullName : string.Empty);
            set => _receiverName = value;
        }

        private string? _receiverPhone;
        public string ReceiverPhone
        {
            get => !string.IsNullOrWhiteSpace(_receiverPhone) ? _receiverPhone : (!string.IsNullOrWhiteSpace(Phone) ? Phone : string.Empty);
            set => _receiverPhone = value;
        }

        public virtual ApplicationUser ApplicationUser { get; set; } = null!;
    }
}


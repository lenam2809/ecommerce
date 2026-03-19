using Ecommerce.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class Shipping : BaseEntity
    {
        public EShippingMethod ShippingMethod { get; set; }
        public required string TrackingNumber { get; set; }
        public DateTime EstimatedDeliveryDate { get; set; }
        public decimal ShippingCost { get; set; }
        public required string ShippingProvider { get; set; }

        [ForeignKey(nameof(Order))]
        public Guid OrderId { get; set; }
        public virtual Order Order { get; set; } = null!;
    }
}


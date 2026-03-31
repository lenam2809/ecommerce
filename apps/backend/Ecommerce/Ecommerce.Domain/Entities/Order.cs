using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Exceptions;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class Order : BaseEntity
    {
        private readonly List<OrderItem> _orderItems = new();

        public Order()
        {
            // Constructor for EF Core
        }

        [Required]
        [StringLength(50)]
        public string Code { get; private set; } = string.Empty;

        [ForeignKey(nameof(ApplicationUser))]
        public Guid? ApplicationUserId { get; private set; } // Nullable cho guest

        [StringLength(200)]
        public string? GuestEmail { get; private set; }

        [StringLength(100)]
        public string? GuestName { get; private set; }

        [StringLength(64)]
        public string? GuestId { get; private set; }

        [NotMapped]
        public bool IsGuestOrder => !ApplicationUserId.HasValue;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; private set; }

        public DateTime OrderDate { get; private set; }

        [Required]
        [StringLength(500)]
        public string ShippingAddress { get; private set; } = string.Empty;

        [Phone]
        public string Phone { get; private set; } = string.Empty;

        [EmailAddress]
        public string Email { get; private set; } = string.Empty;

        public EOrderStatus Status { get; private set; }

        [StringLength(50)]
        public string? DiscountCode { get; private set; }

        [StringLength(500)]
        public string? DeliveryInstructions { get; private set; }

        public DateTime? ExpectedDeliveryDate { get; private set; }

        // Navigation properties
        public virtual ApplicationUser ApplicationUser { get; private set; } = null!;
        public virtual IReadOnlyCollection<OrderItem> OrderItems => _orderItems.AsReadOnly();

        // Factory method
        public static Order Create(
            Guid userId,
            string customerName,
            string email,
            string phone,
            string shippingAddress,
            string? discountCode,
            string? deliveryInstructions,
            DateTime? expectedDeliveryDate)
        {
            var order = new Order
            {
                Id = Guid.NewGuid(),
                Code = GenerateOrderCode(),
                ApplicationUserId = userId,
                Email = email,
                Phone = phone,
                ShippingAddress = shippingAddress,
                DiscountCode = discountCode,
                DeliveryInstructions = deliveryInstructions,
                Status = EOrderStatus.Pending,
                OrderDate = DateTime.UtcNow,
                ExpectedDeliveryDate = expectedDeliveryDate ?? DateTime.UtcNow.AddDays(3)
            };
            
            return order;
        }

        public static Order CreateGuestOrder(
            string guestEmail,
            string guestName,
            string phone,
            string shippingAddress,
            string? discountCode,
            string? deliveryInstructions,
            DateTime? expectedDeliveryDate,
            string? guestId = null)
        {
            return new Order
            {
                Id = Guid.NewGuid(),
                Code = GenerateOrderCode(),
                ApplicationUserId = null,
                GuestEmail = guestEmail,
                GuestName = guestName,
                GuestId = guestId,
                Email = guestEmail,
                Phone = phone,
                ShippingAddress = shippingAddress,
                DiscountCode = discountCode,
                DeliveryInstructions = deliveryInstructions,
                Status = EOrderStatus.Pending,
                OrderDate = DateTime.UtcNow,
                ExpectedDeliveryDate = expectedDeliveryDate ?? DateTime.UtcNow.AddDays(3)
            };
        }

        public void AddOrderItem(Guid productId, string name, string image, decimal unitPrice, int quantity, string? color, string? size)
        {
            var existingItem = _orderItems.FirstOrDefault(i => i.ProductId == productId && i.Color == color && i.Size == size);
            if (existingItem != null)
            {
                existingItem.AddQuantity(quantity);
            }
            else
            {
                var item = new OrderItem(
                    this.Id,
                    productId,
                    name,
                    image,
                    unitPrice,
                    quantity,
                    color,
                    size
                );
                _orderItems.Add(item);
            }

            RecalculateTotal();
        }

        public void FinalizeCreation(string customerName)
        {
             if (_orderItems.Count == 0)
             {
                 throw new DomainException("Đơn hàng phải có ít nhất một sản phẩm.");
             }

             AddDomainEvent(new OrderCreatedEvent(
                Id,
                Code,
                ApplicationUserId,
                Email,
                customerName,
                TotalAmount,
                _orderItems.Count,
                OrderDate
            ));
        }

        public void UpdateStatus(EOrderStatus newStatus, string? note = null, DateTime? customExpectedDeliveryDate = null)
        {
            if (!IsValidStatusTransition(Status, newStatus))
            {
                throw new InvalidStatusTransitionException(Status, newStatus);
            }

            var oldStatus = Status;
            Status = newStatus;

            // Logic cập nhật ngày giao dự kiến
            if (customExpectedDeliveryDate.HasValue)
            {
                ExpectedDeliveryDate = customExpectedDeliveryDate.Value;
            }
            else if (newStatus == EOrderStatus.Processing)
            {
                ExpectedDeliveryDate = DateTime.Now.AddDays(3);
            }
            else if (newStatus == EOrderStatus.Shipped)
            {
                ExpectedDeliveryDate = DateTime.Now.AddDays(1);
            }

            // Trigger events
            var customerName = ApplicationUser != null
                ? $"{ApplicationUser.FirstName} {ApplicationUser.LastName}".Trim()
                : "";

            AddDomainEvent(new OrderStatusChangedEvent(
                Id,
                Code,
                ApplicationUserId,
                oldStatus,
                newStatus,
                Email,
                customerName
            ));
        }

        public void UpdateInfo(string shippingAddress, string phone, string email, string? deliveryInstructions)
        {
            ShippingAddress = shippingAddress;
            Phone = phone;
            Email = email;
            DeliveryInstructions = deliveryInstructions;
        }

        public Order Snapshot()
        {
            return (Order)this.MemberwiseClone();
        }

        private void RecalculateTotal()
        {
            TotalAmount = _orderItems.Sum(x => x.UnitPrice * x.Quantity);
        }

        private static string GenerateOrderCode()
        {
            var timestamp = DateTime.Now.ToString("yyMMddHHmm");
            var random = new Random().Next(1000, 9999).ToString();
            return $"ORD-{timestamp}-{random}";
        }

        private static bool IsValidStatusTransition(EOrderStatus currentStatus, EOrderStatus newStatus)
        {
            if (currentStatus == newStatus) return true;

            return (currentStatus, newStatus) switch
            {
                (EOrderStatus.Pending, EOrderStatus.Processing) => true,
                (EOrderStatus.Pending, EOrderStatus.Cancelled) => true,
                (EOrderStatus.Processing, EOrderStatus.Shipped) => true,
                (EOrderStatus.Processing, EOrderStatus.Cancelled) => true,
                (EOrderStatus.Shipped, EOrderStatus.Delivered) => true,
                (EOrderStatus.Shipped, EOrderStatus.ReturnRequested) => true,
                (EOrderStatus.Delivered, EOrderStatus.Completed) => true,
                (EOrderStatus.Delivered, EOrderStatus.ReturnRequested) => true,
                (EOrderStatus.ReturnRequested, EOrderStatus.Returned) => true,
                (EOrderStatus.Returned, EOrderStatus.Refunded) => true,
                _ => false
            };
        }
    }
}

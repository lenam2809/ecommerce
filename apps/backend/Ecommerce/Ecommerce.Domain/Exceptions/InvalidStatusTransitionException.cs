using Ecommerce.Domain.Enums;

namespace Ecommerce.Domain.Exceptions
{
    /// <summary>
    /// Exception thrown when an invalid order status transition is attempted
    /// </summary>
    public class InvalidStatusTransitionException : DomainException
    {
        public EOrderStatus FromStatus { get; }
        public EOrderStatus ToStatus { get; }

        public InvalidStatusTransitionException(EOrderStatus fromStatus, EOrderStatus toStatus)
            : base($"Chuyển trạng thái không hợp lệ từ {fromStatus} sang {toStatus}")
        {
            FromStatus = fromStatus;
            ToStatus = toStatus;
        }
    }
}

using MediatR;

namespace Ecommerce.Domain.Events
{
    /// <summary>
    /// Domain event phát ra khi khách hàng tạo yêu cầu đổi/trả hàng.
    /// </summary>
    public record ReturnRequestCreatedEvent(
        Guid ReturnRequestId,
        string Code,
        Guid OrderId,
        Guid CustomerId
    ) : INotification;
}

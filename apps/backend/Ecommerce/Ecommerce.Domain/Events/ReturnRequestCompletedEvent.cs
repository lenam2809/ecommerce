using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Domain.Events
{
    /// <summary>
    /// Domain event phát ra khi yêu cầu đổi/trả hàng được hoàn tất.
    /// </summary>
    public record ReturnRequestCompletedEvent(
        Guid ReturnRequestId,
        string Code,
        Guid OrderId,
        EReturnType Type,
        decimal RefundAmount
    ) : INotification;
}

using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Exceptions;
using FluentAssertions;

namespace Ecommerce.Domain.Tests.Entities;

public class ReturnRequestTests
{
    [Fact]
    public void Create_ValidArguments_CreatesRequestedReturnRequestWithHistoryAndEvent()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var customerId = Guid.NewGuid();

        // Act
        var request = CreateReturnRequest(orderId: orderId, customerId: customerId);

        // Assert
        request.Code.Should().StartWith("RMA-");
        request.OrderId.Should().Be(orderId);
        request.CustomerId.Should().Be(customerId);
        request.Status.Should().Be(EReturnStatus.Requested);
        request.StatusHistory.Should().ContainSingle();
        request.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ReturnRequestCreatedEvent>();
    }

    [Fact]
    public void Create_InvalidQuantity_ThrowsDomainException()
    {
        // Arrange
        Action act = () => CreateReturnRequest(quantity: 0);

        // Act & Assert
        act.Should().Throw<DomainException>()
            .WithMessage("Số lượng đổi/trả phải lớn hơn 0.");
    }

    [Fact]
    public void AddEvidence_UnderLimit_AddsEvidence()
    {
        // Arrange
        var request = CreateReturnRequest();

        // Act
        request.AddEvidence("https://cdn.test/evidence.png", EEvidenceType.Image, "Damaged box");

        // Assert
        request.Evidences.Should().ContainSingle();
        request.Evidences.Single().Description.Should().Be("Damaged box");
    }

    [Fact]
    public void AddEvidence_MoreThanTenFiles_ThrowsDomainException()
    {
        // Arrange
        var request = CreateReturnRequest();
        for (var i = 0; i < 10; i++)
        {
            request.AddEvidence($"https://cdn.test/{i}.png", EEvidenceType.Image, null);
        }

        Action act = () => request.AddEvidence("https://cdn.test/11.png", EEvidenceType.Image, null);

        // Act & Assert
        act.Should().Throw<DomainException>()
            .WithMessage("Tối đa 10 file bằng chứng cho mỗi yêu cầu đổi/trả.");
    }

    [Fact]
    public void StartReview_RequestedRequest_MovesToUnderReview()
    {
        // Arrange
        var request = CreateReturnRequest();
        var staffId = Guid.NewGuid();

        // Act
        request.StartReview(staffId);

        // Assert
        request.Status.Should().Be(EReturnStatus.UnderReview);
        request.ProcessedByStaffId.Should().Be(staffId);
        request.StatusHistory.Should().HaveCount(2);
    }

    [Fact]
    public void Approve_UnderReviewRequest_MovesToApprovedAndUpdatesRefund()
    {
        // Arrange
        var request = CreateReturnRequest(refundAmount: 1000m);
        var staffId = Guid.NewGuid();
        request.StartReview(staffId);

        // Act
        request.Approve(staffId, "Approved", 800m);

        // Assert
        request.Status.Should().Be(EReturnStatus.Approved);
        request.StaffNote.Should().Be("Approved");
        request.RefundAmount.Should().Be(800m);
    }

    [Fact]
    public void Reject_EmptyReason_ThrowsDomainException()
    {
        // Arrange
        var request = CreateReturnRequest();
        Action act = () => request.Reject(Guid.NewGuid(), " ");

        // Act & Assert
        act.Should().Throw<DomainException>()
            .WithMessage("Phải nêu lý do từ chối.");
    }

    [Fact]
    public void MarkCompleted_RefundProcessingRequest_CompletesAndAddsEvent()
    {
        // Arrange
        var request = CreateReturnRequest(type: EReturnType.Return);
        request.StartReview(Guid.NewGuid());
        request.Approve(Guid.NewGuid(), null, 1000m);
        request.ConfirmItemReceived();
        request.StartQualityCheck();
        request.StartRefundProcessing();
        request.ClearDomainEvents();

        // Act
        request.MarkCompleted();

        // Assert
        request.Status.Should().Be(EReturnStatus.Completed);
        request.ResolvedAt.Should().NotBeNull();
        request.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<ReturnRequestCompletedEvent>();
    }

    [Fact]
    public void MarkCompleted_RequestedRequest_ThrowsDomainException()
    {
        // Arrange
        var request = CreateReturnRequest();
        Action act = () => request.MarkCompleted();

        // Act & Assert
        act.Should().Throw<DomainException>()
            .WithMessage("Không thể chuyển trạng thái RMA từ 'Requested' sang 'Completed'.");
    }

    private static ReturnRequest CreateReturnRequest(
        Guid? orderId = null,
        Guid? customerId = null,
        EReturnType type = EReturnType.Return,
        int quantity = 1,
        decimal refundAmount = 1000m)
    {
        return ReturnRequest.Create(
            orderId ?? Guid.NewGuid(),
            Guid.NewGuid(),
            customerId ?? Guid.NewGuid(),
            type,
            EReturnReason.Defective,
            "Product is defective",
            quantity,
            refundAmount);
    }
}

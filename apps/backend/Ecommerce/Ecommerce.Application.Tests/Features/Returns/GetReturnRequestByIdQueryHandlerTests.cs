using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Returns.Queries.GetReturnRequestById;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Returns
{
    public class GetReturnRequestByIdQueryHandlerTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWork = new();
        private readonly Mock<IReturnRequestRepository> _returnRequestRepository = new();
        private readonly Mock<ICurrentUserService> _currentUserService = new();
        private readonly GetReturnRequestByIdQueryHandler _handler;

        public GetReturnRequestByIdQueryHandlerTests()
        {
            _unitOfWork.SetupGet(x => x.ReturnRequests).Returns(_returnRequestRepository.Object);
            _handler = new GetReturnRequestByIdQueryHandler(_unitOfWork.Object, _currentUserService.Object);
        }

        [Fact]
        public async Task Handle_ExistingRequest_ReturnsFiveStepTimelineAndLogs()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var requestId = Guid.NewGuid();
            var orderId = Guid.NewGuid();
            var orderItemId = Guid.NewGuid();

            var entity = ReturnRequest.Create(
                orderId,
                orderItemId,
                userId,
                EReturnType.Exchange,
                EReturnReason.Defective,
                "Lỗi màn hình sọc xanh sau 3 ngày sử dụng",
                1,
                0,
                "RET-2026-999");

            _currentUserService.SetupGet(x => x.UserId).Returns(userId);
            _currentUserService.Setup(x => x.IsInRole(It.IsAny<string>())).Returns(false);

            _returnRequestRepository
                .Setup(x => x.GetWithDetailsAsync(requestId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(entity);

            var query = new GetReturnRequestByIdQuery { Id = requestId };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().NotBeNull();
            result.Value.TimelineSteps.Should().HaveCount(5);
            result.Value.TimelineSteps.Should().Contain(s => s.Step == 1 && s.Status == "Completed");
            result.Value.TimelineSteps.Should().Contain(s => s.Title.Contains("Tiếp nhận thiết bị"));
            result.Value.TimelineSteps.Should().Contain(s => s.Title.Contains("KTV kiểm định"));
            result.Value.Logs.Should().NotBeEmpty();
        }

        [Fact]
        public async Task Handle_Unauthenticated_ReturnsUnauthorized()
        {
            // Arrange
            _currentUserService.SetupGet(x => x.UserId).Returns((Guid?)null);
            var query = new GetReturnRequestByIdQuery { Id = Guid.NewGuid() };

            _returnRequestRepository
                .Setup(x => x.GetWithDetailsAsync(query.Id, It.IsAny<CancellationToken>()))
                .ReturnsAsync(ReturnRequest.Create(
                    Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(),
                    EReturnType.Exchange, EReturnReason.Defective,
                    "Lỗi máy", 1, 0));

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.IsUnauthorized.Should().BeTrue();
        }
    }
}

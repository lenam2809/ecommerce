using AutoMapper;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.PromoCodes.Commands.ApplyPromoCode;
using Ecommerce.Application.Features.PromoCodes.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Base;
using FluentAssertions;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features.PromoCodes.Commands.ApplyPromoCode;

public class ApplyPromoCodeCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IPromoCodeRepository> _promoCodeRepository = new();
    private readonly Mock<IRepository<PromoCode>> _basePromoCodeRepository = new();
    private readonly Mock<IMapper> _mapper = new();
    private readonly ApplyPromoCodeCommandHandler _handler;

    public ApplyPromoCodeCommandHandlerTests()
    {
        _unitOfWork.SetupGet(x => x.PromoCodes).Returns(_promoCodeRepository.Object);
        _unitOfWork.Setup(x => x.BaseRepository<PromoCode>()).Returns(_basePromoCodeRepository.Object);
        _mapper.Setup(x => x.Map<PromoCodeDto>(It.IsAny<PromoCode>()))
            .Returns((PromoCode promoCode) => new PromoCodeDto
            {
                Id = promoCode.Id,
                Code = promoCode.Code,
                Description = promoCode.Description,
                Type = promoCode.Type.ToString(),
                DiscountPercentage = promoCode.DiscountPercentage,
                DiscountAmount = promoCode.DiscountAmount,
                FreeShipping = promoCode.FreeShipping,
                ValidFrom = promoCode.ValidFrom,
                ValidTo = promoCode.ValidTo,
                UsageLimit = promoCode.UsageLimit,
                TimesUsed = promoCode.TimesUsed,
                IsActive = promoCode.IsActive
            });

        _handler = new ApplyPromoCodeCommandHandler(_unitOfWork.Object, _mapper.Object);
    }

    [Fact]
    public async Task Handle_ValidPromoCode_ReturnsPreviewWithoutIncrementingUsage()
    {
        // Arrange
        var promoCode = CreatePromoCode("SAVE10", PromoCodeType.PercentageDiscount, discountPercentage: 10m);
        _promoCodeRepository.Setup(x => x.GetByCodeAsync(promoCode.Code)).ReturnsAsync(promoCode);

        // Act
        var result = await _handler.Handle(new ApplyPromoCodeCommand
        {
            Code = promoCode.Code,
            OrderTotal = 1000m
        }, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.DiscountAmount.Should().Be(100m);
        promoCode.TimesUsed.Should().Be(0);
        _basePromoCodeRepository.Verify(x => x.ExecuteCommandAsync(It.IsAny<string>(), It.IsAny<object[]?>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_InvalidPromoCode_ReturnsBadRequestWithoutIncrementingUsage()
    {
        // Arrange
        _promoCodeRepository.Setup(x => x.GetByCodeAsync("MISSING")).ReturnsAsync((PromoCode?)null!);

        // Act
        var result = await _handler.Handle(new ApplyPromoCodeCommand
        {
            Code = "MISSING",
            OrderTotal = 1000m
        }, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Mã giảm giá không tồn tại");
        _basePromoCodeRepository.Verify(x => x.ExecuteCommandAsync(It.IsAny<string>(), It.IsAny<object[]?>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_PromoUsageLimitReached_ReturnsBadRequestWithoutIncrementingUsage()
    {
        // Arrange
        var promoCode = CreatePromoCode("LIMITED", PromoCodeType.FixedAmountDiscount, discountAmount: 100m, usageLimit: 1, timesUsed: 1);
        _promoCodeRepository.Setup(x => x.GetByCodeAsync(promoCode.Code)).ReturnsAsync(promoCode);

        // Act
        var result = await _handler.Handle(new ApplyPromoCodeCommand
        {
            Code = promoCode.Code,
            OrderTotal = 1000m
        }, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Mã giảm giá đã đạt giới hạn sử dụng");
        promoCode.TimesUsed.Should().Be(1);
        _basePromoCodeRepository.Verify(x => x.ExecuteCommandAsync(It.IsAny<string>(), It.IsAny<object[]?>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    private static PromoCode CreatePromoCode(
        string code,
        PromoCodeType type,
        decimal discountPercentage = 0,
        decimal discountAmount = 0,
        int usageLimit = 0,
        int timesUsed = 0)
    {
        return new PromoCode
        {
            Id = Guid.NewGuid(),
            Code = code,
            Description = $"{code} promo",
            Type = type,
            DiscountPercentage = discountPercentage,
            DiscountAmount = discountAmount,
            FreeShipping = false,
            ValidFrom = DateTime.UtcNow.AddDays(-1),
            ValidTo = DateTime.UtcNow.AddDays(1),
            UsageLimit = usageLimit,
            TimesUsed = timesUsed,
            IsActive = true
        };
    }
}

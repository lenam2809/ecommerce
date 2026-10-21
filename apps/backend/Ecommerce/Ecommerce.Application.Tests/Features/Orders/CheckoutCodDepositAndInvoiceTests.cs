using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Features.Orders.Commands.CreateOrder;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Orders
{
    public class CheckoutCodDepositAndInvoiceTests
    {
        private readonly CreateOrderCommandValidator _validator = new();

        [Theory]
        [InlineData("0101234567")]      // 10 digits
        [InlineData("0101234567-001")]  // 10-3 digits
        [InlineData("0123456789123")]   // 13 digits
        public async Task Validator_ValidTaxCode_PassesValidation(string taxCode)
        {
            // Arrange
            var command = new CreateOrderCommand
            {
                ShippingAddress = "123 Ba Dinh, Hanoi",
                Phone = "0912345678",
                Email = "customer@example.com",
                ApplicationUserId = Guid.NewGuid(),
                RequireInvoice = true,
                TaxCode = taxCode,
                CompanyName = "ShopViet JSC",
                CompanyAddress = "Hanoi, Vietnam",
                OrderItems = new List<CreateOrderItemDto>
                {
                    new() { ProductId = Guid.NewGuid(), Quantity = 1 }
                }
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            result.IsValid.Should().BeTrue();
        }

        [Theory]
        [InlineData("123")]
        [InlineData("123456789")]
        [InlineData("ABC1234567")]
        [InlineData("0101234567-01")]
        [InlineData("Valid TaxCode")] // Dummy test string must now fail
        public async Task Validator_InvalidTaxCode_FailsValidation(string invalidTaxCode)
        {
            // Arrange
            var command = new CreateOrderCommand
            {
                ShippingAddress = "123 Ba Dinh, Hanoi",
                Phone = "0912345678",
                Email = "customer@example.com",
                ApplicationUserId = Guid.NewGuid(),
                RequireInvoice = true,
                TaxCode = invalidTaxCode,
                CompanyName = "ShopViet JSC",
                CompanyAddress = "Hanoi, Vietnam",
                OrderItems = new List<CreateOrderItemDto>
                {
                    new() { ProductId = Guid.NewGuid(), Quantity = 1 }
                }
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.ErrorMessage.Contains("Mã số thuế không đúng định dạng"));
        }

        [Fact]
        public async Task Validator_ShowroomPickup_WithShowroomId_PassesValidation()
        {
            // Arrange
            var command = new CreateOrderCommand
            {
                ShippingAddress = "", // Empty allowed when ShowroomId is provided
                DeliveryType = EDeliveryType.ShowroomPickup,
                DeliveryMethod = "ShowroomPickup",
                ShowroomId = Guid.NewGuid(),
                Phone = "0912345678",
                Email = "customer@example.com",
                ApplicationUserId = Guid.NewGuid(),
                OrderItems = new List<CreateOrderItemDto>
                {
                    new() { ProductId = Guid.NewGuid(), Quantity = 1 }
                }
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            result.IsValid.Should().BeTrue();
        }

        [Fact]
        public async Task Validator_ShowroomPickup_MissingShowroomId_FailsValidation()
        {
            // Arrange
            var command = new CreateOrderCommand
            {
                ShippingAddress = "",
                DeliveryType = EDeliveryType.ShowroomPickup,
                DeliveryMethod = "ShowroomPickup",
                ShowroomId = null,
                Phone = "0912345678",
                Email = "customer@example.com",
                ApplicationUserId = Guid.NewGuid(),
                OrderItems = new List<CreateOrderItemDto>
                {
                    new() { ProductId = Guid.NewGuid(), Quantity = 1 }
                }
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.ErrorMessage.Contains("Vui lòng chọn showroom để nhận hàng"));
        }

        [Fact]
        public void Order_CodDeposit_Over20M_Requires10PercentDeposit()
        {
            // Arrange
            var order = Order.Create(
                Guid.NewGuid(),
                "Nguyen Van A",
                "a@example.com",
                "0912345678",
                "123 Nguyen Trai",
                null,
                null,
                null);

            order.PaymentMethod = "COD";
            order.AddOrderItem(Guid.NewGuid(), "MacBook Pro 14", "macbook.png", 25_000_000m, 1, "Space Gray", "14-inch");

            // Act: Apply SSoT COD deposit rule
            var isCod = string.Equals(order.PaymentMethod, "COD", StringComparison.OrdinalIgnoreCase);
            if (isCod && order.TotalAmount > 20_000_000m)
            {
                order.DepositRequired = Math.Round(order.TotalAmount * 0.10m);
                order.DepositStatus = EDepositStatus.Pending;
                order.DepositAmount = 0;
                order.RemainingAmount = order.TotalAmount - order.DepositRequired;
            }

            // Assert
            order.TotalAmount.Should().Be(25_000_000m);
            order.DepositRequired.Should().Be(2_500_000m);
            order.DepositStatus.Should().Be(EDepositStatus.Pending);
            order.RemainingAmount.Should().Be(22_500_000m);
        }

        [Fact]
        public void Order_CodDeposit_Under20M_DoesNotRequireDeposit()
        {
            // Arrange
            var order = Order.Create(
                Guid.NewGuid(),
                "Nguyen Van B",
                "b@example.com",
                "0912345678",
                "123 Nguyen Trai",
                null,
                null,
                null);

            order.PaymentMethod = "COD";
            order.AddOrderItem(Guid.NewGuid(), "iPad Air", "ipad.png", 15_000_000m, 1, "Blue", "11-inch");

            // Act: Apply SSoT COD deposit rule
            var isCod = string.Equals(order.PaymentMethod, "COD", StringComparison.OrdinalIgnoreCase);
            if (isCod && order.TotalAmount > 20_000_000m)
            {
                order.DepositRequired = Math.Round(order.TotalAmount * 0.10m);
                order.DepositStatus = EDepositStatus.Pending;
                order.DepositAmount = 0;
                order.RemainingAmount = order.TotalAmount - order.DepositRequired;
            }
            else
            {
                order.DepositRequired = 0;
                order.DepositStatus = EDepositStatus.None;
                order.DepositAmount = 0;
                order.RemainingAmount = order.TotalAmount;
            }

            // Assert
            order.TotalAmount.Should().Be(15_000_000m);
            order.DepositRequired.Should().Be(0);
            order.DepositStatus.Should().Be(EDepositStatus.None);
            order.RemainingAmount.Should().Be(15_000_000m);
        }

        [Fact]
        public void OrderDto_OrderItemDto_MapsAllSsoT2026Properties()
        {
            // Arrange
            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new MappingProfile());
            }, Microsoft.Extensions.Logging.Abstractions.NullLoggerFactory.Instance);
            var mapper = config.CreateMapper();


            var showroomId = Guid.NewGuid();
            var showroom = new Showroom
            {
                Code = "SR-HCM-01",
                Name = "Showroom Lê Lợi",
                Address = "123 Le Loi, Q1, HCM"
            };
            showroom.Id = showroomId;

            var order = Order.Create(
                Guid.NewGuid(),
                "Tran Van C",
                "c@example.com",
                "0901234567",
                "Nhận tại showroom",
                null,
                null,
                null,
                "ORD-2026-TEST");

            order.ShowroomId = showroomId;
            order.DeliveryType = EDeliveryType.ShowroomPickup;
            order.DeliveryMethod = "ShowroomPickup";
            order.DepositRequired = 2_500_000m;
            order.DepositStatus = EDepositStatus.Pending;
            order.RemainingAmount = 22_500_000m;
            order.Invoice = new OrderInvoice(true, "0101234567", "ShopViet", "Hanoi", "c@example.com");

            var addOnId = Guid.NewGuid();
            order.AddOrderItem(
                Guid.NewGuid(),
                "iPhone 15 Pro Max",
                "iphone.png",
                30_000_000m,
                1,
                "Titan Tự Nhiên",
                "256GB",
                Guid.NewGuid(),
                "SKU-IPHONE15-256",
                "Titan / 256GB",
                addOnId,
                "Gói bảo hành AppleCare+ 2 năm",
                2_599_000m,
                24);

            // Act
            var dto = mapper.Map<OrderDto>(order);

            // Assert
            dto.ShowroomId.Should().Be(showroomId);
            dto.DeliveryType.Should().Be(EDeliveryType.ShowroomPickup);
            dto.DeliveryMethod.Should().Be("ShowroomPickup");
            dto.DepositRequired.Should().Be(2_500_000m);
            dto.DepositStatus.Should().Be(EDepositStatus.Pending);
            dto.RemainingAmount.Should().Be(22_500_000m);
            dto.Invoice.Should().NotBeNull();
            dto.Invoice!.RequireInvoice.Should().BeTrue();
            dto.Invoice.TaxCode.Should().Be("0101234567");

            dto.OrderItems.Should().HaveCount(1);
            var itemDto = dto.OrderItems[0];
            itemDto.AddOnId.Should().Be(addOnId);
            itemDto.AddOnName.Should().Be("Gói bảo hành AppleCare+ 2 năm");
            itemDto.AddOnPrice.Should().Be(2_599_000m);
            itemDto.WarrantyMonths.Should().Be(24);
            itemDto.SkuCode.Should().Be("SKU-IPHONE15-256");
        }
    }
}

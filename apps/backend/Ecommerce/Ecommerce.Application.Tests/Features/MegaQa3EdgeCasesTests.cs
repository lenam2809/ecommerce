using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Commands.CreateOrder;
using Ecommerce.Application.Features.Orders.Commands.UploadOrderInvoicePdf;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Application.Features.Products.Commands.CreateProduct;
using Ecommerce.Application.Features.Products.Commands.UpdateProduct;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Application.Features.Promotions.Commands.CreateFlashSale;
using Ecommerce.Application.Features.Promotions.Commands.UpdateFlashSale;
using Ecommerce.Application.Features.Promotions.Dto;
using Ecommerce.Application.Features.Showrooms.Commands.TransferShowroomStock;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features
{
    public class MegaQa3EdgeCasesTests
    {
        // -------------------------------------------------------------------------
        // EDGE CASE 1: Giới hạn tối đa 2 Key Specs trên API Backend (POST / PUT)
        // -------------------------------------------------------------------------
        [Fact]
        public async Task EdgeCase1_CreateProduct_WithMoreThan2KeySpecs_ReturnsValidationError()
        {
            var mockRepo = new Mock<IProductRepository>();
            mockRepo.Setup(r => r.IsCodeUniqueAsync(It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            mockRepo.Setup(r => r.IsSkuUniqueAsync(It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var validator = new CreateProductCommandValidator(mockRepo.Object);

            var mockFile = new Mock<Microsoft.AspNetCore.Http.IFormFile>();
            mockFile.Setup(f => f.Length).Returns(1024);

            var command = new CreateProductCommand
            {
                Code = "PRD-TEST-001",
                Name = "MacBook Pro Test",
                Sku = "MBP-TEST-SKU",
                Price = 50000000,
                Description = "Mo ta san pham",
                MainImage = mockFile.Object,
                CategoryId = Guid.NewGuid(),
                BrandId = Guid.NewGuid(),
                Specifications = new List<ProductSpecificationDto>
                {
                    new() { Name = "CPU", Value = "M3 Max", IsKeySpec = true },
                    new() { Name = "RAM", Value = "36GB", IsKeySpec = true },
                    new() { Name = "SSD", Value = "1TB", IsKeySpec = true }, // 3rd Key Spec -> Should Fail!
                }
            };

            var result = await validator.ValidateAsync(command);

            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.ErrorMessage.Contains("Sản phẩm chỉ được có tối đa 2 thông số nổi bật (Key Specs)"));
        }

        [Fact]
        public async Task EdgeCase1_UpdateProduct_WithMoreThan2KeySpecs_ReturnsValidationError()
        {
            var mockRepo = new Mock<IProductRepository>();
            mockRepo.Setup(r => r.ExistsAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            mockRepo.Setup(r => r.IsCodeUniqueAsync(It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);
            mockRepo.Setup(r => r.IsSkuUniqueAsync(It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var validator = new UpdateProductCommandValidator(mockRepo.Object);

            var command = new UpdateProductCommand
            {
                Id = Guid.NewGuid(),
                Code = "PRD-TEST-002",
                Name = "MacBook Pro Test 2",
                Sku = "MBP-TEST-SKU2",
                Price = 50000000,
                CategoryId = Guid.NewGuid(),
                BrandId = Guid.NewGuid(),
                Specifications = new List<ProductSpecificationDto>
                {
                    new() { Name = "CPU", Value = "M3 Pro", IsKeySpec = true },
                    new() { Name = "RAM", Value = "18GB", IsKeySpec = true },
                    new() { Name = "Màn hình", Value = "14 inch Liquid Retina XDR", IsKeySpec = true }, // 3rd -> Fail!
                }
            };

            var result = await validator.ValidateAsync(command);

            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.ErrorMessage.Contains("Sản phẩm chỉ được có tối đa 2 thông số nổi bật (Key Specs)"));
        }

        // -------------------------------------------------------------------------
        // EDGE CASE 2: Điều chuyển kho âm hoặc vượt số lượng khả dụng
        // -------------------------------------------------------------------------
        [Fact]
        public async Task EdgeCase2_TransferStock_WhenQuantityZeroOrNegative_ValidatorFails()
        {
            var validator = new TransferShowroomStockCommandValidator();
            var command = new TransferShowroomStockCommand
            {
                FromShowroomId = Guid.NewGuid(),
                ToShowroomId = Guid.NewGuid(),
                ProductId = Guid.NewGuid(),
                Quantity = 0 // Invalid
            };

            var result = await validator.ValidateAsync(command);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.ErrorMessage.Contains("Số lượng điều chuyển phải lớn hơn 0"));
        }

        [Fact]
        public async Task EdgeCase2_TransferStock_WhenSameFromAndTo_ValidatorFails()
        {
            var id = Guid.NewGuid();
            var validator = new TransferShowroomStockCommandValidator();
            var command = new TransferShowroomStockCommand
            {
                FromShowroomId = id,
                ToShowroomId = id, // Same showroom
                ProductId = Guid.NewGuid(),
                Quantity = 5
            };

            var result = await validator.ValidateAsync(command);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.ErrorMessage.Contains("Showroom xuất và showroom nhận không được trùng nhau"));
        }

        // -------------------------------------------------------------------------
        // EDGE CASE 3: Khung giờ Flash Sale không hợp lệ (EndTime <= StartTime hoặc FlashPrice >= BasePrice)
        // -------------------------------------------------------------------------
        [Fact]
        public async Task EdgeCase3_CreateFlashSale_WhenEndTimeBeforeStartTime_ValidatorFails()
        {
            var validator = new CreateFlashSaleCommandValidator();
            var now = DateTime.UtcNow;

            var command = new CreateFlashSaleCommand
            {
                Title = "Flash Sale Hè 2026",
                StartTime = now.AddHours(2),
                EndTime = now.AddHours(1), // EndTime < StartTime!
                Items = new List<FlashSaleItemInputDto>()
            };

            var result = await validator.ValidateAsync(command);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.ErrorMessage.Contains("Thời gian kết thúc phải sau thời gian bắt đầu"));
        }

        [Fact]
        public async Task EdgeCase3_CreateFlashSale_WhenFlashPriceGreaterThanOrEqualToOriginal_ValidatorFails()
        {
            var validator = new CreateFlashSaleCommandValidator();
            var now = DateTime.UtcNow;

            var command = new CreateFlashSaleCommand
            {
                Title = "Flash Sale Độc Quyền",
                StartTime = now,
                EndTime = now.AddHours(4),
                Items = new List<FlashSaleItemInputDto>
                {
                    new()
                    {
                        ProductId = Guid.NewGuid(),
                        OriginalPrice = 30000000,
                        FlashSalePrice = 30000000, // Equal to OriginalPrice -> Must Fail!
                        TotalQuota = 10
                    }
                }
            };

            var result = await validator.ValidateAsync(command);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.ErrorMessage.Contains("Giá Flash Sale phải nhỏ hơn giá gốc"));
        }

        [Fact]
        public async Task EdgeCase3_UpdateFlashSale_WhenFlashPriceExceedsOriginal_ValidatorFails()
        {
            var validator = new UpdateFlashSaleCommandValidator();
            var now = DateTime.UtcNow;

            var command = new UpdateFlashSaleCommand
            {
                Id = Guid.NewGuid(),
                Title = "Flash Sale Cập Nhật",
                StartTime = now,
                EndTime = now.AddHours(4),
                Items = new List<FlashSaleItemInputDto>
                {
                    new()
                    {
                        ProductId = Guid.NewGuid(),
                        OriginalPrice = 25000000,
                        FlashSalePrice = 28000000, // Higher than OriginalPrice -> Fail!
                        TotalQuota = 5
                    }
                }
            };

            var result = await validator.ValidateAsync(command);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.ErrorMessage.Contains("Giá Flash Sale phải nhỏ hơn giá gốc"));
        }

        // -------------------------------------------------------------------------
        // EDGE CASE 4: Định dạng Mã số thuế VAT (bắt buộc 10 hoặc 13 chữ số)
        // -------------------------------------------------------------------------
        [Theory]
        [InlineData("12345")]             // 5 digits -> invalid
        [InlineData("123456789")]         // 9 digits -> invalid
        [InlineData("12345678901")]       // 11 digits -> invalid
        [InlineData("123456789012")]      // 12 digits -> invalid
        [InlineData("010123456A")]        // contains letters -> invalid
        public async Task EdgeCase4_CreateOrder_WithInvalidTaxCode_ValidatorFails(string invalidTax)
        {
            var validator = new CreateOrderCommandValidator();
            var command = new CreateOrderCommand
            {
                ShippingAddress = "123 Pham Van Dong, Hanoi",
                Phone = "0987654321",
                Email = "tax-test@shopviet.vn",
                ApplicationUserId = Guid.NewGuid(),
                RequireInvoice = true,
                TaxCode = invalidTax,
                CompanyName = "ShopViet Tech Corp",
                CompanyAddress = "Hanoi, Vietnam",
                OrderItems = new List<CreateOrderItemDto>
                {
                    new() { ProductId = Guid.NewGuid(), Quantity = 1 }
                }
            };

            var result = await validator.ValidateAsync(command);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.ErrorMessage.Contains("Mã số thuế không đúng định dạng"));
        }

        [Theory]
        [InlineData("0101234567")]        // 10 digits -> valid
        [InlineData("0101234567-001")]    // 10-3 digits -> valid
        [InlineData("0123456789123")]     // 13 digits -> valid
        public async Task EdgeCase4_CreateOrder_WithValidTaxCode_ValidatorPasses(string validTax)
        {
            var validator = new CreateOrderCommandValidator();
            var command = new CreateOrderCommand
            {
                ShippingAddress = "123 Pham Van Dong, Hanoi",
                Phone = "0987654321",
                Email = "tax-test@shopviet.vn",
                ApplicationUserId = Guid.NewGuid(),
                RequireInvoice = true,
                TaxCode = validTax,
                CompanyName = "ShopViet Tech Corp",
                CompanyAddress = "Hanoi, Vietnam",
                OrderItems = new List<CreateOrderItemDto>
                {
                    new() { ProductId = Guid.NewGuid(), Quantity = 1 }
                }
            };

            var result = await validator.ValidateAsync(command);
            result.IsValid.Should().BeTrue();
        }

        [Fact]
        public async Task EdgeCase4_UploadInvoicePdf_WithInvalidTaxCode_ValidatorFails()
        {
            var validator = new UploadOrderInvoicePdfCommandValidator();
            var command = new UploadOrderInvoicePdfCommand
            {
                OrderId = Guid.NewGuid(),
                TaxCode = "999ABC" // Invalid
            };

            var result = await validator.ValidateAsync(command);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.ErrorMessage.Contains("Mã số thuế không đúng định dạng"));
        }
    }
}

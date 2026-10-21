using System;
using Ecommerce.Application.Features.Showrooms.Dto;
using FluentAssertions;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Showrooms
{
    public class ShowroomDtoTests
    {
        [Fact]
        public void ShowroomStockDto_InStock_ReportsCorrectQuantityAndStatus()
        {
            // Arrange
            var stock = new ShowroomStockDto
            {
                ShowroomId = Guid.NewGuid(),
                Code = "SR-HN-01",
                Name = "ShopViet Flagship Thái Hà",
                Address = "12 Thái Hà, Trung Liệt, Đống Đa, Hà Nội",
                Quantity = 15
            };

            // Assert
            stock.Quantity.Should().Be(15);
            stock.StockQuantity.Should().Be(15);
            stock.IsAvailable.Should().BeTrue();
            stock.Code.Should().Be("SR-HN-01");
            stock.Name.Should().Be("ShopViet Flagship Thái Hà");
        }

        [Fact]
        public void ShowroomStockDto_OutOfStock_ReportsUnavailable()
        {
            // Arrange
            var stock = new ShowroomStockDto
            {
                ShowroomId = Guid.NewGuid(),
                Code = "SR-HCM-01",
                Name = "ShopViet Flagship Nguyễn Trãi",
                Address = "136 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
                Quantity = 0
            };

            // Assert
            stock.Quantity.Should().Be(0);
            stock.StockQuantity.Should().Be(0);
            stock.IsAvailable.Should().BeFalse();
        }
    }
}

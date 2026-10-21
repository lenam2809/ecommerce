using System;
using System.Collections.Generic;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Application.Features.Products.Helpers;
using Ecommerce.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Products
{
    public class ProductSpecsAndComparisonTests
    {
        [Fact]
        public void ExtractKeySpecs_WithExplicitKeySpecs_ReturnsTopHighlightedChips()
        {
            // Arrange
            var specs = new List<ProductSpecification>
            {
                new() { Name = "Vi xử lý", Value = "Apple M3 Pro 12-core", IsKeySpec = true, DisplayOrder = 1 },
                new() { Name = "RAM", Value = "36GB Unified", IsKeySpec = true, DisplayOrder = 2 },
                new() { Name = "Ổ cứng", Value = "1TB SSD", IsKeySpec = false, DisplayOrder = 3 }
            };

            // Act
            var chips = ProductSpecHelper.ExtractKeySpecs(specs, "MacBook Pro 14 M3 Pro");

            // Assert
            chips.Should().HaveCount(2);
            chips[0].Should().Be("Apple M3 Pro 12-core");
            chips[1].Should().Be("36GB Unified");
        }

        [Fact]
        public void ExtractKeySpecs_WithoutKeySpecFlag_FallsBackToRegexExtraction()
        {
            // Arrange - No specs provided, regex from product name
            var specs = new List<ProductSpecification>();

            // Act
            var chips = ProductSpecHelper.ExtractKeySpecs(specs, "iPhone 15 Pro Max 256GB Titan Tự Nhiên");

            // Assert
            chips.Should().NotBeEmpty();
            chips.Should().Contain(c => c.Contains("256GB"));
            chips.Should().Contain(c => c.Contains("Bảo hành 24T"));
        }

        [Fact]
        public void ExtractKeySpecs_WithEmptySpecsAndNoRegex_ReturnsFallbackChips()
        {
            // Act
            var chips = ProductSpecHelper.ExtractKeySpecs(new List<ProductSpecification>(), "Chuột không dây Logitech", "Phụ kiện");

            // Assert
            chips.Should().NotBeEmpty();
            chips.Should().Contain("Phụ kiện");
            chips.Should().Contain("Bảo hành 24T chính hãng");
        }

        [Fact]
        public void ProductComparisonDto_MatrixStructure_MapsRowsAndValuesCorrectly()
        {
            // Arrange
            var prodId1 = Guid.NewGuid();
            var prodId2 = Guid.NewGuid();

            var matrix = new ProductComparisonDto
            {
                Products = new List<ProductDto>
                {
                    new()
                    {
                        Id = prodId1,
                        Code = "IPHONE15",
                        Name = "iPhone 15 Pro Max",
                        Sku = "IP15-256",
                        CategoryName = "Điện thoại",
                        CategorySlug = "dien-thoai",
                        KeySpecs = new List<string> { "Apple A17 Pro", "256GB" }
                    },
                    new()
                    {
                        Id = prodId2,
                        Code = "S24ULTRA",
                        Name = "Samsung Galaxy S24 Ultra",
                        Sku = "S24U-256",
                        CategoryName = "Điện thoại",
                        CategorySlug = "dien-thoai",
                        KeySpecs = new List<string> { "Snapdragon 8 Gen 3", "256GB" }
                    }
                },
                SpecGroups = new List<ComparisonSpecGroupDto>
                {
                    new()
                    {
                        GroupName = "Hiệu năng",
                        Specs = new List<ComparisonSpecRowDto>
                        {
                            new()
                            {
                                Name = "Vi xử lý",
                                Values = new Dictionary<string, string>
                                {
                                    { prodId1.ToString(), "Apple A17 Pro 3nm" },
                                    { "IPHONE15", "Apple A17 Pro 3nm" },
                                    { prodId2.ToString(), "Snapdragon 8 Gen 3 for Galaxy" },
                                    { "S24ULTRA", "Snapdragon 8 Gen 3 for Galaxy" }
                                }
                            }
                        }
                    }
                }
            };

            // Assert
            matrix.Products.Should().HaveCount(2);
            matrix.SpecGroups.Should().HaveCount(1);
            matrix.SpecGroups[0].Specs.Should().HaveCount(1);

            var row = matrix.SpecGroups[0].Specs[0];
            row.Name.Should().Be("Vi xử lý");
            row.Values[prodId1.ToString()].Should().Be("Apple A17 Pro 3nm");
            row.Values["IPHONE15"].Should().Be("Apple A17 Pro 3nm");
            row.Values[prodId2.ToString()].Should().Be("Snapdragon 8 Gen 3 for Galaxy");
            row.Values["S24ULTRA"].Should().Be("Snapdragon 8 Gen 3 for Galaxy");
        }
    }
}

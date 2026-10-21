using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Ecommerce.Domain.Tests.Entities;

public class TechEcommerceSpecsAndShowrooms2026Tests
{
    [Fact]
    public void ProductSpecification_SpecKeyAndSpecValue_AliasesSyncWithNativeProperties()
    {
        // Arrange & Act
        var spec = new ProductSpecification
        {
            SpecKey = "RAM",
            SpecValue = "36GB Unified Memory",
            GroupName = "Hiệu năng",
            IsKeySpec = true,
            DisplayOrder = 1,
            FilterKey = "ram"
        };

        // Assert
        spec.Name.Should().Be("RAM");
        spec.Value.Should().Be("36GB Unified Memory");
        spec.SpecKey.Should().Be("RAM");
        spec.SpecValue.Should().Be("36GB Unified Memory");
        spec.GroupName.Should().Be("Hiệu năng");
        spec.IsKeySpec.Should().BeTrue();
        spec.DisplayOrder.Should().Be(1);
        spec.FilterKey.Should().Be("ram");

        // Reverse sync
        spec.Name = "SSD";
        spec.Value = "1TB PCIe NVMe";
        spec.SpecKey.Should().Be("SSD");
        spec.SpecValue.Should().Be("1TB PCIe NVMe");
    }

    [Fact]
    public void ProductAddOn_DefaultsAndCustomProperties_SetProperly()
    {
        // Arrange & Act
        var addOn = new ProductAddOn
        {
            Code = "APPLECARE_MBP14",
            Name = "AppleCare+ 3 năm chính hãng Apple",
            Price = 2490000m,
            DurationMonths = 36
        };

        // Assert
        addOn.Code.Should().Be("APPLECARE_MBP14");
        addOn.Name.Should().Be("AppleCare+ 3 năm chính hãng Apple");
        addOn.Price.Should().Be(2490000m);
        addOn.DurationMonths.Should().Be(36);
        addOn.IsActive.Should().BeTrue();
        addOn.DisplayOrder.Should().Be(0);
        addOn.AddOnType.Should().Be("ExtendedWarranty");
    }

    [Fact]
    public void Showroom_ProvinceAndCity_SynchronizeTwoWays()
    {
        // 1. Setting City propagates to Province when Province is empty
        var showroom1 = new Showroom
        {
            City = "TP. Hồ Chí Minh"
        };
        showroom1.Province.Should().Be("TP. Hồ Chí Minh");
        showroom1.City.Should().Be("TP. Hồ Chí Minh");

        // 2. Setting Province propagates to City when City is empty
        var showroom2 = new Showroom
        {
            Province = "Hà Nội"
        };
        showroom2.City.Should().Be("Hà Nội");
        showroom2.Province.Should().Be("Hà Nội");

        // 3. Defaults check
        showroom1.Phone.Should().Be("1800 6868");
        showroom1.OpeningHours.Should().Be("08:00 - 21:30");
        showroom1.HasInstantPickup.Should().BeTrue();
        showroom1.IsActive.Should().BeTrue();
    }

    [Fact]
    public void ShowroomInventory_QuantityAndStockQuantity_AliasesSyncProperly()
    {
        // Arrange
        var showroomId = Guid.NewGuid();
        var productId = Guid.NewGuid();

        // Act
        var inventory = new ShowroomInventory
        {
            ShowroomId = showroomId,
            ProductId = productId,
            Quantity = 45,
            ReservedQuantity = 3,
            IsAvailableFor2hDelivery = true
        };

        // Assert
        inventory.ShowroomId.Should().Be(showroomId);
        inventory.ProductId.Should().Be(productId);
        inventory.Quantity.Should().Be(45);
        inventory.StockQuantity.Should().Be(45);
        inventory.ReservedQuantity.Should().Be(3);
        inventory.IsAvailableFor2hDelivery.Should().BeTrue();

        // Reverse assignment
        inventory.StockQuantity = 100;
        inventory.Quantity.Should().Be(100);
    }

    [Fact]
    public void Order_O2OFieldsAndInvoiceDelegation_FunctionCorrectly()
    {
        // Arrange
        var pickupId = Guid.NewGuid();
        var order = new Order
        {
            DeliveryType = EDeliveryType.ShowroomPickup,
            PickupShowroomId = pickupId,
            DepositRequired = 5000000m,
            DepositStatus = EDepositStatus.Pending,
            RequireInvoice = true,
            TaxCode = "0312345678",
            CompanyName = "ShopViet Tech Corp",
            CompanyAddress = "123 Le Loi, Q.1, TP.HCM",
            InvoiceEmail = "accounting@shopviet.vn"
        };

        // Assert
        order.DeliveryType.Should().Be(EDeliveryType.ShowroomPickup);
        order.PickupShowroomId.Should().Be(pickupId);
        order.ShowroomId.Should().Be(pickupId); // synced if showroomId wasn't set
        order.DepositRequired.Should().Be(5000000m);
        order.DepositStatus.Should().Be(EDepositStatus.Pending);

        // Invoice properties delegation check
        order.RequireInvoice.Should().BeTrue();
        order.Invoice.RequireInvoice.Should().BeTrue();
        order.TaxCode.Should().Be("0312345678");
        order.Invoice.TaxCode.Should().Be("0312345678");
        order.CompanyName.Should().Be("ShopViet Tech Corp");
        order.Invoice.CompanyName.Should().Be("ShopViet Tech Corp");
        order.CompanyAddress.Should().Be("123 Le Loi, Q.1, TP.HCM");
        order.Invoice.CompanyAddress.Should().Be("123 Le Loi, Q.1, TP.HCM");
        order.InvoiceEmail.Should().Be("accounting@shopviet.vn");
        order.Invoice.InvoiceEmail.Should().Be("accounting@shopviet.vn");
    }

    [Fact]
    public void OrderItemSerial_WarrantyDefaultsAndProperties_SetProperly()
    {
        // Arrange & Act
        var serial = new OrderItemSerial
        {
            OrderItemId = Guid.NewGuid(),
            SerialNumber = "UG20261019-A01",
            Imei = "358912345678901",
            WarrantyExpiresAt = DateTime.UtcNow.AddYears(2)
        };

        // Assert
        serial.SerialNumber.Should().Be("UG20261019-A01");
        serial.Imei.Should().Be("358912345678901");
        serial.WarrantyMonths.Should().Be(24);
        serial.WarrantyStatus.Should().Be("Active");
        serial.WarrantyExpiresAt.Should().NotBeNull();
    }

    [Fact]
    public void ReturnRequestLog_StepAndAliases_SyncProperly()
    {
        // Arrange & Act
        var log = new ReturnRequestLog
        {
            ReturnRequestId = Guid.NewGuid(),
            Step = 3,
            Action = "TechnicianInspection",
            Title = "Kỹ thuật viên thẩm định",
            TechnicianNote = "Lỗi phần cứng màn hình, đủ điều kiện đổi mới 15 phút",
            Author = "Trần Quốc Bảo (Showroom Q.1)"
        };

        // Assert
        log.Step.Should().Be(3);
        log.Note.Should().Be("Lỗi phần cứng màn hình, đủ điều kiện đổi mới 15 phút");
        log.TechnicianNote.Should().Be("Lỗi phần cứng màn hình, đủ điều kiện đổi mới 15 phút");
        log.ActorName.Should().Be("Trần Quốc Bảo (Showroom Q.1)");
        log.Author.Should().Be("Trần Quốc Bảo (Showroom Q.1)");

        // Reverse assignment
        log.Note = "Đã xuất kho máy mới";
        log.TechnicianNote.Should().Be("Đã xuất kho máy mới");
        log.ActorName = "Nguyễn Văn A";
        log.Author.Should().Be("Nguyễn Văn A");
    }

    [Fact]
    public void FlashSaleItem_Aliases_SyncWithUnderlyingColumns()
    {
        // Arrange & Act
        var item = new FlashSaleItem
        {
            FlashSaleId = Guid.NewGuid(),
            ProductId = Guid.NewGuid(),
            FlashPrice = 49990000m,
            OriginalPrice = 59990000m,
            QuantityLimit = 50,
            SoldQuantity = 34,
            IsHeroFeatured = true,
            BadgeText = "-17%"
        };

        // Assert
        item.FlashSalePrice.Should().Be(49990000m);
        item.FlashPrice.Should().Be(49990000m);
        item.TotalQuota.Should().Be(50);
        item.QuantityLimit.Should().Be(50);
        item.SoldCount.Should().Be(34);
        item.SoldQuantity.Should().Be(34);
        item.IsHeroFeatured.Should().BeTrue();
        item.BadgeText.Should().Be("-17%");

        // Reverse assignment
        item.FlashSalePrice = 45000000m;
        item.FlashPrice.Should().Be(45000000m);
        item.TotalQuota = 100;
        item.QuantityLimit.Should().Be(100);
        item.SoldCount = 50;
        item.SoldQuantity.Should().Be(50);
    }

    [Fact]
    public void Order_InvoiceNull_SafelyHandlesGettersAndReinitializesOnSetters()
    {
        var order = new Order();
        // Force Invoice to null
        order.Invoice = null!;

        // Getters should not throw NRE and return defaults
        order.RequireInvoice.Should().BeFalse();
        order.TaxCode.Should().BeNull();
        order.CompanyName.Should().BeNull();
        order.CompanyAddress.Should().BeNull();
        order.InvoiceEmail.Should().BeNull();

        // Setter reinitializes Invoice object
        order.TaxCode = "0109998887";
        order.Invoice.Should().NotBeNull();
        order.Invoice.TaxCode.Should().Be("0109998887");
        order.TaxCode.Should().Be("0109998887");
    }

    [Fact]
    public void Showroom_ExplicitProvinceOverride_PreservesCityValue()
    {
        var showroom = new Showroom
        {
            City = "Đà Nẵng"
        };
        showroom.Province.Should().Be("Đà Nẵng");

        // Explicitly set a different Province value
        showroom.Province = "TP. Đà Nẵng";
        showroom.Province.Should().Be("TP. Đà Nẵng");
        showroom.City.Should().Be("Đà Nẵng");
    }

    [Fact]
    public void Order_PickupShowroomId_SyncsToShowroomIdWhenUnset()
    {
        var showroomGuid = Guid.NewGuid();
        var order = new Order();

        order.PickupShowroomId = showroomGuid;
        order.PickupShowroomId.Should().Be(showroomGuid);
        order.ShowroomId.Should().Be(showroomGuid);

        // Setting a different showroomId directly preserves pickupShowroomId
        var anotherGuid = Guid.NewGuid();
        order.ShowroomId = anotherGuid;
        order.ShowroomId.Should().Be(anotherGuid);
        order.PickupShowroomId.Should().Be(showroomGuid);
    }

    [Fact]
    public void Product_AddSpecification_WithGroupAndKeySpecParameters_CreatesCompleteSpecification()
    {
        var product = Product.Create(
            "TEST-SKU", "Test Laptop", "test-laptop", "SKU123", 
            20000000m, 18000000m, "img.jpg", "Description", 10, 
            Guid.NewGuid(), Guid.NewGuid());

        product.AddSpecification(
            name: "Vi xử lý (CPU)",
            value: "Apple M3 Pro 12-Core",
            groupName: "Hiệu năng",
            isKeySpec: true,
            displayOrder: 1,
            filterKey: "cpu",
            isHighlight: true);

        product.Specifications.Should().ContainSingle();
        var spec = product.Specifications.First();
        spec.Name.Should().Be("Vi xử lý (CPU)");
        spec.Value.Should().Be("Apple M3 Pro 12-Core");
        spec.SpecKey.Should().Be("Vi xử lý (CPU)");
        spec.SpecValue.Should().Be("Apple M3 Pro 12-Core");
        spec.GroupName.Should().Be("Hiệu năng");
        spec.IsKeySpec.Should().BeTrue();
        spec.DisplayOrder.Should().Be(1);
        spec.FilterKey.Should().Be("cpu");
        spec.IsHighlight.Should().BeTrue();
    }

    [Theory]
    [InlineData(1, "Tiếp nhận sản phẩm tại Showroom Flagship")]
    [InlineData(2, "Kỹ thuật viên kiểm tra phần cứng")]
    [InlineData(3, "Thẩm định lỗi và phê duyệt bảo hành")]
    [InlineData(4, "Xuất kho máy mới đổi trả 15 phút")]
    [InlineData(5, "Hoàn tất bàn giao và kích hoạt e-Warranty")]
    public void ReturnRequestLog_StepLifecycle1To5_LogsStepAndMetadata(int step, string title)
    {
        var log = new ReturnRequestLog
        {
            ReturnRequestId = Guid.NewGuid(),
            Step = step,
            Title = title,
            Action = $"Step_{step}",
            TechnicianNote = $"Ghi chú kỹ thuật bước {step}",
            Author = "Kỹ thuật viên ShopViet"
        };

        log.Step.Should().BeInRange(1, 5);
        log.Step.Should().Be(step);
        log.Title.Should().Be(title);
        log.TechnicianNote.Should().Be($"Ghi chú kỹ thuật bước {step}");
        log.Note.Should().Be($"Ghi chú kỹ thuật bước {step}");
        log.Author.Should().Be("Kỹ thuật viên ShopViet");
        log.ActorName.Should().Be("Kỹ thuật viên ShopViet");
        log.CreatedAt.Should().BeBefore(DateTime.UtcNow.AddSeconds(5));
        log.LoggedAt.Should().BeBefore(DateTime.UtcNow.AddSeconds(5));
    }

    [Fact]
    public void OrderItemSerial_Collection_CanAttachToOrderItem()
    {
        var orderItem = new OrderItem(
            orderId: Guid.NewGuid(),
            productId: Guid.NewGuid(),
            name: "iPhone 16 Pro Max",
            image: "iphone16.jpg",
            unitPrice: 34990000m,
            quantity: 2,
            color: "Titan Sa Mạc",
            size: "256GB");

        var serial1 = new OrderItemSerial
        {
            OrderItemId = orderItem.Id,
            SerialNumber = "IMEI-123456789012345",
            Imei = "123456789012345",
            WarrantyMonths = 24,
            WarrantyExpiresAt = DateTime.UtcNow.AddMonths(24),
            WarrantyStatus = "Active"
        };

        var serial2 = new OrderItemSerial
        {
            OrderItemId = orderItem.Id,
            SerialNumber = "IMEI-987654321098765",
            Imei = "987654321098765",
            WarrantyMonths = 24,
            WarrantyExpiresAt = DateTime.UtcNow.AddMonths(24),
            WarrantyStatus = "Active"
        };

        orderItem.OrderItemSerials.Add(serial1);
        orderItem.OrderItemSerials.Add(serial2);

        orderItem.OrderItemSerials.Should().HaveCount(2);
        orderItem.OrderItemSerials.Select(s => s.SerialNumber)
            .Should().Contain(new[] { "IMEI-123456789012345", "IMEI-987654321098765" });
    }
}


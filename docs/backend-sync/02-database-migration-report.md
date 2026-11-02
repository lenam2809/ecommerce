Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Báo Cáo Kỹ Thuật: Nâng Cấp Domain Entities, Value Objects & Thực Thi EF Core Migration (SSoT 2026)

- **Ngày thực hiện:** 21/10/2026
- **Vai trò:** Lead Backend Architect
- **Hệ thống mục tiêu:** Backend .NET 8 (Clean Architecture + DDD) & PostgreSQL 15 Container / SQLite
- **Tài liệu đặc tả:** [docs/backend-sync/01-backend-gap-and-schema-spec.md](file:///d:/2026/projects/ecommerce/docs/backend-sync/01-backend-gap-and-schema-spec.md)
- **Migration mới nhất:** `AddTechEcommerceSpecsAndShowrooms2026` (`20261021121358_AddTechEcommerceSpecsAndShowrooms2026`)

---

## 1. Tóm Tắt Kết Quả Triển Khai (Executive Summary)

Đã hoàn thành 100% các yêu cầu về nâng cấp tầng Domain và Database Context theo chuẩn Clean Architecture và Domain-Driven Design:

1. **Chuẩn hóa Enums & Value Objects:**
   - Tạo mới Enum [EDeliveryType](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Domain/Enums/EDeliveryType.cs) (`HomeDelivery = 1`, `ShowroomPickup = 2`).
   - Tạo mới Enum [EDepositStatus](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Domain/Enums/EDepositStatus.cs) (`None = 0`, `Pending = 1`, `Paid = 2`).
   - Tích hợp Value Object [OrderInvoice](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Domain/ValueObjects/OrderInvoice.cs) nhúng dạng Owned Type vào thực thể [Order](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Domain/Entities/Order.cs).

2. **Nâng cấp Domain Entities & Fluent API:**
   - **ProductSpecification:** Bổ sung `IsKeySpec` (bool), đánh B-Tree Index trên `IsKeySpec`, cung cấp alias properties `SpecKey` / `SpecValue` trỏ vào `Name` / `Value` để bảo toàn tương thích DTOs và seeds.
   - **ProductAddOn:** Quản lý đầy đủ các gói bảo hiểm mở rộng (AppleCare+, ShopViet Care 24T) với `Id`, `ProductId`, `Name`, `Price`, `DurationMonths`, `IsActive`.
   - **Showroom:** Bổ sung trường `Province` liên kết đồng bộ hai chiều với `City`, đánh B-Tree Index trên `Province`.
   - **ShowroomInventory:** Tái cấu trúc sang **khóa chính phức hợp** `(ShowroomId, ProductId)`, cột `Quantity`, `UpdatedAt`, cung cấp alias `StockQuantity` tương thích ngược. Áp dụng `DeleteBehavior.Restrict` bảo vệ quan hệ Showroom và Product.
   - **Order:** Mở rộng các trường `DeliveryType` (Enum `EDeliveryType`), `PickupShowroomId` (FK -> `Showrooms`, `DeleteBehavior.Restrict`), `DepositRequired` (decimal), `DepositStatus` (Enum `EDepositStatus`), đánh index trên `DeliveryType` và `PickupShowroomId`.
   - **OrderItemSerial:** Quản lý Serial/IMEI và bảo hành điện tử e-Warranty với B-Tree index trên `SerialNumber`, `Imei`, `DeleteBehavior.Restrict` trên `OrderItemId`.
   - **ReturnRequestLog:** Bổ sung cột `Step` (1..5), cung cấp alias `TechnicianNote` (trỏ `Note`) và `Author` (trỏ `ActorName`).
   - **FlashSale & FlashSaleItem:** Quản lý chiến dịch Flash Sale với các alias `FlashPrice`, `QuantityLimit`, `SoldQuantity`.

3. **Thực thi Migration & Chuỗi 6 Migrations Thực Tế:**
   Hệ thống sở hữu chuỗi 6 migrations EF Core lũy kế:
   1. `20260507115052_InitialCreate.cs`: Khởi tạo lược đồ DB cốt lõi.
   2. `20260516123045_AddReviewProductUserUniqueIndex.cs`: Unique index chống lặp review.
   3. `20260517012236_AddOutboxMessages.cs`: Bảng OutboxMessages cho sự kiện OrderCreatedEvent.
   4. `20261015140903_RefactorCartItemSurrogateKey.cs`: Khóa chính độc lập surrogate key cho CartItem.
   5. `20261020155436_AddTechEcommerceSchema2026.cs`: Lược đồ công nghệ SSoT 2026 ban đầu.
   6. `20261021121358_AddTechEcommerceSpecsAndShowrooms2026.cs`: Lược đồ hoàn chỉnh (Specs, Showrooms, Serials, RMA logs).
   - Lệnh thực thi: `dotnet ef database update --project Ecommerce.Infrastructure --startup-project Ecommerce.WebAPI`.
   - Áp dụng thành công vào cơ sở dữ liệu PostgreSQL `ecommerce_db` (Docker port 5432) không xung đột và không mất mát dữ liệu.

4. **Seeding Dữ liệu Chuẩn SSoT 2026:**
   - **45 Showroom công nghệ** toàn quốc được cập nhật đầy đủ `Province`, `City`, `District`, `Address`, hotline bán hàng `1800 6868`, mở cửa `08:00 - 21:30`.
   - **Thông số kỹ thuật thật (ProductSpecification)** cho 5 Flagship SKUs:
     - MacBook Pro 14 M3 Pro (14 thông số chi tiết chuẩn SSoT matrix)
     - iPhone 16 Pro Max
     - Keychron Q1 Pro
     - Anker Prime 100W GaN
     - Cáp Ugreen 240W
   - **50 bản ghi tồn kho O2O (ShowroomInventory)** cho các showroom flagship.

---

## 2. Chi Tiết Lược Đồ & Cấu Hình Fluent API

### 2.1. Bảng `ShowroomInventories` (Composite Primary Key)
```csharp
builder.ToTable("ShowroomInventories");
builder.HasKey(si => new { si.ShowroomId, si.ProductId });
builder.Property(si => si.Quantity).HasDefaultValue(0);
builder.Ignore(si => si.StockQuantity);
builder.Property(si => si.ReservedQuantity).HasDefaultValue(0);
builder.Property(si => si.IsAvailableFor2hDelivery).HasDefaultValue(true);

builder.HasOne(si => si.Showroom)
       .WithMany(s => s.Inventories)
       .HasForeignKey(si => si.ShowroomId)
       .OnDelete(DeleteBehavior.Restrict);

builder.HasOne(si => si.Product)
       .WithMany(p => p.ShowroomInventories)
       .HasForeignKey(si => si.ProductId)
       .OnDelete(DeleteBehavior.Restrict);
```

### 2.2. Bảng `Orders` (Phân hệ O2O & Đặt cọc)
```csharp
builder.Property(o => o.DeliveryType)
       .HasDefaultValue(EDeliveryType.HomeDelivery);

builder.Property(o => o.DepositRequired)
       .HasColumnType("decimal(18,2)")
       .HasDefaultValue(0);

builder.Property(o => o.DepositStatus)
       .HasDefaultValue(EDepositStatus.None);

builder.Property(o => o.PickupShowroomId)
       .IsRequired(false);

builder.HasOne(o => o.PickupShowroom)
       .WithMany()
       .HasForeignKey(o => o.PickupShowroomId)
       .OnDelete(DeleteBehavior.Restrict)
       .IsRequired(false);

builder.HasIndex(o => o.PickupShowroomId);
builder.HasIndex(o => o.DeliveryType);
```

### 2.3. Bảng `ProductSpecifications` (Tech Spec Chips)
```csharp
builder.Property(ps => ps.IsKeySpec)
       .HasDefaultValue(false);

builder.Ignore(ps => ps.SpecKey);
builder.Ignore(ps => ps.SpecValue);

builder.HasIndex(ps => ps.IsKeySpec);
```

### 2.4. Bảng `Showrooms`
```csharp
builder.Property(s => s.Province)
       .HasMaxLength(100);

builder.HasIndex(s => s.Province);
```

### 2.5. Bảng `ReturnRequestLogs`
```csharp
builder.Property(l => l.Step)
       .HasDefaultValue(1);

builder.Ignore(l => l.TechnicianNote);
builder.Ignore(l => l.Author);
```

---

## 3. Nhật Ký Migration & Database Update

### 3.1. Lệnh sinh Migration
```bash
dotnet ef migrations add AddTechEcommerceSpecsAndShowrooms2026 \
  --project apps/backend/Ecommerce/Ecommerce.Infrastructure \
  --startup-project apps/backend/Ecommerce/Ecommerce.WebAPI
```

**Thao tác thực hiện trong migration `20261021121358_AddTechEcommerceSpecsAndShowrooms2026`:**
- Drop old primary key `PK_ShowroomInventories (Id)` và drop old unique index `(ShowroomId, ProductId)`.
- Drop các cột surrogate: `Id`, `ConcurrencyToken`, `IsDeleted` từ `ShowroomInventories`.
- Rename `StockQuantity` -> `Quantity` trong `ShowroomInventories`.
- Add composite primary key `PK_ShowroomInventories` trên `("ShowroomId", "ProductId")`.
- Add column `Province` (`varchar(100)`) vào `Showrooms` kèm index `IX_Showrooms_Province`.
- Add column `Step` (`integer`, default 1) vào `ReturnRequestLogs`.
- Add column `IsKeySpec` (`boolean`, default false) vào `ProductSpecifications` kèm index `IX_ProductSpecifications_IsKeySpec`.
- Add columns `DeliveryType` (`integer`, default 1), `DepositRequired` (`numeric(18,2)`, default 0), `DepositStatus` (`integer`, default 0), `PickupShowroomId` (`uuid`, nullable) vào `Orders`.
- Add foreign key `FK_Orders_Showrooms_PickupShowroomId` với `DeleteBehavior.Restrict`.
- Add indexes `IX_Orders_DeliveryType` và `IX_Orders_PickupShowroomId`.

### 3.2. Lệnh cập nhật Database
```bash
dotnet ef database update \
  --project apps/backend/Ecommerce/Ecommerce.Infrastructure \
  --startup-project apps/backend/Ecommerce/Ecommerce.WebAPI
```
**Kết quả:**
```
Build started...
Build succeeded.
Applying migration '20261021121358_AddTechEcommerceSpecsAndShowrooms2026'.
Done.
```

---

## 4. Xác Minh Dữ Liệu Seeding Thực Tế (PostgreSQL Database Verification)

Đã kết nối trực tiếp vào database PostgreSQL `ecommerce_db` để kiểm tra toàn bộ 4 mục tiêu:

### 4.1. Mạng lưới 45 Showroom SSoT 2026
```sql
SELECT count(*) AS total_showrooms, 
       count(*) FILTER (WHERE "Province" IS NOT NULL AND "Province" <> '') AS total_with_province
FROM "Showrooms";
```
- **Kết quả:** `total_showrooms = 45`, `total_with_province = 45` (100% chi nhánh có đầy đủ thông tin Tỉnh/Thành phố).

### 4.2. Bộ Thông Số Kỹ Thuật Flagship SKUs (ProductSpecifications)
```sql
SELECT count(*) AS total_key_specs FROM "ProductSpecifications" WHERE "IsKeySpec" = true;
```
- **Kết quả:** `26` key spec chips được phân loại đúng nhóm và đánh dấu `IsKeySpec = true`:
  - **MacBook Pro 14 M3 Pro:** CPU Apple M3 Pro 12-Core, GPU 18-Core, 36GB Unified Memory, 1TB SSD 7.4GB/s, 14.2" Liquid Retina XDR 120Hz ProMotion, Pin 72.4Wh 18h sạc nhanh 96W.
  - **iPhone 16 Pro Max:** Super Retina XDR OLED 6.9" 120Hz, Apple A18 Pro 3nm, RAM 8GB, 256GB NVMe, Camera 48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto, Khung Titan Grade 5.
  - **Keychron Q1 Pro:** Layout 75% núm xoay, Full nhôm CNC 6063, Switch Keychron K Pro, QMK/VIA keymap, Bluetooth 5.1 & Type-C 1000Hz, Pin 4000mAh.
  - **Anker Prime 100W GaN:** GaNPrime 100W Max 3 cổng (2C + 1A), C1/C2 100W, ActiveShield 2.0.
  - **Cáp Ugreen 240W:** PD 3.1 240W 48V/5A, Chip E-Marker thông minh, Vỏ dù nylon chịu 10.000 uốn gập.

### 4.3. Tồn kho Showroom O2O (ShowroomInventories)
```sql
SELECT count(*) AS total_inventories FROM "ShowroomInventories";
```
- **Kết quả:** `50` bản ghi tồn kho khớp chuẩn khóa chính phức hợp `(ShowroomId, ProductId)`.

### 4.4. Kiểm tra Test Suites & Hardening
- `Ecommerce.Domain.Tests`: **75/75 passed (100%)**, bao gồm test suite mới [TechEcommerceSpecsAndShowrooms2026Tests.cs](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/tests/Ecommerce.Domain.Tests/Entities/TechEcommerceSpecsAndShowrooms2026Tests.cs) kiểm thử toàn diện:
  - Đồng bộ hai chiều `SpecKey`/`SpecValue` với `Name`/`Value` trên `ProductSpecification`.
  - Khởi tạo thông số kỹ thuật đa nhóm (`GroupName`, `IsKeySpec`, `DisplayOrder`, `FilterKey`) qua `Product.AddSpecification`.
  - Đồng bộ hai chiều `Province` và `City` trên `Showroom`, bảo toàn giá trị khi override `Province`.
  - Khóa chính phức hợp và alias `StockQuantity` trên `ShowroomInventory`.
  - Delegation và null-safety của Value Object `OrderInvoice` trên `Order` (`RequireInvoice`, `TaxCode`, `CompanyName`, `CompanyAddress`, `InvoiceEmail`).
  - Đồng bộ `PickupShowroomId` và `ShowroomId` trên `Order`.
  - Gắn và quản lý tập hợp `OrderItemSerial` e-Warranty trên `OrderItem`.
  - Chu trình nhật ký đổi trả 5 bước (`ReturnRequestLog.Step` 1..5) cùng metadata `TechnicianNote`, `Author`, và `CreatedAt` đồng bộ chuẩn UTC.
  - Aliases `FlashPrice`, `QuantityLimit`, `SoldQuantity` trên `FlashSaleItem`.
- `Ecommerce.Application.Tests`: **206/206 passed (100%)**:
  - Đồng bộ `ProductSpecificationDto` cho các luồng CQRS `CreateProductCommand` và `UpdateProductCommand`.
  - Khớp chuẩn M11 anti-enumeration cho `LoginUserCommandHandlerTests`.
  - Khớp trường bắt buộc `RefreshToken` cho `RefreshTokenCommandValidator` scenario test.
- `dotnet ef migrations has-pending-model-changes`: **0 changes / 0 warnings**.

---

## 5. Kết Luận
Tầng Domain và Database Context của hệ thống Backend .NET 8 đã được nâng cấp toàn diện, migration đã thực thi thành công, cơ sở dữ liệu đã đồng bộ 100% với đặc tả kỹ thuật SSoT 2026 và toàn bộ domain entity mới đã được bảo vệ bởi test suite tự động (75 domain tests + 206 application tests).

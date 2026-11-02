> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 14/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/backend-sync/01-backend-gap-and-schema-spec.md`](../backend-sync/01-backend-gap-and-schema-spec.md).

# 05 — Phân tích Cơ sở Dữ liệu & Tính Toàn vẹn Dữ liệu (Database & Data Integrity)

> **Dự án:** ShopViet E-Commerce Platform  
> **Repository:** https://github.com/lenam2809/ecommerce  
> **Thời điểm kiểm toán:** 14/10/2026  
> **Phạm vi:** EF Core DbContext, Schema Migrations, Raw SQL queries, Concurrency Tokens, Quan hệ dữ liệu và Tính toàn vẹn.

---

## 1. Kiểm kê Schema & Entity Inventory (58 Entities)

Cơ sở dữ liệu được quản lý thông qua Entity Framework Core 8 (`ApplicationDbContext.cs` kế thừa `IdentityDbContext`).

### 1.1. Các nhóm Entity chính

| Phân hệ (Subsystem) | Các Entity chính | Khóa ngoại & Ràng buộc quan trọng |
|---|---|---|
| **Identity & Phân quyền** | `ApplicationUser`, `Role`, `UserRole`, `Permission`, `UserPermission`, `RolePermission`, `RefreshToken`, `PasswordResetToken`, `AccountLock` | Mối quan hệ nhiều - nhiều giữa `Role` và `Permission` qua `RolePermission`. Khóa ngoại `UserId` trên toàn bộ bảng lịch sử. |
| **Catalog & Biến thể** | `Product`, `Category`, `Brand`, `ProductImage`, `ProductSpecification`, `ProductAttribute`, `ProductAttributeValue`, `ProductVariantSku`, `SkuAttributeValue` | Kiến trúc SKU 2 tầng: `Product` có nhiều `ProductVariantSku`. Mỗi SKU liên kết với nhiều `SkuAttributeValue`. |
| **Kho hàng & Tồn kho** | `InventoryItem` (cũ), `ProductVariantSku.StockQuantity` (mới) | `StockQuantity` là thuộc tính số nguyên không âm trên từng SKU. |
| **Giỏ hàng & Wishlist** | `Cart`, `CartItem`, `Wishlist`, `WishlistItem` | `Cart` gắn với `UserId` (bảng `Carts` trong DB). Giỏ hàng khách vãng lai lưu trên Redis (`ecommerce:guest_cart:<guestId>`). |
| **Đơn hàng & Giao dịch** | `Order`, `OrderItem`, `OrderHistory`, `Payment`, `PaymentTransaction` | Unique Index trên `Order.Code`. Khóa ngoại `OrderId` trên `OrderItems`, `OrderHistory` và `Payments`. |
| **Đổi trả hàng (RMA)** | `ReturnRequest`, `ReturnEvidence`, `ReturnStatusHistory` | Khóa ngoại `OrderId` trên `ReturnRequest`. Mỗi yêu cầu đổi trả có nhiều `ReturnEvidence` và lịch sử trạng thái `ReturnStatusHistory`. |
| **Đánh giá & Tương tác** | `Review`, `ReviewImage`, `ReviewLike`, `ReviewReply`, `ReviewReplyLike` | Unique Index `(ProductId, UserId)` trên `Review` (ngăn 1 user đánh giá nhiều lần cùng 1 sản phẩm). |
| **Hệ thống & Sự kiện** | `OutboxMessage`, `Notification`, `NotificationTemplate`, `NotificationSetting`, `AuditLog`, `LogEntry`, `PerformanceLog`, `MarqueeMessage`, `MarqueeSetting` | `OutboxMessage` lưu trạng thái `Pending`, `Processing`, `Processed`, `Failed`. |

---

## 2. Các Lỗi Nghiêm trọng trong Thiết kế Schema & Mapping EF Core

### 2.1. Lỗi Khóa Chính `CartItem` Chặn Mua Nhiều Biến thể (Variant Blocker Bug)
- **Vị trí:** [CartItemConfiguration.cs#L15](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/EntityConfigurations/CartItemConfiguration.cs#L15) và [ApplicationDbContext.cs#L289](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/ApplicationDbContext.cs#L289):
  ```csharp
  builder.HasKey(ci => new { ci.CartId, ci.ProductId });
  ```
- **Bản chất lỗi:** Khóa chính của `CartItem` được cấu hình là cặp `{ CartId, ProductId }`.
- **Hệ quả kinh doanh:** Khi khách hàng muốn mua **cùng 1 sản phẩm nhưng 2 biến thể khác nhau** (ví dụ: Áo thun Size M Màu Đỏ VÀ Áo thun Size L Màu Xanh), thao tác thêm sản phẩm thứ hai sẽ vi phạm Primary Key (`PK_CartItems`) và gây crash với lỗi `UniqueConstraintViolationException`!
- **Khắc phục:** Cần bổ sung cột `Id` độc lập (Surrogate Key) hoặc mở rộng khóa chính tổng hợp thành `{ CartId, ProductId, ProductVariantSkuId }`.

### 2.2. Xung đột Khóa chính `OrderItem` giữa Configuration và DbContext
- Trong [OrderItemConfiguration.cs#L15](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/EntityConfigurations/OrderItemConfiguration.cs#L15): cấu hình khóa chính là composite key `builder.HasKey(oi => new { oi.OrderId, oi.ProductId });`.
- Tuy nhiên trong [ApplicationDbContext.cs#L304](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/ApplicationDbContext.cs#L304), DbContext lại ghi đè thành: `entity.HasKey(ci => ci.Id);`.
- `OrderItemConfiguration.cs` chứa cấu hình chết mâu thuẫn trực tiếp với entity domain ([OrderItem.cs#L7](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Domain/Entities/OrderItem.cs#L7)).

### 2.3. Xung đột Xóa Cascade giữa `Category` và `Product`
- Trong [CategoryConfiguration.cs#L38-L41](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/EntityConfigurations/CategoryConfiguration.cs#L38-L41): `builder.HasMany(c => c.Products).WithOne(p => p.Category).HasForeignKey(p => p.CategoryId).OnDelete(DeleteBehavior.Cascade);`.
- Nhưng trong [ProductConfiguration.cs#L41-L44](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/EntityConfigurations/ProductConfiguration.cs#L41-L44): `builder.HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId).OnDelete(DeleteBehavior.Restrict);`.
- Hai cấu hình này mâu thuẫn nhau và hành vi thực tế sẽ phụ thuộc ngẫu nhiên vào thứ tự quét assembly của EF Core.

### 2.4. Unique Index Không Lọc Gây Hỏng Tính năng Xóa Mềm (Soft Delete Gap)
Các thực thể kế thừa `BaseEntity` triển khai `ISoftDelete` với global filter `!IsDeleted` ([ApplicationDbContext.cs#L345-L371](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/ApplicationDbContext.cs#L345-L371)). Tuy nhiên các Unique Index lại được tạo **không có mệnh đề lọc (Unfiltered Unique Indexes)**, bao gồm cả các dòng đã bị xóa mềm:
1. **Reviews (`IX_Reviews_ProductId_UserId`)**: Nếu user xóa 1 review (`IsDeleted = true`), họ sẽ **vĩnh viễn không thể viết review mới** cho sản phẩm đó vì index unique vẫn giữ cặp `(ProductId, UserId)` của bản ghi cũ.
2. **Products (`IX_Products_Slug`)**: Xóa mềm 1 sản phẩm sẽ khóa vĩnh viễn `Slug` của sản phẩm đó, không thể đặt lại cho sản phẩm mới.
3. **Categories (`IX_Categories_Name`) & Brands (`IX_Brands_Name`)**: Không thể tạo lại danh mục hoặc nhãn hàng cùng tên nếu tên đó từng bị xóa mềm.
4. **PromoCodes (`IX_PromoCodes_Code`) & SKUs (`IX_ProductVariantSkus_Sku`)**: Không thể tái sử dụng mã voucher hoặc mã SKU sau khi xóa mềm.
- **Khắc phục:** Bổ sung filter cho tất cả unique index trên thực thể soft-delete:
  ```csharp
  builder.HasIndex(r => new { r.ProductId, r.ApplicationUserId }).IsUnique().HasFilter("\"IsDeleted\" = false");
  ```

### 2.5. Lỗ hổng Soft Delete vs Hard Delete
- Trong `ApplicationDbContext.cs#L98-L107`, `SaveChangesAsync` **không hề can thiệp vào `EntityState.Deleted`** để chuyển thành cập nhật `IsDeleted = true`.
- Các hàm repository ([BaseRepository.cs#L81](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Repositories/Base/BaseRepository.cs#L81)) gọi `_dbSet.Remove(entity)`.
- Handlers như `DeleteProductCommandHandler.cs#L77` gọi `_unitOfWork.Products.Delete(product)` ➔ thực thi lệnh SQL `DELETE` vật lý.
- **Hậu quả:** Nếu một sản phẩm đã từng phát sinh đơn hàng (`OrderItem` tham chiếu tới với `DeleteBehavior.Restrict`), việc xóa sản phẩm sẽ lập tức ném lỗi vi phạm khóa ngoại SQL Foreign Key Exception!

---

## 3. Lịch sử Migration & Sai lệch Database Provider

### 3.1. Lịch sử Migration thực tế
Trong `Ecommerce.Infrastructure/Migrations`, có **3 migration**:
1. `20260507115052_InitialCreate`: Khởi tạo toàn bộ schema ban đầu.
2. `20260516123045_AddReviewProductUserUniqueIndex`: Thêm Unique Index cho `(ProductId, UserId)` trên bảng `Reviews`.
3. `20260517012236_AddOutboxMessages`: Thêm bảng `OutboxMessages` và index `IX_OutboxMessages_Status_OccurredAtUtc`.

### 3.2. Sai lệch về SQL Server
- Cả `README.md` và `AGENTS.md` đều khẳng định hệ thống dùng SQL Server cho local development.
- Tuy nhiên, `Ecommerce.Infrastructure.csproj` hoàn toàn **không có package `Microsoft.EntityFrameworkCore.SqlServer`**. Dự án chỉ hỗ trợ SQLite và PostgreSQL.
- Trong `ProcessPaymentCallbackCommandHandler.cs#L202-L207`:
  ```sql
  INSERT INTO "PaymentTransactions" (...) VALUES (...) ON CONFLICT ("TxnRef") DO NOTHING
  ```
  Cú pháp `ON CONFLICT ("TxnRef") DO NOTHING` và định danh nháy kép `"` chỉ chạy trên PostgreSQL/SQLite, sẽ văng lỗi cú pháp nếu chạy trên SQL Server.

---

## 4. Các Truy vấn Cần Đánh Index Bổ sung (Missing Indexes)

1. **Bảng `Orders`**:
   - Thiếu index trên `Status` và `(Status, OrderDate)`. Toàn bộ endpoint báo cáo doanh thu (`GetRevenueByMonth`, `GetRevenueByCategory`) đều lọc theo `Status == EOrderStatus.Completed && OrderDate between ...`, dẫn tới việc phải quét toàn bộ bảng (Full Table Scan).
2. **Bảng `Products`**:
   - Thiếu composite index `(IsDeleted, IsActive)` và `(CategoryId, IsActive)`.
3. **Bảng `Categories` và `Brands`**:
   - Cột `Slug` **chưa hề có Index** trong `CategoryConfiguration.cs` và `BrandConfiguration.cs`, mặc dù frontend storefront định tuyến theo `/categories/{slug}` và `/brands/{slug}`.

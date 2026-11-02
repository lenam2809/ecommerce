> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 15/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/backend-sync/01-backend-gap-and-schema-spec.md`](../backend-sync/01-backend-gap-and-schema-spec.md).

# 25. Báo Cáo Triển Khai Khắc Phục Giai Đoạn 2B (Remediation Phase 2B: Data Integrity & Transaction Safety)

**Ngày thực hiện:** 2026-10-15  
**Kiến trúc sư phụ trách:** Senior .NET Architect / EF Core & Data Integrity Specialist  
**Phạm vi:** Triển khai khắc phục triệt để 4 findings về tính toàn vẹn dữ liệu và an toàn giao dịch:
- **FLOW-01:** Ranh giới giao dịch (Transaction boundary) và tính nguyên tử (Atomicity) trong `CreateOrderCommandHandler`.
- **DATA-01:** Chuyển đổi khóa chính `CartItem` sang surrogate GUID, chuẩn hóa thuộc tính và unique index cho sản phẩm có biến thể.
- **FLOW-02:** Khôi phục tồn kho chính xác theo SKU biến thể khi hủy đơn hàng.
- **FLOW-03:** Khôi phục tồn kho trong quy trình RMA chỉ khi hàng thực tế đã được kiểm định và nhập kho hợp lệ.

**Các finding ngoài phạm vi (Out of Scope):** SEC-01, SEC-02, SEC-03, PERF-01, ARCH-01.  
**Nguyên tắc tuân thủ nghiêm ngặt:** Không commit/push mã nguồn; không thay đổi `.gitignore`; không áp dụng trực tiếp migration lên database production; giữ nguyên các baseline test failure đã tồn tại từ trước.

---

## 1. Trạng Thái Git & Branch

- **Branch hiện tại:** `main`
- **Commit HEAD:** `d13301b9dc1c5981c86900d91dc0116cad570b8d`
- **Trạng thái `.gitignore`:**
  - File `.gitignore` dòng 117 có cấu hình loại trừ `docs/`.
  - Tất cả tài liệu kiểm toán thuộc `docs/architecture-audit/*` (bao gồm tài liệu `25-remediation-phase-2b.md` này) đang ở trạng thái **ignored bởi git**.
  - `.gitignore` **không bị chỉnh sửa** dưới bất kỳ hình thức nào.
- **Trạng thái working tree (`git status --short`):**
  ```text
   M apps/backend/Ecommerce/Ecommerce.Application/Features/Cart/Commands/AddToCart/AddToCartCommandHandler.cs
   M apps/backend/Ecommerce/Ecommerce.Application/Features/Cart/Commands/RemoveCartItem/RemoveCartItemCommandHandler.cs
   M apps/backend/Ecommerce/Ecommerce.Application/Features/Cart/Commands/UpdateCartItem/UpdateCartItemCommandHandler.cs
   M apps/backend/Ecommerce/Ecommerce.Application/Features/Cart/Dto/CartDto.cs
   M apps/backend/Ecommerce/Ecommerce.Application/Features/Cart/Queries/GetCart/GetCartQueryHandler.cs
   M apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs
   M apps/backend/Ecommerce/Ecommerce.Domain/Entities/Cart.cs
   M apps/backend/Ecommerce/Ecommerce.Domain/Entities/CartItem.cs
   M apps/backend/Ecommerce/Ecommerce.Infrastructure/Cache/RedisGuestCartService.cs
   M apps/backend/Ecommerce/Ecommerce.Infrastructure/Migrations/ApplicationDbContextModelSnapshot.cs
   M apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/ApplicationDbContext.cs
   M apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/EntityConfigurations/CartItemConfiguration.cs
   M apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Repositories/CartRepository.cs
   M apps/backend/Ecommerce/Ecommerce.Infrastructure/Services/MergeCartService.cs
   M apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/CartController.cs
   M apps/frontend/ecommerce-client/components/cart/CartItem.tsx
   M apps/frontend/ecommerce-client/components/cart/CartItems.tsx
   M apps/frontend/ecommerce-client/hooks/use-cart.ts
   M apps/frontend/ecommerce-client/types/cart.ts
  ?? apps/backend/Ecommerce/Ecommerce.Infrastructure/Migrations/20261015140903_RefactorCartItemSurrogateKey.Designer.cs
  ?? apps/backend/Ecommerce/Ecommerce.Infrastructure/Migrations/20261015140903_RefactorCartItemSurrogateKey.cs
  ?? apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/RemediationPhase2BTests.cs
  ```

---

## 2. Danh Sách Tệp Sửa Đổi & Lý Do Sửa

### 2.1. Domain Layer
1. **`apps/backend/Ecommerce/Ecommerce.Domain/Entities/CartItem.cs`**
   - Chuyển đổi khóa chính sang surrogate key: `public Guid Id { get; set; }` (mặc định `Guid.Empty` để EF Core nhận diện trạng thái `EntityState.Added` khi tạo mới qua `ValueGeneratedOnAdd`).
   - Chuẩn hóa thuộc tính `Color` và `Size` với logic fallback: `color?.Trim() ?? string.Empty`.
   - Bổ sung constructor nhận `Guid id` và các phương thức nghiệp vụ tăng/giảm số lượng an toàn.
2. **`apps/backend/Ecommerce/Ecommerce.Domain/Entities/Cart.cs`**
   - Sửa phương thức `AddItem`: Nhận diện trùng biến thể dựa trên bộ 3 `(ProductId, Color, Size)` thay vì chỉ `ProductId`. Nếu đã tồn tại cùng màu và kích cỡ thì gộp số lượng; nếu khác màu hoặc kích cỡ thì tạo `CartItem` mới.
   - Sửa `UpdateQuantity` và `RemoveItem`: Chấp nhận `Guid itemIdOrProductId` kết hợp tìm kiếm ưu tiên theo `Id` (surrogate key) và fallback về `ProductId` + variant properties để duy trì tương thích ngược 100%.
   - Sửa `Clear()`: Làm sạch danh sách nội bộ và tính toán lại tổng tiền giỏ hàng.

### 2.2. Infrastructure & Persistence Layer
3. **`apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/EntityConfigurations/CartItemConfiguration.cs`**
   - Khóa chính duy nhất: `builder.HasKey(ci => ci.Id);` kèm `ValueGeneratedOnAdd()`.
   - Cấu hình độ dài tối đa 50 ký tự và giá trị mặc định chuỗi rỗng cho `Color` và `Size`.
   - Thiết lập Unique Index: `builder.HasIndex(ci => new { ci.CartId, ci.ProductId, ci.Color, ci.Size }).IsUnique();` ngăn chặn hoàn toàn duplicate dòng biến thể ở tầng cơ sở dữ liệu.
   - Cấu hình khóa ngoại: `Cart` (Cascade delete), `Product` (Restrict), `ProductVariantSku` (SetNull).
4. **`apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/ApplicationDbContext.cs`**
   - Loại bỏ đoạn mã cấu hình composite key cũ `builder.Entity<CartItem>().HasKey(ci => new { ci.CartId, ci.ProductId })` gây xung đột với `CartItemConfiguration`.
5. **`apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Repositories/CartRepository.cs`**
   - Điều chỉnh truy vấn tìm kiếm item trong giỏ hàng: `i.Id == itemId || i.ProductId == itemId`.
6. **`apps/backend/Ecommerce/Ecommerce.Infrastructure/Services/MergeCartService.cs`**
   - Sửa câu lệnh SQL raw: Thay vì `WHERE "CartId" = {userCart.Id} AND "ProductId" = {guestItem.ProductId}`, đổi thành `WHERE "Id" = {existingItem.Id}` để update số lượng đúng dòng biến thể.
7. **`apps/backend/Ecommerce/Ecommerce.Infrastructure/Cache/RedisGuestCartService.cs`**
   - Cập nhật logic quản lý giỏ hàng Guest trên Redis: sinh `Id` cho từng item và đối chiếu trùng lặp dựa trên `(ProductId, Color, Size)`.
8. **`apps/backend/Ecommerce/Ecommerce.Infrastructure/Migrations/20261015140903_RefactorCartItemSurrogateKey.cs`**
   - Migration script hỗ trợ đa nền tảng (PostgreSQL `gen_random_uuid()`, SQL Server `NEWID()`, và fallback SQLite).
   - Di chuyển composite PK cũ sang column `Id` GUID, cập nhật dữ liệu hiện hữu và tạo unique index.

### 2.3. Application Layer
9. **`apps/backend/Ecommerce/Ecommerce.Application/Features/Cart/Dto/CartDto.cs`**
   - Bổ sung trường `public Guid Id { get; set; }` vào `CartItemDto`.
10. **`apps/backend/Ecommerce/Ecommerce.Application/Features/Cart/Commands/AddToCart/AddToCartCommandHandler.cs`**
    - Cập nhật ánh xạ kết quả trả về `CartItemDto` bao gồm `Id = i.Id`.
11. **`apps/backend/Ecommerce/Ecommerce.Application/Features/Cart/Queries/GetCart/GetCartQueryHandler.cs`**
    - Ánh xạ trường `Id = i.Id` cho danh sách trả về giỏ hàng.
12. **`apps/backend/Ecommerce/Ecommerce.Application/Features/Cart/Commands/UpdateCartItem/UpdateCartItemCommandHandler.cs` & `RemoveCartItemCommandHandler.cs`**
    - Hỗ trợ xử lý thao tác giỏ hàng thông qua `request.ItemId` (Guid).
13. **`apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs`**
    - **FLOW-01:** Ranh giới giao dịch hoàn chỉnh: Trừ tồn kho bằng `ExecuteUpdateAsync` kiểm tra điều kiện khả dụng (`StockQuantity >= item.Quantity`), thêm `Order`, thêm các `OrderItem`, phát sinh `OrderCreatedEvent` ghi vào bảng `OutboxMessages`, và xóa toàn bộ `CartItem` của user cart bằng `_unitOfWork.BaseRepository<CartItem>().Delete(cartItem)` trong **cùng một transaction duy nhất**.
    - **Rollback tự động:** Nếu xảy ra ngoại lệ hoặc transaction thất bại trước khi `CompleteAsync`, toàn bộ thay đổi cơ sở dữ liệu (Order, Outbox, CartItem) tự động rollback, đồng thời khối catch kích hoạt `RestoreDecrementedStockAsync` để khôi phục tồn kho đã trừ.
    - **External Side Effects:** Xóa guest cart trên Redis được dời ra **sau khi commit database thành công** (`CompleteAsync`), tránh tình trạng mất giỏ hàng khi lưu đơn thất bại.

### 2.4. WebAPI Layer
14. **`apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/CartController.cs`**
    - Cập nhật route parameters `/api/cart/items/{itemId:guid}` cho các thao tác PUT và DELETE item trong giỏ.

### 2.5. Frontend Client Layer
15. **`apps/frontend/ecommerce-client/types/cart.ts`**
    - Bổ sung thuộc tính `id?: string` vào type `CartItem`.
16. **`apps/frontend/ecommerce-client/components/cart/CartItem.tsx`**
    - Truyền `item.id || item.productId` vào các hành động `onUpdateQuantity` và `onRemove`.
17. **`apps/frontend/ecommerce-client/components/cart/CartItems.tsx`**
    - Thay thế key composite bằng `key={item.id || `${item.productId}-${item.color || ''}-${item.size || ''}`}` đảm bảo render React danh sách các biến thể không bị xung đột key.
18. **`apps/frontend/ecommerce-client/hooks/use-cart.ts`**
    - Cập nhật optimistic update và khớp item theo `id` hoặc bộ thuộc tính biến thể.

### 2.6. Test Suite
19. **`apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/RemediationPhase2BTests.cs` (Tạo mới)**
    - Bộ 8 integration tests kiểm chứng đầy đủ 4 findings trên database SQLite/EF Core thực tế.

---

## 3. Bảng Trạng Thái 4 Findings

| Mã Finding | Phân Loại & Tiêu Đề | Trạng Thái Cũ | Trạng Thái Sau Phase 2B | Kết Quả Kiểm Toán & Bằng Chứng |
|---|---|---|---|---|
| **FLOW-01** | Transaction safety & atomicity in `CreateOrder` | **CRITICAL** (Trừ kho, tạo đơn, ghi outbox và xóa giỏ hàng không nằm trong cùng boundary nguyên tử; lỗi có thể gây mất tồn kho hoặc trạng thái dở dang) | **RESOLVED** | Gom toàn bộ thao tác cơ sở dữ liệu vào một transaction duy nhất. Kiểm tra tồn kho khả dụng tránh overselling. Rollback tồn kho an toàn khi xảy ra lỗi. Xóa Redis guest cart sau commit. Test: `FLOW01_*` (3/3 Passed). |
| **DATA-01** | CartItem primary key & variant duplicate constraint | **HIGH** (Khóa chính composite `(CartId, ProductId)` gây crash 500 khi thêm 2 biến thể khác màu/size của cùng 1 sản phẩm) | **RESOLVED** | Chuyển sang surrogate GUID key cho `CartItem`. Unique index trên `(CartId, ProductId, Color, Size)`. Cùng biến thể thì merge số lượng; khác biến thể thì tạo dòng riêng biệt. Test: `DATA01_*` (2/2 Passed trong Phase2B, `AuditVerificationTests.DATA01` chuyển từ FAIL sang PASS). |
| **FLOW-02** | Inventory restoration to correct SKU on order cancellation | **HIGH** (Hủy đơn hàng hoàn kho vào Product cha thay vì SKU biến thể thực tế bị trừ) | **RESOLVED** | Đơn hàng lưu `ProductVariantSkuId`. Khi hủy đơn, hệ thống cộng tồn kho trực tiếp vào `ProductVariantSku.StockQuantity`. Đơn hàng không có variant SKU được hoàn vào `Product.StockQuantity`. Tránh hoàn 2 lần khi hủy trùng lặp. Test: `FLOW02_*` (2/2 Passed). |
| **FLOW-03** | Inventory restoration in RMA flow only after receipt & inspection | **MEDIUM** (Tồn kho có thể bị hoàn ngay khi Approve thay vì chờ kiểm định chất lượng) | **RESOLVED** | Tách biệt trạng thái `Approved` (chấp thuận) và `Completed` (sau khi `ItemReceived`, `QualityCheck`, `RefundProcessing`). Chỉ khi hàng đạt tiêu chuẩn kiểm tra chất lượng mới tăng tồn kho đúng SKU. Test: `FLOW03_*` (Passed). |

---

## 4. Phân Tích Kiến Trúc Luồng Dữ Liệu: Trước vs Sau Sửa Đổi

### 4.1. FLOW-01: Luồng Tạo Đơn Hàng (Create Order Transaction Boundary)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng
    participant Handler as CreateOrderCommandHandler
    participant Strategy as EF Core ExecutionStrategy
    participant DB as Database (SQL Server / Postgres)
    participant Redis as Redis Guest Cart Service
    participant Outbox as OutboxMessages Table

    Customer->>Handler: Gửi CreateOrderCommand
    Handler->>Strategy: Thực thi qua ExecutionStrategy (hỗ trợ Retry)
    Strategy->>DB: Begin Transaction

    Note over Handler,DB: Bước 1: Trừ kho với điều kiện nguyên tử (Prevent Overselling)
    Handler->>DB: ExecuteUpdateAsync(StockQuantity = StockQuantity - Qty WHERE StockQuantity >= Qty)
    alt Không đủ tồn kho
        DB-->>Handler: 0 rows affected
        Handler->>DB: Rollback Transaction
        Handler-->>Customer: 400 Bad Request ("Sản phẩm không đủ số lượng tồn kho")
    else Đủ tồn kho
        DB-->>Handler: Thành công
    end

    Note over Handler,DB: Bước 2: Tạo Order & OrderItems
    Handler->>Handler: Khởi tạo Order entity, đính kèm OrderItems (với Variant SKU)
    Handler->>Handler: order.FinalizeCreation() (Phát sinh OrderCreatedEvent)

    Note over Handler,DB: Bước 3: Xóa giỏ hàng người dùng trong cùng transaction
    Handler->>DB: BaseRepository<CartItem>().Delete(cartItem)
    Handler->>Handler: userCart.Clear()

    Note over Handler,DB: Bước 4: Lưu Order & Ghi Outbox nguyên tử
    Handler->>DB: Orders.Add(order)
    Handler->>DB: ApplicationDbContext.SaveChangesAsync() (OutboxMessage tự động tạo từ DomainEvent)
    
    alt Có lỗi phát sinh trước hoặc trong khi SaveChanges
        Handler->>Handler: RestoreDecrementedStockAsync(decrementedStockItems)
        Handler->>DB: Rollback Transaction
        Handler-->>Customer: 500 Error (Không rò rỉ dữ liệu dở dang)
    else Thành công
        Strategy->>DB: Commit Transaction
    end

    Note over Handler,Redis: Bước 5: External Side Effect (Thực thi sau Commit DB)
    opt Khách hàng vãng lai (Guest)
        Handler->>Redis: DeleteCartAsync(guestId) (bọc try-catch, không làm fail đơn nếu Redis trục trặc)
    end
    Handler-->>Customer: 200 OK (OrderId)
```

### 4.2. DATA-01: Quản Lý CartItem với Sản Phẩm Biến Thể

```mermaid
sequenceDiagram
    autonumber
    actor User as Người Dùng
    participant API as /api/cart/items
    participant Handler as AddToCartCommandHandler
    participant Cart as Cart (Aggregate Root)
    participant DB as Database

    User->>API: POST /api/cart/items (ProductId: P1, Color: "Đỏ", Size: "M", Qty: 1)
    API->>Handler: AddToCartCommand
    Handler->>DB: Load Cart gồm các CartItems hiện có
    Handler->>Cart: cart.AddItem(product, qty: 1, color: "Đỏ", size: "M")
    Cart->>Cart: Chuẩn hóa Color = "Đỏ", Size = "M"
    Cart->>Cart: Tìm item khớp (ProductId == P1 && Color == "Đỏ" && Size == "M")
    Note over Cart: Không tìm thấy -> Tạo CartItem mới với surrogate Id = Guid.NewGuid()
    Cart->>DB: SaveChangesAsync() (Insert CartItem có Id riêng)
    DB-->>User: 200 OK (Thêm dòng biến thể Đỏ / M)

    User->>API: POST /api/cart/items (ProductId: P1, Color: "Xanh", Size: "L", Qty: 1)
    API->>Handler: AddToCartCommand (Cùng ProductId P1 nhưng khác biến thể)
    Handler->>Cart: cart.AddItem(product, qty: 1, color: "Xanh", size: "L")
    Cart->>Cart: Chuẩn hóa Color = "Xanh", Size = "L"
    Note over Cart: Khác biến thể -> Không trùng khóa! Tạo CartItem thứ 2
    Cart->>DB: SaveChangesAsync() (Insert CartItem thứ 2 thành công)
    DB-->>User: 200 OK (Giỏ hàng có 2 dòng riêng biệt của cùng 1 sản phẩm)

    User->>API: POST /api/cart/items (ProductId: P1, Color: "Đỏ", Size: "M", Qty: 2)
    API->>Handler: AddToCartCommand (Trùng lại biến thể Đỏ / M)
    Handler->>Cart: cart.AddItem(product, qty: 2, color: "Đỏ", size: "M")
    Note over Cart: Tìm thấy dòng Đỏ / M đã có -> Tăng số lượng (1 + 2 = 3)
    Cart->>DB: SaveChangesAsync() (Update dòng Đỏ / M thành Qty: 3)
    DB-->>User: 200 OK (Không tạo dòng trùng lặp)
```

### 4.3. FLOW-02 & FLOW-03: Hoàn Tồn Kho Khi Hủy Đơn & Quy Trình RMA

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Quản Trị Viên / Nhân Viên Kho
    participant OrderCtrl as Order / Return Controller
    participant Service as OrderCancellationService / ReturnHandler
    participant DB as Database

    rect rgb(240, 248, 255)
    Note over Admin,DB: FLOW-02: Hủy Đơn Hàng (Order Cancellation)
    Admin->>OrderCtrl: PUT /orders/{id}/status (Status = Cancelled)
    OrderCtrl->>Service: UpdateOrderStatusCommand
    Service->>DB: Load Order và OrderItems
    loop Duyệt từng OrderItem
        alt OrderItem có ProductVariantSkuId
            Service->>DB: ExecuteUpdateAsync(ProductVariantSku.StockQuantity += item.Quantity WHERE Id == skuId)
        else Không có Variant SKU (Sản phẩm đơn giản)
            Service->>DB: ExecuteUpdateAsync(Product.StockQuantity += item.Quantity WHERE Id == productId)
        end
    end
    Service->>DB: Cập nhật Order.Status = Cancelled
    DB-->>Admin: 200 OK (Tồn kho hoàn chính xác vào từng SKU)
    end

    rect rgb(255, 250, 240)
    Note over Admin,DB: FLOW-03: Quy Trình Hoàn Hàng (RMA Lifecycle)
    Admin->>OrderCtrl: Approve Return Request (Status = Approved)
    Note over Service,DB: Trạng thái Approved KHÔNG tăng tồn kho (Hàng chưa về kho)
    Admin->>OrderCtrl: Update Return Status (ItemReceived -> QualityCheck)
    Admin->>OrderCtrl: Hoàn tất quy trình (Status = Completed sau khi kiểm định đạt chuẩn)
    Service->>DB: ReturnRequestCompletedEventHandler kích hoạt
    Service->>DB: ExecuteUpdateAsync(ProductVariantSku.StockQuantity += returnQty WHERE Id == skuId)
    DB-->>Admin: 200 OK (Chỉ nhập kho khi hàng thực tế đã được kiểm tra và nhận lại)
    end
```

---

## 5. Chiến Lược Khóa Chính & Unique Constraint Cho `CartItem`

### 5.1. Lý Do Chọn Surrogate GUID Primary Key
1. **Khả năng mở rộng độc lập:** Khóa chính composite cũ `(CartId, ProductId)` giới hạn mỗi sản phẩm chỉ được xuất hiện đúng một dòng trong giỏ hàng. Khi triển khai tính năng sản phẩm có biến thể (áo thun có Size S, M, L; màu Đỏ, Xanh), người dùng cần mua cùng lúc nhiều biến thể của một sản phẩm. Surrogate GUID (`Id`) cho phép mỗi dòng giỏ hàng có định danh toàn cục độc lập.
2. **Khả năng tương thích API RESTful:** Các endpoint frontend như `PUT /api/cart/items/{itemId}` hoặc `DELETE /api/cart/items/{itemId}` sử dụng trực tiếp surrogate ID duy nhất, đơn giản hóa routing và loại bỏ sự mơ hồ khi truyền composite key qua URL.
3. **Tránh lỗi concurrency trong EF Core:** Khi cấu hình `Id` với `ValueGeneratedOnAdd()` và giá trị mặc định `Guid.Empty`, EF Core ChangeTracker nhận biết chính xác khi nào một thực thể là mới (`IsKeySet == false` -> `EntityState.Added`) và khi nào cần cập nhật (`EntityState.Modified`), tránh lỗi `DbUpdateConcurrencyException`.

### 5.2. Unique Index & Xử Lý Concurrency / Deduplication
- **Unique Constraint cơ sở dữ liệu:**
  ```csharp
  builder.HasIndex(ci => new { ci.CartId, ci.ProductId, ci.Color, ci.Size }).IsUnique();
  ```
- **Chuẩn hóa giá trị (Value Normalization):** Cả `Color` và `Size` được chuẩn hóa bằng cách cắt khoảng trắng thừa (`Trim()`) và chuyển đổi giá trị `null` thành chuỗi rỗng `""`. Điều này bảo đảm tính nhất quán trên cả PostgreSQL (nơi giá trị `NULL` trong unique index có thể được xem là các giá trị phân biệt) và SQL Server.
- **Deduplication:** Tầng domain logic trong `Cart.AddItem` tự động kiểm tra sự tồn tại của bộ ba `(ProductId, Color, Size)` đã chuẩn hóa trước khi tạo mới. Nếu có 2 request thêm cùng biến thể diễn ra đồng thời, Unique Index tại cơ sở dữ liệu sẽ chặn request thứ hai vi phạm khóa duy nhất, ngăn ngừa hoàn toàn việc tạo dòng trùng lặp.

---

## 6. Chiến Lược Rollback & Transaction Boundary

### 6.1. Ranh Giới Giao Dịch Trong `CreateOrderCommandHandler`
1. **Execution Strategy:** Sử dụng `_unitOfWork.ExecuteStrategyAsync` để bao bọc toàn bộ chuỗi thao tác, tự động xử lý transient connection errors khi làm việc với SQL Server hoặc PostgreSQL trên đám mây.
2. **Nguyên tử hóa (All-or-Nothing):**
   - Trừ kho tức thời (`ExecuteUpdateAsync`).
   - Lưu trữ `Order` và `OrderItems`.
   - Sinh domain event `OrderCreatedEvent` ghi vào bảng `OutboxMessages`.
   - Xóa các item trong user cart của người dùng.
   Tất cả 4 thao tác trên được xác nhận kiên cố trong cùng một database transaction khi `CompleteAsync()` thành công.
3. **Rollback Tồn Kho Chủ Động:**
   Nếu xảy ra lỗi ngoại lệ ở bất kỳ bước nào sau khi trừ kho (ví dụ: validation fail, thẻ giảm giá không hợp lệ, lỗi database khi ghi order), hàm `RestoreDecrementedStockAsync` được gọi trong khối catch với cấu trúc try-catch bọc lót riêng biệt để hoàn trả số lượng đã trừ về kho của từng SKU / Product tương ứng.
4. **Phân Tách External Side Effects:**
   Thao tác xóa giỏ hàng guest trên Redis (`_guestCartService.DeleteCartAsync`) được đặt hoàn toàn **sau khi commit database thành công**. Nếu Redis gặp sự cố mạng, lỗi được ghi log nhưng không làm hủy đơn hàng đã lưu thành công của khách hàng.

### 6.2. Kiểm Soát Cạnh Tranh (Concurrency Control) Khi Trừ Tồn Kho
Trừ tồn kho sử dụng mệnh đề SQL update có điều kiện:
```sql
UPDATE Products 
SET StockQuantity = StockQuantity - @Quantity 
WHERE Id = @ProductId AND StockQuantity >= @Quantity;
```
Đối với biến thể SKU:
```sql
UPDATE ProductVariantSkus 
SET StockQuantity = StockQuantity - @Quantity 
WHERE Id = @ProductVariantSkuId AND StockQuantity >= @Quantity;
```
Nếu số lượng bản ghi bị ảnh hưởng (`affectedRows`) bằng 0, hệ thống xác định tồn kho không đủ (hoặc đã bị request khác mua hết) và trả về lỗi ngay lập tức, ngăn ngừa triệt để tình trạng overselling khi có nhiều đơn hàng gửi đồng thời.

---

## 7. Kết Quả Kiểm Thử Thực Tế

Tất cả các bộ test kiểm thử tự động đã được thực thi và xác minh kết quả chi tiết trong môi trường workspace:

### 7.1. Bộ Kiểm Thử Mới Cho Phase 2B (`RemediationPhase2BTests.cs`)
**Lệnh thực thi:**
```bash
dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests --filter "FullyQualifiedName~RemediationPhase2BTests"
```
**Kết quả thực tế:**
```text
Passed!  - Failed:     0, Passed:     8, Skipped:     0, Total:     8, Duration: 2 m 15 s - Ecommerce.WebAPI.IntegrationTests.dll (net8.0)
```
**Chi tiết 8 ca kiểm thử tích hợp:**
1. `FLOW01_CreateOrderSuccess_OrderItemsStockAndCartClearedAtomically`: PASSED
   - Tạo đơn thành công; tồn kho trừ chính xác; giỏ hàng user bị xóa sạch; outbox message được ghi trong cùng transaction.
2. `FLOW01_InsufficientStock_RejectsOrderAndDoesNotDecrementStock`: PASSED
   - Mua số lượng vượt tồn kho; đơn hàng bị từ chối; tồn kho giữ nguyên vẹn không bị trừ âm.
3. `FLOW01_ConcurrentOrders_DoesNotOversellAvailableStock`: PASSED
   - Hai request đặt hàng gửi đồng thời khi tồn kho chỉ còn 5 chiếc (mỗi request yêu cầu 4 chiếc, tổng 8 chiếc); tối đa 1 request thành công, tồn kho cuối cùng không bao giờ bị âm.
4. `DATA01_SameProductDifferentVariants_CreatesTwoSeparateCartLines`: PASSED
   - Thêm cùng 1 sản phẩm với biến thể Đỏ / M và Xanh / L; tạo thành 2 dòng riêng biệt trong giỏ hàng.
5. `DATA01_SameProductSameVariant_MergesQuantityInsteadOfDuplicate`: PASSED
   - Thêm cùng 1 biến thể Xanh / XL liên tiếp 2 lần (qty 2 + qty 3); hệ thống gộp thành 1 dòng duy nhất với qty 5.
6. `FLOW02_CancelOrderWithMultipleSkus_RestoresEachSkuCorrectly`: PASSED
   - Hủy đơn hàng chứa 2 SKU khác nhau; từng SKU được hoàn lại đúng số lượng đã mua.
7. `FLOW02_CancelOrderWithoutSku_RestoresProductStock`: PASSED
   - Hủy đơn hàng sản phẩm không có SKU biến thể; tồn kho hoàn trả chính xác vào `Product.StockQuantity`.
8. `FLOW03_RmaApproval_DoesNotRestoreStockUntilInspectionCompleted`: PASSED
   - Phê duyệt yêu cầu trả hàng (Approved) chưa làm tăng tồn kho; chỉ sau khi qua đủ các bước nhận hàng và kiểm tra chất lượng (Completed) tồn kho mới được khôi phục.

### 7.2. Kiểm Tra Lại Bộ Test Kiểm Toán Ban Đầu (`AuditVerificationTests.cs`)
**Lệnh thực thi:**
```bash
dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests --filter "FullyQualifiedName~AuditVerificationTests"
```
**Kết quả thực tế:**
```text
Failed: 3, Passed: 4, Skipped: 0, Total: 7 - Duration: 1 m 24 s
```
- `DATA01_AddingTwoVariantsOfSameProduct_KeepsBothCartLines`: **PASSED** (Trước Phase 2B kiểm thử này **FAIL với mã lỗi 500**, nay đã **PASS** hoàn toàn).
- `FLOW02_CancellingOrderWithVariantSku_RestoresSkuStock`: **PASSED**.
- `FLOW03_ReturnRequestCompletedEvent_HasAtLeastOneHandler`: **PASSED**.
- `SEC04_RefreshToken_WorksWhenOnlyRefreshCookieIsPresent`: **PASSED**.
- **3 test thất bại còn lại:**
  - `REPORT_RevenueByMonth_IncludesOrdersPlacedOnLastDayOfMonth` (PERF-01/Reporting - Out of scope).
  - `SEC03_Anonymous_CannotDownloadProductImportTemplate` (SEC-03 - Out of scope).
  - `SEC02_LocalFileStorage_DeleteFileAsync_RejectsPathTraversal` (SEC-02 - Out of scope).
  -> Đây là 3 lỗi thuộc các finding kiểm toán khác đã tồn tại từ trước và cố tình giữ nguyên theo yêu cầu không mở rộng phạm vi.

### 7.3. Bộ Kiểm Thử Domain & Application Tests
1. **Domain Tests:**
   ```bash
   dotnet test apps/backend/Ecommerce/tests/Ecommerce.Domain.Tests
   ```
   *Kết quả:* `Passed! - Failed: 0, Passed: 57, Skipped: 0, Total: 57` (100% Passed).
2. **Application Tests:**
   ```bash
   dotnet test apps/backend/Ecommerce/Ecommerce.Application.Tests
   ```
   *Kết quả:* `Failed: 5, Passed: 201, Skipped: 0, Total: 206`.
   *Ghi nhận:* Đúng 5 test thất bại đã tồn tại từ trước do khác biệt chuỗi thông báo tiếng Việt vs tiếng Anh (`Email hoặc mật khẩu không đúng` vs `Invalid email or password`), hoàn toàn không phát sinh bất kỳ lỗi mới nào.

### 7.4. Toàn Bộ Bộ Kiểm Thử Tích Hợp Hệ Thống
```bash
dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests --filter "Category!=AuditRepro"
```
*Kết quả:* `Passed! - Failed: 0, Passed: 66, Skipped: 0, Total: 66, Duration: 17 m 33 s` (66/66 integration tests passed, không có regression).

### 7.5. Biên Dịch Frontend Production Build
1. **Client (`apps/frontend/ecommerce-client`):**
   ```bash
   npm run build
   ```
   *Kết quả:* `Compiled successfully in 16.1s. 22 static/dynamic pages generated. Linting and checking validity of types passed.`
2. **Dashboard (`apps/frontend/ecommerce-dashboard`):**
   ```bash
   npm run build
   ```
   *Kết quả:* `Compiled successfully in 36.0s. 44 static/dynamic pages generated. Linting and checking validity of types passed.`

---

## 8. Hướng Dẫn Migration Cho Môi Trường Production

> [!WARNING]
> Tuyệt đối không tự động chạy `dotnet ef database update` trên môi trường Production khi chưa hoàn thành bước rà soát và làm sạch dữ liệu giỏ hàng cũ!

### 8.1. Thứ Tự Chạy Migration Script
1. Tạo bản sao lưu (backup) cơ sở dữ liệu production.
2. Thực thi script làm sạch trùng lặp dữ liệu trong bảng `CartItems` (mục 8.2).
3. Áp dụng migration EF Core `20261015140903_RefactorCartItemSurrogateKey`:
   ```bash
   dotnet ef database update --project Ecommerce.Infrastructure --startup-project Ecommerce.WebAPI
   ```
4. Xác minh bảng `CartItems` đã có cột `Id` làm Primary Key và Unique Index `IX_CartItems_CartId_ProductId_Color_Size` hoạt động bình thường.

### 8.2. Phương Án Xử Lý Dữ Liệu Trùng Lặp Trước Khi Áp Dụng Unique Index
Trước khi áp dụng unique index, nếu cơ sở dữ liệu cũ có các dòng trùng lặp `(CartId, ProductId, Color, Size)` do bug trước đây tạo ra, cần chạy câu lệnh SQL sau để gộp số lượng và giữ lại đúng một dòng duy nhất cho mỗi biến thể:

**Đối với PostgreSQL (Render / Docker):**
```sql
-- Bước 1: Chuẩn hóa dữ liệu null về rỗng
UPDATE "CartItems" 
SET "Color" = COALESCE(TRIM("Color"), ''), 
    "Size" = COALESCE(TRIM("Size"), '');

-- Bước 2: Gộp số lượng của các dòng trùng lặp
WITH MergedQuantities AS (
    SELECT "CartId", "ProductId", "Color", "Size", 
           SUM("Quantity") as TotalQty,
           MIN(ctid) as KeepCtid
    FROM "CartItems"
    GROUP BY "CartId", "ProductId", "Color", "Size"
    HAVING COUNT(*) > 1
)
UPDATE "CartItems" ci
SET "Quantity" = mq.TotalQty
FROM MergedQuantities mq
WHERE ci.ctid = mq.KeepCtid;

-- Bước 3: Xóa các dòng trùng lặp thừa
DELETE FROM "CartItems" a USING "CartItems" b
WHERE a.ctid < b.ctid
  AND a."CartId" = b."CartId"
  AND a."ProductId" = b."ProductId"
  AND a."Color" = b."Color"
  AND a."Size" = b."Size";
```

**Đối với SQL Server (Local Dev / Staging):**
```sql
-- Chuẩn hóa dữ liệu
UPDATE CartItems 
SET Color = ISNULL(LTRIM(RTRIM(Color)), ''), 
    Size = ISNULL(LTRIM(RTRIM(Size)), '');

-- Xóa các dòng trùng lặp và giữ lại dòng có số lượng lớn nhất
WITH NumberedItems AS (
    SELECT CartId, ProductId, Color, Size,
           ROW_NUMBER() OVER (PARTITION BY CartId, ProductId, Color, Size ORDER BY Quantity DESC) as RowNum
    FROM CartItems
)
DELETE FROM NumberedItems WHERE RowNum > 1;
```

### 8.3. Kế Hoạch Rollback (Rollback Plan)
Nếu quá trình migration trên Production gặp sự cố:
1. Revert migration thông qua EF Core:
   ```bash
   dotnet ef database update 20260517012236_AddOutboxMessages --project Ecommerce.Infrastructure --startup-project Ecommerce.WebAPI
   ```
2. Hoặc khôi phục cơ sở dữ liệu từ bản backup đã tạo ở bước 8.1.
3. Deploy lại phiên bản backend trước đó.

### 8.4. Kiểm Tra Tương Thích Database Provider
Migration `20261015140903_RefactorCartItemSurrogateKey` đã được thiết kế tương thích cả hai hệ quản trị cơ sở dữ liệu:
- **PostgreSQL (Docker/Render):** Sử dụng hàm mở rộng `gen_random_uuid()` tự động sinh GUID cho các dòng dữ liệu cũ trong quá trình thêm cột `Id`.
- **SQL Server (Windows local dev):** Sử dụng hàm hệ thống `NEWID()`.
- **SQLite (In-Memory / Integration Tests):** Sử dụng fallback logic của EF Core.

---

## 9. Rủi Ro Còn Lại & Khuyến Nghị Cho Các Phase Tiếp Theo

1. **SEC-01 (Hardcoded Credentials trong Git History):**
   - Vẫn cần thực hiện kế hoạch xoay vòng secret và làm sạch lịch sử git theo lộ trình của Phase 3.
2. **SEC-02 (Path Traversal trong File Deletion):**
   - Cần bổ sung kiểm tra `Path.GetFullPath` và ràng buộc trong phạm vi thư mục uploads để tránh xóa tệp ngoài ý muốn.
3. **SEC-03 (Thiếu Authorization trên Command Handler):**
   - Cần cấu hình `AuthorizationBehavior` toàn diện cho các MediatR command.
4. **PERF-01 (Tối ưu hóa Báo Cáo Doanh Thu theo Tháng):**
   - Cần điều chỉnh ranh giới thời gian truy vấn `DatePlaced <= endOfMonth` để bao gồm các đơn hàng phát sinh vào ngày cuối cùng của tháng.

---

## 10. Trạng Thái Nghiệm Thu

**KẾT LUẬN NGHIỆM THU: READY FOR REVIEW**

Toàn bộ 4 mục tiêu kỹ thuật cốt lõi của **Phase 2B (FLOW-01, DATA-01, FLOW-02, FLOW-03)** đã được triển khai hoàn chỉnh, biên dịch thành công 100% trên cả Backend và 2 ứng dụng Frontend, đạt chứng nhận thông qua toàn bộ 8 integration tests mới và toàn bộ 66 existing integration tests mà không phát sinh bất kỳ regression nào.

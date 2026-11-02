> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 14/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`apps/frontend/ecommerce-client/docs/business-analysis.md`](../../apps/frontend/ecommerce-client/docs/business-analysis.md).

# 03 — Phân tích Luồng Nghiệp vụ E-Commerce (Business Flow Analysis)

> **Dự án:** ShopViet E-Commerce Platform  
> **Repository:** https://github.com/lenam2809/ecommerce  
> **Thời điểm kiểm toán:** 14/10/2026  
> **Phạm vi:** Toàn bộ 6 nhóm nghiệp vụ lõi: Catalog & Search, Cart & Guest Cart, Checkout & Orders, Stock Lifecycle, VNPay Payments, Returns & Reviews.

---

## 1. Bản đồ Nghiệp vụ Lõi (Business Domains)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SHOPVIET BUSINESS DOMAINS                        │
├─────────────────────┬───────────────────────┬───────────────────────────────┤
│ 1. Catalog & Search │ 2. Cart Management    │ 3. Checkout & Orders          │
│ • Products & SKUs   │ • Customer DB Cart    │ • Validation & Pricing        │
│ • Attributes/Values │ • Guest Redis Cart    │ • Stock Reservation          │
│ • Categories/Brands │ • Cookie guest_id     │ • Order State Machine         │
│ • ES & SQL Search   │ • Cart Merge on Login │ • Outbox Event Generation     │
├─────────────────────┼───────────────────────┼───────────────────────────────┤
│ 4. Inventory/Stock  │ 5. Payments & Gateway │ 6. Post-Purchase              │
│ • SKU Stock Quantity│ • VNPay Sandbox URL   │ • RMA Return Requests         │
│ • Atomic Decrement  │ • IPN & Return Hook   │ • Evidence Upload             │
│ • Concurrency check │ • HMACSHA512 Checksum │ • Product Reviews & Rating    │
│ • Stock Restoration │ • Idempotency & Replay│ • SignalR Hub Real-time Sync  │
└─────────────────────┴───────────────────────┴───────────────────────────────┘
```

---

## 2. Truy vết Chi tiết Từng Luồng Nghiệp vụ

### 2.1. Luồng 1: Tìm kiếm & Danh mục Sản phẩm (Catalog & Search)

- **Cấu trúc Mô hình kép (Dual Variant Model Discrepancy):**
  - Thực thể `Product.cs` định nghĩa 2 cơ chế biến thể song song:
    1. **Mô hình mới (DDD Variant SKU):** `HasVariants` (L63), `Attributes` (`ICollection<ProductAttribute>`, L74), `VariantSkus` (`ICollection<ProductVariantSku>`, L79). `Product.AddAttribute()` (L238), `Product.AddVariantSku()` (L248), `Product.GetTotalStock()` (L268). Bảng liên kết nhiều-nhiều `SkuAttributeValue` liên kết `ProductVariantSku` và `ProductAttributeValue`.
    2. **Mô hình cũ (Legacy Variants):** `Variants` (`ProductVariants`, L69), gồm `ProductColor` và `ProductSize` dạng chuỗi phẳng.
  - **Lỗ hổng phân mảnh nghiệp vụ:** Trong `CreateProductCommandHandler.cs#L90-L98` và `UpdateProductCommandHandler.cs#L169-L205`, hệ thống chỉ gọi `product.SetVariants(request.Colors, request.Sizes)` ghi vào bảng legacy `ProductVariants`. API CRUD sản phẩm hoàn toàn **KHÔNG** tạo hay cập nhật `ProductAttribute` hay `ProductVariantSku`. Tuy nhiên, luồng Cart và Checkout lại yêu cầu và trừ kho trên `ProductVariantSku`!
- **Tìm kiếm: Elasticsearch vs SQL LIKE Fallback:**
  - `GET /api/search/products` ➔ `SearchController.SearchProducts` ➔ `SearchProductsQueryHandler.Handle` ➔ `IProductSearchService.SearchProductsAsync`.
  - **Sai lệch so với tài liệu (Discrepancy):** Tài liệu `AGENTS.md` ghi: *"Search | Elasticsearch (optional) — falls back to SQL LIKE via NoOpProductSearchService"*. Trong thực tế, `NoOpProductSearchService.SearchProductsAsync` ([NoOpProductSearchService.cs#L25](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Elasticsearch/NoOpProductSearchService.cs#L25)) ném trực tiếp `SearchServiceUnavailableException("Elasticsearch search is disabled.")`. Tại `SearchProductsQueryHandler.cs#L67-L72`, ngoại lệ này bị bắt và trả về HTTP 503 (`Result.ServiceUnavailable`). Khi tắt Elasticsearch, endpoint `/api/search/products` bị lỗi 503 hoàn toàn, **không hề có cơ chế fallback sang SQL LIKE**!
  - SQL LIKE (`product.Name.Contains(searchTerm)`) chỉ tồn tại ở endpoint `GET /api/products/paged` ([GetPagedProductsQueryHandler.cs#L85](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Products/Queries/GetPagedProducts/GetPagedProductsQueryHandler.cs#L85)), nhưng endpoint này lại yêu cầu quyền Admin (`[Authorize(Policy = EPermissions.ViewProducts)]`), người dùng cuối không thể sử dụng.

---

### 2.2. Luồng 2: Giỏ hàng & Khách vãng lai (Cart & Guest Cart Sync)

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách hàng (Chưa đăng nhập)
    participant Client as Next.js Storefront
    participant Middleware as GuestCartMiddleware
    participant CartCtrl as CartController
    participant RedisService as RedisGuestCartService
    participant Redis as Redis Server

    User->>Client: Bấm "Thêm vào giỏ"
    Client->>Middleware: POST /api/Cart/items (kèm Cookie guest_id)
    alt Chưa có Cookie guest_id
        Middleware->>Middleware: Sinh Guid guestId mới
        Middleware-->>Client: Set-Cookie: guest_id=<guid>; HttpOnly; SameSite=Lax
    end
    Middleware->>CartCtrl: Chuyển tiếp request kèm GuestId trong context
    CartCtrl->>RedisService: AddToCartAsync(guestId, item)
    RedisService->>Redis: SET ecommerce:guest_cart:<guestId> (TTL: 7 ngày)
    Redis-->>RedisService: OK
    RedisService-->>CartCtrl: Cart DTO
    CartCtrl-->>Client: 200 OK (Chi tiết giỏ hàng)

    Note over User,Client: Khách hàng tiến hành Đăng nhập (Login)
    User->>Client: Nhập Email/Password
    Client->>CartCtrl: POST /api/Auth/login (gửi kèm cookie guest_id)
    CartCtrl->>RedisService: MergeGuestCartIntoUserCartAsync(guestId, userId)
    RedisService->>Redis: GET ecommerce:guest_cart:<guestId>
    RedisService->>CartCtrl: Chuyển các item vào Cart Entity trong DB
    RedisService->>Redis: DEL ecommerce:guest_cart:<guestId>
```

- **Các lỗi và rủi ro đã xác minh trong Giỏ hàng:**
  1. **Lệch giao thức Guest ID giữa Frontend và Backend:** Backend (`GuestCartMiddleware.cs#L25-L37`) chỉ đọc cookie `guest_id` do server sinh và bỏ qua header `X-Guest-ID`. Tuy nhiên, Frontend client (`apps/frontend/ecommerce-client/lib/api.ts#L117-L121` và `lib/guest-id.ts#L12-L26`) vẫn tự sinh UUID lưu vào `localStorage` và gửi qua header `X-Guest-ID`. Khi gặp lỗi cấu hình cookie (cross-site/CORS), giỏ hàng guest trên giao diện bị mất đồng bộ với server.
  2. **Hardcoded Promo Codes trong `RedisGuestCartService`:** Tại [RedisGuestCartService.cs#L140-L151](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Cache/RedisGuestCartService.cs#L140-L151), mã giảm giá của guest bị gán cứng trong code C# (`WELCOME10` giảm 10%, `FREESHIP` giảm 0), hoàn toàn bỏ qua bảng `PromoCodes` trong database.
  3. **Lỗi logic kiểm tra tồn kho biến thể (`CartItem.cs`):** Constructor `CartItem.cs#L23-L26` gọi `ValidateQuantity(product)` so sánh `Quantity <= product.StockQuantity`. Với sản phẩm có biến thể, tồn kho nằm ở `ProductVariantSku.StockQuantity`, trong khi `product.StockQuantity` có thể là `0`. Thêm sản phẩm variant vào giỏ sẽ vấp phải lỗi vô lý: *"Không đủ hàng trong kho. Kho còn: 0"*.
  4. **Sai lệch số lượng khi gộp giỏ (`MergeCartService.cs`):** Khi gộp giỏ hàng khách vào user (`MergeCartService.cs#L41-L43`, `L110-L112`), câu SQL cập nhật:
     ```sql
     UPDATE "CartItems" SET "Quantity" = "Quantity" + {0} WHERE "CartId" = {1} AND "ProductId" = {2}
     ```
     **Hoàn toàn không lọc theo `Color`, `Size` hay `ProductVariantSkuId`**. Nếu user có 2 item cùng ProductId nhưng khác Size/Color trong giỏ, câu lệnh SQL sẽ cộng dồn sai vào tất cả các dòng của sản phẩm đó.
  5. **Sync-over-Async Blocking Call:** [GetCartQueryHandler.cs#L60](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Cart/Queries/GetCart/GetCartQueryHandler.cs#L60) gọi `_fileStorageService.GetFileUrlAsync(i.Product.Image).Result` chặn thread trong luồng async, gây nguy cơ thread starvation.

---

### 2.3. Luồng 3: Đặt hàng & Trừ tồn kho (Checkout & Order Flow)

- **Invariants & Kiểm tra an toàn:**
  - ✅ **Bảo vệ toàn vẹn giá (Price Tampering Defense)**: Đơn giá được đọc trực tiếp từ DB (`Product.Price` hoặc `ProductVariantSku.Price`), bỏ qua đơn giá client gửi lên.
  - ✅ **Atomic Stock Decrement**: Dùng `ExecuteUpdateAsync` với điều kiện `s.StockQuantity >= quantity` để ngăn overselling ở tầng SQL.
  - ❌ **Lỗ hổng khôi phục tồn kho khi ngoại lệ không mong muốn (Inventory Leak)**:
    Trong [CreateOrderCommandHandler.cs#L182-L186](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs#L182-L186):
    ```csharp
    catch (Exception ex)
    {
        await _logger.LogExceptionAsync(ex, "Loi xay ra khi tao don hang");
        return Result<Guid>.BadRequest($"Tao don hang that bai: {ex.Message}");
    }
    ```
    Khối `catch (Exception ex)` chung này **không gọi `RestoreDecrementedStockAsync`**! Vì `TryDecrementStockAsync` gọi `ExecuteUpdateAsync` chạy trực tiếp xuống DB ngoài EF Core transaction, nếu bước `_unitOfWork.CompleteAsync()` gặp sự cố mạng, DB lỗi timeout hoặc deadlock, tồn kho đã trừ sẽ **bị trừ vĩnh viễn** mà đơn hàng không được tạo.
  - ❌ **Bỏ quên phí vận chuyển (Shipping Cost)**: `Cart` tính `ShippingCost` qua `IShippingCalculator`, nhưng Entity `Order.cs#L258` **không có trường `ShippingCost`**. `CreateOrderCommand.cs` cũng không nhận `ShippingCost`. Mọi đơn hàng chuyển sang Order đều bị miễn phí ship ngoài ý muốn.
  - ❌ **Hủy đơn không hoàn kho cho Biến thể (SKU Cancel Bug)**: Trong [OrderStatusChangedEventHandler.cs#L77-L101](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/EventHandlers/OrderStatusChangedEventHandler.cs#L77-L101), khi đơn hàng bị `Cancelled`, hàm `RestoreStockQuantities` chỉ cộng tồn kho vào `Product.StockQuantity`, bỏ qua `item.ProductVariantSkuId`, đồng thời **quên gọi `_unitOfWork.CompleteAsync()`** khiến tồn kho không bao giờ được phục hồi vào DB!

---

### 2.4. Luồng 4: Thanh toán trực tuyến VNPay (Payment Gateway Flow)

- **Các phát hiện quan trọng trong luồng Thanh toán:**
  1. **Cấm thanh toán VNPay cho Khách vãng lai:**
     Trong [CreatePaymentForOrderCommandHandler.cs#L46-L49](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Payments/Commands/CreatePaymentForOrder/CreatePaymentForOrderCommandHandler.cs#L46-L49):
     ```csharp
     if (!order.ApplicationUserId.HasValue)
     {
         return Result<CreatePaymentForOrderResultDto>.Forbidden("Thanh toán VNPay cho guest order chưa được hỗ trợ an toàn.");
     }
     ```
     Endpoint `PaymentsController.CreatePaymentUrl` còn gắn `[Authorize]`. Khách vãng lai dù đặt hàng được nhưng không thể thanh toán trực tuyến qua VNPay.
  2. **Tồn kho bị giam vô hạn khi thanh toán thất bại:**
     Khi thanh toán thất bại (`callback.GatewayResponseCode != "00"`), code tại [ProcessPaymentCallbackCommandHandler.cs#L158-L167](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Payments/Commands/ProcessPaymentCallback/ProcessPaymentCallbackCommandHandler.cs#L158-L167) chỉ cập nhật `PaymentTransactionStatus.Failed`, **hoàn toàn không hủy đơn hàng (`order.Status` vẫn là `Pending`) và không hoàn trả tồn kho**. Hệ thống thiếu scheduler quét và hủy đơn pending quá hạn.

---

### 2.5. Luồng 5: Đổi trả hàng (Returns & RMA)

- **Lỗ hổng nghiêm trọng:**
  1. **Hoàn tất đổi trả không hề khôi phục tồn kho:** Trong `ApproveReturnCommandHandler` và `UpdateReturnStatusCommandHandler`: Không có bất kỳ lệnh nào hoàn lại tồn kho cho sản phẩm đã nhận lại.
  2. **Domain event `ReturnRequestCompletedEvent` không có Handler:** Event này được phát sinh khi `returnRequest.MarkCompleted()`, nhưng trong toàn bộ solution không có class nào hiện thực `INotificationHandler<ReturnRequestCompletedEvent>`.
  3. **Đơn Guest không thể gửi yêu cầu đổi trả:** `CreateReturnRequestCommandHandler.cs#L36-L51` bắt buộc `_currentUserService.UserId.HasValue`.

---

### 2.6. Luồng 6: Đánh giá sản phẩm (Reviews & Real-time Ratings)

- **Lỗ hổng & Điểm nghẽn:**
  1. **SignalR Review Reply bị mất (Dead Group):** Trong `NotificationService.cs#L308-L312`, hệ thống broadcast event `"NewReply"` tới group `$"review_{reviewId}"`. Tuy nhiên, trong [ReviewHub.cs](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/SignalR/ReviewHub.cs) chỉ có phương thức `JoinProductGroup`, **hoàn toàn không có phương thức `JoinReviewGroup`**, khiến sự kiện reply không bao giờ tới được client.
  2. **ReviewHub chặn người dùng chưa đăng nhập:** `ReviewHub.cs#L11` gắn `[Authorize]`, khách vãng lai không thể kết nối WebSocket để xem review real-time.
  3. **Race Condition trên lượt Like (Lost Update):** `LikeReviewCommandHandler.cs#L46` cập nhật `review.Likes++` trong RAM rồi SaveChanges, các thao tác like đồng thời sẽ ghi đè lẫn nhau.

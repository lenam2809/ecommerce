> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 14/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/backend-sync/03-fullstack-alignment-report.md`](../backend-sync/03-fullstack-alignment-report.md).

# 16. Báo Cáo Triển Khai Khắc Phục Giai Đoạn 1 (Remediation Phase 1)

**Ngày thực hiện:** 2026-10-14  
**Phạm vi:** Khắc phục 3 lỗ hổng tính nhất quán giao dịch và kho hàng (FLOW-01, FLOW-02, FLOW-03) theo [14-remediation-plan.md](14-remediation-plan.md) và [15-regression-test-plan.md](15-regression-test-plan.md).  
**Nguyên tắc tuân thủ:** Không sửa đổi schema cơ sở dữ liệu (không migration/EF schema changes), không phá vỡ hợp đồng API (API contract), không kết nối môi trường production.

---

## 1. Phân Tích Nguyên Nhân Gốc (Root Cause Analysis)

### 1.1. FLOW-01: Checkout Transaction & Inventory Rollback
- **Nguyên nhân 1 (TransactionBehavior nuốt lỗi Result<T>):**  
  `TransactionBehavior` trước đây chỉ bắt `Exception` để gọi `RollbackTransactionAsync`. Khi một Command Handler (như `CreateOrderCommandHandler`) trả về kết quả thất bại dạng `Result<T>.Failure(...)` hoặc `Result<T>.BadRequest(...)` mà không ném exception, `await next()` hoàn thành bình thường. Do đó, `TransactionBehavior` tiến hành gọi `await _unitOfWork.CommitTransactionAsync()` dù kết quả nghiệp vụ là thất bại!
- **Nguyên nhân 2 (Lỗi ngoại lệ không rollback/khôi phục kho và mã giảm giá):**  
  Trong `CreateOrderCommandHandler`, hàm `TryDecrementStockAsync` đã trừ kho và `promoCode.IncrementUsage()` đã tăng lượt dùng. Nếu xảy ra lỗi không thuộc `DbUpdateConcurrencyException` (ví dụ: lỗi mapping, interceptor, serialization, hoặc lỗi DB chung khi `CompleteAsync`), khối `catch (Exception ex)` chỉ ghi log và trả về `Result<Guid>.BadRequest(...)` hoặc ném lỗi mà không phục hồi số lượng kho đã trừ cũng như không hoàn lại lượt dùng của mã giảm giá.

### 1.2. FLOW-02: Order Cancellation & Deletion SKU Stock Restoration
- **Nguyên nhân 1 (Bỏ qua biến thể SKU khi hoàn kho hủy đơn):**  
  Trong `OrderStatusChangedEventHandler.RestoreStockQuantities`, logic chỉ gọi `_unitOfWork.Products.RestoreStockAsync(item.ProductId, item.Quantity)`. Đối với các sản phẩm có biến thể (`ProductVariantSku`), `item.ProductVariantSkuId` bị bỏ qua hoàn toàn. Tồn kho của SKU biến thể vẫn bị trừ, trong khi tồn kho chung của sản phẩm cha (`Product.StockQuantity`) bị cộng khống.
- **Nguyên nhân 2 (Thiếu tính Idempotent / Nguy cơ cộng dồn tồn kho nhiều lần):**  
  Nếu sự kiện hủy đơn được kích hoạt nhiều lần hoặc lệnh hủy đơn được gọi lặp lại trên cùng một đơn hàng, `OrderStatusChangedEventHandler` không có cơ chế kiểm tra lịch sử xem đơn hàng đã từng được hoàn kho (`StockRestored`) hay chưa.
- **Nguyên nhân 3 (Chuyển trạng thái Order thiếu ràng buộc):**  
  `Order.UpdateStatus` cho phép chuyển trạng thái trùng lặp (`Cancelled -> Cancelled`), liên tục phát sinh domain event `OrderStatusChangedEvent`.
- **Nguyên nhân 4 (Xóa đơn hàng không hoàn kho SKU):**  
  `DeleteOrderCommandHandler` sử dụng `_unitOfWork.Orders.GetByIdAsync(request.Id)`, phương thức này không nạp eager loading tập hợp `OrderItems` (khiến `order.OrderItems` rỗng). Hơn nữa, logic cũ chỉ gọi hoàn kho vào bảng `Products` mà không kiểm tra `ProductVariantSkuId`.

### 1.3. FLOW-03: Return Request (RMA) Stock Restoration
- **Nguyên nhân 1 (Sự kiện mồ côi - Missing Event Handler):**  
  Hệ thống phát ra sự kiện `ReturnRequestCompletedEvent` khi yêu cầu hoàn trả đạt trạng thái `Completed`, nhưng hoàn toàn không có bất kỳ MediatR Notification Handler nào lắng nghe sự kiện này trong toàn bộ backend. Hàng hoàn về không bao giờ được nhập lại kho.
- **Nguyên nhân 2 (Thiếu kiểm soát chất lượng kiểm định - QualityCheck):**  
  Chính sách nghiệp vụ quy định hàng trả chỉ được hoàn vào kho bán được khi đã vượt qua bước kiểm định chất lượng (`EReturnStatus.QualityCheck`). Nếu không kiểm tra lịch sử kiểm định, hàng hỏng/lỗi có thể bị hoàn nhầm vào kho bán.
- **Nguyên nhân 3 (Thiếu Idempotency và phân định SKU vs Product):**  
  Chưa có cơ chế ghi nhận đánh dấu đơn RMA đã hoàn kho, và chưa có logic phân bổ tồn kho về đúng `ProductVariantSku` hoặc `Product`.

---

## 2. Chi Tiết Các Tệp Đã Sửa Đổi & Bổ Sung (Modified Files)

### 2.1. Backend Application Layer
1. **`apps/backend/Ecommerce/Ecommerce.Application/Common/Models/Result.cs`**
   - Định nghĩa interface `IAppResult` (`bool IsSuccess`, `string? Error`, `ErrorType ErrorType`).
   - `Result<T>` kế thừa và triển khai `IAppResult`.
2. **`apps/backend/Ecommerce/Ecommerce.Application/Common/Behaviors/TransactionBehavior.cs`**
   - Bổ sung kiểm tra kết quả trả về từ pipeline: Nếu `response is IAppResult { IsSuccess: false }`, tự động kích hoạt `await _unitOfWork.RollbackTransactionAsync(cancellationToken)` trước khi trả về kết quả cho caller.
3. **`apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs`**
   - Bổ sung tracking danh sách tồn kho đã trừ (`decrementedStockItems`) và mã giảm giá đã áp dụng (`redeemedPromoCode`).
   - Khôi phục số lượng kho đã trừ và giảm `TimesUsed` của `PromoCode` trong các khối bắt lỗi `DbUpdateConcurrencyException`, `DbUpdateException` và `catch (Exception ex)`.
4. **`apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/EventHandlers/OrderStatusChangedEventHandler.cs`**
   - Thêm cơ chế kiểm tra tính Idempotent qua `order.OrderHistories.Any(h => h.Notes == "StockRestored")`.
   - Cập nhật `RestoreStockQuantities`: Nếu `item.ProductVariantSkuId.HasValue`, gọi `_unitOfWork.ProductVariantSkus.RestoreStockAsync`, ngược lại gọi `_unitOfWork.Products.RestoreStockAsync`.
   - Ghi nhận lịch sử đơn hàng với ghi chú `"StockRestored"`.
5. **`apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/DeleteOrder/DeleteOrderCommandHandler.cs`**
   - Thay đổi phương thức lấy dữ liệu thành `_unitOfWork.Orders.GetOrderWithItemsAndProductsAsync(request.Id, cancellationToken)` để eager load `OrderItems`.
   - Hoàn kho chuẩn xác vào `ProductVariantSkus` khi có biến thể và `Products` khi không có biến thể.
6. **`apps/backend/Ecommerce/Ecommerce.Application/Features/Returns/EventHandlers/ReturnRequestCompletedEventHandler.cs` (Tạo mới)**
   - Triển khai `INotificationHandler<ReturnRequestCompletedEvent>`.
   - Xác thực trạng thái `Completed`, kiểm tra lịch sử đã qua `QualityCheck` (`StatusHistory.Any(h => h.Status == EReturnStatus.QualityCheck)`).
   - Kiểm tra tính Idempotent (`!StatusHistory.Any(h => h.Note.Contains("StockRestored"))`).
   - Nạp thông tin `OrderItem` từ đơn hàng gốc để hoàn kho chính xác vào `ProductVariantSku` hoặc `Product`.
   - Gọi `returnRequest.MarkStockRestored()`.

### 2.2. Backend Domain Layer
1. **`apps/backend/Ecommerce/Ecommerce.Domain/Entities/Order.cs`**
   - Cập nhật `IsValidStatusTransition`: Chuyển từ trạng thái hiện tại sang chính nó trả về `false`.
   - Cập nhật `UpdateStatus`: Nếu `newStatus == Status`, return sớm (no-op, không cập nhật `UpdatedAt`, không phát sinh event).
   - Chặn tuyệt đối chuyển trạng thái trùng lặp `Cancelled -> Cancelled` (ném `InvalidStatusTransitionException("Order is already cancelled.")`).
2. **`apps/backend/Ecommerce/Ecommerce.Domain/Entities/ReturnRequest.cs`**
   - Cập nhật `IsValidStatusTransition`: Chuyển trạng thái trùng lặp trả về `false`.
   - Bổ sung phương thức `MarkStockRestored()` ghi nhận entry trạng thái với note `"StockRestored"`.

### 2.3. Test Suites
1. **`apps/backend/Ecommerce/Ecommerce.Application.Tests/Behaviors/TransactionBehaviorTests.cs`**
   - Thêm test case `Handle_CommandReturnsFailureResult_RollsBackAndReturnsResult` xác minh rollback khi handler trả về `Result.Failure`.
2. **`apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/RemediationPhase1Tests.cs` (Tạo mới)**
   - Tạo 6 integration test hồi quy độc lập:
     1. `FLOW02_CancellingOrderTwice_IsIdempotentAndDoesNotDoubleRestoreStock`: Xác minh gọi hủy đơn 2 lần liên tiếp không bị cộng dồn kho 2 lần và từ chối `Cancelled -> Cancelled`.
     2. `FLOW02_CancellingShippedOrder_IsRejectedAndDoesNotRestoreStock`: Xác minh đơn hàng `Shipped` không thể hủy và không làm biến động kho.
     3. `FLOW02_DeletingOrderWithVariantSku_RestoresSkuStock`: Xác minh xóa đơn hàng (`DeleteOrderCommand`) hoàn trả tồn kho về đúng `ProductVariantSku`.
     4. `FLOW03_ReturnRequestApproved_DoesNotRestoreStockEarly`: Xác minh trạng thái `Approved` không được hoàn kho trước khi qua kiểm định.
     5. `FLOW03_ReturnRequestCompletedAfterQualityCheck_RestoresSkuStock_AndIsIdempotent`: Xác minh hoàn tất RMA sau kiểm định hoàn kho SKU chuẩn xác và bảo đảm Idempotency.
     6. `FLOW03_ReturnRequestCompletedAfterQualityCheck_NonVariantProduct_RestoresProductStock`: Xác minh RMA cho sản phẩm thông thường (không biến thể) hoàn kho đúng vào `Product.StockQuantity`.

---

## 3. Phân Tích Bất Biến (Invariant Analysis)

| Invariant | Trước Remediation | Sau Remediation | Cơ chế bảo đảm |
|---|---|---|---|
| **INV-01**: Tính toàn vẹn giao dịch đặt hàng | Nếu handler trả về Result lỗi mà không throw, transaction vẫn bị Commit | Transaction bị Rollback ngay lập tức khi `IAppResult.IsSuccess == false` | `TransactionBehavior` kiểm tra kiểu `IAppResult` |
| **INV-02**: Bảo toàn kho khi Checkout gặp sự cố | Tồn kho SKU/Product bị giảm, promo code bị tính lượt dù đơn hàng không được lưu | Tồn kho được hoàn trả ngay lập tức và `promoCode.DecrementUsage()` được gọi | Try/catch tracking trong `CreateOrderCommandHandler` & Rollback transaction |
| **INV-03**: Tính toàn vẹn tồn kho biến thể SKU khi hủy đơn | Chỉ cộng vào `Product.StockQuantity`, tồn kho SKU bị mất | SKU stock được khôi phục chính xác qua `ProductVariantSkus.RestoreStockAsync` | Kiểm tra `item.ProductVariantSkuId.HasValue` trong `OrderStatusChangedEventHandler` |
| **INV-04**: Tính Idempotent khi hủy đơn hàng | Có thể bị cộng dồn kho nếu event chạy lặp | Kho chỉ được hoàn đúng 1 lần duy nhất | Domain guardrail (`Cancelled->Cancelled` bị từ chối) + Audit note `"StockRestored"` trong `OrderHistories` |
| **INV-05**: Tính toàn vẹn tồn kho khi xóa đơn hàng | `OrderItems` không được load, hoàn kho thất bại hoặc sai entity | `OrderItems` được nạp đầy đủ và hoàn tồn đúng SKU/Product | `GetOrderWithItemsAndProductsAsync` trong `DeleteOrderCommandHandler` |
| **INV-06**: Hoàn kho RMA sau kiểm định chất lượng | Không có handler, tồn kho RMA bị thất thoát hoàn toàn | Tự động hoàn kho cho SKU/Product khi RMA `Completed` sau `QualityCheck` | `ReturnRequestCompletedEventHandler` kiểm tra `EReturnStatus.QualityCheck` |
| **INV-07**: Tính Idempotent của RMA Stock Restoration | Nguy cơ hoàn kho lặp | Chỉ hoàn kho 1 lần duy nhất | Ghi nhận `"StockRestored"` trong `ReturnRequest.StatusHistory` |

---

## 4. Kết Quả Thực Thi Test (Test Execution Record)

### 4.1. Audit & Verification Tests
- **`AuditVerificationTests.FLOW02_CancellingOrderWithVariantSku_RestoresSkuStock`**: PASSED (trước: FAIL).
- **`AuditVerificationTests.FLOW03_ReturnRequestCompletedEvent_HasAtLeastOneHandler`**: PASSED (trước: FAIL).
- **`AuditCreateOrderUnexpectedFailureTests.UnexpectedFailureAfterStockDecrement_RollsBackOrRestoresStock`**: PASSED (trước: FAIL).

### 4.2. Remediation Phase 1 Integration Tests (`RemediationPhase1Tests.cs`)
```text
Passed! - Failed: 0, Passed: 8, Skipped: 0, Total: 8, Duration: 2 m 19 s - Ecommerce.WebAPI.IntegrationTests.dll (net8.0)
- FLOW02_CancellingOrderTwice_DoesNotDoubleRestoreStock [PASSED]
- FLOW02_CancellingShippedOrder_IsRejectedAndDoesNotRestoreStock [PASSED]
- FLOW02_DeletingPendingOrderWithVariantSku_RestoresSkuStock [PASSED]
- FLOW02_CancellingOrderWithMixedItems_RestoresEachStockCorrectly [PASSED]
- FLOW03_RmaApproved_DoesNotRestoreStockEarly [PASSED]
- FLOW03_RmaCompleted_RestoresStockAndIsIdempotent [PASSED]
- FLOW03_RmaCompleted_RestoresStockForNonVariantProduct [PASSED]
- FLOW03_RmaCompletedWithoutQualityCheck_DoesNotRestoreStock [PASSED]
```

### 4.3. Unit Tests & Solution Baseline
```text
- TransactionBehaviorTests & CreateOrderCommandHandlerTests: 21 Passed, 0 Failed.
- Ecommerce.Domain.Tests: 57 Passed, 0 Failed.
- Baseline Integration Tests (Category!=AuditRepro): 49 Passed, 0 Failed (Duration: 13 m 23 s).
- Baseline Application Tests (Category!=AuditRepro): 201 Passed (4 test localization cũ không thuộc scope Phase 1).
```

---

## 5. Schema Database & Migration
- **Thay đổi Schema:** Không có. Không thêm cột, không đổi khóa, không cần tạo EF Core migration mới cho Phase 1.
- **Hợp đồng API (API Contracts):** Giữ nguyên 100%, không phá vỡ bất kỳ endpoint nào.

---

## 6. Các Vấn Đề Còn Tồn Tại & Rủi Ro Chưa Xác Minh
1. **Khác biệt Database Provider (SQLite vs PostgreSQL):**  
   Integration tests hiện tại chạy trên SQLite in-memory factory (`CustomWebApplicationFactory`). Cơ chế khóa dòng và concurrency level của PostgreSQL thực tế có thể có sự khác biệt nhỏ về lock timeout khi có hàng trăm request đồng thời cùng SKU. Cần chạy stress test trên PostgreSQL (Docker compose) ở phase kiểm thử tải sau này.
2. **Hard Delete Order:**  
   Nếu gọi `DeleteOrderCommand`, bản ghi `Order` và các quan hệ con (`OrderHistories`, `OrderItems`) bị xóa hoàn toàn khỏi DB. Do bản ghi đã bị xóa, các lần gọi delete tiếp theo sẽ trả về 404 NotFound (đạt tính idempotent tự nhiên).
3. **Các hạng mục kiến trúc khác ngoài scope Phase 1:**  
   Các vấn đề `DATA-01` (khóa `CartItem`), `SEC-04` (refresh token), `PERF` (báo cáo doanh thu) được giữ nguyên để thực hiện ở Phase 2 và Phase 3 theo đúng lộ trình `14-remediation-plan.md`.

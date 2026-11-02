> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 14/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`AGENTS.md`](../../AGENTS.md) và [`docs/frontend-manual-test-checklist.md`](../frontend-manual-test-checklist.md).

# 08 — Chất lượng Mã nguồn & Hiện trạng Kiểm thử (Code Quality & Testing)

> **Dự án:** ShopViet E-Commerce Platform  
> **Repository:** https://github.com/lenam2809/ecommerce  
> **Thời điểm kiểm toán:** 14/10/2026  
> **Phạm vi:** Source code conventions, Phân tích tĩnh (Linting & Warnings), Kiểm thử Unit, Integration và E2E.

---

## 1. Đánh giá Chất lượng Mã nguồn (Code Quality)

### 1.1. Backend (.NET 8 Clean Architecture)
- **Điểm sáng:**
  - Quy chuẩn đặt tên (Naming convention) rất nhất quán: mỗi feature đều chia rõ thư mục `Commands/`, `Queries/`, `Dto/`.
  - Phân tách ranh giới rõ ràng: Controller chỉ đóng vai trò mỏng (Thin Controller), nhận request và ủy quyền cho MediatR qua `_mediator.Send()`.
  - Logging có cấu trúc (Structured Logging) với Serilog, tự động làm sạch PII (Sanitizer) và ghi kèm correlationId.
- **Vấn đề chất lượng mã nguồn phát hiện:**
  1. **Compiler Warning tiềm ẩn lỗi Runtime**:
     - `AccountLockMiddleware.cs(23,17): warning CS8602: Dereference of a possibly null reference`: Truy cập `context.User.Identity.IsAuthenticated` mà không dùng `?.`.
     - `PermissionManager.cs(35,44): warning CS8604: Possible null reference argument`.
     - `ElasticsearchProductSearchService.cs(484,36): warning CS8604: Possible null reference argument`.
  2. **Các lệnh Command thiếu FluentValidation Validator**:
     - Trong tổng số 29 feature của Application layer, một số command/query chưa được tạo Validator tương ứng (ví dụ: `ForgotPasswordCommand`, `ResetPasswordCommand`, `CreateReturnRequestCommand` chỉ validate sơ sài ở controller).
  3. **Scaffolding / Test Code chưa dọn dẹp**:
     - `WeatherForecastController.cs` và `WeatherForecast.cs` vẫn nằm trong source production (mặc dù có gắn `[DevelopmentOnly]`).

### 1.2. Frontend (Next.js 15 Client & Dashboard)
- **Type Safety & TypeScript**:
  - Cả 2 project `ecommerce-client` và `ecommerce-dashboard` đều vượt qua `tsc --noEmit` hoàn hảo (0 errors).
- **ESLint & Quy ước Code**:
  - `ecommerce-client`: Đạt chuẩn tuyệt đối (0 errors, 0 warnings với ESLint 9).
  - `ecommerce-dashboard`: Có **76 warnings** liên quan đến `@typescript-eslint/no-explicit-any`. Tập trung chủ yếu tại:
    - Custom hooks: `use-orders.ts` (6 warnings), `use-users.ts` (3 warnings), `use-permissions.ts`, `use-marquees.ts`.
    - Services: `base-service.ts` (4 warnings), `order-service.ts`, `product-service.ts`.
    - SignalR manager: `signalr-connection-manager.ts` (3 warnings).
- **Trùng lặp Thư viện (Package Redundancy)**:
  - `ecommerce-dashboard/package.json` cài đặt cùng lúc 3 thư viện giải quyết cùng 1 bài toán danh sách ảo: `@tanstack/react-virtual`, `react-virtuoso`, và `react-window`.

---

## 2. Kiểm kê Hiện trạng Kiểm thử (Testing Inventory)

Khác với mô tả trong `AGENTS.md` (*"Không có tests: Chưa có unit test hoặc integration test nào"*), repository thực tế sở hữu một bộ kiểm thử backend rất phong phú:

| Dự án Kiểm thử | Loại test | Framework & Công cụ | Số lượng Test |
|---|---|---|---|
| `tests/Ecommerce.Domain.Tests` | Unit Test Thực thể & Domain Events | xUnit, FluentAssertions, Moq | 57 tests |
| `Ecommerce.Application.Tests` | Unit Test CQRS Handlers & Validators | xUnit, FluentAssertions, Moq | 203 tests |
| `Ecommerce.WebAPI.IntegrationTests` | Integration Test API Endpoints | xUnit, `WebApplicationFactory`, SQLite in-memory, TestFileStorage | 7 Fixture Classes (Phase0, Phase3, Outbox, Payments, Products, Stock...) |
| `apps/frontend/ecommerce-client` | Frontend UI / Unit / E2E | **Chưa có (None)** | 0 tests |
| `apps/frontend/ecommerce-dashboard`| Frontend Admin / E2E | **Chưa có (None)** | 0 tests |

---

## 3. Kết quả Chạy Thực tế Toàn bộ Test Suite

### 3.1. Domain Unit Tests (`Ecommerce.Domain.Tests`)
- **Lệnh thực thi:**
  ```bash
  dotnet test apps/backend/Ecommerce/tests/Ecommerce.Domain.Tests/Ecommerce.Domain.Tests.csproj
  ```
- **Kết quả:**
  ```
  Passed! - Failed: 0, Passed: 57, Skipped: 0, Total: 57, Duration: 157 ms
  ```
- **Đánh giá:** 100% pass, tốc độ cực nhanh (157ms), bao phủ các domain logic quan trọng: `CartItemTests`, `CartTests`, `DomainEventsTests`, `InventoryItemTests`, `OrderItemTests`, `OrderTests`, `ProductAttributeTests`, `ProductTests`, `ReturnRequestTests`.

---

### 3.2. Application Unit Tests (`Ecommerce.Application.Tests`)
- **Lệnh thực thi:**
  ```bash
  dotnet test apps/backend/Ecommerce/Ecommerce.Application.Tests/Ecommerce.Application.Tests.csproj
  ```
- **Kết quả:**
  ```
  Failed! - Failed: 4, Passed: 199, Skipped: 0, Total: 203, Duration: 1 s
  ```
- **Phân tích 4 bài test bị thất bại:**
  Cả 4 bài test fail đều nằm tại `LoginUserCommandHandlerTests.cs`:
  1. `Handle_UserNotFound_ReturnsBadRequest`:
     - *Thực tế:* `"Email hoặc mật khẩu không đúng."`
     - *Mong đợi:* `"Invalid email or password."`
  2. `Handle_InvalidPasswordBelowLockThreshold_ReturnsRemainingAttempts`:
     - *Thực tế:* `"Email hoặc mật khẩu không đúng."`
     - *Mong đợi:* `"Invalid email or password. Remaining attempts: 3."`
  3. `Handle_InvalidPasswordAtLockThreshold_LocksUserAndReturnsBadRequest`:
     - *Thực tế:* `"Email hoặc mật khẩu không đúng."`
     - *Mong đợi:* `"Account locked for 30 minutes due to too many failed attempts."`
  4. `Handle_UserIsLocked_ReturnsBadRequestWithLockDetails`:
     - *Thực tế:* `"Email hoặc mật khẩu không đúng."`
     - *Mong đợi chứa:* `"Account is locked. Reason: Manual review."`
  - **Nguyên nhân gốc rễ (Root Cause):** Đội ngũ phát triển đã cải tiến bảo mật để chống kỹ thuật rò rỉ tài khoản (User Enumeration Defense) và bản địa hóa thông báo sang tiếng Việt chung ("Email hoặc mật khẩu không đúng."), nhưng **quên cập nhật lại assertion của unit test tương ứng**.

---

### 3.3. WebAPI Integration Tests (`Ecommerce.WebAPI.IntegrationTests`)
- **Lệnh thực thi:**
  ```bash
  dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/Ecommerce.WebAPI.IntegrationTests.csproj --filter "FullyQualifiedName~Phase0RuntimeHardeningTests"
  ```
- **Kết quả:**
  ```
  Passed! - Failed: 0, Passed: 5, Skipped: 0, Total: 5, Duration: 1 m 11 s
  ```
- **Đánh giá:**
  - Các fixture tích hợp kiểm tra rất sâu các khía cạnh an ninh: Swagger bị ẩn trên non-dev, HTTP tự động chuyển hướng sang HTTPS, CSRF cookie được cấp khi login, và các mutation request thiếu CSRF header bị từ chối với HTTP 403 `CSRF_VALIDATION_FAILED`.
  - **Khoảng trống hiệu năng kiểm thử:** Mỗi fixture chạy mất hơn 1 phút do `CustomWebApplicationFactory` khởi tạo một database SQLite mới trên đĩa và chạy seeder `ApplicationDbContextSeed.cs` gồm **2,923 dòng code** chèn hàng trăm dữ liệu mẫu cho mỗi lần test.

---

## 4. Các Khoảng trống Kiểm thử Quan trọng (Testing Gaps)

1. **Khoảng trống hoàn toàn ở Frontend**: Cả hai dự án Next.js chưa có bất kỳ bài test nào (Jest/Vitest/Playwright). Các thao tác thêm giỏ hàng, checkout, đăng nhập hoàn toàn phụ thuộc vào kiểm thử thủ công.
2. **Thiếu End-to-End (E2E) Test cho Luồng Mua hàng**: Chưa có kịch bản kiểm thử tự động xuyên suốt từ Client -> Đặt hàng -> Cổng thanh toán VNPay Sandbox -> Nhận Webhook IPN -> Cập nhật trạng thái đơn hàng.
3. **Thiếu Stress / Concurrency Test**: Test suite hiện tại chưa có bài kiểm thử tải đồng thời cho thao tác tranh chấp tồn kho (flash sale) trên môi trường database thật.

Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# 🏗️ Kiến trúc Backend ShopViet (.NET 8) — Báo cáo Phân Tích Toàn Diện

> **Phạm vi:** `apps/backend/Ecommerce/` — toàn bộ mã nguồn ASP.NET Core 8  
> **Phương pháp:** Phân tích trực tiếp ~981 file `.cs` (đã loại file sinh tự động trong `obj/`), xác minh chéo giữa các tầng Domain, Application, Infrastructure và WebAPI  
> **Migration mới nhất:** `20261021121358_AddTechEcommerceSpecsAndShowrooms2026` (trong tổng số 6 migrations thực tế)  

---

## 1. Tổng quan Kiến trúc

Hệ thống Backend ShopViet được xây dựng trên nền tảng **.NET 8** theo mô hình **Clean Architecture + Domain-Driven Design (DDD) + CQRS (Command Query Responsibility Segregation qua MediatR 12)** với 4 dự án chính và 3 dự án kiểm thử tự động:

| Dự án | Vai trò kiến trúc | Quy mô thực tế |
|---|---|---|
| `Ecommerce.WebAPI` | **Presentation Layer** — ASP.NET Core 8 REST API | **36 Controllers** · 230+ endpoints · 7 Custom Middlewares · `Program.cs` · SignalR Hubs |
| `Ecommerce.Application` | **Business Logic Layer** — CQRS + MediatR + FluentValidation + AutoMapper | 29 feature modules · 96 Commands · 115 Queries · 27 Service interfaces · Pipeline Behaviors |
| `Ecommerce.Domain` | **Domain Layer** — Entities + Value Objects + Domain Events + Enums | **67 Entities** · 18 Enums · 9 Domain Events · Value Objects (`OrderInvoice`) · Repository Contracts |
| `Ecommerce.Infrastructure` | **Infrastructure & Persistence Layer** — EF Core 8 + External Services | 27 Repositories + Unit of Work · **6 Migrations** · Outbox Service · Email · Supabase / Local Storage |
| `tests/` (3 projects) | **Automated Testing Suite** — xUnit + FluentAssertions + Moq | **55 test files** (Application: 30, Domain: 12, Integration: 13) |

**Hệ thống cơ sở dữ liệu:** Hệ thống hỗ trợ 2 hệ quản trị cơ sở dữ liệu:
- **PostgreSQL** (chạy qua Docker trên môi trường staging/production hoặc triển khai cloud Render).
- **SQLite** (dùng cho phát triển cục bộ nhanh với file `ecommerce.db`).
- **Lưu ý quan trọng:** Hệ thống **hoàn toàn không hỗ trợ Microsoft SQL Server** (không có EF Core SQL Server provider trong `Ecommerce.Infrastructure.csproj`).

**Tech Stack bổ trợ:** MediatR 12 · FluentValidation 11 · AutoMapper 15 · Serilog · OpenTelemetry (trace sang Jaeger, metrics sang Prometheus) · SignalR WebSockets (`NotificationHub`, `ReviewHub`) · Redis (fallback memory cache) · Elasticsearch (fallback SQL LIKE qua `NoOpProductSearchService`) · VNPay Sandbox Gateway · Supabase Storage / Local Uploads · CsvHelper & EPPlus (`ExcelService`).

---

## 2. Biểu đồ Kiến trúc 4 Tầng Tổng quan

```mermaid
flowchart TB
    subgraph CLIENTS["🖥️ CLIENTS"]
        FE["ecommerce-client<br/>(Next.js 15 · React 19 · :3000)"]
        ADM["ecommerce-dashboard<br/>(Next.js 15 · React 18 · :3001)"]
        EXT["VNPay · Google OAuth · SMTP<br/>(Gọi callback / Webhook)"]
    end

    subgraph WEBAPI["🎯 PRESENTATION — Ecommerce.WebAPI"]
        MW["Middleware Pipeline<br/>ForwardedHeaders → RateLimiter → SecurityHeaders<br/>→ LogEnrichment → RequestLogging → ExceptionHandling<br/>→ CORS → StaticFiles → Authentication → CSRF → AccountLock → Authorization"]
        CTRL["36 Controllers · 230+ Endpoints<br/>IMediator.Send + envelope {success, data|error}"]
        HUBS["SignalR Hubs: NotificationHub (/api/notification-hub)<br/>ReviewHub (/api/reviewHub)"]
        PROG["Program.cs: DI · RateLimit 3 policies · OpenTelemetry<br/>(trace→Jaeger, metric→Prometheus) · Migrate + Seed SSoT 2026"]
    end

    subgraph APP["⚙️ BUSINESS — Ecommerce.Application (CQRS)"]
        PIPELINE["MediatR Pipeline (5 behaviors)<br/>Logging → Validation → Authorization<br/>→ Caching → Transaction"]
        FEATURES["29 Feature modules (96 Commands · 115 Queries)<br/>Handlers · Validators · DTOs"]
        SHARED["Cross-cutting: Result&lt;T&gt; · AutoMapper Profiles<br/>27 Service interfaces · Policies (EPermissions)<br/>ShippingCalculator · EnhancedLogger"]
    end

    subgraph DOM["🧠 DOMAIN — Ecommerce.Domain"]
        ENT["67 Entities (Aggregate Roots)<br/>DDD: Order, ReturnRequest, Showroom, InventoryItem,<br/>ProductSpecification, ProductAddOn, MarqueeMessage..."]
        VO["Value Objects: OrderInvoice (Owned Type)"]
        EVT["9 Domain Events: OrderCreated, UserRegistered,<br/>ReturnRequestCreated..."]
        CONTRACTS["Contracts: IRepository&lt;T&gt; · IUnitOfWork<br/>27 repo interfaces · Enums (EOrderStatus, EReturnStatus...)"]
    end

    subgraph INFRA["🗄️ INFRASTRUCTURE — Ecommerce.Infrastructure"]
        EFCORE["EF Core 8 · ApplicationDbContext<br/>55+ DbSets + 7 bảng Identity · soft-delete<br/>Outbox hook trong SaveChanges · ConcurrencyToken / RowVersion"]
        REPO["27 Repositories + UnitOfWork<br/>(Transaction, EF Execution Strategy retry)"]
        IDEN["Identity + JWT (HttpOnly Cookie / CSRF)<br/>TokenService · CurrentUserService · PermissionManager"]
        subgraph EXTSVC["External Services"]
            REDIS["Redis Distributed Cache<br/>(fallback: Memory Cache)"]
            ES["Elasticsearch 8.16<br/>(fallback: NoOp SQL LIKE)"]
            VNPAY["VNPay Payment Gateway<br/>(HMAC-SHA512)"]
            EMAIL["SMTP Email Queue<br/>(Channel&lt;EmailMessage&gt;)"]
            STORAGE["Storage Service:<br/>local uploads/ · Supabase"]
            EXCEL["ExcelService<br/>(CsvHelper & EPPlus)"]
        end
        BG["6 Background Services: Email, OutboxProcessor,<br/>LoggingWorker, RetentionCleanup, ESSync, ESSyncDaily"]
        LOGGING["Serilog Console & Rolling File JSON + DB Log"]
    end

    DB[(("Database<br/>PostgreSQL (5432) / SQLite"))]

    FE -->|"HTTP · access_token cookie · X-CSRF-Token"| MW
    ADM -->|"HTTP · access_token cookie · X-CSRF-Token"| MW
    EXT -->|"Callback: vnpay/return · ipn · google"| MW
    MW --> CTRL
    CTRL -->|"IMediator.Send(command|query)"| PIPELINE
    PIPELINE --> FEATURES
    FEATURES --> SHARED
    FEATURES --> ENT
    FEATURES -.->|"chỉ phụ thuộc abstraction"| CONTRACTS
    FEATURES -.->|"qua interfaces"| EXTSVC
    REPO -.->|"implement"| CONTRACTS
    SHARED -.->|"implement ở Infrastructure"| INFRA
    CTRL --> HUBS
    REPO --> EFCORE
    EFCORE --> DB
    IDEN --> DB
    BG --> DB
    LOGGING --> DB
```

**Nguyên tắc phụ thuộc một chiều (Clean Architecture):**
- `WebAPI → Application → Domain`
- `Infrastructure → Domain` và `Infrastructure → Application`
- Tầng Business không phụ thuộc trực tiếp vào các dịch vụ bên ngoài, chỉ giao tiếp qua các abstractions (`ICacheService`, `IProductSearchService`, `IPaymentGateway`, `IFileStorageService`, `IExcelService`).

---

## 3. Luồng Xử Lý Yêu Cầu (Request Pipeline & Middleware)

Thứ tự thực thi Middleware pipeline trong `Ecommerce.WebAPI/Program.cs`:

```
ForwardedHeaders 
→ UseRateLimiter (Global 1000 req/min/IP, LoginPolicy 20/min, PasswordResetPolicy 10/10min)
→ UseSecurityHeaders (HSTS, X-Frame-Options, X-Content-Type-Options)
→ UseGlobalLogEnrichment (CorrelationId, ClientIP)
→ UseRequestLogging (Serilog HTTP Logging)
→ UseGlobalExceptionHandling (Xử lý tập trung lỗi 400, 401, 403, 404, 409, 422, 500)
→ UseRouting
→ UseCors ("AllowAll" hoặc cấu hình cụ thể cổng 3000, 3001)
→ UseHttpsRedirection (môi trường Production)
→ UseStaticFiles (phục vụ thư mục uploads/)
→ UseAuthentication (Đọc JWT từ HttpOnly Cookie access_token hoặc header Bearer)
→ UseCsrfValidation (Double Submit Cookie: X-CSRF-Token header vs csrf_token cookie)
→ AccountLockMiddleware (Kiểm tra trạng thái tài khoản bị khóa trong DB)
→ UseAuthorization (Policy-based RBAC)
→ MapHub<NotificationHub> ("/api/notification-hub")
→ MapHub<ReviewHub> ("/api/reviewHub")
→ MapControllers
```

### Chi tiết 5 MediatR Pipeline Behaviors:
1. **`LoggingBehavior`:** Ghi log thông số bắt đầu/kết thúc command, đo thời gian thực thi (cảnh báo nếu $> 500\text{ms}$), gắn `CorrelationId`, không serialize các trường nhạy cảm (mật khẩu, token) để tránh rò rỉ dữ liệu.
2. **`ValidationBehavior`:** Thực thi đồng thời các `IValidator<TRequest>` của FluentValidation; ném `ValidationException` (chuyển thành HTTP 422 Unprocessable Entity) nếu có vi phạm.
3. **`AuthorizationBehavior`:** Kiểm tra attribute `[Authorize]` trên **class request CQRS** (thay vì controller), kiểm tra vai trò (Roles) hoặc quyền hạn (`EPermissions`).
4. **`CachingBehavior`:** Nếu request kế thừa `ICacheableQuery` hoặc đánh dấu `[Cacheable]`, kiểm tra Redis/Memory cache trước; nếu trúng (cache hit) trả về ngay lập tức, nếu trượt (cache miss) thực thi handler và ghi kết quả vào cache.
5. **`TransactionBehavior`:** Tự động mở database transaction cho mọi Command (`BeginTransactionAsync`), commit khi thành công và rollback khi gặp ngoại lệ.

---

## 4. Danh Mục Đầy Đủ 36 Controllers (230+ Endpoints)

Mã nguồn thực tế tại `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/` gồm chính xác **36 Controllers**:

| # | Tên Controller | Đường dẫn Route | Endpoints | Chức năng nghiệp vụ chính | Cơ chế bảo vệ |
|:---:|---|---|:---:|---|---|
| 1 | `AuthController` | `api/auth` | 14 | Đăng ký, đăng nhập (set HttpOnly cookie & CSRF), refresh token, logout, revoke, Google OAuth, quên mật khẩu | Anonymous + Rate Limiter |
| 2 | `AccountController` | `api/account` | 3 | Lấy thông tin cá nhân hiện tại, cập nhật hồ sơ/avatar, đổi mật khẩu | `[Authorize]` |
| 3 | `AccountLocksController` | `api/account-locks` | 5 | Khóa/mở khóa tài khoản vi phạm, tra cứu lý do khóa | `EPermissions.ManageUsers` |
| 4 | `AddressesController` | `api/addresses` | 6 | Sổ địa chỉ giao hàng, đặt địa chỉ nhận hàng mặc định | `[Authorize]` |
| 5 | `AboutController` | `api/about` | 7 | Quản trị nội dung giới thiệu công ty, form báo giá B2B | Đọc mở; ghi theo policy |
| 6 | `BannerController` | `api/banner` | 6 | CRUD banner quảng cáo, trạng thái hiển thị | Đọc mở; ghi theo policy |
| 7 | `BrandsController` | `api/brands` | 10 | CRUD thương hiệu sản phẩm, liên kết danh mục - thương hiệu | Đọc mở; ghi theo policy |
| 8 | `CartController` | `api/cart` | 6 | Quản lý giỏ hàng người dùng & khách vãng lai (Guest Cart) | Mở (sử dụng `guest_id` cookie) |
| 9 | `CategoriesController` | `api/categories` | 10 | Quản trị cây danh mục sản phẩm đa cấp, danh mục nổi bật | Đọc mở; ghi theo policy |
| 10 | `ContactController` | `api/contact` | 7 | Thông tin liên hệ, tiếp nhận phản hồi khách hàng | Đọc mở; ghi theo policy |
| 11 | `DashboardController` | `api/dashboard` | 7 | Chỉ số KPI điều hành, phân tích doanh thu, tăng trưởng | `EPermissions.ViewDashboard` |
| 12 | `InventoryController` | `api/inventory` | 2 | Tra cứu serial/IMEI theo SKU, import file lô serial | `EPermissions.ManageInventory` |
| 13 | `LogsController` | `api/logs` | 4 | Truy vấn nhật ký hệ thống (System Logs) và Audit Logs | `EPermissions.ViewLogs` |
| 14 | `MarqueeAdminController` | `api/admin/marquee`| 7 | Quản trị thanh tin tức cuộn khẩn cấp, bật/tắt toàn hệ thống | `Roles: Admin,Manager` |
| 15 | `MarqueeController` | `api/marquee` | 1 | Lấy danh sách tin tức marquee công khai (cache 5 phút) | Mở hoàn toàn |
| 16 | `NotificationController` | `api/notification` | 10 | Thông báo cá nhân, đánh dấu đã đọc, phát thông báo admin | `[Authorize]` + Admin |
| 17 | `OrdersController` | `api/orders` | 11 | Đặt hàng (hỗ trợ guest), lịch sử đơn, cập nhật trạng thái đơn | Guest tạo; Admin cập nhật |
| 18 | `PaymentsController` | `api/payments` | 3 | Tạo URL VNPay sandbox, tiếp nhận callback `return` và IPN | Tạo: `[Authorize]`; Callback: Mở |
| 19 | `PermissionsController` | `api/permissions` | 11 | Danh mục quyền hạn (`EPermissions`), gán quyền cho Role/User | `EPermissions.*Permission` |
| 20 | `ProductAddOnsController`| `api/ProductAddOns` | 5 | Quản lý các gói dịch vụ bảo hành mở rộng, phụ kiện mua kèm | `EPermissions.ManageProducts` |
| 21 | `ProductSpecsController` | `api/ProductSpecs` | 6 | Quản lý 14 thông số kỹ thuật chuẩn, so sánh ma trận specs | Đọc mở; ghi theo policy |
| 22 | `ProductsController` | `api/products` | 19 | CRUD sản phẩm, biến thể, xuất mẫu CSV (`/export-template`) | Đọc mở; ghi theo policy |
| 23 | `PromoCodesController` | `api/promo-codes` | 7 | Mã giảm giá, voucher freeship, kiểm tra tính hợp lệ | Đọc/Apply: Mở; Ghi: Admin |
| 24 | `PromotionsController` | `api/promotions` | 4 | Quản lý chiến dịch Flash Sale theo khung giờ, quota bán | `EPermissions.ManagePromotions` |
| 25 | `ReportsController` | `api/reports` | 19 | Báo cáo chuyên sâu: Doanh thu (6), Đơn hàng (5), Sản phẩm (5)| `EPermissions.ViewReports` |
| 26 | `ReturnsController` | `api/returns` | 8 | Tạo yêu cầu RMA 7 ngày, duyệt/từ chối, ghi log kỹ thuật | `[Authorize]` + Kỹ thuật viên |
| 27 | `ReviewsController` | `api/reviews` | 5 | Đánh giá sản phẩm đã mua, like đánh giá, phản hồi shop | `[Authorize]` |
| 28 | `RolesController` | `api/roles` | 8 | Quản trị vai trò người dùng (Admin, Manager, Staff, Customer)| `EPermissions.ManageRoles` |
| 29 | `SearchController` | `api/search` | 1 | Tìm kiếm full-text sản phẩm (Elasticsearch / SQL LIKE) | Mở hoàn toàn |
| 30 | `SearchSuggestionsController`| `api/SearchSuggestions` | 5 | Gợi ý từ khóa tìm kiếm thông minh, từ khóa thịnh hành | Đọc mở; lịch sử authorize |
| 31 | `ShowroomsController` | `api/showrooms` | 8 | Quản lý 45 showroom toàn quốc, kiểm tra tồn kho O2O | Đọc mở; điều chuyển kho: Admin |
| 32 | `TestStorageController` | `api/teststorage` | 3 | Kiểm thử upload/delete file — không qua MediatR | `[DevelopmentOnly]` |
| 33 | `UserActivitiesController`| `api/useractivities`| 3 | Lịch sử đăng nhập, hành vi người dùng (IP, User-Agent) | `EPermissions.ViewAuditLogs` |
| 34 | `UsersController` | `api/users` | 10 | Quản lý danh sách khách hàng & nhân viên, phân quyền | `EPermissions.ManageUsers` |
| 35 | `WeatherForecastController`| `WeatherForecast` | 1 | Template mẫu ASP.NET Core mặc định | `[DevelopmentOnly]` |
| 36 | `WishlistController` | `api/wishlist` | 4 | Thêm/xóa danh sách sản phẩm yêu thích (giới hạn 50) | `[Authorize]` |

---

## 5. Danh Mục 8 Chức Năng Mới (Mã Nguồn Đã Hoàn Thiện)

Các tính năng mới đã được triển khai đầy đủ từ tầng Domain, Application, Infrastructure tới WebAPI:

### 5.1. Quản lý Tồn kho IMEI/Serial Number
- **Thực thể Domain:** `InventoryItem.cs`, `OrderItemSerial.cs`, `EInventoryStatus.cs` (`Available=0, Reserved=1, Sold=2, Defective=3, ReturnedToStock=4`).
- **Nghiệp vụ:** Mỗi thiết bị giá trị cao (Laptop, Điện thoại) có một mã Serial/IMEI duy nhất. Khi đơn hàng chuyển sang `Shipped`, hệ thống gán serial vào `OrderItemSerial` và đánh dấu `InventoryItem` là `Sold`. Hỗ trợ bảo hành điện tử e-Warranty với `WarrantyExpiresAt`.
- **API & UI:** `InventoryController.cs` (`/api/inventory`), giao diện Dashboard `/inventory`.

### 5.2. Quy trình Đổi trả Hàng RMA 7 Ngày
- **Thực thể Domain:** `ReturnRequest.cs`, `ReturnRequestLog.cs`, `ReturnEvidence.cs`, `EReturnStatus.cs` (9 trạng thái), `EReturnReason.cs` (6 lý do).
- **Quy tắc cốt lõi:** Chỉ cho phép tạo yêu cầu đổi trả khi đơn hàng ở trạng thái `Delivered` và thời gian kể từ ngày nhận hàng không quá **7 ngày** (`(DateTime.UtcNow - deliveredDate).TotalDays <= 7`).
- **API & UI:** `CreateReturnRequestCommandHandler.cs`, `ReturnsController.cs`, Client `/account/returns`, Dashboard `/returns` (Stepper 5 bước).

### 5.3. Mạng lưới 45 Showroom & Điều chuyển kho O2O
- **Thực thể Domain:** `Showroom.cs`, `ShowroomInventory.cs`, `EDeliveryType.cs` (`HomeDelivery=1, ShowroomPickup=2`).
- **Nghiệp vụ:** Hỗ trợ nhận hàng tại chi nhánh (`ShowroomPickup`), quản lý tồn kho tức thời tại 45 showroom toàn quốc theo SSoT 2026. Lập phiếu điều chuyển kho (Stock Transfer) giữa hai chi nhánh đảm bảo an toàn giao dịch qua Unit of Work.
- **API & UI:** `ShowroomsController.cs`, Client chọn showroom tại `/checkout`, Dashboard `/showrooms`.

### 5.4. Khóa & Quản lý Tài khoản Vi phạm
- **Thực thể Domain:** `AccountLock.cs`, `ELockType.cs` (`Temporary=1, Permanent=2, Suspended=3`).
- **Nghiệp vụ:** Chặn người dùng vi phạm quy chế hoặc có dấu hiệu gian lận. `AccountLockMiddleware` trong pipeline tự động đối soát trạng thái khóa và trả về lỗi `403 Forbidden` kèm lý do.
- **API & UI:** `AccountLocksController.cs`, Dashboard `/account-locks`.

### 5.5. Thanh cuộn Tin tức Khẩn cấp (Marquee)
- **Thực thể Domain:** `MarqueeMessage.cs`, `MarqueeSetting.cs`, `MarqueeAuditLog.cs`.
- **Nghiệp vụ:** Hiển thị thông báo khẩn cấp, sự kiện Flash Sale hoặc bảo trì trên thanh thông báo chạy ngang đầu trang client. Hỗ trợ bật/tắt toàn cục hoặc theo từng bản tin.
- **API & UI:** `MarqueeController.cs` (công khai), `MarqueeAdminController.cs` (quản trị), Dashboard `/configs/marquee`.

### 5.6. Gói Phụ kiện & Bảo hành Mở rộng (Product Add-Ons)
- **Thực thể Domain:** `ProductAddOn.cs`, `CartItem.AddOnId`, `OrderItem.AddOnId`, `OrderItem.AddOnPrice`.
- **Nghiệp vụ:** Cho phép khách hàng mua kèm các gói bảo hiểm (AppleCare+, ShopViet Care 24T) hoặc combo phụ kiện khi mua thiết bị chính. Chi phí Add-On được tính toán tự động vào tổng giá trị đơn hàng.
- **API & UI:** `ProductAddOnsController.cs`, Dashboard `/configs/product-addons`.

### 5.7. So sánh Chi tiết 14 Thông số Kỹ thuật
- **Thực thể Domain:** `ProductSpecification.cs` (gồm các trường: `GroupName`, `IsKeySpec`, `IsHighlight`, `FilterKey`, `DisplayOrder`).
- **Nghiệp vụ:** Cung cấp ma trận so sánh động đa sản phẩm theo nhóm thông số kỹ thuật (Vi xử lý, Màn hình, Đồ họa, Pin & Sạc). Hỗ trợ lọc sản phẩm theo spec facets (`specs[ram]`, `specs[ssd]`).
- **API & UI:** `ProductSpecsController.cs`, Client `/compare`.

### 5.8. Xuất Mẫu CSV & Quản lý Sản phẩm Hàng loạt
- **Hạ tầng:** `ExcelService.cs` (tích hợp CsvHelper và EPPlus).
- **API & UI:** Endpoint `GET /api/products/export-template?format=csv` xuất file mẫu danh mục sản phẩm, biến thể và 14 thông số; hỗ trợ tải lên và xác thực dữ liệu tại Dashboard `/bulk-management/products`.

---

## 6. Cơ Chế Cơ Sở Dữ Liệu & 6 Migrations Thực Tế

Cơ sở dữ liệu được quản lý nghiêm ngặt qua EF Core Code-First với **6 migrations** chính thức:

1. **`20260507115052_InitialCreate.cs`:** Khởi tạo lược đồ cơ sở dữ liệu ban đầu (Sản phẩm, Danh mục, Người dùng, Vai trò, Đơn hàng cơ bản).
2. **`20260516123045_AddReviewProductUserUniqueIndex.cs`:** Thêm ràng buộc duy nhất chống spam đánh giá lặp cho cùng một cặp `(ProductId, UserId)`.
3. **`20260517012236_AddOutboxMessages.cs`:** Bổ sung bảng `OutboxMessages` triển khai Outbox Pattern cho sự kiện `OrderCreatedEvent`.
4. **`20261015140903_RefactorCartItemSurrogateKey.cs`:** Tái cấu trúc khóa chính của `CartItem` sang Surrogate Key `Id (Guid)` độc lập.
5. **`20261020155436_AddTechEcommerceSchema2026.cs`:** Bổ sung lược đồ công nghệ SSoT 2026 ban đầu.
6. **`20261021121358_AddTechEcommerceSpecsAndShowrooms2026.cs`:** Migration hoàn thiện lược đồ SSoT 2026 (Bảng `Showrooms`, `ShowroomInventory`, `OrderItemSerials`, `ReturnRequestLogs`, các trường mở rộng `OrderInvoice`, `DepositRequired`, `DeliveryType`).

### Cơ chế Giỏ hàng Khách Vãng Lai (Guest Cart):
- Khi khách hàng chưa đăng nhập, `GuestCartMiddleware.cs` tự động phát hành một HttpOnly Cookie `guest_id` với thời hạn **7 ngày**.
- Dữ liệu giỏ hàng được lưu trữ trực tiếp trong CSDL bảng `Carts` qua cột `AnonymousId` (chuỗi GUID mapping với `guest_id`).
- **Khẳng định:** Giỏ hàng khách vãng lai **hoàn toàn không lưu trong Redis**; Redis chỉ dùng làm cache dữ liệu và session tạm.
- Khi người dùng đăng nhập thành công, `MergeCartService.cs` thực hiện gộp (merge) các sản phẩm từ giỏ khách vãng lai vào giỏ tài khoản chính bằng câu lệnh SQL UPSERT an toàn.

### Outbox Pattern:
- Trong phương thức `ApplicationDbContext.SaveChangesAsync`, các sự kiện Domain kế thừa `OrderCreatedEvent` được chuyển thành JSON và lưu vào bảng `OutboxMessages` trong cùng một Transaction với việc tạo đơn.
- `OutboxBackgroundService` chạy định kỳ đọc các bản ghi chưa xử lý (`ProcessedOnUtc == null`), publish qua MediatR, hỗ trợ thử lại tối đa `MaxRetryCount = 3`.

---

## 7. Kiểm Thử Tự Động (Automated Testing Suite)

Hệ thống sở hữu bộ kiểm thử tự động gồm **3 test projects với 55 test files**:

1. **`Ecommerce.Application.Tests` (30 test files):**
   - Kiểm thử toàn diện các CQRS Handlers (Orders, Cart, Products, Showrooms, Returns, PromoCodes, Banners).
   - Kiểm thử xác thực dữ liệu qua FluentValidation.
   - Kiểm thử Pipeline Behaviors (CachingBehavior, ValidationBehavior, TransactionBehavior).
2. **`Ecommerce.Domain.Tests` (12 test files):**
   - Kiểm thử máy trạng thái đơn hàng (`Order.cs`).
   - Kiểm thử các quy tắc nghiệp vụ Domain: Tính toán giá, giảm giá, tồn kho IMEI/Serial, cọc COD 10%.
3. **`Ecommerce.WebAPI.IntegrationTests` (13 test files):**
   - Kiểm thử tích hợp WebApplicationFactory, xác thực qua Cookie/JWT, phân quyền RBAC, Outbox message lifecycle.

Lệnh thực thi toàn bộ test suite:
```bash
cd apps/backend/Ecommerce
dotnet test
```

---

## 8. Mục "Sai Lệch Đã Biết" (Known Discrepancies)

Các sai lệch kỹ thuật giữa mã nguồn hiện tại và tài liệu/thiết kế được ghi nhận trung thực dưới đây:

1. **Toán tử Ngưỡng Miễn Phí Vận Chuyển (Freeship Threshold):**
   - *Chuẩn SSoT 2026 & Frontend:* Miễn phí vận chuyển khi giá trị đơn hàng `subtotal >= 500.000₫`.
   - *Mã nguồn Backend:* Tại `ShippingCalculator.cs:34`, code đang sử dụng toán tử lớn hơn hẳn: `return subtotal > FREE_SHIPPING_THRESHOLD;`. Do đó, đơn hàng có giá trị chính xác 500.000₫ tại Backend vẫn bị tính phí ship 30.000₫.
2. **Lệch Thời Hạn Giữa JWT Payload Claim và Cookie Trình Duyệt:**
   - *JWT Payload Claim:* Trong `TokenService.cs:54`, claim `exp` được tạo với thời hạn 60 phút (`AccessTokenExpirationMinutes = 60`).
   - *Cookie Trình Duyệt:* Trong `CookieAuthExtensions.cs:36`, cookie `access_token` được cấu hình thời hạn hết hạn sau 15 phút (`CookieSettings:AccessTokenMinutes ?? 15`). Trình duyệt sẽ tự động xóa cookie sau 15 phút dù JWT bên trong còn hạn.
3. **Cổng Thanh Toán MoMo, ZaloPay, VietQR:**
   - Frontend Client cung cấp giao diện lựa chọn các ví MoMo, ZaloPay, VietQR.
   - Backend hiện chỉ tích hợp gateway xử lý thực tế cho **COD** và **VNPay Sandbox** (`VnPayPaymentGateway.cs`). Các cổng còn lại khi thanh toán chỉ ghi nhận tên phương thức vào database.
4. **Secret Cấu Hình Cũ Còn Lưu Trong Lịch Sử Git:**
   - Commit `695e86f84c15` (01/04/2026) từng đưa trực tiếp cấu hình chứa secret VNPay sandbox và connection string vào git.
   - Commit `0b346f35aaf0` đã xóa các file này và đưa vào `.gitignore`, tuy nhiên secret vẫn còn tồn tại trong lịch sử git commit cũ (cần chủ dự án đổi khóa trên merchant portal).
5. **Lệch Enum Trạng Thái Đơn Hàng (`EOrderStatus`) Tại Client:**
   - Backend định nghĩa 9 trạng thái (`Pending=0, Processing=1, Shipped=2, Completed=3, Cancelled=4, Refunded=5, Delivered=6, ReturnRequested=7, Returned=8`).
   - Client (`types/order.ts`) chỉ định nghĩa 6 trạng thái và gán sai `Delivered = 3` (thay vì 6), thiếu `Completed` và `Refunded`. (Dashboard đã đồng bộ chuẩn 9 trạng thái như Backend).
6. **Thiếu RowVersion Trong Dashboard `order-service.ts`:**
   - Backend `UpdateOrderStatusCommand.cs` yêu cầu `RowVersion` cho optimistic concurrency.
   - Dashboard API service `services/order-service.ts` hiện gửi payload cập nhật trạng thái thiếu trường này.

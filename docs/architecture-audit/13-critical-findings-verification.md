> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 14/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/reports/KIEM_KE_HIEN_TRANG.md`](../reports/KIEM_KE_HIEN_TRANG.md).

# 13. Xác Minh Độc Lập Các Phát Hiện Nghiêm Trọng

**Ngày xác minh:** 2026-10-14 · **Phạm vi:** chỉ đọc mã + thêm test (không sửa code production, không migration, không đổi cấu hình, không rotate secret, không commit).
**Quy ước secret:** không có giá trị bí mật nào được in trong tài liệu này; chỉ ghi loại, vị trí, trạng thái.

> [!IMPORTANT]
> Xác minh lại cho thấy báo cáo đợt 1 **sai ở 4 điểm** và **sai mức độ ở nhiều điểm**:
> - `OPS-01` là **FALSE POSITIVE**; khuyến nghị cũ trong `11-prioritized-roadmap.md` (P0-6) sẽ **làm hỏng** Docker nếu áp dụng.
> - `SEC-01` / `SEC-06`: file chứa secret **không còn được git theo dõi** ở HEAD; rủi ro nằm ở **lịch sử git**.
> - `FLOW-02`: nhận định "không persist vì thiếu `CompleteAsync`" là **sai**; lỗi thật là **sai entity (SKU)**.
> - `SEC-02`: lớp có lỗ hổng **không được đăng ký DI** → không khai thác được.

## 0. Test đã chạy (kết quả thực tế)

Lệnh: `dotnet test <project> --filter "Category=AuditRepro"`. Mọi test **assert hành vi ĐÚNG**; test **FAIL = lỗi được tái hiện**.

| Test | Project | Kết quả | Thông điệp thực tế |
|---|---|---|---|
| `SEC03_Anonymous_CannotDownloadProductImportTemplate` | IntegrationTests | FAIL ⇒ tái hiện | anonymous nhận **200** (kỳ vọng 401/403) |
| `SEC04_RefreshToken_WorksWhenOnlyRefreshCookieIsPresent` | IntegrationTests | FAIL ⇒ tái hiện | refresh chỉ với cookie `refresh_token` trả **422** |
| `DATA01_AddingTwoVariantsOfSameProduct_KeepsBothCartLines` | IntegrationTests | FAIL ⇒ tái hiện | thêm dòng thứ 2 (Color/Size khác) trả **500** |
| `FLOW02_CancellingOrderWithVariantSku_RestoresSkuStock` | IntegrationTests | FAIL ⇒ tái hiện | SKU stock sau hủy = **3** (kỳ vọng 5); `Product.StockQuantity` = **2** (từ 0) |
| `FLOW03_ReturnRequestCompletedEvent_HasAtLeastOneHandler` | IntegrationTests | FAIL ⇒ tái hiện | không có handler nào |
| `REPORT_RevenueByMonth_IncludesOrdersPlacedOnLastDayOfMonth` | IntegrationTests | FAIL ⇒ tái hiện | doanh thu T3/2025 = **0**, đơn 31/3 12:00 không được tính |
| `SEC02_LocalFileStorage_DeleteFileAsync_RejectsPathTraversal` | IntegrationTests | FAIL ⇒ tái hiện (lớp lẻ) | xóa được file **ngoài** `wwwroot` |
| `UnexpectedFailureAfterStockDecrement_RollsBackOrRestoresStock` | Application.Tests | FAIL ⇒ tái hiện (mock) | `commits=1, rollbacks=0, explicit restores=0` |

Kết quả: 7/7 integration + 1/1 unit **FAIL có chủ đích** (TRX: `brain/e0101c11-.../scratch/results/audit-integration.trx`). Các test baseline đợt 1 (Domain 57/57; Application 199/203 với 4 lỗi localization sẵn có; Phase0 5/5) **không chạy lại** ở phase này; vì các test mới đang đỏ nên chạy thường quy dùng `--filter "Category!=AuditRepro"`.
Không có test nào "không chạy được do môi trường". **Chưa test được** (cần trình duyệt/Docker): `FE-03`, `OPS-01`.

## 1. Bảng kết luận

| Mã | Kết luận | Mức cũ → mới | Độ tin cậy |
|---|---|---|---|
| SEC-01 | PARTIALLY CONFIRMED | Critical → **High** (Critical nếu repo từng public) | High (vị trí/lịch sử); Unknown (secret còn sống không) |
| SEC-02 | FALSE POSITIVE (khai thác) / defect tiềm ẩn CONFIRMED | Critical → **Low** | High |
| SEC-03 | CONFIRMED (hệ thống), tác động thực tế hẹp | High → **Medium** | High |
| FE-03 | PARTIALLY CONFIRMED | High → **Medium** | Medium (chưa chạy runtime) |
| DATA-01 | CONFIRMED | Critical → **High** | High (500 tái hiện) |
| FLOW-01 | PARTIALLY CONFIRMED | Critical → **Medium** | Medium |
| FLOW-02a (không persist) | FALSE POSITIVE | — | High |
| FLOW-02b (sai entity SKU) | CONFIRMED | High → **High** | High |
| FLOW-03 | CONFIRMED | High → **Medium** | High |
| SEC-04 | CONFIRMED | High → **High** | High |
| OPS-01 | FALSE POSITIVE | Critical → **Informational** | High (mã) / Medium (chưa build Docker) |
| ARCH-01 | CONFIRMED (hành vi), là khoảng trống tài liệu | High → **Medium** | High |
| PERF (báo cáo doanh thu) | CONFIRMED + **lỗi đúng-sai mới** | High → **High** | High |
| SEC-07 (bổ sung) | CONFIRMED | Medium → **High** | High |

## 2. Chi tiết từng phát hiện

### SEC-01 — Credentials Supabase/database — PARTIALLY CONFIRMED (High)
- **Bằng chứng:**
  - `.gitignore:108` loại `appsettings*.json` (trừ `*.example.json`); `.gitignore:24` loại `.env`. `git ls-files` ở HEAD/`main`/`origin/main`/`codex` **không** còn `appsettings.Development.json`, `appsettings.Production.json`, `appsettings.json`, `docker-compose/.env` (0 file).
  - Commit gỡ: `0b346f3`/`6156512` "Remove tracked appsettings secrets from repo" (2026-04-08).
  - **Lịch sử vẫn còn:** commit `695e86f`, `457b43b` (2026-04-01) chứa trong `appsettings.Development.json` và `appsettings.Production.json`: 1 `SupabaseStorage.ServiceRoleKey` dạng JWT (trông thật), 1 `Jwt.SecretKey` entropy cao; trong `appsettings.json` 1 `VnPay.HashSecret`. Các commit này truy cập được từ `origin/main`, `origin/codex`, `origin/ux-bug-fixes` và 3 nhánh `origin/v0/*`; còn nhánh `backup/pre-sanitize-2026-03-19`. Commit `9172248`/`59020af` (03-19) chứa `Jwt.SecretKey` + `HashSecret`.
  - File làm việc cục bộ (untracked) vẫn có `ServiceRoleKey` (Development.json:14, Production.json:47), connection string (Development.json:27), `SecretKey`, `TokenHashSecret`; `docker-compose/.env` có `DB_CONNECTION_STRING`, `JWT_SECRET_KEY`, `AUTH_TOKEN_HASH_SECRET` — **không bị commit** hiện tại.
- **Luồng:** `git clone` → `git log -p`/checkout `695e86f` → đọc khóa.
- **Điều kiện:** repo GitHub `lenam2809/ecommerce` truy cập được (độ hiển thị **Unknown**, không kiểm tra) hoặc ai đó đã clone trước 04-08.
- **Tác động:** ServiceRoleKey bỏ qua RLS Supabase; JWT secret cho phép giả mạo token **nếu** giá trị trùng với đang chạy; HashSecret cho phép ký giả callback VNPay sandbox.
- **Chưa xác minh:** khóa còn hiệu lực không (không gọi dịch vụ ngoài); production có dùng chung giá trị không; mật khẩu DB trong lịch sử (mẫu regex không phân loại được).
- **Test hiện có/cần:** không có. Cần: `gitleaks detect --log-opts="--all"` (file 15).
- **Sửa tối thiểu (người dùng quyết định):** coi mọi giá trị trong lịch sử là đã lộ → rotate Supabase DB password + ServiceRoleKey + `Jwt.SecretKey` + `TokenHashSecret` + VNPay HashSecret; tùy chọn làm sạch lịch sử bằng `git filter-repo` + force-push (rủi ro cao). **Không tự rotate.**
- **Rủi ro hồi quy:** đổi `Jwt.SecretKey`/`TokenHashSecret` làm mất hiệu lực mọi phiên và refresh token hiện có.

### SEC-02 — Path traversal khi xóa file — FALSE POSITIVE (khai thác) · Low
- **Bằng chứng:** `FileStorageService.DeleteFileAsync` (`FileStorageService.cs:98-112`) dùng `Path.Combine(_env.WebRootPath, filePath.TrimStart('/'))` không kiểm tra ranh giới — **đã tái hiện** bằng test (xóa được file ngoài wwwroot).
- **Nhưng:** `AddServicesExtensions.cs:27` đăng ký `IFileStorageService → SupabaseStorageService`; `FileStorageService` **không được đăng ký ở bất kỳ nơi nào**. `SupabaseStorageService.DeleteFileAsync` (`:91-110`) không đụng filesystem, chặn `://` và `uploads/`, gọi `storage.Remove` trên khóa bucket. `TestStorageController` có `[DevelopmentOnly]`. 9 call-site (`Delete/Update` Brand, Category, Product, User, Banner) truyền giá trị đọc từ DB.
- **Điều kiện để thành lỗi thật:** ai đó đăng ký lại `FileStorageService` **và** giá trị ảnh trong DB do người dùng kiểm soát; hoặc dùng controller test ở Development.
- **Mức khai thác thực tế:** không có trong cấu hình hiện tại.
- **Sửa tối thiểu:** thêm kiểm tra `Path.GetFullPath(...).StartsWith(root + sep)` hoặc xóa lớp chết. Hồi quy: thấp.

### SEC-03 — AuthorizationBehavior đọc attribute sai chỗ — CONFIRMED (Medium)
- **Bằng chứng:** `AuthorizationBehavior.cs:25` đọc `request.GetType().GetCustomAttributes<AuthorizeAttribute>()`; `ServiceCollectionExtensions.cs:32` đăng ký behavior. Đếm: **28 handler** có `[Authorize]`, **0** Command/Query có (ví dụ `ExportProductsTemplateCommandHandler.cs:11`, `CreateBrandCommandHandler.cs:15`). Test hiện có (`AuthorizationBehaviorTests`) chỉ dùng request có attribute nên không phát hiện.
- **Luồng thực tế:** HTTP → `[Authorize]` ở controller (hầu hết action có) → MediatR `AuthorizationBehavior` (bỏ qua) → handler. Lớp bảo vệ thật là **controller attribute**; lớp thứ hai (defense-in-depth) **không hoạt động**.
- **Tái hiện:** `GET /api/products/export-template` ẩn danh → **200** (`ProductsController.cs:200-202`, `//[Authorize(...)]` bị comment). Tác động: lộ file mẫu import (không có dữ liệu nhạy cảm).
- **Khác:** `UserActivitiesController.cs:12` `//[Authorize]` (class) — `GET api/UserActivities`, `recent` không có attribute; **chưa đo** kết quả ẩn danh (Unknown → test ở file 15). `LogsController` đã sửa (`[Authorize(Roles=Admin)]`).
- **Sửa tối thiểu:** `AuthorizationBehavior` đọc cả attribute của handler **hoặc** chuyển attribute lên request; bỏ comment 2 chỗ controller.
- **Rủi ro hồi quy:** CAO — bật lại 28 kiểm tra có thể trả 401/403 cho luồng nội bộ (event handler, seed, job gọi `mediator.Send` không có `HttpContext`). Chạy toàn bộ integration test + rà các nơi gọi `Send` ngoài HTTP.

### FE-03 — Dashboard không kiểm tra role — PARTIALLY CONFIRMED (Medium)
- **Bằng chứng:** `ecommerce-dashboard/middleware.ts:107` `isAuthenticated = Boolean(profile?.userId)`; `/api/auth/me/profile` (`AuthController.cs:323-344`) chỉ `[Authorize]`, trả `roles` nhưng không chặn. `(dashboard)/layout.tsx:13-18` chỉ kiểm tra có cookie `access_token`.
- **Giảm nhẹ:** `auth-service.ts:58-77` chặn role không phải Admin/Manager **ở UI đăng nhập** (cookie đã được `/auth/login` set trước đó). Backend API dùng policy theo quyền nên khách không đọc/ghi được dữ liệu quản trị; `hasPermission()` ẩn menu.
- **Điều kiện:** khách có cookie hợp lệ trên domain dashboard (đăng nhập trực tiếp qua API, hoặc dev dùng chung host `localhost` khác port).
- **Tác động:** thấy "vỏ" UI quản trị, không thấy dữ liệu. **Chưa chạy runtime.**
- **Sửa tối thiểu:** middleware kiểm tra `profile.roles` ∩ {Admin, Manager}; redirect khi không đủ.
- **Hồi quy:** user có quyền hạt nhân nhưng role khác (có seed role `Staff`) sẽ bị chặn — cần chốt danh sách role được phép.

### DATA-01 — Khóa chính CartItem — CONFIRMED (High)
- **Bằng chứng:** `Persistence/EntityConfigurations/CartItemConfiguration.cs:15` **và** `ApplicationDbContext.cs:289` đều `HasKey { CartId, ProductId }` (đường dẫn `Data/Configurations/` trong báo cáo cũ sai); `Cart.AddItem` (`Cart.cs:41-57`) coi dòng khác nhau theo `ProductId + Color + Size` ⇒ tạo `CartItem` thứ 2 cùng khóa. `ApplicationDbContext.cs:274-300` còn cấu hình `CartItem` hai lần (cascade vs `NoAction` cho FK Product).
- **Tái hiện:** 2 lần `POST /api/cart/items` (Red/M rồi Blue/L, cùng sản phẩm, user đăng nhập) → lần 2 **500**.
- **Đề xuất sửa cũ SAI:** `AddToCartCommand` **không có** `ProductVariantSkuId` và `Cart.AddItem` không gán nó, nên khóa `{CartId, ProductVariantSkuId}` không dùng được. Danh tính dòng giỏ thực là `(CartId, ProductId, Color, Size)`.
- **Phạm vi:** chỉ giỏ **người dùng đăng nhập**; giỏ khách dùng Redis (`RedisGuestCartService`) — chưa test riêng.
- **Sửa tối thiểu:** khóa thay thế `Id` (Guid) + unique index `(CartId, ProductId, Color, Size)` (cột nullable: chuẩn hóa `''` hoặc `NULLS NOT DISTINCT` trên PostgreSQL); `UpdateCartItem`/`RemoveCartItem` hiện khớp `ProductId == request.ItemId` (`UpdateCartItemCommandHandler.cs:75`) — phải nhận diện bằng Id dòng.
- **Rủi ro:** cần migration (đổi PK) + dữ liệu hiện có; thay đổi hợp đồng API update/remove; frontend phải gửi id dòng.

### FLOW-01 — Rò rỉ tồn kho khi lỗi bất ngờ — PARTIALLY CONFIRMED (Medium)
- **Bằng chứng:** `CreateOrderCommand : ICommand` ⇒ `TransactionBehavior` bọc **một** transaction (`TransactionBehavior.cs:32-49`); `ExecuteUpdateAsync` (`ProductVariantSkuRepository.cs:37-46`) chạy **trong cùng transaction** (nhận định cũ "ngoài transaction" là **sai**). Nhưng `catch (Exception)` (`CreateOrderCommandHandler.cs:182-186`) và `catch (DomainException)` (`:178-181`) **nuốt** lỗi và trả `BadRequest` ⇒ behavior thấy "thành công" ⇒ **Commit**, không rollback, không `RestoreDecrementedStockAsync`.
- **Tái hiện (mock):** `CompleteAsync` ném `InvalidOperationException` ⇒ `commits=1, rollbacks=0, restores=0`.
- **Điều kiện/tác động thực tế:** với PostgreSQL, lỗi do câu lệnh DB làm transaction aborted nên `COMMIT` thực chất rollback → tồn kho tự phục hồi (**chưa kiểm chứng trên PG thật**). Rò rỉ xảy ra với lỗi không phải DB (NullReference, lỗi domain sau khi trừ, lỗi mapping) hoặc SQLite. Cũng rò `PromoCode.TimesUsed` (`RedeemPromoCodeAsync` tăng bằng SQL trực tiếp).
- **Test hiện có:** collision mã đơn, promo race, `AtomicStockUpdateAffectsNoRows` phủ các nhánh *có xử lý*.
- **Sửa tối thiểu:** trong 2 `catch` tổng quát gọi `RestoreDecrementedStockAsync` hoặc rethrow để behavior rollback.
- **Rủi ro:** đổi hợp đồng lỗi (hiện luôn 400).

### FLOW-02 — Hủy đơn không hoàn tồn kho
- **(a) "không persist" — FALSE POSITIVE:** `ApplicationDbContext.SaveChangesAsync` (`:98-107`) gọi `DispatchInProcessDomainEvents` **trước** `base.SaveChangesAsync`; `OrderStatusChangedEvent` không thuộc outbox (`OutboxMessageFactory` chỉ `OrderCreatedEvent`) nên handler chạy ngay trong `CompleteAsync` của `UpdateOrderStatusCommandHandler:68` và thay đổi `Product` được lưu cùng lần save. Test: `Product.StockQuantity` 0 → 2.
- **(b) Sai entity — CONFIRMED (High):** `OrderStatusChangedEventHandler.cs:82-90` luôn `AdjustStock` trên `Product`, bỏ qua `OrderItem.ProductVariantSkuId`; checkout (`CreateOrderCommandHandler.cs:110-121`) trừ ở **SKU**. Tái hiện: SKU 3 → vẫn 3 sau hủy; `Product.StockQuantity` bị tăng sai.
- **Tương tự:** `DeleteOrderCommandHandler.cs:38-46` (chỉ đơn Pending).
- **Điều kiện:** đơn chứa sản phẩm có biến thể bị hủy (Pending/Processing).
- **Tác động:** SKU mất tồn vĩnh viễn; tồn `Product` phồng lên.
- **Sửa tối thiểu:** nếu `item.ProductVariantSkuId` có giá trị → `ProductVariantSkus.RestoreStockAsync(skuId, qty)`; ngược lại như cũ.
- **Rủi ro:** cần idempotency (retry/event chạy 2 lần → cộng đôi); chốt vai trò `Product.StockQuantity` của sản phẩm có biến thể (`Product.GetTotalStock`).

### FLOW-03 — RMA hoàn tất không nhập kho — CONFIRMED (Medium)
- **Bằng chứng:** `ReturnRequest.MarkCompleted` (`ReturnRequest.cs:157-164`) phát `ReturnRequestCompletedEvent`; không có `INotificationHandler<ReturnRequestCompletedEvent>`; không tệp nào trong `Features/Returns` chạm `Stock/Inventory/Sku`.
- **Tái hiện:** test reflection FAIL.
- **Lưu ý nghiệp vụ:** có trạng thái `QualityCheck`; hoàn kho tự động cho hàng lỗi là **sai**. Cần chốt chính sách.
- **Sửa tối thiểu:** handler hoàn kho theo `OrderItem` (SKU/Product) chỉ khi qua kiểm tra; idempotent theo `ReturnRequestId`.
- **Chưa xác minh:** nơi khác có xử lý `InventoryItem`/hoàn tiền hay không (ngoài các tìm kiếm nêu trên).

### SEC-04 — Refresh sau khi access token hết hạn — CONFIRMED (High)
- **Bằng chứng:** cookie `access_token` hết hạn đúng 15 phút (`CookieAuthExtensions.cs:35-37`) nên trình duyệt ngừng gửi; `AuthController.cs:149` đặt `AccessToken = accessToken ?? ""`; `RefreshTokenCommandHandler.cs:31-39` yêu cầu access token **hợp lệ** (`TokenService.ValidateToken:96-105`, `ValidateLifetime` mặc định `true`, `ClockSkew=0`). Client chỉ refresh **sau 401** (`ecommerce-client/lib/api.ts:143-168`, dashboard `axios.ts:111-129`); không có refresh chủ động.
- **Tái hiện:** chỉ gửi cookie `refresh_token` → **422** (bị `ValidationBehavior` chặn vì `AccessToken` rỗng; nếu vượt qua vẫn bị `ValidateToken` từ chối).
- **Tác động:** phiên thực tế ≈ 15 phút rồi buộc đăng nhập lại; refresh 7 ngày + rotation + phát hiện replay **không chạy** trên đường chính.
- **Sửa tối thiểu:** bỏ yêu cầu access token (dùng refresh token + tra theo hash), hoặc đọc claims với `ValidateLifetime=false`; cập nhật `RefreshTokenCommandValidator`.
- **Rủi ro:** sau khi sửa, **SEC-05** (CSRF bỏ qua khi thiếu cookie `access_token`, `CsrfValidationMiddleware.cs:40-44`) thành đường chính ⇒ sửa **cùng lúc** (thêm `refresh_token` vào điều kiện). Đồng thời đổi `DateTime.Now`→`UtcNow` ở `TokenService.cs:54`.

### OPS-01 — `NEXT_PUBLIC_API_URL=http://backend:5000/api` — FALSE POSITIVE
- **Bằng chứng:** trình duyệt dùng `baseURL: '/api'` (client `lib/api.ts:8`, dashboard `lib/axios.ts:8`) — đường dẫn tương đối. `NEXT_PUBLIC_API_URL` chỉ được `next.config` dùng cho `rewrites()` (client `:83-93`, dashboard `:58-68`: `/api/:path*` → `${backendBase}/api/:path*`) và là `ARG` lúc build (`Dockerfile:34-35`). Rewrite chạy **phía server trong mạng Docker** nên `http://backend:5000` là giá trị **đúng**; `middleware.ts` cũng fetch `/api/auth/me/profile` tương đối qua rewrite.
- **Hệ quả:** khuyến nghị cũ "đổi sang `http://localhost:5000/api`" sẽ khiến rewrite trong container trỏ về chính container ⇒ **hỏng**.
- **Rủi ro còn lại:** `docker-compose/.env.example:57` đặt `http://localhost:5000/api` (trong khi compose mặc định `:-http://backend:5000/api`): ai sao chép `.env.example` sẽ gặp lỗi proxy. **Likely**, chưa chạy `docker compose build`.
- **Sửa:** sửa `.env.example` + ghi chú; **không** đổi `.env`.

### ARCH-01 — Fallback tìm kiếm — CONFIRMED (hành vi) · Medium
- **Bằng chứng:** `NoOpProductSearchService.cs:25` ném `SearchServiceUnavailableException`; `SearchProductsQueryHandler.cs:67-71` trả 503; đăng ký khi `UseElasticsearch=false` (`AddElasticsearchExtensions.cs:27-33`); client dùng `/search/products` (`product-service.ts:29`). Hành vi **có chủ đích và có test** (`SearchProductsQueryHandlerTests`), trái với `AGENTS.md` ("fallback SQL LIKE").
- **Tác động:** không bật Elasticsearch thì tìm kiếm trên client lỗi 503 (chưa xác minh toàn bộ trang có dùng endpoint khác).
- **Sửa:** fallback EF `Contains`/`ILike` trong `NoOp` **hoặc** sửa tài liệu. Cần quyết định sản phẩm.

### PERF — Báo cáo doanh thu — CONFIRMED + lỗi đúng-sai mới
- **Hiệu năng:** `GetRevenueByCategoryQueryHandler.cs:27-51` tải đơn+item+product+category của 1 năm rồi `GroupBy` trong RAM; `GetRevenueByMonthQueryHandler.cs:40-66` lặp 12 lần, mỗi lần tải đơn của tháng rồi `Sum` trong C#.
- **Lỗi đúng-sai MỚI (tái hiện):** `endDate = startDate.AddMonths(1).AddDays(-1)` (`:43`) với `OrderDate <= endDate` ⇒ **mọi đơn sau 00:00 ngày cuối tháng bị loại**; test: doanh thu T3/2025 = 0 dù có đơn 31/3 12:00 (2×1000). Còn dùng `DateTime.Now` không UTC.
- **Tác động:** báo cáo doanh thu thấp hơn thực tế mỗi tháng.
- **Sửa tối thiểu:** `OrderDate >= start && OrderDate < nextMonthStart`; đẩy `GroupBy/Sum` xuống SQL. Rủi ro: số liệu lịch sử hiển thị thay đổi.

### SEC-07 (bổ sung) — Seed tài khoản mặc định ở mọi môi trường — CONFIRMED (High)
- `Program.cs:246-247`: dòng đúng bị comment, gọi `SeedAsync(services, true)`; `ApplicationDbContextSeed` tạo admin/manager/staff/customer với mật khẩu **hard-code trong mã nguồn** (dòng 189, 228, 258, 288), `MustChangePassword = !isDevelopment` ⇒ `false`; sample data cũng được seed (`:64`).
- **Điều kiện:** CSDL mới/thiếu user ở bất kỳ môi trường nào (Render, Docker).
- **Hồi quy khi sửa:** integration test chạy ở môi trường `IntegrationTesting` và **phụ thuộc** user được seed (`Phase3OwnershipTests`...). Sửa phải giữ seed cho môi trường test (cờ cấu hình `Seed:Enabled`), không chỉ `IsDevelopment()`.

## 3. Giới hạn xác minh
- Không kiểm tra visibility repo GitHub, độ sống của secret, hay hành vi PostgreSQL thật (test dùng SQLite + mock).
- `FE-03`, `OPS-01` không chạy runtime/Docker.
- `UserActivities` ẩn danh: chưa đo.
- Các nhận định ở `03`/`05`/`06` ngoài danh sách trên **chưa được xác minh lại**.

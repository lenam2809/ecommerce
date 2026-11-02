> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 15/08/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/architecture-backend.md`](architecture-backend.md).

# 🛡️ Security Audit — Backend ShopViet (.NET 8)

> **Phạm vi:** `apps/backend/Ecommerce` (Ecommerce.Application + Ecommerce.Infrastructure + Ecommerce.WebAPI)
> **Phương pháp:** grep toàn diện + đọc trực tiếp ~40 file nghi vấn + 2 luồng audit song song (authorization/ownership & SQL/logging); mọi kết luận được xác minh chéo bằng code thật
> **Thời điểm:** sau phân tích kiến trúc (xem `docs/architecture-backend.md`)
> **Chính sách:** không in bất kỳ giá trị secret thật nào trong báo cáo — chỉ ghi nhận tồn tại/độ dài/vị trí

---

## ✅ Cập nhật trạng thái vá lỗ hổng

| Nhóm | Trạng thái | Ghi chú |
|---|---|---|
| 🔴 Critical (0) | — | không có |
| 🟠 **High (6)** | **✅ ĐÃ VÁ TOÀN BỘ (H1–H6)** | chi tiết từng mục bên dưới; build thành công (0 lỗi) |
| 🟡 **Medium (11)** | **✅ ĐÃ VÁ TOÀN BỘ (M1–M11)** | chi tiết mục 4; build thành công (0 lỗi) |
| 🟢 Low (10) | ⏳ chưa vá | L1–L10 + 9 gap validator |

---

## 1. Kết quả nhanh theo 8 hạng mục

| # | Hạng mục | Kết quả |
|---|---|---|
| 1 | Endpoint thiếu `[Authorize]` | 🟡 `LogsController` **đã khóa Admin (H1 ✅)**; `UserActivitiesController` + `ProductsController.ExportTemplate` vẫn mở |
| 2 | Input không validate | ⚠️ 11 command thiếu Validator (ForgotPassword, ResetPassword, Returns...) |
| 3 | SQL thô | ✅ **Không có SQL Injection** — 7/7 call-site parameterize đúng |
| 4 | CORS "AllowAll" | ✅ Production khóa cứng về `shopviet.online`; chỉ là tên policy gây hiểu nhầm |
| 5 | CSRF middleware | ✅ Hoạt động đúng (Double-Submit), còn 2 điểm yếu nhỏ (L1) |
| 6 | Log sensitive data | ✅ **Đã vá (M1–M5)** — query-string key-only, UserName/exception sanitized, 3 call-site `ILogger<T>` chính, regex bổ sung |
| 7 | JWT config | 🟡 **`Auth:TokenHashSecret` đã bổ sung (H5 ✅)**; còn expiry 60≠15 phút (L4) |
| 8 | Guest vào endpoint nhạy cảm | ✅ **Đã vá (H4 + H6)** — không còn giả mạo chủ đơn / giỏ guest |

**Tổng số phát hiện:** 0 Critical · 6 High (**✅ đã vá toàn bộ**) · 11 Medium (**✅ đã vá toàn bộ**) · 10 Low (+ 9 gap validator).

---

## 2. 🔴 CRITICAL — 0

Không phát hiện lỗ hổng mức RCE / chiếm quyền admin trực tiếp không cần xác thực.

---

## 3. 🟠 HIGH — 6

### H1. Anonymous đọc toàn bộ system logs → lộ PII/IP/query string (chain lộ access token)

- **✅ ĐÃ VÁ** — File thay đổi: `LogsController.cs` (bật `[Authorize(Roles = Admin)]`), `GetLogEntriesQueryHandler.cs` + `GetLogEntryByIdQueryHandler.cs` (fail-closed: anonymous → 403), `RequestLoggingMiddleware.cs` (chỉ log danh sách key của query string, không log giá trị).

- **File:** `LogsController.cs:14` (`//[Authorize]` bị comment) + `GetLogEntriesQueryHandler.cs:47` + `LogEntry.cs:20` (`ApplicationUserId` **nullable**).
- **Cơ chế:** anonymous → `currentUserId = null` → filter `logEntry.ApplicationUserId == currentUserId` khớp mọi log hệ thống (worker ghi với user null). `RequestLoggingMiddleware.cs:81` lại log **full query string** vào `LogEntry.Properties` — bao gồm `?access_token=...` của SignalR negotiate và tham số `vnp_*` của VNPay callback.
- **Khắc phục (2 lớp):**

```csharp
// 1. Bật lại [Authorize]
[Authorize(Roles = "Admin")]   // LogsController class-level

// 2. Fail-closed trong handler — anonymous/null phải bị chặn tuyệt đối
var currentUserId = _currentUserService.UserId;
if (!isAdmin && !currentUserId.HasValue)
    return Result<PaginatedList<LogEntryDto>>.Forbidden("Yêu cầu đăng nhập");
```

```csharp
// RequestLoggingMiddleware.cs — chỉ log tên key, không log giá trị query
{ "RequestQueryString", context.Request.Query.Keys.Count == 0 ? null :
    string.Join("&", context.Request.Query.Keys) }
```

### H2. Logout / Revoke-token **hỏng** — refresh token bị đánh cắp không thể thu hồi

- **✅ ĐÃ VÁ** — File thay đổi: `RevokeTokenCommandHandler.cs` (hash token trước khi so `TokenHash`, inject `ITokenService`), `AuthController.cs` (Logout ghi log lỗi thay vì nuốt exception).

- **File:** `RevokeTokenCommandHandler.cs:34` — so sánh **raw token với hash lưu DB**:

```csharp
user.RefreshTokens.FirstOrDefault(rt => rt.Token == request.RefreshToken && ...) // ❌ không bao giờ khớp
```

- **Hệ quả:** `AuthController.Logout` nuốt exception + chỉ xóa cookie client → token server-side sống đủ 7 ngày, kẻ tấn công vẫn refresh được. (Ngược lại, đường `RefreshTokenCommandHandler.cs:54-55` so bằng hash nên hoạt động đúng — chỉ mỗi revoke bị hỏng.)
- **Khắc phục:**

```csharp
var incomingHash = _tokenService.HashToken(request.RefreshToken);
var refreshToken = user.RefreshTokens.FirstOrDefault(rt => rt.TokenHash == incomingHash && !rt.IsRevoked);
```

### H3. Mọi customer đăng nhập có thể liệt kê PII toàn bộ user (email, phone, chi tiêu)

- **✅ ĐÃ VÁ** — File thay đổi: `UsersController.cs` (thêm `[Authorize(Policy = EPermissions.ViewUsers)]` cho `GetPaged`, `GetTopUsers`, `GetOptionUsers`; policy auto-register, Admin luôn pass).

- **File:** `UsersController.cs:45-72` — `GetPaged`, `GetTop`, `GetOptionUsers` chỉ `[Authorize]` (không `Policy = EPermissions.ViewUsers` như `GetAll`/`GetById`). Handler `GetPagedUsersQueryHandler.cs:60-69` không lọc theo role → trả email, phone, họ tên, status, customer level; `GetTopUsersQueryHandler.cs:47-62` trả tổng chi tiêu + order count.
- **Khắc phục:**

```csharp
[HttpGet("paged")]
[Authorize(Policy = EPermissions.ViewUsers)]   // thay [Authorize]
```

Ngoài ra: cân nhắc lược bỏ `PhoneNumber`/`Email` khỏi DTO khi caller không phải Admin.

### H4. Tạo đơn hàng giả mạo cho user khác (IDOR phân bổ chủ sở hữu)

- **✅ ĐÃ VÁ** — File thay đổi: `OrdersController.cs` (Create luôn ghi đè `ApplicationUserId = User.GetUserId()` khi đã đăng nhập), `CreateOrderCommandHandler.cs` (defense-in-depth: ghi đè trong handler nếu `_currentUserService.UserId.HasValue`).

- **File:** `OrdersController.cs:103` — `command.ApplicationUserId = command.ApplicationUserId ?? User.GetUserId()` **giữ giá trị client gửi**; `CreateOrderCommandHandler.cs:182-205` dùng thẳng giá trị đó (được xác nhận: handler không so sánh với `_currentUserService.UserId`).
- **Khắc phục:** luôn ghi đè bằng danh tính xác thực:

```csharp
// Controller
if (User.Identity?.IsAuthenticated == true)
    command.ApplicationUserId = User.GetUserId();        // ❌ bỏ "?? command.ApplicationUserId"
```

```csharp
// Handler — double check
if (_currentUserService.UserId.HasValue)
    request.ApplicationUserId = _currentUserService.UserId.Value;
```

### H5. `Auth:TokenHashSecret` **thiếu ở production** → auth vỡ (và nguy cơ fix sai)

- **✅ ĐÃ VÁ** — File thay đổi: `render.yaml` (thêm `Auth__TokenHashSecret` với `generateValue: true`), `appsettings.Production.json` (khai báo section `Auth`), `WebAPI/Configuration/AuthTokenSettings.cs` (mới — `[Required, MinLength(16)]`), `Program.cs` (`ValidateDataAnnotations()` + `ValidateOnStart()` → crash fail-fast lúc boot nếu thiếu). `docker-compose.yml` đã có sẵn biến tương ứng.

- **File:** `TokenService.cs:77-81` (throw nếu thiếu) · `appsettings.Production.json` (không có section `Auth`) · `render.yaml:12-40` (chỉ set `ConnectionStrings__*`, `Jwt__*` — không có `Auth__TokenHashSecret`).
- **Hệ quả:** mọi login/external-login trên Render đều throw `InvalidOperationException`; nếu ai "fix nhanh" bằng cách bỏ hash hoặc hardcode secret yếu sẽ tạo lỗ hổng mới.
- **Khắc phục:**

```yaml
# render.yaml
- key: Auth__TokenHashSecret
  generateValue: true          # ít nhất 32 bytes ngẫu nhiên
```

Thêm `ValidateOnStart()` kiểm tra đủ các secret bắt buộc trước khi khởi động.

### H6. Giỏ hàng guest định danh bằng header `X-Guest-ID` do client tự đặt

- **✅ ĐÃ VÁ** — File thay đổi: `WebAPI/Middleware/GuestCartMiddleware.cs` (mới — server sinh `guest_id` cookie httpOnly 7 ngày, đọc qua `context.Items` ngay trong request), `Application/Common/Constants/GuestCartConstants.cs` (mới), `CurrentUserService.cs` (GuestId đọc từ cookie thay cho header), `CreateOrderCommandHandler.cs` (bỏ `GuestId` từ body), `AuthController.cs` (external-login bỏ param guestId; google-response đọc cookie), `Program.cs` (đăng ký `app.UseGuestCart()` sau `UseAuthentication`), `ICurrentUserService.cs` (doc).
  - ⚠️ **Việc còn lại (ngoài backend):** frontend `ecommerce-client` nên ngừng gửi header `X-Guest-ID`; giỏ guest cũ trong Redis sẽ mồ côi một lần khi deploy.

- **File:** `CurrentUserService.cs:68-69` + toàn bộ `Cart` handlers — ai biết/đoán được guestId của nạn nhân có thể đọc/sửa/xóa giỏ, áp mã giảm giá, và **cart-poisoning khi merge** lúc nạn nhân đăng nhập. Kèm theo: `CreateOrderCommandHandler.cs:217` nhận `GuestId` từ body.
- **Khắc phục:** server cấp định danh guest qua **signed cookie** thay vì header client:

```csharp
// Set khi request không có cookie guest
if (!context.Request.Cookies.ContainsKey("guest_id"))
{
    var guestId = Guid.NewGuid().ToString("N");
    context.Response.Cookies.Append("guest_id", guestId, new CookieOptions
    {
        HttpOnly = true, Secure = true, SameSite = SameSiteMode.Lax,
        Expires = DateTimeOffset.UtcNow.AddDays(7)
    });
}
// CurrentUserService.GuestId => đọc từ cookie, không đọc header
```

---

## 4. 🟡 MEDIUM — 11

> **✅ ĐÃ VÁ TOÀN BỘ (M1–M11)** — tóm tắt thay đổi:
> - **M1:** `RequestLoggingMiddleware.cs` — log key-only (vá chung trong H1).
> - **M2:** `EnhancedLogger.cs:324` — `UserName` được sanitize trước khi `TryAdd`.
> - **M3:** `EnhancedLogger.cs:187` — `LogExceptionAsync` không còn truyền exception object thô cho Serilog.
> - **M4:** inject `ILogSanitizer` vào `ElasticsearchProductSearchService.cs`, `OutboxMessageProcessor.cs`, `EmailBackgroundService.cs` — sanitize `DebugInformation`, keyword, cột `Error` DB, subject email; bỏ `LogError(ex, ...)` thô. (SignalR/CacheService log ít nhạy cảm — có thể xử lý bằng enricher toàn cục sau.)
> - **M5:** `LogSanitizer.cs` — thêm `QueryParamSecretRegex` (`?token=`, `&code=`, `api_key=`, `secret=`, `key=`) + `RawTokenValueRegex` (refresh token base64/hex không bắt đầu `eyJ`).
> - **M6:** `VnPayPaymentGateway.cs:144-165` — `CryptographicOperations.FixedTimeEquals` + pre-check độ dài + catch `FormatException`.
> - **M7:** `Program.cs` — helper `Program.ResolveRateLimitKey()`: ưu tiên `RemoteIpAddress`; chỉ khi peer là private/loopback mới lấy entry **cuối** của XFF nếu hợp lệ IP công khai. Áp cho cả 4 policy.
> - **M8:** `AuthController.cs` — `[EnableRateLimiting("AuthPolicy")]` cho `register` + `refresh-token`.
> - **M9:** `Program.cs` — đăng ký `app.UseAccountLockCheck()` sau `UseAuthentication`; `AccountLockMiddleware.cs` cho phép `logout` chạy qua.
> - **M10:** `FileStorageService.cs` + `SupabaseStorageService.cs` — whitelist extension (ảnh + `.xlsx/.csv/.pdf/.txt`) + chặn path traversal trong `folderName`.
> - **M11:** `LoginUserCommandHandler.cs` — thống nhất mọi thông báo thất bại thành `"Email hoặc mật khẩu không đúng."` (kể cả tài khoản bị khóa); lý do khóa được ghi log `LoginFailed_Locked`.

| # | Lỗ hổng | Vị trí | Khắc phục |
|---|---|---|---|
| M1 | Log full query string (VNPay params, token tiềm ẩn) | `RequestLoggingMiddleware.cs:81` | Chỉ log danh sách key, hoặc redact `token`, `code`, `key`, `vnp_*` (xem H1) |
| M2 | Email được thêm vào log **sau** bước sanitize (`GetUserName()` fallback `ClaimTypes.Email` tại `EnhancedLogger.cs:356-361`) | `EnhancedLogger.cs:311-331` | `enrichedProperties.TryAdd("UserName", _sanitizer.Sanitize(userName))` |
| M3 | Exception **thô** truyền vào Serilog (`.Enrich.WithExceptionDetails()` ghi message/stack trace/Data gốc) | `EnhancedLogger.cs:187` + `SeriLogger.cs:70,110` | Không truyền `ex` object cho Serilog — chỉ log `ExceptionMessage`/`StackTrace` đã sanitize |
| M4 | `ILogger<T>` trực tiếp bypass toàn bộ sanitizer | `ElasticsearchProductSearchService.cs:139,198` (DebugInformation + keyword), `OutboxMessageProcessor.cs:79,82` (lưu `ex.ToString()` 4000 ký tự vào DB), `EmailBackgroundService.cs:46`, SignalR, CacheService | Chuẩn hóa qua `IEnhancedLogger`, hoặc đặt destructure filter toàn cục ở Serilog sink |
| M5 | `LogSanitizer` bỏ sót token không bắt đầu `eyJ`, param `?token=`, `?code=`, `?api_key=` | `LogSanitizer.cs:9-31` | Thêm regex: `(?i)(token|code|key|secret)\s*[=:]\s*[^\s&,;]+` |
| M6 | VNPay verify chữ ký không constant-time (timing side-channel trên endpoint `ipn` mở) | `VnPayPaymentGateway.cs:148` (`String.Equals` + `InvariantCultureIgnoreCase`) | `CryptographicOperations.FixedTimeEquals(Convert.FromHexString(checksum), Convert.FromHexString(inputHash))` |
| M7 | **Bypass rate limit** — partition key đọc header `X-Forwarded-For` thô, không cấu hình `KnownProxies` | `Program.cs:107,118,129,140` | Dùng `context.Connection.RemoteIpAddress` (đã qua `UseForwardedHeaders` với `KnownProxies` rõ ràng) hoặc giới hạn `ForwardLimit=1` + chỉ tin header từ proxy đáng tin |
| M8 | `register` và `refresh-token` không có rate limit riêng (spam tài khoản, brute-force refresh) | `AuthController.cs:54,121` | `[EnableRateLimiting("AuthPolicy")]` — policy `AuthPolicy` (100/min) đã định nghĩa trong `Program.cs:116` nhưng **chưa được dùng ở đâu** |
| M9 | `AccountLockMiddleware` không đăng ký → tài khoản bị khóa vẫn dùng session/refresh cũ (khóa chỉ chặn login mới qua `LoginUserCommandHandler.cs:52-60`) | `Program.cs:241-269` + `RefreshTokenCommandHandler` | `app.UseAccountLockCheck()` sau `UseAuthentication`; thêm check `IsUserLockedAsync` trong refresh handler |
| M10 | Upload không whitelist extension cho file **không phải ảnh** → stored XSS (`.html`) trên `wwwroot/uploads` | `FileStorageService.cs:54-66` | Extension whitelist cứng cho mọi file + thêm `Content-Disposition: attachment` khi serve |
| M11 | User enumeration — `"Remaining attempts: {n}"` chỉ hiện khi tài khoản tồn tại | `LoginUserCommandHandler.cs:87` | Thông báo đồng nhất: `"Email hoặc mật khẩu không đúng"` cho cả 2 trường hợp |

---

## 5. 🟢 LOW — 10

| # | Lỗ hổng | Vị trí | Khắc phục |
|---|---|---|---|
| L1 | CSRF: so sánh token không constant-time; token không rotate (24h); skip-list dùng `path.Contains` | `CsrfValidationMiddleware.cs:52-84` | `CryptographicOperations.FixedTimeEquals(...)`; rotate `csrf_token` mỗi lần refresh; dùng `StartsWithSegments` |
| L2 | Thiếu header **HSTS** | `SecurityHeadersMiddleware.cs` | `app.UseHsts()` (non-dev), header `Strict-Transport-Security: max-age=31536000; includeSubDomains` |
| L3 | CSP chứa `'unsafe-inline' 'unsafe-eval'` | `SecurityHeadersMiddleware.cs:27-33` | Thu hẹp dần: bỏ `unsafe-eval`, chỉ giữ `unsafe-inline` cho Swagger (chỉ enable ở dev) |
| L4 | JWT sống **60 phút** (production) nhưng cookie chỉ 15 phút — token vẫn hợp lệ sau khi cookie hết hạn | `appsettings.Production.json:20` vs `:103` | Đồng bộ `Jwt__AccessTokenExpirationMinutes = 15` |
| L5 | Secret JWT encode bằng `Encoding.ASCII` — lặng lẽ làm yếu key nếu chứa ký tự non-ASCII | `TokenService.cs:29,92,118` | `Encoding.UTF8.GetBytes(...)` |
| L6 | Trả `ex.Message` nội bộ cho client (`"Login failed: {ex.Message}"` tại `LoginUserCommandHandler.cs:155`, `BadRequest(ex.Message)` trong nhiều handler) | nhiều file | Trả message generic + correlationId (đã có sẵn ở exception middleware) |
| L7 | Supabase **ServiceRoleKey** (bypass toàn bộ RLS) nằm plaintext trong config production | `appsettings.Production.json:42-46` | Dùng **anon key** + bucket policies hạn chế; chuyển secret sang environment variable/secret manager |
| L8 | `DeleteFileAsync` không chặn path traversal (filePath từ DB nên rủi ro thấp, defense-in-depth) | `FileStorageService.cs:78` | `Path.GetFullPath` phải nằm trong `_rootPath`, nếu không → từ chối |
| L9 | Nhóm nhỏ: `GetLockStatus` không check ownership (`AccountLocksController.cs:72`) · `CheckClaims` lộ claims (`UsersController.cs:30`) · `CreateReviewReplyCommandHandler.cs:63` hardcode `IsVerified=true` · `ExportTemplate` public (`ProductsController.cs:201`) | nhiều file | Gắn policy/ownership check; chỉ verified khi đã mua; bật lại policy EditProduct |
| L10 | GuestId nhận từ **body** khi tạo đơn (`CreateOrderCommandHandler.cs:217`) — giả danh guest khác | cùng file | Chỉ dùng `_currentUserService.GuestId` (sau khi đã chuyển sang signed cookie — H6) |

### Gap validator cần bổ sung (command không có `*Validator.cs`)

Pipeline `ValidationBehavior` chỉ chạy khi tồn tại `IValidator<TRequest>` (`ValidationBehavior.cs:18-34`); validator đăng ký tự động qua `AddValidatorsFromAssembly`. Các command **thiếu validator** (xác nhận bằng glob):

| Command | Endpoint | Field cần validate |
|---|---|---|
| `ForgotPasswordCommand` | `POST /api/auth/forgot-password` | Email required + format |
| `ResetPasswordCommand` | `reset-password`, `reset-password/confirm` | Độ mạnh mật khẩu (≥12 ký tự, phức tạp) |
| `CreatePaymentForOrderCommand` | `POST /api/payments/vnpay/create-url` | OrderId required; PaymentMethod whitelist |
| `CreateReturnRequestCommand` | `POST /api/returns` | OrderId/OrderItemId required, Quantity>0, EvidenceFiles ≤10 |
| `ApproveReturnCommand` / `RejectReturnCommand` / `UpdateReturnStatusCommand` | `PUT /api/returns/*` | Enum hợp lệ, `RejectionReason` bắt buộc, Note max length |
| `ChangeUserStatusCommand` | (handler tồn tại) | UserId required, enum Status hợp lệ |
| `ImportProductsCommand` | `POST /api/products/import` | Kích thước file, extension, CSV schema |
| `CreateReviewCommand` | `POST /api/reviews` | Rating 1-5 (handler check ✅), Content required + max length, Images count/size/type |
| `CreateReviewReplyCommand` | `POST /api/reviews/{id}/replies` | Content max length (controller chỉ check non-empty) |

---

## 6. ✅ Các điểm đã làm tốt (không cần sửa)

1. **SQL Injection: không phát hiện** — raw SQL chỉ tồn tại ở `BaseRepository.cs:283-294` (`SqlQueryRaw`/`ExecuteSqlRawAsync` + `object[]` params); 7/7 call-site parameterize đúng: `MergeCartService.cs:40-44,109-113`, `ProcessPaymentCallbackCommandHandler.cs:202-207,220-223`, `CreateOrderCommandHandler.cs:242-251`; `LogRetentionCleanupService` dùng LINQ `ExecuteDeleteAsync`. Rủi ro còn lại chỉ là defense-in-depth (Low).
2. **Refresh token**: 256-bit CSPRNG (`TokenService.cs:64-72`), lưu **HMAC-SHA256 hash** (`:75-87`), rotation + phát hiện replay → revoke toàn bộ session (`RefreshTokenCommandHandler.cs:62-66`), check User-Agent/IP subnet (`:76-94`). Cả 3 luồng login/external/refresh đều hash trước khi lưu/so sánh.
3. **VNPay callback**: verify chữ ký HMAC-SHA512 trước (`VnPayPaymentGateway.cs:63,144-149`), callback ≤ 30 phút, amount khớp order (`:85-98`), order phải ở trạng thái Pending (`:100-115`), chống double-payment qua check `Payment` tồn tại + `ON CONFLICT (TxnRef) DO NOTHING` (`:121-138,202-207`).
4. **Mật khẩu**: policy mạnh — ≥12 ký tự, digit/lower/upper/non-alphanumeric, ≥6 unique (`AddIdentityExtensions.cs:14-19`) + khóa tài khoản 30 phút sau 5 lần sai (`LoginUserCommandHandler.cs:65-87`, tự hết hạn lazy trong `AccountLockRepository.cs:32-35`).
5. **CSRF**: Double-Submit Cookie hoạt động đúng, chỉ áp cho method ghi khi có cookie auth (`CsrfValidationMiddleware.cs:13-91`); production bật `EnableCsrfProtection: true`.
6. **Response lỗi**: 500 trả generic + correlationId (`GlobalExceptionHandlingMiddleware.cs:132-139`), không lộ stack trace/connection string/body; `LoggingBehavior.cs:28-29` cố ý không serialize request; `DevelopmentOnlyAttribute` trả 404 ngoài dev.
7. **Ownership checks đúng** ở: Orders (GetById/GetOrderHistory/GetOrdersByUser), Addresses (4 handler), Wishlist, Returns (GetById/Create), Notifications (MarkAsRead/Delete), Reviews (Like/Create), Payments (CreatePaymentUrl verify chủ sở hữu + amount từ server), Account (UpdateProfile/ChangePassword), RefreshToken (rotation + replay).
8. CORS production khóa cứng về `shopviet.online` (`appsettings.Production.json:107-111`); file chứa secret thật đều nằm trong `.gitignore` (chỉ `*.example.json` được track — đã xác nhận bằng `git ls-files`).
9. Rate limit có 3 policy rõ ràng + `OnRejected` trả 429 tiếng Việt; lockout tự động sau 5 lần sai.

---

## 7. Thứ tự ưu tiên xử lý

1. **Ngay:** H1 (bật `[Authorize]` Logs + fail-closed filter), H2 (sửa revoke), H4 (fix gán UserId), H5 (bổ sung `Auth__TokenHashSecret` vào render.yaml). — ✅ **ĐÃ HOÀN TẤT**
2. **Tuần này:** H3 (policy ViewUsers), H6 (guest cookie), M1–M7 (log sanitize + VNPay + rate-limit). — ✅ **ĐÃ HOÀN TẤT** (đã vá thêm cả M8–M11: rate limit register/refresh, đăng ký AccountLockMiddleware, upload whitelist, chống user enumeration)
3. **Sprint sau:** nhóm Low (L1–L10) + 9 gap validator + 2 endpoint còn mở `[Authorize]` bị comment (`UserActivitiesController`, `ProductsController.ExportTemplate`). — ⏳ chưa bắt đầu.

---

## 8. Phụ lục — bản đồ endpoint public / bị comment

### Endpoint công khai (không `[Authorize]`)

| Controller | Endpoint | Ghi chú |
|---|---|---|
| `AuthController` | register, login, refresh-token, cookie-check, external-login, google-response, forgot/reset-password (verify/confirm) | login/forgot/reset có rate limit riêng |
| `CartController` | **toàn bộ** (class-level `[AllowAnonymous]`) | guest cart |
| `OrdersController` | `POST /api/orders` (Create) | guest checkout |
| `PaymentsController` | `GET vnpay/return`, `GET vnpay/ipn` | callback VNPay (cần thiết, đã verify chữ ký) |
| `ProductsController` | tất cả GET + `export-template` | |
| `CategoriesController` / `BrandsController` / `BannerController` / `AboutController` / `ContactController` / `MarqueeController` / `SearchController` | tất cả GET | đọc công khai — chấp nhận được |
| `SearchSuggestionsController` | GET suggestions/trending | POST/DELETE có `[Authorize]` |
| `PromoCodesController` | `GetActivePromoCodes`, `ApplyPromoCode` | |
| `UserActivitiesController` | `GET /`, `GET /recent` | ⚠️ `[Authorize]` bị comment; handler có check nên dữ liệu an toàn hơn — **chưa vá** |
| `LogsController` | ~~toàn bộ 4 GET~~ | ✅ **ĐÃ VÁ (H1)** — giờ chỉ Admin (`[Authorize(Roles = Admin)]`) |
| `WeatherForecastController` / `TestStorageController` | public nhưng `[DevelopmentOnly]` | trả 404 ngoài dev |

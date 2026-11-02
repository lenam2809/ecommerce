> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 14/05/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/architecture-backend.md`](architecture-backend.md) và [`docs/reports/KIEM_KE_HIEN_TRANG.md`](reports/KIEM_KE_HIEN_TRANG.md).

# Báo cáo phân tích và kế hoạch cải tiến ShopViet E-Commerce Platform

Ngày cập nhật: 2026-05-14

## Mục lục

1. [Tóm tắt điều hành](#1-tóm-tắt-điều-hành)
2. [Tổng quan dự án](#2-tổng-quan-dự-án)
3. [Phân tích kiến trúc hiện tại](#3-phân-tích-kiến-trúc-hiện-tại)
4. [Các rủi ro trọng yếu cần xử lý trước](#4-các-rủi-ro-trọng-yếu-cần-xử-lý-trước)
5. [Đánh giá chi tiết theo feature](#5-đánh-giá-chi-tiết-theo-feature)
6. [Chiến lược triển khai không phá kiến trúc hiện có](#6-chiến-lược-triển-khai-không-phá-kiến-trúc-hiện-có)
7. [Test strategy và acceptance criteria](#7-test-strategy-và-acceptance-criteria)
8. [Migration, rollout và rollback plan](#8-migration-rollout-và-rollback-plan)
9. [Lộ trình cải thiện đề xuất](#9-lộ-trình-cải-thiện-đề-xuất)
10. [Câu hỏi cần làm rõ trước khi đưa vào sprint](#10-câu-hỏi-cần-làm-rõ-trước-khi-đưa-vào-sprint)
11. [Kết luận](#11-kết-luận)

## 1. Tóm tắt điều hành

Báo cáo này đánh giá mã nguồn ShopViet theo các trục quan trọng của một hệ thống e-commerce: security, checkout/payment, stock correctness, ownership, Clean Architecture, CQRS, DDD, frontend quality gate, observability, migration và rollback.

Nhận định chính:

- Kiến trúc nền tương đối tốt: backend đã tách `Domain`, `Application`, `Infrastructure`, `WebAPI`; CQRS dùng MediatR; có pipeline behaviors, repository/unit of work, Identity/JWT cookie auth, CSRF middleware, Redis/cache, SignalR, OpenTelemetry.
- Không nên rewrite. Cách cải tiến phù hợp là bổ sung policy, validator, handler, repository method, DB constraint, adapter và tests đúng layer hiện có.
- Các rủi ro ưu tiên cao nhất là public mutation/admin endpoints, payment workflow chưa khép kín, promo code redeem sai thời điểm, stock product/SKU chưa nhất quán, thiếu ownership checks, domain event side effect trước commit, và quality gate frontend đang bị bỏ qua.
- Một số priority trong bản nháp cũ đã được tinh chỉnh: không gom toàn bộ frontend hoặc import/export vào High/Critical nếu chưa có bằng chứng tác động trực tiếp. Mỗi vấn đề được tách theo mức độ thực tế.

## 2. Tổng quan dự án

ShopViet là nền tảng thương mại điện tử full-stack gồm:

- Backend: ASP.NET Core 8 Web API, Clean Architecture, CQRS với MediatR, Entity Framework Core, Identity, JWT qua cookie httpOnly, CSRF double-submit cookie, SignalR, OpenTelemetry, Redis cache tùy chọn, Elasticsearch tùy chọn.
- Frontend:
  - `apps/frontend/ecommerce-client`: storefront khách hàng, Next.js 15, Tailwind CSS, TanStack Query, SignalR.
  - `apps/frontend/ecommerce-dashboard`: dashboard quản trị, Next.js 15, Tailwind CSS, TanStack Query, SignalR.
- Database: code hiện tại hỗ trợ PostgreSQL/SQLite trong `AddDatabaseExtensions`; ngữ cảnh dự án nói SQL Server local. Cần đồng bộ README, appsettings, migrations và deployment docs để tránh nhầm provider.
- Test: có domain tests, application tests và integration tests, nhưng độ phủ chưa đều ở payment, security, ownership, promo, inventory, returns.

Các feature module chính trong `Ecommerce.Application/Features`:

- Core commerce: `Products`, `Categories`, `Brands`, `Cart`, `Orders`, `Payments`, `PromoCodes`, `Inventory`, `Wishlists`.
- Customer flow: `Auth`, `Account`, `CustomerAddresses`, `Reviews`, `Returns`, `SearchSuggestions`, `Notifications`.
- Admin/operations: `Users`, `Roles`, `Permissions`, `AccountLocks`, `Reports`, `Dashboard`, `AuditLogs`, `UserActivities`, `Marquee`, `About`, `Contact`, `Banners`.

## 3. Phân tích kiến trúc hiện tại

### 3.1 Layer và dependency rule

Kiến trúc hiện tại bám khá sát Clean Architecture:

- `Ecommerce.Domain`: entity, aggregate behavior, enum, domain event, domain exception, repository contracts, domain service contracts.
- `Ecommerce.Application`: command/query handlers, DTO, validators, mapping, pipeline behaviors, application service abstractions.
- `Ecommerce.Infrastructure`: EF Core `ApplicationDbContext`, repository implementations, Identity/JWT, cache, email, file storage, SignalR hubs, Elasticsearch, logging.
- `Ecommerce.WebAPI`: controller, middleware, auth cookie extensions, request pipeline, health checks.

Điểm đúng:

- WebAPI chủ yếu gọi Application qua `IMediator`.
- Application phụ thuộc vào abstraction (`IUnitOfWork`, repository contracts, file storage/email/cache interfaces).
- Infrastructure implement chi tiết kỹ thuật.
- Domain có invariant cho `Order`, `Product`, `ReturnRequest`, SKU/inventory.

Điểm lệch cần sửa:

- `VnPayService` nằm trong Application nhưng phụ thuộc `HttpContext` và `IQueryCollection`. Đây là Web concern/gateway concern, nên đưa adapter VNPay sang Infrastructure. Application chỉ nên biết `IPaymentGateway`.
- Một số controller chứa logic nghiệp vụ/thống kê (`OrdersController` history overview/stats), làm yếu CQRS và khó test.
- Domain events đang dispatch trước `base.SaveChangesAsync`; nếu event handler gửi email/notification hoặc gọi external system, side effect có thể xảy ra dù transaction DB thất bại.

### 3.2 CQRS và transaction boundary

MediatR pipeline hiện có:

- `LoggingBehavior`
- `ValidationBehavior`
- `AuthorizationBehavior`
- `CachingBehavior`
- `TransactionBehavior`

Đây là nền tốt, nhưng cần chỉnh:

- `TransactionBehavior` đang bỏ qua query bằng convention `requestName.EndsWith("Query")`. Nên chuyển sang marker interfaces:

```csharp
public interface ICommand<out TResponse> : IRequest<TResponse> { }
public interface IQuery<out TResponse> : IRequest<TResponse> { }
```

- Command handler không nên tự mở transaction trừ trường hợp đặc biệt. Một command nên có một transaction boundary rõ.
- Query không được mutate state.
- External calls như email, notification, payment gateway không nên chạy trong DB transaction dài. Với side effect quan trọng, dùng outbox hoặc background worker.

### 3.3 Authorization model

Hiện tại authorization nằm ở cả controller và một số command handler qua `[Authorize]`. Hướng này đúng nhưng chưa nhất quán:

- Static permission như `ViewProducts`, `CreateRole`, `DeleteOrder` có thể khai báo bằng policy ở controller và command.
- Ownership/business authorization như “user chỉ xem order/return/address của mình” nên đặt trong Application handler/query vì cần dữ liệu runtime.
- Payment IPN/webhook không nên dùng user `[Authorize]`; phải xác thực bằng signature, idempotency, optional IP allowlist và audit log riêng.

### 3.4 Frontend API/auth model

Điểm tốt:

- Frontend dùng axios base URL `/api`, Next rewrites sang backend; cookie được set cùng frontend domain.
- `withCredentials` bật.
- Interceptor thêm `X-CSRF-Token` cho POST/PUT/PATCH/DELETE.
- Token refresh có queue để tránh nhiều refresh đồng thời.
- Dashboard middleware kiểm tra role Admin/Manager.

Rủi ro:

- `next.config.ts` đang `ignoreDuringBuilds`; client còn `ignoreBuildErrors`. Điều này không phải lúc nào cũng Critical, nhưng là quality gate risk cần xử lý theo phase.
- `dangerouslySetInnerHTML` tồn tại ở marquee/product description/chart styles. Mức độ phụ thuộc nguồn HTML: nếu là user/admin content chưa sanitize thì High/Critical; nếu là JSON-LD hoặc CSS nội bộ thì thấp hơn.
- Nhiều `console.log/error/warn` còn trong runtime. Đây là Low/Medium, trừ khi log token/PII.

## 4. Các rủi ro trọng yếu cần xử lý trước

### 4.1 Bảng priority đã điều chỉnh

| Nhóm | Vấn đề | Mức độ | Lý do |
|---|---|---:|---|
| Security | Public mutation/admin endpoints | Critical | Có thể sửa/xóa catalog, promo, settings, upload file hoặc lộ report |
| Security | Swagger/test endpoints production, HTTPS off | Critical | Lộ API surface, downgrade transport security |
| Payment | Tạo payment URL từ dữ liệu client, IPN/callback chưa khép kín | Critical | Sai tiền, sai order status, double processing |
| Promo | CRUD public hoặc `apply` làm tăng usage | Critical/High | Public CRUD là Critical; redeem sai thời điểm là High |
| XSS | Render raw HTML chưa sanitize | Critical/High | Critical nếu user-generated; High nếu admin CMS content |
| Stock | Product stock và SKU stock không thống nhất trong checkout | High/Critical | Critical nếu checkout variant đang live; High nếu chưa live |
| Ownership | Returns/orders/addresses/search history thiếu owner check | High | Lộ dữ liệu khách hàng hoặc thao tác trên tài nguyên người khác |
| Orders | Order/RMA code generator có nguy cơ trùng | High | Ảnh hưởng payment/reconciliation/support |
| Domain events | Side effect trước commit | High | Email/notification/payment event có thể xảy ra dù DB rollback |
| Reports | Reports thiếu authorize, `int.MaxValue` load toàn bộ | High | Lộ dữ liệu kinh doanh, timeout/memory spike |
| Frontend | Build bỏ qua type/lint | Medium/High | High nếu đang che lỗi runtime nghiêm trọng; mặc định Medium |
| Import/export | Xử lý file lớn synchronous | Medium | Nâng lên High nếu production đã có file lớn/timeouts |
| Console logs | Debug logs production | Low/Medium | Medium nếu chứa PII/token, còn lại Low |

### 4.2 Endpoint cần phân loại và khóa quyền

Danh sách dưới đây được rút từ controller hiện tại và cần chuyển thành task kiểm thử cụ thể. Một số endpoint có thể public hợp lệ, nhưng phải phân loại rõ: public read, public create form, authenticated customer, admin/manager hoặc internal callback.

| Controller | Endpoint/nhóm endpoint | Hiện trạng rủi ro | Phân loại đề xuất |
|---|---|---|---|
| `AboutController` | `POST`, `PUT`, `DELETE`, `PATCH status` | Mutation content site có thể public | Admin/Manager only |
| `ContactController` | `GET all`, `GET by id`, `PUT`, `DELETE`, `PATCH status` | Contact management có thể public | Admin/Manager only |
| `ContactController` | `POST` create contact message | Có thể public hợp lệ | Public, nhưng rate limit + validation |
| `BannerController` | CRUD banner | Mutation content site có thể public | Admin/Manager only |
| `BrandsController` | CRUD brand | Catalog mutation | Admin/Manager only |
| `CategoriesController` | CRUD category | Catalog mutation | Admin/Manager only |
| `PromoCodesController` | CRUD/list paged | Promotion mutation/data | Admin/Manager only |
| `PromoCodesController` | `active`, validate/apply | Có thể public/customer | Public/customer nhưng không redeem usage |
| `AddressesController` | CRUD address | Ownership risk | Authenticated customer + owner check |
| `WishlistController` | all endpoints | Handler tự unauthorized, controller chưa khóa | `[Authorize]` + current user only |
| `SearchSuggestionsController` | save/delete/clear history | Client truyền/ảnh hưởng user history | Current user/guest only + ownership |
| `PaymentsController` | create URL | Client có thể giả amount/order | Auth/guest ownership + backend amount |
| `PaymentsController` | VNPay return/IPN | Không dùng user auth | Signature validation + idempotency |
| `ReportsController` | all report endpoints | Dữ liệu kinh doanh | `ViewReports` |
| `TestStorageController` | upload/url/delete | Dev/test public | Disable outside development |
| `WeatherForecastController` | sample endpoint | Dev/test public | Remove/disable outside development |

## 5. Đánh giá chi tiết theo feature

### 5.1 Auth, account lock và security

**Vấn đề**

- Nhiều mutation endpoint không có `[Authorize]` hoặc policy phù hợp.
- Swagger luôn bật.
- `UseHttpsRedirection()` bị comment.
- `JwtBearerOptions.RequireHttpsMetadata = false`.
- CSRF middleware bỏ qua khi không có `access_token`, trong khi một số endpoint public có side effect cần rate limit/validation riêng.

**Tác động**

- Unauthorized user có thể sửa catalog/settings/promo hoặc upload/delete file nếu endpoint thực sự public.
- Production API surface dễ bị dò quét.
- Cookie/JWT có rủi ro vận hành nếu deploy không ép HTTPS.

**Giải pháp không phá kiến trúc**

- WebAPI: khai báo static policy ở controller/action.
- Application: thêm `[Authorize(Policy = ...)]` cho command/query quan trọng để bảo vệ khi command được gọi từ entrypoint khác.
- Ownership: đặt trong handler bằng `ICurrentUserService`, không đặt logic phức tạp trong controller.
- Internal callback: payment IPN dùng signature/idempotency, không dùng user auth.

**Acceptance criteria**

- Anonymous request tới admin mutation trả `401` hoặc `403`.
- Customer không gọi được report/admin catalog mutation.
- CSRF thiếu header với cookie-auth state-changing request trả `403`.
- Swagger chỉ bật ở Development hoặc sau admin auth.
- Production bật HTTPS redirection.

**Test cases**

- `POST /api/categories` anonymous -> `401/403`.
- `PUT /api/about/{id}` customer -> `403`.
- `GET /api/reports/...` customer -> `403`.
- `POST /api/auth/login` không yêu cầu CSRF.
- `POST /api/cart/items` guest hợp lệ cần rate limit và guest id validation.

### 5.2 Products, categories, brands, banners

**Vấn đề**

- CRUD catalog/content có dấu hiệu public.
- Tồn tại hai nguồn stock: `Product.StockQuantity` và `ProductVariantSku.StockQuantity`.
- Import/export có thể tốn memory khi file lớn.
- `RowVersion` tự set bằng Guid byte array; mức độ phụ thuộc DB provider.

**Tác động**

- Catalog takeover: sửa giá, ẩn sản phẩm, đổi ảnh, xóa category/brand.
- Oversell hoặc sai availability nếu checkout variant nhưng trừ product stock.
- Import/export timeout nếu dataset lớn.

**Giải pháp cụ thể**

- Public read vẫn giữ public: danh sách sản phẩm, category tree, brand list, banner active.
- Mutation dùng policy: `CreateProduct`, `EditProduct`, `DeleteProduct`, tương ứng cho category/brand/banner.
- Chuẩn hóa stock source:
  - `HasVariants = false`: checkout dùng `Product.StockQuantity`.
  - `HasVariants = true`: request bắt buộc có `ProductVariantSkuId`; checkout dùng `ProductVariantSku.StockQuantity`.
- Application chỉ gọi abstraction:

```csharp
public interface IStockReservationService
{
    Task<StockReservationResult> ReserveAsync(
        IReadOnlyCollection<StockReservationItem> items,
        CancellationToken cancellationToken);
}
```

- Infrastructure thực hiện atomic update trong transaction bằng repository method, không để raw SQL rải trong handler.
- DB constraints:
  - unique `Product.Slug`
  - unique `Product.Code`/`Sku`
  - unique `ProductVariantSku.Sku`
  - check `StockQuantity >= 0`, `Price >= 0` nếu provider hỗ trợ.

**Acceptance criteria**

- Product variant không thể checkout nếu thiếu SKU id.
- Concurrent checkout không làm stock âm.
- Admin/Manager mới tạo/sửa/xóa catalog.
- Import file vượt max size bị từ chối rõ ràng.

**Test cases**

- Two concurrent orders reserve same last stock -> chỉ một order thành công.
- `HasVariants=true` + missing `ProductVariantSkuId` -> validation error.
- Anonymous `DELETE /api/brands/{id}` -> `401/403`.
- Duplicate slug/SKU -> unique constraint hoặc validation error.

### 5.3 Cart và wishlist

**Vấn đề**

- `WishlistController` chưa khóa `[Authorize]`; handler tự trả unauthorized.
- `GetCartQueryHandler` dùng `.Result` khi gọi async file URL.
- Guest cart dựa trên `X-Guest-ID` từ localStorage; cần TTL, rate limit, size limits.

**Tác động**

- API behavior không nhất quán, khó audit security.
- `.Result` có thể gây thread starvation/deadlock risk dưới tải cao.
- Guest cart có thể bị spam hoặc tạo payload lớn.

**Giải pháp**

- Thêm `[Authorize]` ở wishlist controller hoặc command/query.
- Resolve URL bằng `Task.WhenAll`.
- Guest cart limits:
  - max item count/cart.
  - max quantity/item.
  - Redis TTL.
  - rate limit theo IP + guest id.
- Merge cart sau login cần rule rõ:
  - cùng product/SKU thì cộng quantity tới max stock.
  - item hết hàng thì giữ trong cart với trạng thái unavailable hoặc loại bỏ có thông báo.

**Acceptance criteria**

- Anonymous wishlist endpoints trả `401`.
- Guest cart hết TTL trả empty cart.
- Add cart vượt max quantity trả validation error.
- Merge cart không vượt stock.

### 5.4 Orders

**Vấn đề**

- `GenerateOrderCode` dùng `DateTime.Now + Random`, có nguy cơ trùng khi concurrent.
- Controller chứa report logic và dùng `PageSize = int.MaxValue`.
- Domain events dispatch trước DB commit.
- Guest checkout ownership cần cơ chế truy cập rõ cho order detail/return/payment.

**Tác động**

- Trùng order code gây lỗi payment reconciliation.
- Report chậm, khó test, dễ memory spike.
- Side effect xảy ra dù DB rollback.
- Guest user có thể không có cơ chế chứng minh quyền truy cập order sau checkout.

**Giải pháp**

- Tạo unique index cho `Order.Code`.
- Tạo `IOrderCodeGenerator`, implement ở Infrastructure bằng DB sequence hoặc retry khi unique violation.
- Đưa stats vào query handlers:
  - `GetMyOrderHistoryStatsQuery`
  - `GetOrderHistoryOverviewQuery`
- Aggregate bằng SQL projection, bắt buộc date range và page size max.
- Phân loại domain event:
  - In-process event không side effect ngoài DB: có thể xử lý synchronous.
  - Integration event/email/notification/payment: dùng outbox sau commit.
- Guest checkout:
  - Order lưu `GuestId`.
  - Order detail cho guest cần access tokenized link hoặc email verification, không chỉ dựa vào GUID.

**Acceptance criteria**

- `Order.Code` unique ở DB.
- Duplicate code generator collision được retry hoặc trả lỗi kiểm soát.
- Reports không load toàn bộ order bằng `int.MaxValue`.
- Email/notification order created không gửi nếu transaction thất bại.

### 5.5 Payments

**Vấn đề**

- `CreatePaymentUrl` nhận model từ client, có thể giả order/amount.
- Endpoint public chưa kiểm tra owner/payable state.
- Return URL hard-code `http://localhost:3000`.
- IPN còn comment cập nhật order status, workflow chưa khép kín.
- `VnPayService` nằm trong Application nhưng phụ thuộc `HttpContext`/`IQueryCollection`.

**Tác động**

- User có thể tạo payment URL với amount không khớp order.
- Payment success nhưng order không paid, hoặc callback/IPN xử lý lặp.
- Production redirect sai.
- Application layer bị nhiễm gateway/Web concern.

**Thiết kế đề xuất**

Application:

- `CreatePaymentForOrderCommand`
- `ProcessPaymentCallbackCommand`
- `ProcessPaymentIpnCommand`
- `IPaymentGateway`
- `IPaymentTransactionRepository`

Infrastructure:

- `VnPayPaymentGateway`
- Signature verification, URL generation, gateway-specific mapping.

WebAPI:

- Controller chỉ map HTTP request sang command.
- Return endpoint redirect frontend sau khi Application trả payment result.
- IPN trả gateway response code theo kết quả command.

**Payment state machine**

Các trạng thái tối thiểu:

- `Pending`
- `Paid`
- `Failed`
- `Expired`
- `Cancelled`
- `Refunded`

Luồng đề xuất:

1. Order created ở trạng thái `PendingPayment` hoặc `Pending`.
2. Create payment URL:
   - load order từ DB.
   - check owner hoặc guest access token.
   - check payable state.
   - amount lấy từ `Order.TotalAmount`.
   - tạo `PaymentTransaction` pending với unique `TxnRef`.
3. VNPay return:
   - verify signature.
   - không tin client amount.
   - cập nhật transaction nếu chưa processed.
   - redirect frontend theo config `AppUrl:Frontend`.
4. VNPay IPN:
   - source of truth nếu VNPay hỗ trợ server-to-server.
   - idempotent theo `TxnRef` + gateway transaction no.
   - nếu success: create `Payment`, mark transaction success, update order payment/status.
   - nếu failed/mismatch: mark failed, không update order paid.

**Idempotency**

- Unique index `PaymentTransactions.TxnRef`.
- Nếu callback/IPN đến lần 2, trả kết quả đã xử lý.
- Nếu IPN đến trước callback hoặc callback đến trước IPN, kết quả cuối cùng vẫn nhất quán.

**Acceptance criteria**

- Client không thể truyền amount tùy ý khi tạo payment URL.
- Invalid signature không update order/payment.
- Amount mismatch không update order/payment.
- Duplicate IPN không tạo duplicate payment.
- Return URL lấy từ config, không hard-code localhost.

### 5.6 Promo codes

**Vấn đề**

- CRUD promo có dấu hiệu public.
- `ApplyPromoCodeCommandHandler` tăng `CurrentUsage` khi apply/preview, chưa chờ order thành công.
- Chưa thấy snapshot discount trong order.
- Chưa thấy duplicate redemption protection đủ rõ.

**Tác động**

- Mã giảm giá có thể bị sửa/xóa trái phép.
- User có thể làm cạn usage bằng cách apply liên tục.
- Order cũ bị ảnh hưởng nếu promo bị sửa sau khi order tạo, nếu không snapshot.

**Thiết kế đề xuất**

- `ValidatePromoCodeQuery`: kiểm tra code, điều kiện, trả discount preview, không mutate.
- `RedeemPromoCodeCommand`: chạy trong checkout transaction, ghi `PromoCodeRedemption`.
- Optional `ReservePromoCodeCommand`: chỉ cần nếu business muốn giữ slot promo cho unpaid order.
- `ReleasePromoCodeRedemption`: dùng nếu có reservation và order expired/cancelled.

DB constraints:

- unique `PromoCode.Code`.
- unique `(PromoCodeId, OrderId)`.
- optional unique `(PromoCodeId, UserId)` nếu mỗi user chỉ dùng một lần.

**Acceptance criteria**

- Validate/apply preview không tăng usage.
- Create order với promo hợp lệ tăng usage đúng một lần.
- Duplicate redeem cùng order bị chặn.
- Promo discount được snapshot vào order/order item.

### 5.7 Reviews

**Vấn đề**

- `CreateReviewCommandHandler` chưa kiểm tra user đã mua sản phẩm/delivered order.
- Chưa kiểm tra user null trước khi dùng avatar/username.
- Chưa rõ rule duplicate review.
- XSS risk nếu content render raw.

**Business rule cần chọn**

Một trong hai mô hình:

- Strict: chỉ user có delivered order chứa product mới được review.
- Open: ai cũng review được, nhưng buyer có `VerifiedPurchase=true`.

Không nên mặc định từ chối non-buyer nếu product strategy muốn mở review. Nhưng dù chọn model nào, server phải enforce rõ.

**Giải pháp**

- Thêm repository method `HasDeliveredProductAsync(userId, productId)`.
- Thêm `ReviewStatus`: `Pending`, `Approved`, `Rejected` nếu cần moderation.
- Unique index theo `(ProductId, ApplicationUserId)` nếu chỉ cho một review/product; hoặc theo `(OrderItemId, ApplicationUserId)` nếu review theo lần mua.
- Sanitize content hoặc chỉ render plain text.
- File review image/video cần validate mime/size/count.

**Acceptance criteria**

- User không tồn tại không gây null reference; trả `Unauthorized/NotFound`.
- Duplicate review bị chặn theo business rule.
- Rating aggregate cập nhật đúng khi review tạo/sửa/xóa.
- HTML/script trong review không render executable.

### 5.8 Returns/RMA

**Vấn đề**

- `GetById` return không check owner.
- Create return chưa check order thuộc current user.
- Evidence nhận URL từ client.
- Chưa chống duplicate return/quantity đã return.

**Tác động**

- Lộ thông tin đơn hàng, lý do trả hàng, bằng chứng.
- User có thể tạo return cho order người khác nếu biết ID.
- Return quantity vượt số lượng còn lại có thể gây sai refund/restock.

**Giải pháp đúng layer**

- Controller set user id chỉ là phụ trợ; handler phải dùng `ICurrentUserService.UserId`.
- Không tin `CustomerId` từ client.
- Admin path dùng policy role/permission; customer path dùng ownership check.

Ví dụ hướng xử lý trong handler:

```csharp
var currentUserId = _currentUserService.UserId;
if (currentUserId is null)
    return Result<Guid>.Unauthorized();

if (!currentUserIsAdmin && order.ApplicationUserId != currentUserId)
    return Result<Guid>.Forbidden("Không có quyền tạo yêu cầu cho đơn hàng này.");
```

Nếu guest order được phép return:

- dùng tokenized return link, hoặc
- xác minh email/order code, hoặc
- guest order access token lưu hash ở DB.

**DB/business constraints**

- Không tạo open return trùng `OrderItemId` nếu request trước chưa resolved.
- Tổng returned quantity không vượt `OrderItem.Quantity`.
- Return window dựa vào delivered date, không dùng `UpdatedAt` chung nếu field này có thể đổi vì lý do khác.

**Acceptance criteria**

- Customer A không xem/tạo return cho order của Customer B.
- Duplicate open return bị chặn.
- Return quá quantity còn lại bị chặn.
- Evidence file không nhận URL tùy ý; phải qua upload/validation pipeline.

### 5.9 Notifications và SignalR

**Vấn đề**

- Cần audit hub authorization và group join.
- Frontend SignalR còn nhiều console log.
- Nếu client truyền user/group id để join, có nguy cơ nhận notification của người khác.

**Giải pháp**

- Hub user-specific notification dùng `[Authorize]`.
- Hub method không nhận `userId` để join private group; lấy từ claims.
- Product review public group có thể anonymous nếu chỉ gửi dữ liệu public.
- Admin broadcast/check permission trong Application command.
- Metric:
  - connection count.
  - unauthorized join attempts.
  - failed sends.
  - reconnect storm.

**Acceptance criteria**

- Anonymous không join private notification hub.
- User A không join group user B.
- Admin notification command yêu cầu permission.

### 5.10 Users, roles, permissions, account locks

**Vấn đề**

- Policy string literal phân tán: `"AdminOnly"`, `"ViewUsers"`, `EPermissions.ViewUsers`, `"Products.Delete"`.
- Một số command-level authorization bị comment.
- Permission/token claims có thể stale sau role/permission change.

**Giải pháp**

- Centralize permission constants trong `EPermissions` và `AuthorizationPolicies`.
- Command mutation quan trọng có `[Authorize(Policy = ...)]`.
- Ownership/dynamic rules vẫn nằm trong handler.
- Permission cache invalidation:
  - invalidate user permission cache khi assign/revoke role/permission.
  - invalidate role cache khi permission của role đổi.
  - refresh claims khi refresh token.
  - optional permission version/security stamp để buộc refresh session.
- Audit log cho thay đổi role/permission/account lock.

**Acceptance criteria**

- Sau khi revoke permission, request mới không còn dùng quyền cũ sau refresh/access token expiry.
- Role/permission change tạo audit log.
- Không còn policy string tự do ở controller mới.

### 5.11 Reports, dashboard và logs

**Vấn đề**

- Report endpoints cần được khóa bằng `ViewReports`.
- Controller có logic report và `PageSize = int.MaxValue`.
- Runtime logs nằm trong repo/webapi logs; cần đảm bảo không public qua static files hoặc commit.

**Giải pháp**

- `ReportsController` và dashboard report endpoints dùng `[Authorize(Policy = EPermissions.ViewReports)]`.
- Chuyển report logic sang query handlers.
- Date range bắt buộc hoặc có default range hợp lý; giới hạn max range.
- Aggregate bằng SQL projection, không load toàn bộ.
- Report lớn dùng background job hoặc streaming/export job.
- Logs:
  - retention cleanup.
  - mask PII.
  - không phục vụ qua static files.
  - logs controller chỉ admin.

**Acceptance criteria**

- Customer không truy cập được report.
- Report date range > max trả validation error.
- `history-overview` không gọi query với `int.MaxValue`.
- Log response không chứa password/token/raw cookie.

### 5.12 Settings/About/Contact/Marquee

**Vấn đề**

- About/Contact content management có mutation public risk.
- Contact form create có thể public hợp lệ nhưng cần rate limit.
- Marquee/content HTML render raw có XSS risk nếu chưa sanitize.

**Giải pháp**

- Phân tách endpoint:
  - Public: get active about/contact/marquee, create contact message.
  - Admin: list/update/delete/toggle status.
- Sanitize HTML allowlist trước khi lưu hoặc trước khi render.
- Nếu cần audit, có thể lưu raw + sanitized, nhưng frontend chỉ render sanitized.
- Cache invalidation khi content active thay đổi.

**Acceptance criteria**

- Anonymous chỉ gửi contact message, không list/delete/update contact.
- Marquee chứa `<script>` không được render executable.
- Toggle active content invalidates public cache.

### 5.13 Search suggestions

**Vấn đề**

- Save/delete/clear history có thể public.
- `ClearHeaderSearchHistory` nhận `userId` từ query.
- Query search có thể bị abuse.

**Giải pháp**

- Authenticated history lấy user từ `ICurrentUserService.UserId`, không nhận user id từ client.
- Anonymous history dùng guest id/session id có TTL.
- Delete history phải check owner.
- Limit query length, normalize text, rate limit.
- Nếu dùng Elasticsearch, tránh wildcard/prefix query quá đắt hoặc đặt timeout.

**Acceptance criteria**

- User A không clear/delete search history của User B.
- Query quá dài bị từ chối.
- Anonymous spam search bị rate limit.

### 5.14 Inventory và stock reservation

**Vấn đề**

- Hiện tại order create có atomic deduction product stock, nhưng inventory/SKU model cần workflow rõ hơn.
- E-commerce stock không chỉ là một số lượng: cần available, reserved, committed/sold, returned/restocked, damaged.

**Mô hình đề xuất theo phase**

Phase đơn giản:

- Trừ stock khi order created.
- Nếu order unpaid quá timeout, background job cancel order và hoàn stock.

Phase đầy đủ hơn:

1. Khi order created chưa thanh toán: reserve stock.
2. Khi payment success: commit reservation.
3. Khi payment failed/expired/cancelled: release reservation.
4. Khi return approved/restocked: increase available hoặc chuyển sang inspection stock.

**DB constraints**

- Stock quantity không âm.
- Reservation unique theo order/order item.
- Reservation có expiry.

**Acceptance criteria**

- Concurrent checkout không làm available stock âm.
- Payment failed/expired release stock.
- Return completed restock theo trạng thái hàng.

### 5.15 Frontend client và dashboard

**Vấn đề**

- `ignoreBuildErrors` và `ignoreDuringBuilds` đang che lỗi.
- `dangerouslySetInnerHTML` cần audit nguồn dữ liệu.
- Console logs nhiều.
- Dashboard middleware chỉ là UX guard, không phải security boundary.

**Priority điều chỉnh**

- Unsanitized raw user/admin HTML: High/Critical tùy nguồn.
- `ignoreBuildErrors`: Medium/High.
- Console logs: Low/Medium, trừ khi log PII/token.
- Permission-aware UI: Medium, backend authorization vẫn là bắt buộc.

**Giải pháp**

- CI trước, config sau:
  - thêm `typecheck`.
  - thêm `lint`.
  - thêm `build`.
  - fix lỗi hiện hữu.
  - bỏ `ignoreBuildErrors`/`ignoreDuringBuilds`.
- Thêm ESLint rule cấm `console` trong production code, cho phép logger.
- Dùng `usePermission(permission)` để disable/hide actions, nhưng backend vẫn enforce.
- Cân nhắc OpenAPI-generated client để giảm lỗi contract.

**Acceptance criteria**

- CI fail nếu TypeScript/lint/build fail.
- Không render HTML chưa sanitize từ API.
- Dashboard action button ẩn/disable khi thiếu permission, và API vẫn trả `403` nếu gọi trực tiếp.

## 6. Chiến lược triển khai không phá kiến trúc hiện có

### 6.1 Quy tắc thay đổi

- Không rewrite module.
- Không đưa EF/HTTP/gateway-specific concerns vào Domain/Application nếu có thể tránh.
- Thêm abstraction khi có lợi rõ: payment gateway, stock reservation, code generator, clock/time provider.
- Business rule nằm trong Domain entity hoặc Application handler/domain service tùy mức độ cần dữ liệu ngoài aggregate.
- Controller mỏng: bind request, gọi mediator, map response.
- Query handler chịu trách nhiệm đọc/aggregate; command handler chịu trách nhiệm mutation.

### 6.2 Outbox pattern có phạm vi

Không cần áp outbox cho mọi domain event ngay. Phân loại:

| Loại event | Ví dụ | Cách xử lý |
|---|---|---|
| Domain event nội bộ, không side effect ngoài process | update read model nội bộ nhỏ | có thể xử lý in-process nếu không gọi external |
| Integration event/side effect | order created email, payment succeeded notification, return completed, stock alert | outbox sau commit |
| Realtime UI public | review created/rating changed | cân nhắc outbox hoặc retryable notification nếu không được mất |

Phase đầu nên áp outbox cho:

- `OrderCreated`
- `OrderStatusChanged`
- `PaymentSucceeded/Failed`
- `ReturnStatusChanged/Completed`
- email/notification integration events

### 6.3 Background jobs

Các việc nên chuyển khỏi request synchronous:

- gửi email.
- retry notification.
- cleanup logs.
- expire unpaid orders.
- release stock reservation.
- import/export lớn.
- report export lớn.

Có thể dùng `BackgroundService` hiện có nếu đủ đơn giản; nếu cần retry/dashboard quản trị job thì cân nhắc Hangfire hoặc Quartz.NET.

### 6.4 API error model

Nên chuẩn hóa:

- `Result<T>` -> HTTP status nhất quán.
- validation errors có field-level details.
- error code ổn định cho frontend.
- correlation id trong response header/body.
- production không leak `ex.Message` thô cho lỗi 500.

## 7. Test strategy và acceptance criteria

### 7.1 Test matrix theo phase

| Nhóm test | Test cần có |
|---|---|
| Security integration | anonymous mutation bị chặn; customer không xem admin report; manager chỉ quyền được cấp; CSRF required |
| Ownership | user A không xem/sửa order/address/return/search history của user B |
| Payment | valid signature; invalid signature; amount mismatch; duplicate IPN; callback trước IPN; IPN trước callback |
| Inventory | concurrent checkout; insufficient stock; product stock vs SKU stock; release stock khi payment expired |
| Promo | validate không tăng usage; redeem tăng một lần; duplicate redeem blocked; order snapshot discount |
| Returns | owner only; duplicate open return blocked; return window expired; quantity vượt còn lại blocked |
| Reviews | verified purchase rule; duplicate review; user null; XSS content |
| Reports | unauthorized blocked; max date range; large dataset aggregation |
| Frontend | typecheck/lint/build; permission-aware UI; sanitized HTML rendering |

### 7.2 Definition of Done cho task cải tiến

Mỗi task nên có:

- affected files/modules.
- migration nếu có.
- backward compatibility note.
- unit/integration tests.
- manual verification steps.
- log/metric cần theo dõi sau deploy.
- rollback plan.

## 8. Migration, rollout và rollback plan

### 8.1 DB constraints

Các migration nên thêm dần:

- unique `Orders.Code`.
- unique `ReturnRequests.Code`.
- unique `PromoCodes.Code`.
- unique `Products.Slug`, `Products.Code`, SKU.
- unique `PaymentTransactions.TxnRef`.
- optional check constraints cho price/quantity/stock >= 0.
- new tables:
  - `PromoCodeRedemptions`.
  - optional `StockReservations`.
  - optional `OutboxMessages`.

Chiến lược an toàn:

1. Pre-check dữ liệu trùng trước migration.
2. Fix/merge dữ liệu trùng nếu có.
3. Add nullable columns/tables trước.
4. Backfill.
5. Add constraints.
6. Deploy code dùng constraint.

### 8.2 Backward compatibility

- Payment: giữ endpoint cũ tạm thời nhưng deprecate, hoặc route cũ gọi command mới và bỏ field amount từ client.
- Promo: `apply` cũ chuyển thành validate-only, không tăng usage.
- Stock: nếu chưa có SKU ở frontend, giữ product-level stock cho `HasVariants=false`; SKU flow bật theo feature flag.
- Frontend: bật typecheck/lint trong CI trước, chưa bỏ ignore build ngay nếu còn lỗi hiện hữu.

### 8.3 Rollback

- Security policy changes: rollback bằng revert config/code route policy, ít rủi ro DB.
- Payment workflow: deploy theo feature flag; nếu lỗi, tắt gateway new flow và dùng old flow tạm, nhưng không rollback DB transaction records.
- DB constraints: rollback khó nếu đã add unique/check; cần backup/pre-check. Prefer add constraints sau khi code đã clean dữ liệu.
- Outbox: có thể tắt worker nếu lỗi; message vẫn lưu để replay sau.
- Stock reservation: nếu bật theo flag, rollback về deduct-on-order-created cho sản phẩm chưa variant.

## 9. Lộ trình cải thiện đề xuất

### Phase 0: Critical security hardening (1-3 ngày)

1. Khóa admin/mutation endpoints bằng policy.
2. Tắt/ẩn `TestStorageController`, `WeatherForecastController` ngoài Development.
3. Tắt Swagger production hoặc bảo vệ bằng admin auth.
4. Bật HTTPS redirection production.
5. Khóa report endpoints bằng `ViewReports`.
6. Thêm integration tests cho anonymous/customer/admin access.

### Phase 1: Payment, promo và checkout correctness (3-7 ngày)

1. Payment URL chỉ tạo từ `orderId`; backend tự lấy amount.
2. Check owner/guest access khi thanh toán.
3. Hoàn thiện IPN/callback idempotent.
4. Tách promo validate và redeem.
5. Thêm `PromoCodeRedemption`.
6. Unique payment/order/promo constraints sau khi pre-check dữ liệu.

### Phase 2: Stock và order lifecycle (1 tuần)

1. Chuẩn hóa product-level vs SKU-level stock.
2. Thêm stock reservation service hoặc deduct/release flow đơn giản.
3. Background job expire unpaid orders và release stock.
4. Unique/sequence order code, RMA code.
5. Report stats chuyển từ controller sang query handlers.

### Phase 3: Ownership, privacy và review/return rules (1 tuần)

1. Ownership check cho returns, addresses, orders, search history, wishlist.
2. Guest checkout access token/email verification strategy.
3. Review verified purchase/duplicate rule.
4. Return duplicate/remaining quantity checks.
5. Evidence upload validation.

### Phase 4: Architecture cleanup và outbox (1-2 tuần)

1. Marker interfaces `ICommand<T>`, `IQuery<T>`.
2. `TransactionBehavior` dựa trên marker interface.
3. Chuyển VNPay adapter sang Infrastructure sau `IPaymentGateway`.
4. Outbox cho payment/order/return/email/notification side effects.
5. Centralize permissions và permission cache invalidation tests.

### Phase 5: Frontend quality gate và observability (1 tuần)

1. CI chạy typecheck/lint/build.
2. Bỏ `ignoreBuildErrors`/`ignoreDuringBuilds` sau khi fix lỗi.
3. Sanitize HTML rendering.
4. Replace console logs bằng logger.
5. Business metrics:
   - checkout success/failure rate.
   - payment mismatch/invalid signature count.
   - stock reservation failure.
   - promo validation/redeem failure.
   - unauthorized access attempts.
   - payment IPN latency.

## 10. Câu hỏi cần làm rõ trước khi đưa vào sprint

1. Endpoint nào được phép public chính thức? Cần chốt theo route: public read, public form submit, authenticated customer, admin/manager, internal callback.
2. Payment workflow mong muốn là gì? Order tạo trước hay sau payment? IPN hay callback là nguồn tin cậy?
3. Stock model chính thức là product-level, SKU-level hay hybrid theo `HasVariants`?
4. Promo usage tính khi nào: order created, payment success, delivered hay completed?
5. Guest checkout có được xem order/return sau checkout không? Nếu có, xác thực bằng guest id, email verification hay tokenized link?
6. HTML content đến từ đâu? Admin CMS, user-generated hay static? Có cho phép HTML hay nên chuyển sang rich text blocks?
7. Domain event handlers hiện có side effect nào: email, SignalR, payment, external service hay chỉ update nội bộ?
8. Production database provider chính thức là SQL Server, PostgreSQL hay cả hai?

## 11. Kết luận

ShopViet có nền kiến trúc đủ tốt để cải tiến dần mà không rewrite. Các thay đổi quan trọng nhất nên tập trung vào bảo vệ dữ liệu và tính đúng đắn của checkout:

1. Khóa authorization cho admin/mutation/report endpoints.
2. Hoàn thiện payment state machine và idempotent IPN/callback.
3. Chuẩn hóa stock product/SKU và promo validate/redeem.
4. Thêm ownership checks cho tài nguyên khách hàng.
5. Đưa business/report logic khỏi controller về Application layer.
6. Áp outbox có chọn lọc cho side effect sau commit.
7. Bổ sung DB constraints, tests, migration và rollback plan.

Báo cáo này nên được chuyển thành technical backlog trước khi đưa vào sprint. Mỗi backlog item cần có route/class cụ thể, owner, risk, affected files, acceptance criteria, test cases, migration notes, rollout và rollback plan. Cách làm này giữ nguyên Clean Architecture, CQRS và DDD hiện tại, đồng thời giảm rủi ro hồi quy khi hệ thống đang vận hành.

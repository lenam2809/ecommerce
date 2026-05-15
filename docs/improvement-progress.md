# ShopViet Improvement Progress

## Summary

This document tracks incremental technical improvements for ShopViet E-Commerce without changing production behavior in the audit phase. The current pass records verified risks, maps them to phases, and creates a backlog suitable for implementation through small, reviewable changes.

## Phases

| Phase | Name | Goal | Status |
| --- | --- | --- | --- |
| Phase 0 | Critical security hardening | Lock down public mutations/admin endpoints, production Swagger/test endpoints, HTTPS, and obvious dev surfaces. | IN_PROGRESS |
| Phase 1 | Payment, promo, checkout correctness | Close payment confirmation flow, align promo usage timing, and make checkout side effects explicit. | IN_PROGRESS |
| Phase 2 | Stock va order lifecycle | Unify Product stock, SKU stock, inventory items, and order/return stock transitions. | IN_PROGRESS |
| Phase 3 | Ownership, privacy, review/return rules | Enforce ownership in user-scoped APIs and move privacy/rule checks into Application handlers. | TODO |
| Phase 4 | Architecture cleanup va outbox | Move web concerns out of Application, keep reporting/query logic out of controllers, and dispatch domain events after durable commit/outbox. | TODO |
| Phase 5 | Frontend quality gate va observability | Re-enable frontend type/lint gates and add operational visibility around checkout/payment/security flows. | TODO |

## Checklist

| Task id | Description | Status | Files touched | Tests added/updated | Notes |
| --- | --- | --- | --- | --- | --- |
| AUDIT-001 | Create improvement tracking document and record audit scope. | DONE | `docs/improvement-progress.md` | None | Documentation-only task. |
| P0-001 | Add explicit authorization/policies to public admin/content mutations. | DONE | `AboutController.cs`, `ContactController.cs`, `BannerController.cs`, `BrandsController.cs`, `CategoriesController.cs`, `PromoCodesController.cs`, `ProductsController.cs`, `ReportsController.cs` | `Phase0AuthorizationTests.cs` | Phase 0A secured high-risk content/catalog/promo/report mutations. |
| P0-002 | Gate Swagger/UI by environment or config. | DONE | `apps/backend/Ecommerce/Ecommerce.WebAPI/Program.cs` | `Phase0RuntimeHardeningTests.cs` | Phase 0B enables Swagger/UI only in Development. |
| P0-003 | Re-enable or explicitly configure HTTPS redirection/proxy behavior. | DONE | `Program.cs`, `DependencyInjection.cs`, `AddAuthenticationExtensions.cs` | `Phase0RuntimeHardeningTests.cs` | Phase 0B enables HTTPS redirection outside Development and requires JWT HTTPS metadata outside Development. |
| P0-004 | Remove or protect test/dev controllers. | DONE | `DevelopmentOnlyAttribute.cs`, `TestStorageController.cs`, `WeatherForecastController.cs` | `Phase0AuthorizationTests.cs` | Test/dev controllers now return 404 outside Development. |
| P1-001 | Replace client-supplied payment amount/order data with server-derived order payment initiation. | DONE | `PaymentsController.cs`, `CreatePaymentForOrderCommand*`, `IVnPayService.cs`, `VnPayService.cs`, appsettings production files | `CreatePaymentForOrderCommandHandlerTests.cs`, `PaymentCorrectnessTests.cs` | Phase 1A create-url now requires auth and derives amount/orderInfo/txnRef from backend order by `orderId`; client amount/orderInfo are ignored. Guest VNPay payment is intentionally blocked pending a clear guest ownership mechanism. |
| P1-002 | Make VNPay callbacks/IPN idempotent and update orders/payments consistently. | DONE | `PaymentsController.cs`, `VnPayService.cs`, `PaymentTransaction.cs`, `PaymentCorrectnessTests.cs` | `PaymentCorrectnessTests.cs` | Phase 1B verifies signature before DB writes, uses `PaymentTransactions.TxnRef` as idempotency key, prevents duplicate `Payment`, and keeps invalid/mismatch/failed responses from marking orders paid. Callback logic remains in Application `VnPayService`; moving the gateway adapter remains P4-001. |
| P1-003 | Move promo usage increment from apply/preview to redeem/order confirmation. | DONE | `PromoCodesController.cs`, `ApplyPromoCodeCommandHandler.cs`, `CreateOrderCommandHandler.cs`, `Order.cs`, `CartRepository.cs` | `ApplyPromoCodeCommandHandlerTests.cs`, `CreateOrderCommandHandlerTests.cs` | Phase 1C makes promo apply/preview read-only and increments `TimesUsed` once during valid order creation. No migration added; redemption table and explicit discount amount column are deferred. |
| P2-001 | Define stock source of truth for non-variant Product stock, ProductVariantSku stock, and InventoryItem serials. | DONE | `CreateOrderCommandHandler.cs`, `CreateOrderItemDto.cs`, `Order.cs`, `IProductRepository.cs`, `IProductVariantSkuRepository.cs`, `ProductRepository.cs`, `ProductVariantSkuRepository.cs` | `CreateOrderCommandHandlerTests.cs`, `StockLifecycleTests.cs` | Phase 2A checkout now uses `Products.StockQuantity` only for non-variant products and requires/decrements `ProductVariantSkus.StockQuantity` for variant products. |
| P2-002 | Align order cancel/delete/return stock restore with SKU and inventory item state. | TODO | Order/return handlers | TBD | Existing restore paths focus on Product stock. |
| P3-001 | Add `[Authorize]` to address/search-history/wishlist controllers and enforce current-user ownership in handlers. | TODO | Addresses/SearchSuggestions/Wishlist controllers and handlers | TBD | Several endpoints infer/accept user state without endpoint auth attributes. |
| P3-002 | Audit return/order/review ownership and lifecycle rules in Application handlers. | TODO | Returns/Orders/Reviews features | TBD | Keep controller checks as defense-in-depth only. |
| P4-001 | Move `VnPayService` out of Application or remove `HttpContext`/`IQueryCollection` dependency from Application contract. | TODO | `Ecommerce.Application/Features/Payments/VnPay/*` | TBD | Application currently references `Microsoft.AspNetCore.Http`. |
| P4-002 | Replace pre-save domain event dispatch with after-commit dispatch/outbox. | TODO | `ApplicationDbContext.cs`, event infrastructure | TBD | `SaveChangesAsync()` dispatches before `base.SaveChangesAsync()`. |
| P4-003 | Move ad hoc stats/report logic out of `OrdersController`. | TODO | `OrdersController.cs`, report queries | TBD | Controller builds stats and uses `int.MaxValue`. |
| P5-001 | Re-enable frontend build type/lint gates. | TODO | `apps/frontend/ecommerce-client/next.config.ts`, `apps/frontend/ecommerce-dashboard/next.config.ts` | TBD | Client ignores eslint and TS build errors; dashboard ignores eslint. |
| P5-002 | Add checkout/payment/promo observability and alerting. | TODO | TBD | TBD | Build on existing OpenTelemetry/Prometheus setup. |

## Audit findings

### Phase 0A update

Status: DONE for scoped endpoint hardening. Swagger production gating and HTTPS redirection remain separate Phase 0 tasks.

Endpoints secured in this pass:

| Area | Endpoint/class | Authorization applied |
| --- | --- | --- |
| About content management | `AboutController.Create`, `Update`, `Delete`, `UpdateStatus` | `[Authorize(Policy = EPermissions.EditSettings)]` |
| Contact content management | `ContactController.Create`, `Update`, `Delete`, `UpdateStatus` | `[Authorize(Policy = EPermissions.EditSettings)]` |
| Banner admin/read management | `BannerController.GetPaged`, `Create`, `Update`, `Delete` | `ViewBanners`, `CreateBanner`, `EditBanner`, `DeleteBanner` |
| Brand admin/read management | `BrandsController.GetPaged`, `Create`, `Update`, `Delete`, `LinkCategoryBrand` | `ViewBrands`, `CreateBrand`, `EditBrand`, `DeleteBrand` |
| Category admin/read management | `CategoriesController.GetAll` paged, `Create`, `Update`, `Delete` | `ViewCategories`, `CreateCategory`, `EditCategory`, `DeleteCategory` |
| Promo code management | `PromoCodesController.GetPaged`, `GetById`, `Create`, `Update`, `Delete` | `ViewPromotions`, `CreatePromotion`, `EditPromotion`, `DeletePromotion` |
| Promo apply mutation | `PromoCodesController.ApplyPromoCode` | `[Authorize]` |
| Reports | `ReportsController` | `[Authorize(Policy = EPermissions.ViewReports)]` at controller level |
| Product import validation | `ProductsController.ValidateImport` | `[Authorize(Policy = EPermissions.CreateProduct)]` |
| Test/dev endpoints | `TestStorageController`, `WeatherForecastController` | `[DevelopmentOnly]`, returns 404 outside Development |

Endpoints intentionally left public:

| Endpoint/class | Reason |
| --- | --- |
| Public catalog/content reads such as `AboutController.GetAll/GetActive`, `ContactController.GetAll/GetActive`, `BannerController.GetAll/GetById`, `BrandsController.GetAll/options/category/slug/id`, `CategoriesController.GetAllCategories/options/brand/slug/id/popular` | Public storefront read surface; no mutation. |
| `PromoCodesController.GetActivePromoCodes` | Public storefront read for active promo discovery. |
| Auth endpoints in `AuthController` and checkout/payment endpoints | Outside Phase 0A scope; payment/promo redeem correctness remains Phase 1. |

Endpoints not handled in this pass:

| Endpoint/class | Reason |
| --- | --- |
| Swagger/UI and HTTPS redirection in `Program.cs` | Tracked as P0-002 and P0-003; not included in Phase 0A endpoint hardening. |
| `LogsController`, `UserActivitiesController`, address/search-history/wishlist ownership hardening | Tracked for later Phase 0/Phase 3 work; not in the requested priority list for this pass. |

### Phase 0B update

Status: DONE for production runtime hardening of Swagger, HTTPS redirection, JWT metadata, and CSRF test coverage.

| Area | Before | After |
| --- | --- | --- |
| Swagger/UI | `app.UseSwagger()` and `app.UseSwaggerUI()` were called unconditionally in `Program.cs`. | Swagger and Swagger UI are only registered when `app.Environment.IsDevelopment()`. |
| HTTPS redirection | `UseHttpsRedirection()` was commented out. | `UseHttpsRedirection()` runs when `!app.Environment.IsDevelopment()`, preserving local Development behavior. |
| JWT metadata | `JwtBearerOptions.RequireHttpsMetadata` was hard-coded to `false`. | `AddInfrastructure` accepts a runtime flag and Program passes `requireHttpsMetadata: !builder.Environment.IsDevelopment()`. |
| CSRF | Middleware already required double-submit CSRF for state-changing cookie-auth requests, but integration coverage was missing and default test factory disabled CSRF. | Added CSRF-enabled integration tests for login without CSRF header and authenticated mutation without `X-CSRF-Token`. |
| Security headers | `app.UseSecurityHeaders()` was already present in the pipeline before routing/auth. | No code change; audited as active. CSP still allows Swagger-friendly inline/eval directives and should be revisited if Swagger remains Development-only. |

Tests added/updated:

| Test | Expected behavior |
| --- | --- |
| `Swagger_InNonDevelopmentEnvironment_ReturnsNotFound` | `/swagger` and `/swagger/index.html` return 404 in `IntegrationTesting`. |
| `HttpRequest_InNonDevelopmentEnvironment_RedirectsToHttps` | HTTP request redirects to HTTPS outside Development. |
| `Login_WithoutCsrfHeader_ReturnsOkAndSetsCsrfCookie` | Login remains usable without a CSRF header and sets `csrf_token`. |
| `CookieAuthenticatedMutation_WithoutCsrfHeader_ReturnsForbidden` | Authenticated cookie request to a state-changing endpoint returns 403 with `CSRF_VALIDATION_FAILED` when CSRF header is missing. |

Runtime files audited:

| File | Notes |
| --- | --- |
| `appsettings.Production.json` | `AuthConfig.AllowHeaderFallback=false`, `EnableCsrfProtection=true`, `IncludeTokensInResponse=false`, `CookieSettings.ForceSecure=true`. |
| `appsettings.Development.json` | Development keeps header fallback and token response body enabled for local compatibility. |
| `CsrfValidationMiddleware.cs` | Active after authentication and before authorization; validates unsafe methods only when `access_token` cookie is present. |
| `SecurityHeadersMiddleware.cs` | Active in pipeline. Includes CSP that allows inline/eval for Swagger compatibility; revisit after Swagger is no longer production-exposed. |

### Public mutation/admin endpoints

The following controllers have POST/PUT/PATCH/DELETE actions without controller/action `[Authorize]`, role, or policy attributes. Some may be public by product design, but they require explicit triage because they mutate server state.

| File/class/method | Route attribute | Finding |
| --- | --- | --- |
| `AboutController.Create`, `Update`, `Delete`, `UpdateStatus` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/AboutController.cs:49` | `[HttpPost]`, `[HttpPut("{id}")]`, `[HttpDelete("{id}")]`, `[HttpPatch("{id}/status")]` | Public content management mutations. |
| `AddressesController.Create`, `Update`, `Delete`, `SetDefault` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/AddressesController.cs:57` | Address mutations | No `[Authorize]` attribute, but methods read current user claim and throw if absent. Endpoint metadata should still require auth. |
| `AuthController.Register`, `Login`, `RefreshToken` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/AuthController.cs:54` | Auth mutations | Likely intentional public auth surface; should be rate-limited/CSRF-reviewed. |
| `BannerController.Create`, `Update`, `Delete` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/BannerController.cs:59` | Banner mutations | Public admin/content mutations. |
| `BrandsController.Create`, `Update`, `Delete`, `LinkCategoryBrand` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/BrandsController.cs:86` | Brand/category-brand mutations | Public catalog/admin mutations. |
| `CategoriesController.Create`, `Update`, `Delete` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/CategoriesController.cs:106` | Category mutations | Public catalog/admin mutations. |
| `ContactController.Create`, `Update`, `Delete`, `UpdateStatus` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/ContactController.cs:49` | Contact section mutations | Public content management mutations. |
| `OrdersController.Create` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/OrdersController.cs:95` | `[HttpPost]` | Public checkout/order creation; may be intentional guest checkout, but needs CSRF/payment/stock review. |
| `PaymentsController.CreatePaymentUrl` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/PaymentsController.cs:21` | `[HttpPost("vnpay/create-url")]` | Public payment URL creation with client-supplied amount/order data. |
| `ProductsController.ValidateImport` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/ProductsController.cs:171` | `[HttpPost("validate-import")]` | Public file upload/validation surface. |
| `PromoCodesController.Create`, `Update`, `Delete`, `ApplyPromoCode` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/PromoCodesController.cs:48` | Promo mutations/apply | Admin promo mutations public at controller layer; apply also mutates usage. Some handler classes have Application authorization attributes, but endpoint metadata is unprotected. |
| `SearchSuggestionsController.SaveSearchHistory`, `DeleteHeaderSearchHistory`, `ClearHeaderSearchHistory` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/SearchSuggestionsController.cs:41` | Search history mutations | Public mutation; clear accepts `userId` query parameter. |
| `TestStorageController.Upload`, `Delete` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/TestStorageController.cs:25` | Test storage mutations | Public test/dev upload and delete endpoints. |
| `WishlistController.AddToWishlist`, `RemoveFromWishlist` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/WishlistController.cs:31` | Wishlist mutations | Public mutation; relies on downstream current-user/guest behavior if any. |

### Swagger, HTTPS, and dev endpoints

| Item checked | Finding |
| --- | --- |
| `Program.cs` Swagger | `app.UseSwagger()` and `app.UseSwaggerUI()` are called unconditionally in `apps/backend/Ecommerce/Ecommerce.WebAPI/Program.cs:231`; no `IsDevelopment()` or config gate. |
| HTTPS redirection | `app.UseHttpsRedirection()` is commented out in `apps/backend/Ecommerce/Ecommerce.WebAPI/Program.cs:261`. |
| Test/dev controllers | `TestStorageController` exists with upload/url/delete endpoints in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/TestStorageController.cs`; `WeatherForecastController` exists at route `[Route("[controller]")]` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/WeatherForecastController.cs:6`. |

### Payment workflow

| Item checked | Finding |
| --- | --- |
| `PaymentsController.CreatePaymentUrl` | Accepts `[FromBody] PaymentInformationModel` and passes `HttpContext` into `_vnPayService.CreatePaymentUrl(model, HttpContext)` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/PaymentsController.cs:21`. |
| `PaymentInformationModel` | Client supplies `OrderType`, `Amount`, `OrderDescription`, `Name`, and `OrderId` in `apps/backend/Ecommerce/Ecommerce.Application/Features/Payments/VnPay/Dto/PaymentInformationModel.cs`. |
| `VnPayService` layer | `VnPayService` is in Application layer: `apps/backend/Ecommerce/Ecommerce.Application/Features/Payments/VnPay/VnPayService.cs`. |
| Web dependencies in Application | `IVnPayService` and `VnPayService` depend on `Microsoft.AspNetCore.Http.HttpContext` and `IQueryCollection` in `IVnPayService.cs:8` and `VnPayService.cs:27`. |
| Callback/IPN | `PaymentsController.PaymentCallback` redirects to hardcoded `http://localhost:3000`; `PaymentIpn` calls `PaymentExecuteAsync` and returns VNPay-style response, while order update logic is inside `VnPayService` rather than an Application payment command boundary. |

### Phase 1A update

Status: DONE for server-derived VNPay payment URL initiation.

| Area | Before | After |
| --- | --- | --- |
| API contract | `POST /api/Payments/vnpay/create-url` accepted `PaymentInformationModel` with client-supplied `Amount`, `OrderDescription`, `Name`, `OrderType`, and `OrderId`. | Endpoint now accepts `CreatePaymentUrlRequest` with `OrderId` and optional `PaymentMethod`; extra legacy fields are ignored by model binding. Endpoint requires `[Authorize]`. |
| Amount/order info | VNPay request amount and order info came directly from client request body. | `CreatePaymentForOrderCommandHandler` loads `Order`, derives `Amount` from `Order.TotalAmount`, builds order description from `Order.Code`, and uses `Order.Id` as `TxnRef`. |
| Ownership | Create-url was public and did not verify owner. | Authenticated user must match `Order.ApplicationUserId`; other users receive Forbidden. Guest VNPay payment returns Forbidden because guest ownership for payment initiation is not yet safely defined. |
| Payable state | No server-side payable-state check before generating URL. | Only `EOrderStatus.Pending` orders with positive totals and no successful `Payment` can create a VNPay URL. Paid/processing/cancelled/non-payable orders return BadRequest. |
| Return URL | `PaymentCallback` redirected to hardcoded `http://localhost:3000`. | `PaymentCallback` reads `AppUrl:Frontend` or `AppUrl` from configuration and returns 500 if frontend URL is missing. `appsettings.Production*.json` now include `AppUrl:Frontend`. |
| Payment transaction | Create-url did not create pending transaction. | Phase 1A intentionally deferred pending transaction creation. Phase 1B fixed callback handling for existing pending/terminal `TxnRef`; per-attempt retry references remain a later design item. |

Files audited/changed in Phase 1A:

| File/class/method | Notes |
| --- | --- |
| `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/PaymentsController.cs` | `CreatePaymentUrl` now maps request to `CreatePaymentForOrderCommand`; callback frontend redirect no longer hardcodes localhost. |
| `apps/backend/Ecommerce/Ecommerce.Application/Features/Payments/Commands/CreatePaymentForOrder/CreatePaymentForOrderCommandHandler.cs` | New ownership, payable-state, amount, successful-payment, and VNPay URL initiation checks. |
| `apps/backend/Ecommerce/Ecommerce.Application/Features/Payments/VnPay/IVnPayService.cs` | Added overload accepting primitive client IP string so the Application handler does not need `HttpContext`. Existing Web-dependent overload remains for compatibility and is tracked under P4-001. |
| `apps/backend/Ecommerce/Ecommerce.Application/Features/Payments/VnPay/VnPayService.cs` | New overload builds VNPay request from backend-derived `PaymentInformationModel` and supplied IP string. |
| `apps/backend/Ecommerce/Ecommerce.Domain/Entities/Order.cs` | Audited `ApplicationUserId`, `GuestId`, `TotalAmount`, and `Status` behavior. |
| `apps/backend/Ecommerce/Ecommerce.Domain/Entities/PaymentTransaction.cs` and `PaymentTransactionConfiguration.cs` | Audited unique `TxnRef`; found pre-created pending transactions are unsafe until callback idempotency is fixed. |
| `apps/backend/Ecommerce/Ecommerce.Infrastructure/Identity/CurrentUserService.cs` | Audited current user and `X-Guest-ID` availability; guest payment ownership remains TODO/BLOCKED. |

Tests added/updated:

| Test | Expected behavior |
| --- | --- |
| `CreatePaymentForOrderCommandHandlerTests.Handle_UserCreatesPaymentForOwnPendingOrder_UsesServerDerivedAmount` | Own pending order succeeds and VNPay model amount comes from `Order.TotalAmount`. |
| `CreatePaymentForOrderCommandHandlerTests.Handle_UserCreatesPaymentForAnotherUsersOrder_ReturnsForbidden` | Cross-user payment initiation is forbidden. |
| `CreatePaymentForOrderCommandHandlerTests.Handle_OrderNotInPayableState_ReturnsBadRequest` | Processing/cancelled orders are rejected. |
| `CreatePaymentForOrderCommandHandlerTests.Handle_GuestOrder_ReturnsForbidden` | Guest VNPay payment initiation is blocked until safe guest ownership is designed. |
| `CreatePaymentForOrderCommandHandlerTests.Handle_OrderAlreadyHasSuccessfulPayment_ReturnsBadRequest` | Orders with an existing successful payment are rejected. |
| `PaymentCorrectnessTests.Anonymous_CreatePaymentUrl_ReturnsUnauthorized` | Payment URL creation requires auth. |
| `PaymentCorrectnessTests.Customer_CreatePaymentUrlForOwnOrder_IgnoresClientAmount` | Endpoint ignores client `Amount` and returns URL amount derived from the order. |
| `PaymentCorrectnessTests.Customer_CreatePaymentUrlForAnotherUsersOrder_ReturnsForbidden` | Endpoint returns 403 for another user's order. |

### Phase 1B update

Status: DONE for VNPay callback/IPN idempotency and consistent transaction/payment/order updates.

State machine and idempotency:

| Item | Current behavior |
| --- | --- |
| Idempotency key | `PaymentTransactions.TxnRef`, populated from VNPay `vnp_TxnRef`; current payment initiation uses `Order.Id` as `TxnRef`. |
| Transaction states | `PaymentTransactionStatus.Pending`, `Success`, `Failed`, and new `Expired`. Enum is stored as int; no schema migration required. |
| Success state | Valid signature, matching amount, existing order, `vnp_ResponseCode == "00"`, and `Order.Status == Pending` creates at most one successful `Payment`, updates `PaymentTransaction` to `Success`, and moves order to `Processing`. |
| Duplicate callback/IPN | Existing terminal transaction returns the stored result and does not create another `Payment` or update order again. |
| Invalid signature | Returns VNPay IPN code `97`; does not create/update `PaymentTransaction`, `Payment`, or `Order`. |
| Amount mismatch | Marks `PaymentTransaction` as `Failed` with `AMOUNT_MISMATCH`; does not create `Payment` or update order. |
| Failed VNPay response code | Marks `PaymentTransaction` as `Failed` with the gateway response code; does not create `Payment` or update order. |
| Expired callback | Marks `PaymentTransaction` as `Expired` with `EXPIRED_CALLBACK`; does not create `Payment` or update order. |
| Return vs IPN | Both endpoints use the same `VnPayService.PaymentExecuteAsync` path; return-before-IPN and duplicate IPN are idempotent. IPN maps processing outcomes to stable VNPay `RspCode` values. |

Files changed/audited in Phase 1B:

| File/class/method | Notes |
| --- | --- |
| `apps/backend/Ecommerce/Ecommerce.Application/Features/Payments/VnPay/VnPayService.cs` | Signature verification now happens before DB writes. Pending transactions are processed, terminal transactions are idempotently returned, success/failure updates are centralized. |
| `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/PaymentsController.cs` | `PaymentIpn` no longer has update comments; it delegates to service and maps response to VNPay `RspCode`. |
| `apps/backend/Ecommerce/Ecommerce.Domain/Entities/PaymentTransaction.cs` | Added `Expired` status. |
| `apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/EntityConfigurations/PaymentTransactionConfiguration.cs` | Existing unique index on `TxnRef` confirmed; no new migration needed. |
| `apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/EntityConfigurations/PaymentConfiguration.cs` | Existing unique index on `Payment.TransactionId` confirmed; duplicate payments are also guarded in service. |

Tests added/updated:

| Test | Expected behavior |
| --- | --- |
| `PaymentCorrectnessTests.VnPayIpn_ValidSuccess_UpdatesPaymentTransactionPaymentAndOrder` | Valid signed IPN creates one `Payment`, marks transaction `Success`, and moves order to `Processing`. |
| `PaymentCorrectnessTests.VnPayIpn_DuplicateValidSuccess_DoesNotCreateDuplicatePayment` | Duplicate valid IPN keeps one payment and stable success state. |
| `PaymentCorrectnessTests.VnPayReturnBeforeIpn_DuplicateCallback_DoesNotCreateDuplicatePayment` | Return endpoint processing before IPN remains idempotent. |
| `PaymentCorrectnessTests.VnPayIpn_InvalidSignature_DoesNotUpdatePaymentOrOrder` | Invalid signature creates no transaction/payment and keeps order `Pending`. |
| `PaymentCorrectnessTests.VnPayIpn_AmountMismatch_MarksTransactionFailedAndDoesNotMarkOrderPaid` | Signed amount mismatch marks transaction failed and keeps order unpaid. |
| `PaymentCorrectnessTests.VnPayIpn_FailedResponseCode_MarksTransactionFailedAndDoesNotMarkOrderPaid` | Gateway failed response marks transaction failed and keeps order unpaid. |

Migration notes:

| Item | Note |
| --- | --- |
| `PaymentTransactions.TxnRef` uniqueness | Already configured as unique in `PaymentTransactionConfiguration`; no migration generated in Phase 1B. Production rollout should pre-check duplicate historical `TxnRef` rows before applying existing/expected unique constraints. |
| `Payment.TransactionId` uniqueness | Already configured as unique in `PaymentConfiguration`; service checks transaction id and successful order payment before inserting. |
| Retry model | Current `TxnRef` is order-scoped, so a terminal failed transaction can block retry for the same order. A later payment-attempt model should introduce per-attempt references while still linking to `Order.Id`. |

### Promo code apply/redeem timing

| Item checked | Finding |
| --- | --- |
| `PromoCodesController.ApplyPromoCode` | `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/PromoCodesController.cs:74` sends `ApplyPromoCodeCommand`. |
| `Features/PromoCodes/Commands/ApplyPromoCode` | Handler atomically increments `"TimesUsed" = "TimesUsed" + 1` before returning discount preview/result in `ApplyPromoCodeCommandHandler.cs:37-45`. |
| Cart promo paths | `CartRepository.ApplyPromoCodeAsync` increments `validationResult.PromoCode.TimesUsed++` and updates promo in `apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Repositories/CartRepository.cs:200`; `RefreshCartTotalsAsync` can also increment at `CartRepository.cs:227`. |
| Naming | Current entity uses `TimesUsed`, not `CurrentUsage`; older `Discount.CurrentUsageCount` also exists. The report risk maps to `TimesUsed` mutation timing. |

### Phase 1C update

Status: DONE for separating promo validation/preview from checkout redemption.

| Area | Before | After |
| --- | --- | --- |
| Promo preview endpoint | `POST /api/promo-codes/apply` referenced cart apply behavior at the controller and the DB-backed promo apply handler incremented `TimesUsed` during preview. | Controller now routes to `Ecommerce.Application.Features.PromoCodes.Commands.ApplyPromoCode`. Handler validates and returns preview only; it never calls `CompleteAsync`, transaction APIs, or usage increment SQL. |
| Preview validation | Existing handler validated active/date/usage through an atomic update side effect. | Preview validates code existence, active state, date range, usage limit, and positive order total without mutating DB. No minimum-order/category/product constraints exist in the current `PromoCode` model. |
| Cart apply/refresh | `CartRepository.ApplyPromoCodeAsync` and `RecalculateCartTotalsAsync` incremented `TimesUsed`, so cart previews and cart changes could burn usage. | Cart apply/refresh still updates cart discount state but no longer increments promo usage. |
| Checkout/order redeem | `CreateOrderCommandHandler` accepted `DiscountCode` but did not revalidate or redeem usage during order creation. | Create order calculates subtotal, validates promo server-side, applies discount to order `TotalAmount`, stores `DiscountCode`, and atomically increments `PromoCodes.TimesUsed` once before persisting the order. |
| Order discount snapshot | `Order` only stored `DiscountCode`; `TotalAmount` remained product subtotal. | `Order.DiscountCode` stores the redeemed code and `TotalAmount` stores the net discounted total. A separate `DiscountAmount` column is not present and is deferred. |
| Admin/public endpoint | Admin CRUD policies were already applied in Phase 0A. | CRUD remains policy-protected; promo apply/preview is public read/preview behavior because it no longer mutates usage. |

Files changed/audited in Phase 1C:

| File/class/method | Notes |
| --- | --- |
| `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/PromoCodesController.cs` | `ApplyPromoCode` now uses the DB-backed promo preview command and no longer requires auth because it is read-only preview. |
| `apps/backend/Ecommerce/Ecommerce.Application/Features/PromoCodes/Commands/ApplyPromoCode/ApplyPromoCodeCommandHandler.cs` | Removed usage increment transaction; added read-only validation and discount calculation helpers. |
| `apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs` | Revalidates promo during order creation, applies net total, and atomically increments `TimesUsed` only after order items are valid. |
| `apps/backend/Ecommerce/Ecommerce.Domain/Entities/Order.cs` | Added `ApplyDiscount` to store `DiscountCode` and update net `TotalAmount`. |
| `apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Repositories/CartRepository.cs` | Removed promo usage increments from cart apply and cart total refresh. |

Tests added/updated:

| Test | Expected behavior |
| --- | --- |
| `ApplyPromoCodeCommandHandlerTests.Handle_ValidPromoCode_ReturnsPreviewWithoutIncrementingUsage` | Valid preview returns discount and does not increment usage. |
| `ApplyPromoCodeCommandHandlerTests.Handle_InvalidPromoCode_ReturnsBadRequestWithoutIncrementingUsage` | Missing promo returns BadRequest and does not mutate usage. |
| `ApplyPromoCodeCommandHandlerTests.Handle_PromoUsageLimitReached_ReturnsBadRequestWithoutIncrementingUsage` | Usage limit is respected during preview without mutation. |
| `CreateOrderCommandHandlerTests.Handle_ValidPromoCode_AppliesDiscountAndIncrementsUsageOnce` | Valid order creation applies discount and increments usage once. |
| `CreateOrderCommandHandlerTests.Handle_PromoUsageLimitReached_ReturnsBadRequestWithoutStockDeduction` | Exhausted promo rejects order before stock deduction/order persistence. |
| `CreateOrderCommandHandlerTests.Handle_PromoRedeemRaceFails_RestoresStockAndDoesNotPersistOrder` | If promo usage becomes exhausted after stock deduction, checkout restores stock and does not persist the order. |

Migration notes:

| Item | Note |
| --- | --- |
| `PromoCodeRedemption` table | Deferred. Current idempotency relies on order creation being a single operation; there is no separate redemption table to guard duplicate redemption by `OrderId`. |
| `Order.DiscountAmount` column | Deferred. Current snapshot is `Order.DiscountCode` plus net `Order.TotalAmount`; explicit discount amount should be added with a migration in a later pass. |
| Payment-success redemption | Deferred by business decision. Current implementation redeems on valid order creation, not payment success. If product policy requires paid-only redemption, this should move into payment success handling after a redemption table exists. |

### Orders, reports, and stock

| Item checked | Finding |
| --- | --- |
| `OrdersController.GetMyOrderHistoryStats` | Controller computes grouped stats directly in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/OrdersController.cs:148`. |
| `OrdersController.GetOrderHistoryOverview` | Controller uses `PageSize = int.MaxValue` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/OrdersController.cs:193` and computes report overview in the controller. |
| `ReportsController` | Existing reports generally dispatch MediatR queries, but the controller has no `[Authorize]`/report policy at class or action level in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/ReportsController.cs`. |
| Stock source of truth | `CreateOrderCommandHandler` checks/decrements `Product.StockQuantity` with SQL in `apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs:57-77`; `ProductVariantSku.StockQuantity` and `InventoryItem` exist separately, and inventory import updates SKU stock in `ImportInventoryBatchCommandHandler.cs:59`. |

### Phase 2A update

Status: DONE for checkout stock source selection and atomic decrement.

Stock model confirmed:

| Model item | Finding |
| --- | --- |
| `Product.HasVariants` | Exists on `apps/backend/Ecommerce/Ecommerce.Domain/Entities/Product.cs`; `false` means stock/price come from `Product.StockQuantity` and product price fields. |
| `ProductVariantSku` | Exists with `ProductId`, `Sku`, `Price`, `SalePrice`, `StockQuantity`, `IsActive`, and inventory navigation in `apps/backend/Ecommerce/Ecommerce.Domain/Entities/ProductVariantSku.cs`. |
| `InventoryItem` | Exists and points to `ProductVariantSkuId`; Phase 2A does not reserve/sell serial-level inventory yet. |
| `OrderItem.ProductVariantSkuId` | Already existed as nullable; Phase 2A now populates it for variant checkout and snapshots `SkuCode`/`VariantInfo`. |
| `CreateOrderItemDto.ProductVariantSkuId` | Added as nullable. It is required by handler when `Product.HasVariants == true`. |
| `CartItem.ProductVariantSkuId` | Already exists, but `AddToCartCommand` still does not expose SKU selection and cart pricing still uses product price. This remains TODO before full cart-to-checkout variant support. |

Checkout behavior after Phase 2A:

| Scenario | Behavior |
| --- | --- |
| Non-variant product | Checkout validates `Product.StockQuantity`, creates order item without SKU id, and calls `IProductRepository.TryDecrementStockAsync`. |
| Variant product without SKU | Checkout returns business validation error and does not decrement stock. |
| SKU not found/not active/not owned by product | Checkout returns business validation error and does not decrement stock. |
| Variant product with valid SKU | Checkout uses `ProductVariantSku.EffectivePrice`, snapshots SKU fields on `OrderItem`, and calls `IProductVariantSkuRepository.TryDecrementStockAsync`. |
| Concurrent checkout pressure | Product/SKU repositories use atomic `ExecuteUpdateAsync` predicates with `StockQuantity >= quantity`; integration test confirms two concurrent SKU decrements against one remaining stock allow only one success and leave stock at 0. |
| Promo redeem failure after stock decrement | Existing Phase 1C compensation now restores either product or SKU stock through repository abstractions. |

Files changed/audited in Phase 2A:

| File/class/method | Notes |
| --- | --- |
| `apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs` | Resolves stock source per item, requires SKU for variant products, uses repository abstractions for atomic decrement/restore, and keeps promo flow intact. |
| `apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Dto/CreateOrderItemDto.cs` | Adds optional `ProductVariantSkuId` to checkout contract. |
| `apps/backend/Ecommerce/Ecommerce.Domain/Entities/Order.cs` | `AddOrderItem` now accepts SKU snapshot fields and merges by product plus SKU/color/size. |
| `apps/backend/Ecommerce/Ecommerce.Domain/Interfaces/IProductRepository.cs` | Adds `TryDecrementStockAsync` and `RestoreStockAsync`. |
| `apps/backend/Ecommerce/Ecommerce.Domain/Interfaces/IProductVariantSkuRepository.cs` | Adds `TryDecrementStockAsync` and `RestoreStockAsync` for SKU-level stock. |
| `apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Repositories/ProductRepository.cs` | Implements atomic non-variant product stock decrement/restore. |
| `apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Repositories/ProductVariantSkuRepository.cs` | Implements atomic SKU stock decrement/restore. |

Tests added/updated:

| Test | Expected behavior |
| --- | --- |
| `CreateOrderCommandHandlerTests.Handle_ValidAuthenticatedOrder_ReturnsSuccessAndPersistsOrder` | Non-variant checkout uses product stock repository and product sale price. |
| `CreateOrderCommandHandlerTests.Handle_ProductWithVariantsMissingSku_ReturnsBadRequest` | Variant product requires `ProductVariantSkuId`. |
| `CreateOrderCommandHandlerTests.Handle_ProductWithVariantsSkuNotBelongingToProduct_ReturnsBadRequest` | SKU must belong to the requested product. |
| `CreateOrderCommandHandlerTests.Handle_ProductWithVariantsInsufficientSkuStock_ReturnsBadRequest` | SKU stock shortage rejects order before decrement/persist. |
| `CreateOrderCommandHandlerTests.Handle_ProductWithVariantsValidSku_UsesSkuStockAndPrice` | Valid variant checkout uses SKU stock, SKU price, and snapshots SKU fields. |
| `CreateOrderCommandHandlerTests.Handle_ProductWithVariantsAtomicSkuUpdateFails_ReturnsBadRequestAndClearsTracking` | Atomic SKU decrement race failure rejects order and clears tracking. |
| `StockLifecycleTests.ConcurrentSkuStockDecrement_AllowsOnlyOneSuccessAndDoesNotGoNegative` | Two concurrent SKU decrement attempts against one unit result in one success and stock 0. |

Remaining work:

| Item | Note |
| --- | --- |
| Cart variant flow | `CartItem.ProductVariantSkuId` exists, but `AddToCartCommand` does not expose it and cart subtotal still uses product price. Variant cart support should be completed before frontend cart checkout depends on SKU stock. |
| Reservation/release | Phase 2A decrements at valid order creation. There is still no reservation expiry or release on payment failure/abandoned pending order. |
| Cancel/return restore | Order cancellation, deletion, returns, and serial-level inventory transitions still need alignment in P2-002. |
| DB check constraints | No migration added for `StockQuantity >= 0`; atomic predicates prevent checkout from making stock negative. A later migration can add provider-specific check constraints after production data pre-check. |

### Ownership, privacy, and lifecycle checks

| Item checked | Finding |
| --- | --- |
| Orders | `OrdersController.GetById` and `GetOrderHistory` perform controller-level owner/admin checks in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/OrdersController.cs:54` and `OrdersController.cs:76`; this should be moved/enforced in handlers too. |
| Addresses | `AddressesController` sets `ApplicationUserId` from claims but lacks `[Authorize]` endpoint metadata; ownership is partially pushed to query/command parameters. |
| Search history | `SearchSuggestionsController.ClearHeaderSearchHistory` accepts `userId` from query in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/SearchSuggestionsController.cs:71`. |
| Wishlist | `WishlistController` has no `[Authorize]` attributes and sends wishlist commands/queries without user id in the action body. |
| Returns | `ReturnsController` has `[Authorize]`/Admin role attributes, but owner rule verification should be audited in handlers before Phase 3 implementation. |

### Domain events and architecture

| Item checked | Finding |
| --- | --- |
| Domain event dispatch | `ApplicationDbContext.SaveChangesAsync()` calls `DispatchDomainEvents()` before `base.SaveChangesAsync()` in `apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/ApplicationDbContext.cs:96-102`, so events can publish before the DB write/transaction is durably committed. |
| Transaction behavior | `TransactionBehavior` commits after `next()` in `apps/backend/Ecommerce/Ecommerce.Application/Common/Behaviors/TransactionBehavior.cs:42-50`; this does not prevent `SaveChangesAsync()` from publishing before commit. |
| Web concerns in Application | Payment Application service contracts reference ASP.NET Core `HttpContext`/`IQueryCollection`. |

### Frontend quality gates

| App | Finding |
| --- | --- |
| `apps/frontend/ecommerce-client` | `next.config.ts` sets `eslint.ignoreDuringBuilds = true` and `typescript.ignoreBuildErrors = true`; package scripts include `build` and `lint`. |
| `apps/frontend/ecommerce-dashboard` | `next.config.ts` sets `eslint.ignoreDuringBuilds = true`; package scripts include `build` and `lint`. |

## Build and test results

| Command | Result | Notes |
| --- | --- | --- |
| `dotnet build apps/backend/Ecommerce/Ecommerce.sln` | PASS | Completed with 73 warnings and 0 errors. Warnings are mainly nullable/reference warnings. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.sln` | PASS on rerun via `--no-build` | Initial parallel run conflicted with build output lock. Rerun passed: Domain 57/57, Application 173/173, WebAPI Integration 4/4, total 234/234. |
| `dotnet build apps/backend/Ecommerce/Ecommerce.sln` after Phase 0A | PASS | Completed with 1 warning and 0 errors. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/Ecommerce.WebAPI.IntegrationTests.csproj --no-build` after Phase 0A | PASS | 15/15 integration tests passed, including new Phase 0 authorization coverage. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.sln --no-build` after Phase 0A | PASS | Domain 57/57, Application 173/173, WebAPI Integration 15/15, total 245/245. |
| `dotnet build apps/backend/Ecommerce/Ecommerce.sln` after Phase 0B | PASS | 0 warnings, 0 errors on the post-change build run. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/Ecommerce.WebAPI.IntegrationTests.csproj --no-build` after Phase 0B | PASS | 20/20 integration tests passed, including Swagger, HTTPS redirect, and CSRF coverage. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.sln --no-build` after Phase 0B | PASS | Domain 57/57, Application 173/173, WebAPI Integration 20/20, total 250/250. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.Application.Tests/Ecommerce.Application.Tests.csproj --filter CreatePaymentForOrderCommandHandlerTests` after Phase 1A | PASS | 6/6 payment command handler tests passed. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/Ecommerce.WebAPI.IntegrationTests.csproj --filter PaymentCorrectnessTests` after Phase 1A | PASS | 3/3 payment endpoint integration tests passed. |
| `dotnet build apps/backend/Ecommerce/Ecommerce.sln` after Phase 1A | PASS | 0 warnings, 0 errors. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.sln --no-build` after Phase 1A | PASS | Domain 57/57, Application 179/179, WebAPI Integration 23/23, total 259/259. Required a longer timeout because integration tests took about 6m23s. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/Ecommerce.WebAPI.IntegrationTests.csproj --filter PaymentCorrectnessTests` after Phase 1B | PASS | 9/9 payment integration tests passed, covering success, duplicate, return-before-IPN, invalid signature, amount mismatch, and failed response code. |
| `dotnet build apps/backend/Ecommerce/Ecommerce.sln` after Phase 1B | PASS | 0 warnings, 0 errors. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.sln --no-build` after Phase 1B | PASS | Domain 57/57, Application 179/179, WebAPI Integration 29/29, total 265/265. Integration tests took about 7m57s. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.Application.Tests/Ecommerce.Application.Tests.csproj --filter "ApplyPromoCodeCommandHandlerTests\|CreateOrderCommandHandlerTests"` after Phase 1C | PASS | 11/11 targeted promo/order tests passed. |
| `dotnet build apps/backend/Ecommerce/Ecommerce.sln` after Phase 1C | PASS | 0 warnings, 0 errors. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.sln --no-build` after Phase 1C | PASS | Domain 57/57, Application 185/185, WebAPI Integration 29/29, total 271/271. Integration tests took about 7m25s. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.Application.Tests/Ecommerce.Application.Tests.csproj --filter CreateOrderCommandHandlerTests` after Phase 2A | PASS | 13/13 order command tests passed, including product/SKU stock source cases. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/Ecommerce.WebAPI.IntegrationTests.csproj --filter StockLifecycleTests` after Phase 2A | PASS | 1/1 integration test passed for concurrent SKU stock decrement. |
| `dotnet build apps/backend/Ecommerce/Ecommerce.sln` after Phase 2A | PASS | 73 warnings, 0 errors. Warnings are existing nullable/reference warnings outside the Phase 2A stock changes. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.sln --no-build` after Phase 2A | PASS | Domain 57/57, Application 190/190, WebAPI Integration 30/30, total 277/277. Integration tests took about 8m27s. |
| Frontend scripts audit | DONE | Both frontend apps have `build` and `lint` scripts. No frontend build/lint was required or run for this task. |

## Next recommended prompt

Implement Phase 2B order lifecycle stock release: restore Product/SKU stock consistently on cancellation/payment failure/return flows, and define when InventoryItem serials move between Available/Reserved/Sold/Returned.

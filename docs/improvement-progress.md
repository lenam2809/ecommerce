# ShopViet Improvement Progress

## Summary

This document tracks incremental technical improvements for ShopViet E-Commerce without changing production behavior in the audit phase. The current pass records verified risks, maps them to phases, and creates a backlog suitable for implementation through small, reviewable changes.

## Phases

| Phase | Name | Goal | Status |
| --- | --- | --- | --- |
| Phase 0 | Critical security hardening | Lock down public mutations/admin endpoints, production Swagger/test endpoints, HTTPS, and obvious dev surfaces. | IN_PROGRESS |
| Phase 1 | Payment, promo, checkout correctness | Close payment confirmation flow, align promo usage timing, and make checkout side effects explicit. | IN_PROGRESS |
| Phase 2 | Stock va order lifecycle | Unify Product stock, SKU stock, inventory items, and order/return stock transitions. | IN_PROGRESS |
| Phase 3 | Ownership, privacy, review/return rules | Enforce ownership in user-scoped APIs and move privacy/rule checks into Application handlers. | IN_PROGRESS |
| Phase 4 | Architecture cleanup va outbox | Move web concerns out of Application, keep reporting/query logic out of controllers, and dispatch domain events after durable commit/outbox. | IN_PROGRESS |
| Phase 5 | Frontend quality gate va observability | Re-enable frontend type/lint gates and add operational visibility around checkout/payment/security flows. | IN_PROGRESS |

## Checklist

| Task id | Description | Status | Files touched | Tests added/updated | Notes |
| --- | --- | --- | --- | --- | --- |
| AUDIT-001 | Create improvement tracking document and record audit scope. | DONE | `docs/improvement-progress.md` | None | Documentation-only task. |
| P0-001 | Add explicit authorization/policies to public admin/content mutations. | DONE | `AboutController.cs`, `ContactController.cs`, `BannerController.cs`, `BrandsController.cs`, `CategoriesController.cs`, `PromoCodesController.cs`, `ProductsController.cs`, `ReportsController.cs` | `Phase0AuthorizationTests.cs` | Phase 0A secured high-risk content/catalog/promo/report mutations. |
| P0-002 | Gate Swagger/UI by environment or config. | DONE | `apps/backend/Ecommerce/Ecommerce.WebAPI/Program.cs` | `Phase0RuntimeHardeningTests.cs` | Phase 0B enables Swagger/UI only in Development. |
| P0-003 | Re-enable or explicitly configure HTTPS redirection/proxy behavior. | DONE | `Program.cs`, `DependencyInjection.cs`, `AddAuthenticationExtensions.cs` | `Phase0RuntimeHardeningTests.cs` | Phase 0B enables HTTPS redirection outside Development and requires JWT HTTPS metadata outside Development. |
| P0-004 | Remove or protect test/dev controllers. | DONE | `DevelopmentOnlyAttribute.cs`, `TestStorageController.cs`, `WeatherForecastController.cs` | `Phase0AuthorizationTests.cs` | Test/dev controllers now return 404 outside Development. |
| P1-001 | Replace client-supplied payment amount/order data with server-derived order payment initiation. | DONE | `PaymentsController.cs`, `CreatePaymentForOrderCommand*`, `IVnPayService.cs`, `VnPayService.cs`, appsettings production files | `CreatePaymentForOrderCommandHandlerTests.cs`, `PaymentCorrectnessTests.cs` | Phase 1A create-url now requires auth and derives amount/orderInfo/txnRef from backend order by `orderId`; client amount/orderInfo are ignored. Guest VNPay payment is intentionally blocked pending a clear guest ownership mechanism. |
| P1-002 | Make VNPay callbacks/IPN idempotent and update orders/payments consistently. | DONE | `PaymentsController.cs`, `VnPayService.cs`, `PaymentTransaction.cs`, `PaymentCorrectnessTests.cs` | `PaymentCorrectnessTests.cs` | Phase 1B verifies signature before DB writes, uses `PaymentTransactions.TxnRef` as idempotency key, prevents duplicate `Payment`, and keeps invalid/mismatch/failed responses from marking orders paid. VNPay adapter move was later resolved in Phase 4B. |
| P1-003 | Move promo usage increment from apply/preview to redeem/order confirmation. | DONE | `PromoCodesController.cs`, `ApplyPromoCodeCommandHandler.cs`, `CreateOrderCommandHandler.cs`, `Order.cs`, `CartRepository.cs` | `ApplyPromoCodeCommandHandlerTests.cs`, `CreateOrderCommandHandlerTests.cs` | Phase 1C makes promo apply/preview read-only and increments `TimesUsed` once during valid order creation. No migration added; redemption table and explicit discount amount column are deferred. |
| P2-001 | Define stock source of truth for non-variant Product stock, ProductVariantSku stock, and InventoryItem serials. | DONE | `CreateOrderCommandHandler.cs`, `CreateOrderItemDto.cs`, `Order.cs`, `IProductRepository.cs`, `IProductVariantSkuRepository.cs`, `ProductRepository.cs`, `ProductVariantSkuRepository.cs` | `CreateOrderCommandHandlerTests.cs`, `StockLifecycleTests.cs` | Phase 2A checkout now uses `Products.StockQuantity` only for non-variant products and requires/decrements `ProductVariantSkus.StockQuantity` for variant products. |
| P2-002 | Align order cancel/delete/return stock restore with SKU and inventory item state. | TODO | Order/return handlers | TBD | Existing restore paths focus on Product stock. |
| P3-001 | Add `[Authorize]` to address/search-history/wishlist controllers and enforce current-user ownership in handlers. | IN_PROGRESS | `AddressesController.cs`, `WishlistController.cs`, `SearchSuggestionsController.cs`, customer address handlers, search history commands | `Phase3OwnershipTests.cs` | Address and wishlist customer surfaces now require auth and handlers use `ICurrentUserService`. Search history no longer accepts `userId` from query/body for clear and ignores body `UserId` on save, but real persistence is BLOCKED because no search-history entity/repository exists. |
| P3-002 | Audit return/order/review ownership and lifecycle rules in Application handlers. | DONE | Return request handlers, order detail/list/history handlers, `EUserRoles.cs`, review command/repository/configuration | `Phase3OwnershipTests.cs`, `CreateReviewCommandHandlerTests.cs` | Returns, order detail/history, and review creation now enforce current-user rules in Application. Guest-owned resources remain blocked pending signed guest ownership. |
| P3-003 | Enforce review duplicate/verified-purchase rules and reduce review/content XSS risk. | DONE | `CreateReviewCommandHandler.cs`, `ReviewRepository.cs`, `ReviewConfiguration.cs`, review DTO/service/UI, review unique-index migration | `CreateReviewCommandHandlerTests.cs` | Authenticated users can create one review per product. Review uses current user, stores encoded plain text, and sets `IsVerified` only when a delivered/completed order contains the product. |
| P3-004 | Enforce return/RMA duplicate, quantity, return window, and evidence path rules. | DONE | `CreateReturnRequestCommandHandler.cs`, `IReturnRequestRepository.cs`, `ReturnRequestRepository.cs` | `CreateReturnRequestCommandHandlerTests.cs`, `Phase3OwnershipTests.cs` | Open RMA is unique per order item, total non-rejected quantity cannot exceed purchased quantity, 7-day window uses delivered order history when available, and evidence no longer accepts arbitrary external URLs. |
| P4-001 | Move `VnPayService` out of Application or remove `HttpContext`/`IQueryCollection` dependency from Application contract. | DONE | `IPaymentGateway.cs`, payment gateway DTOs, `ProcessPaymentCallbackCommand*`, `VnPayPaymentGateway.cs`, `VnPaySettings.cs`, `PaymentsController.cs`, DI registrations | `CreatePaymentForOrderCommandHandlerTests.cs`, `PaymentCorrectnessTests.cs` | Phase 4B removes Application `IVnPayService`/`VnPayService`; Application now depends on neutral `IPaymentGateway`, while VNPay URL/signature/query mapping lives in Infrastructure. |
| P4-002 | Replace pre-save domain event dispatch with after-commit dispatch/outbox. | IN_PROGRESS | `ApplicationDbContext.cs`, `OutboxMessage*`, `OutboxMessageProcessor.cs`, `OutboxBackgroundService.cs`, `OutboxMessageConfiguration.cs`, `AddOutboxMessages` migration | `OutboxPatternTests.cs` | Phase 4C converts `OrderCreatedEvent` to a scoped outbox flow. Non-converted events still dispatch in-process before save for compatibility and are pending migration. |
| P4-003 | Move ad hoc stats/report logic out of `OrdersController`. | TODO | `OrdersController.cs`, report queries | TBD | Controller builds stats and uses `int.MaxValue`. |
| P4-004 | Replace name-based `TransactionBehavior` query detection with MediatR marker interfaces. | DONE | `ICommand.cs`, `IQuery.cs`, `TransactionBehavior.cs`, Payment/Promo/Order/Report/Return request types | `TransactionBehaviorTests.cs` | Phase 4A adds `ICommand<TResponse>`/`IQuery<TResponse>`, skips transactions for marked queries, and keeps unmarked requests on the previous command-like transaction fallback until fully migrated. |
| P4-005 | Centralize authorization policy/permission constants and invalidate authorization caches after permission changes. | DONE | `AuthorizationPolicies.cs`, `AuthorizationBehavior.cs`, role/permission/account-lock handlers, auth/user repositories, WebAPI controllers | `AuthorizationMaintainabilityTests.cs`, authorization behavior tests | Phase 4D removes active `[Authorize(Policy = "...")]` literals, centralizes legacy policy names and permission claim type, invalidates user/role permission caches, and logs access-control changes. |
| P5-001 | Re-enable frontend build type/lint gates. | IN_PROGRESS | `apps/frontend/ecommerce-client/package.json`, `apps/frontend/ecommerce-client/eslint.config.mjs`, `apps/frontend/ecommerce-dashboard/package.json`, `apps/frontend/ecommerce-dashboard/eslint.config.mjs`, `.github/workflows/frontend-quality.yml` | Frontend npm scripts run; typecheck/lint/build results recorded below. | Phase 5A adds explicit typecheck/lint/build scripts and CI gate. Next.js build ignores remain because client typecheck/lint and dashboard lint still fail on existing debt. |
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

### Phase 3A update

Status: IN_PROGRESS. Customer-owned resources now rely on Application handlers for ownership checks; controller checks remain only as endpoint metadata or defense-in-depth.

Resources protected in this pass:

| Area | Change |
| --- | --- |
| Returns `Create` | `CreateReturnRequestCommandHandler` now reads `ICurrentUserService.UserId`, overwrites `CustomerId`, blocks unauthenticated users, and forbids creating RMA for another user's order. Guest order returns remain blocked pending a verified guest ownership strategy. |
| Returns `GetById` / list | Return query handlers now allow owner access and admin/manager access; non-owners receive Forbidden. Customer list requests are forced to current user unless privileged. |
| Addresses | `AddressesController` now has `[Authorize]`; create/get/update/delete/set-default handlers ignore client-supplied `ApplicationUserId` and use `ICurrentUserService.UserId` for ownership. |
| Orders detail/list/history | `GetOrdersByUserQueryHandler` uses current user for customer flow and preserves privileged admin/manager/staff target-user flow. `GetOrderHistoryQueryHandler` now checks current user ownership or privileged role before returning history. `GetOrderByIdQueryHandler` now includes manager as a privileged role. |
| Wishlist | `WishlistController` now requires `[Authorize]`; existing handlers already use `ICurrentUserService.UserId`. |
| Search history | `SearchSuggestionsController` protects save/delete/clear with `[Authorize]`; clear no longer accepts `userId` query. Command handlers use current user and return ServiceUnavailable because no search-history persistence model/repository exists yet. |

Tests added:

| Test | Expected behavior |
| --- | --- |
| `Phase3OwnershipTests.Customer_CannotDeleteAnotherUsersAddress` | User A deleting User B address returns 403. |
| `Phase3OwnershipTests.Customer_CannotViewAnotherUsersReturnRequest` | User A reading User B return request returns 403. |
| `Phase3OwnershipTests.Customer_CannotCreateReturnForAnotherUsersOrder` | User A creating RMA for User B order returns 403. |
| `Phase3OwnershipTests.Customer_CannotViewAnotherUsersOrderHistory` | User A reading User B order history returns 403. |
| `Phase3OwnershipTests.Anonymous_WishlistEndpoints_ReturnUnauthorized` | Anonymous wishlist access returns 401. |
| `Phase3OwnershipTests.Customer_ClearSearchHistory_DoesNotAcceptTargetUserId` | `userId` query is ignored; endpoint uses current user and returns configured storage-blocked status. |

Remaining Phase 3 risks:

| Item | Status |
| --- | --- |
| Guest order/return access | BLOCKED until a signed guest ownership mechanism exists; do not expose guest order/RMA by GUID alone. |
| Search history persistence | BLOCKED because no entity/repository/handler implementation existed; current change prevents client-supplied target user IDs but does not add storage. |
| Review creation ownership/lifecycle | DONE in Phase 3B. Update/delete flows are not implemented today; enforce the same owner/admin split if introduced later. |

### Phase 3B update

Status: DONE for review creation rules and focused content safety hardening.

Review rule selected:

| Rule | Implementation |
| --- | --- |
| Authentication | `CreateReviewCommandHandler` now uses `ICurrentUserService.UserId`; `CreateReviewCommand.UserId` from client is ignored. Unauthenticated or unresolved users return Unauthorized instead of throwing null reference errors. |
| Buyer requirement | Code/UI previously allowed open authenticated reviews, so the rule remains open authenticated review. The handler sets `Review.IsVerified=true` only if the current user has a `Delivered` or `Completed` order containing the reviewed product. |
| Duplicate prevention | One review per `(ProductId, ApplicationUserId)`. Handler pre-checks duplicates and EF configuration now has unique index `IX_Reviews_ProductId_ApplicationUserId`. |
| Rating/content validation | Rating outside 1-5 returns validation error. Review content is stored as encoded plain text after trimming and null-character removal. |
| Rating aggregate | Handler saves the review before calculating product rating summary, then updates `Product.Rating` and `Product.ReviewCount` from repository aggregation. |

XSS/content handling:

| Surface audited | Finding/change |
| --- | --- |
| Review content backend | Stored as encoded plain text; raw `<script>` is not persisted by `CreateReviewCommandHandler`. |
| Review frontend render | `ReviewItem` renders review content as React text, not HTML. The "Đã mua hàng" badge now renders only when `review.isVerified` is true. |
| Product detail description | Product descriptions in inspected client pages/tabs render as text, not `dangerouslySetInnerHTML`. |
| `dangerouslySetInnerHTML` audit | `app/layout.tsx` and product page use internal JSON-LD via `JSON.stringify`; dashboard chart CSS is internal generated style; client `MarqueeBarClient` renders marquee HTML and relies on backend marquee handlers that use `HtmlSanitizer`. No frontend sanitizer dependency was added. |

Files touched:

| File | Notes |
| --- | --- |
| `apps/backend/Ecommerce/Ecommerce.Application/Features/Reviews/Commands/CreateReview/CreateReviewCommandHandler.cs` | Current-user ownership, duplicate check, verified-purchase flag, encoded content, rating summary update. |
| `apps/backend/Ecommerce/Ecommerce.Domain/Interfaces/IReviewRepository.cs` | Added duplicate, delivered-purchase, and rating-summary repository contracts. |
| `apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Repositories/ReviewRepository.cs` | Implements duplicate check, delivered/completed purchase lookup, and aggregate rating projection. |
| `apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/EntityConfigurations/ReviewConfiguration.cs` | Adds unique `(ProductId, ApplicationUserId)` index. |
| `apps/backend/Ecommerce/Ecommerce.Infrastructure/Migrations/20260516123045_AddReviewProductUserUniqueIndex.cs` | Adds review unique index. Also captures existing model drift for unique `Orders.Code` from Phase 2 code-generation work. |
| `apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Seed/ApplicationDbContextSeed.cs` | Review seed now picks distinct users per product so fresh seed data respects the unique rule. |
| `apps/frontend/ecommerce-client/services/review-service.ts` and `components/product-reviews.tsx` | Frontend no longer sends `userId` during review creation. |
| `apps/frontend/ecommerce-client/components/reviews/review-item.tsx` | Verified-purchase badge is conditional on `isVerified`. |

Migration/pre-check notes:

| Item | Note |
| --- | --- |
| Review unique index | Before applying to an existing database, check duplicates with `GROUP BY ProductId, ApplicationUserId HAVING COUNT(*) > 1` and resolve them first. |
| Order code unique index | Migration also includes `IX_Orders_Code` because the model already had a unique `Order.Code` configuration from the prior order-code phase but no migration snapshot entry. Check duplicate order codes before applying. |

Tests added:

| Test | Expected behavior |
| --- | --- |
| `Handle_UserNotAuthenticated_ReturnsUnauthorizedWithoutCrashing` | Anonymous review creation is rejected and does not query product/user state. |
| `Handle_DuplicateReview_ReturnsConflict` | Existing review by same user/product is rejected. |
| `Handle_OpenReview_UsesCurrentUserAndStoresSanitizedPlainText` | Client `UserId` is ignored, current user is used, raw script is encoded, non-buyer review is not verified, rating summary updates. |
| `Handle_DeliveredBuyerReview_SetsVerifiedPurchaseFlag` | Delivered/completed buyer review succeeds with `IsVerified=true`. |

Remaining Phase 3 risks:

| Item | Status |
| --- | --- |
| Guest reviews/orders/returns | Still BLOCKED until a signed guest ownership/access-token strategy exists. |
| Review update/delete ownership | Not implemented in current codebase; add ownership checks if those commands/controllers are introduced. |
| Marquee/content HTML contract | Backend sanitizes marquee HTML today; a later frontend hardening pass should define an explicit sanitized HTML contract for all CMS-like fields. |

### Phase 3C update

Status: DONE for scoped Returns/RMA correctness hardening.

Return rules implemented:

| Rule | Implementation |
| --- | --- |
| Duplicate open return | `CreateReturnRequestCommandHandler` calls `IReturnRequestRepository.HasOpenReturnForOrderItemAsync`. Any existing non-resolved RMA for the same `OrderItemId` returns Conflict. Open statuses are everything except `Rejected` and `Completed`. |
| Return quantity | Handler validates `Quantity > 0` and calculates remaining quantity from `OrderItem.Quantity - nonRejectedReturnQuantity`. Requests over remaining return BadRequest. |
| Partial returns | Multiple partial returns are still possible only after prior requests are resolved; total non-rejected quantity cannot exceed purchased quantity. |
| Order item loading | Create return now loads the order through `IOrderRepository.GetOrderWithItemsAsync` so item validation is based on real order items. |
| Return window | Handler prefers `OrderHistory` where `ToStatus == Delivered` for delivered date, then falls back to `Order.UpdatedAt` or `Order.CreatedAt`. The 7-day deadline remains enforced. |
| Evidence | Evidence paths are validated before aggregate creation: max 10 files, no absolute URL/scheme, no rooted/traversal path, must be under `returns/` or `uploads/returns/`, and extension must match image/video evidence type. |

Evidence validation strategy:

| Item | Status |
| --- | --- |
| Arbitrary external URL | Rejected. Examples like `https://evil.example/evidence.png` are no longer accepted. |
| Storage path ownership | Deferred. The current upload/storage model does not expose a durable file ownership token or upload session to validate that a path belongs to the current user/request. |
| MIME/size validation | Deferred to upload endpoints/storage service. This pass validates path shape and extension at RMA creation. A future return evidence upload endpoint should call `IFileStorageService.SaveFileAsync` directly and enforce MIME, size, and count before returning storage ids. |

Files touched:

| File | Notes |
| --- | --- |
| `apps/backend/Ecommerce/Ecommerce.Application/Features/Returns/Commands/CreateReturnRequest/CreateReturnRequestCommandHandler.cs` | Adds duplicate open check, remaining quantity calculation, delivered-history window lookup, and evidence path validation. |
| `apps/backend/Ecommerce/Ecommerce.Domain/Interfaces/IReturnRequestRepository.cs` | Adds open-return and non-rejected quantity query contracts. |
| `apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Repositories/ReturnRequestRepository.cs` | Implements return duplicate/quantity queries with EF projections. |
| `apps/backend/Ecommerce/Ecommerce.Application.Tests/Features/Returns/Commands/CreateReturnRequest/CreateReturnRequestCommandHandlerTests.cs` | Adds focused Application tests for the new RMA rules. |

Tests added:

| Test | Expected behavior |
| --- | --- |
| `Handle_OpenReturnExistsForOrderItem_ReturnsConflict` | Duplicate open RMA for the same order item is rejected. |
| `Handle_QuantityExceedsRemainingReturnableQuantity_ReturnsBadRequest` | Quantity over remaining returnable quantity is rejected. |
| `Handle_ReturnAfterWindow_ReturnsBadRequest` | Return after 7-day delivered window is rejected when delivered history exists. |
| `Handle_ExternalEvidenceUrl_ReturnsBadRequest` | External evidence URL is rejected. |
| `Handle_ValidReturnRequest_PersistsReturnWithEvidence` | Valid return with internal evidence path succeeds. |

Deferred items:

| Item | Status |
| --- | --- |
| Reliable delivered timestamp column | TODO. `OrderHistory` is preferred, but orders without history still fall back to `UpdatedAt`/`CreatedAt`; adding explicit `DeliveredAt` would make the window rule unambiguous. |
| Evidence upload ownership | TODO. Need a customer-facing return evidence upload flow or storage token model before validating file ownership strongly. |
| Cancel/reopen RMA flow | TODO. Current resolved statuses are `Rejected` and `Completed`; no customer cancel flow exists. |

### Phase 4A update

Status: DONE for marker-interface transaction routing and first priority request migration.

Transaction strategy:

| Area | Before | After |
| --- | --- | --- |
| Query detection | `TransactionBehavior` skipped transactions when `typeof(TRequest).Name.EndsWith("Query")`. | `TransactionBehavior` skips transactions when the request implements `IQuery<TResponse>`. |
| Command transaction | Non-query request names opened a transaction and committed/rolled back around `next()`. | Requests implementing `ICommand<TResponse>` open the same transaction boundary. |
| Unmarked requests | Behavior depended on naming. | Backward-compatible fallback treats unmarked requests as command-like and opens a transaction. This avoids breaking unmigrated mutation flows while remaining marker-first for migrated queries. |
| Active transaction | Existing active transaction skipped a new transaction. | Unchanged. |

Marker interfaces added:

| Interface | Location | Notes |
| --- | --- | --- |
| `ICommand<out TResponse> : IRequest<TResponse>` | `apps/backend/Ecommerce/Ecommerce.Application/Common/Interfaces/ICommand.cs` | Marker for mutating MediatR requests. |
| `IQuery<out TResponse> : IRequest<TResponse>` | `apps/backend/Ecommerce/Ecommerce.Application/Common/Interfaces/IQuery.cs` | Marker for read-only MediatR requests that should not open a transaction. |

Request types migrated in this pass:

| Group | Marker applied |
| --- | --- |
| Payments | `CreatePaymentForOrderCommand` -> `ICommand<Result<CreatePaymentForOrderResultDto>>`. |
| Promo codes | Admin create/update/delete -> `ICommand`; `GetActivePromoCodesQuery`, `GetPagedPromoCodesQuery`, `GetPromoCodeByIdQuery` -> `IQuery`; `ApplyPromoCodeCommand` -> `IQuery` because Phase 1C made apply/preview read-only while preserving the existing request name. |
| Orders | Create/update/delete/status/send-email commands -> `ICommand`; order detail/list/history/analytics/history-stats/history-overview requests -> `IQuery`. |
| Reports | All `Features/Reports/Queries/*` request types -> `IQuery`. |
| Returns | Create/approve/reject/update-status commands -> `ICommand`; return get/list queries -> `IQuery`. |

Pending request marker migration:

| Area | Status |
| --- | --- |
| Remaining `IRequest<T>` feature folders | TODO: `About`, `Account`, `AccountLocks`, `AuditLogs`, `Auth`, `Banners`, `Brands`, `Cart`, `Categories`, `CategoryBrands`, `Contact`, `CustomerAddresses`, `Dashboard`, `Inventory`, `Marquee`, `Notifications`, `Permissions`, `Products`, `Reviews`, `Roles`, `SearchSuggestions`, `UserActivities`, `Users`, `Wishlists`. |
| Fallback removal | TODO after all request types are marked. Once no business request depends on raw `IRequest<T>`, update `TransactionBehavior` to skip or fail unmarked requests explicitly instead of treating them as commands. |
| Architecture cleanup still open | Payment gateway Web dependency resolved in Phase 4B. Phase 4C starts P4-002 with scoped `OrderCreatedEvent` outbox; broader event migration remains pending. |

Tests added/updated:

| Test | Expected behavior |
| --- | --- |
| `Handle_RequestIsQuery_SkipsTransactionAndCallsNext` | `IQuery<TResponse>` does not call execution strategy or begin transaction. |
| `Handle_CommandSucceeds_BeginsAndCommitsTransaction` | `ICommand<TResponse>` opens and commits transaction. |
| `Handle_CommandThrows_RollsBackAndRethrows` | Exception rolls back and rethrows. |
| `Handle_UnmarkedRequest_BeginsTransactionForBackwardCompatibility` | Raw `IRequest<TResponse>` still opens transaction during migration. |

### Phase 4B update

Status: DONE for moving the VNPay adapter behind a Clean Architecture payment gateway boundary.

Layer dependency before/after:

| Area | Before | After |
| --- | --- | --- |
| Application payment dependency | `CreatePaymentForOrderCommandHandler` depended on `IVnPayService` and VNPay DTOs under `Ecommerce.Application.Features.Payments.VnPay`. | Handler depends on `IPaymentGateway` and neutral `PaymentGatewayRequest`. |
| Application Web dependency in payment | `IVnPayService` exposed `HttpContext` and `IQueryCollection`; `VnPayService` parsed ASP.NET Core query collections in Application. | Payment Application models use `IReadOnlyDictionary<string, string>` for callback/IPN parameters. No payment feature type references `HttpContext` or `IQueryCollection`. |
| VNPay adapter location | `VnPayService`, `VnPaySettings`, signature validation, URL generation, and VNPay query mapping were in Application. | `VnPayPaymentGateway`, `VnPaySettings`, signature validation, URL generation, and VNPay query mapping are in `Ecommerce.Infrastructure/Payments/VnPay`. |
| Callback/IPN business updates | VNPay service mixed gateway parsing with order/payment transaction state updates. | `ProcessPaymentCallbackCommandHandler` in Application owns idempotency, amount/order validation, transaction/payment/order updates; Infrastructure only parses/verifies gateway data. |
| WebAPI controller | Controller injected `IVnPayService` and passed `Request.Query` directly. | Controller injects `IMediator`, converts query params to dictionary, and sends `ProcessPaymentCallbackCommand`. Response/redirect contract remains unchanged. |
| DI | Application registered `IVnPayService -> VnPayService`; WebAPI configured `VnPaySettings`. | Infrastructure configures `VnPaySettings` and registers `IPaymentGateway -> VnPayPaymentGateway`. |

Interfaces and models added:

| Type | Location | Purpose |
| --- | --- | --- |
| `IPaymentGateway` | `apps/backend/Ecommerce/Ecommerce.Application/Common/Interfaces/IPaymentGateway.cs` | Application-facing abstraction for payment URL creation and callback parsing. |
| `PaymentGatewayRequest` | `apps/backend/Ecommerce/Ecommerce.Application/Features/Payments/Dto/PaymentGatewayRequest.cs` | Neutral request for payment URL creation. |
| `PaymentGatewayCallback` | `apps/backend/Ecommerce/Ecommerce.Application/Features/Payments/Dto/PaymentGatewayCallback.cs` | Neutral parsed callback/IPN result. |
| `ProcessPaymentCallbackCommand` | `apps/backend/Ecommerce/Ecommerce.Application/Features/Payments/Commands/ProcessPaymentCallback/*` | Application command for callback/IPN state transition and idempotency. |

Files touched:

| File/group | Notes |
| --- | --- |
| `Ecommerce.Application/Features/Payments/VnPay/*` | Removed old Application VNPay service, settings, and DTOs. |
| `Ecommerce.Infrastructure/Payments/VnPay/*` | Added VNPay adapter and settings in Infrastructure. |
| `CreatePaymentForOrderCommandHandler.cs` | Uses `IPaymentGateway` and neutral request DTO. |
| `PaymentsController.cs` | Uses MediatR for create URL, return, and IPN flows; no direct gateway service injection. |
| `ServiceCollectionExtensions.cs`, `AddServicesExtensions.cs`, `Program.cs` | Moved payment gateway registration/configuration from Application/WebAPI to Infrastructure. |

Tests:

| Test | Result |
| --- | --- |
| `CreatePaymentForOrderCommandHandlerTests` | PASS 6/6 after switching mocks from `IVnPayService` to `IPaymentGateway`. |
| `PaymentCorrectnessTests` | PASS 9/9; create-url, callback/IPN, invalid signature, amount mismatch, duplicate/idempotency behavior preserved. |

Remaining Phase 4 risks:

| Item | Status |
| --- | --- |
| Other Application Web concerns | Existing non-payment Application code still references ASP.NET Core abstractions, notably authorization/logging/marquee paths. This pass only removed the payment gateway leak. |
| Callback state-machine granularity | DONE for idempotency and consistency from Phase 1B; future cleanup can split callback/IPN commands if different source-of-truth behavior is needed. |
| Domain events before durable commit | Partially addressed in Phase 4C for `OrderCreatedEvent`; other domain events still use the old in-process dispatch path until they are explicitly converted. |

### Phase 4C update

Status: DONE for a scoped outbox implementation around `OrderCreatedEvent`; broader outbox migration remains IN_PROGRESS under P4-002.

Outbox scope and behavior:

| Area | Implementation |
| --- | --- |
| Outbox table | Added `OutboxMessages` with `Id`, `Type`, `Payload`, `OccurredAtUtc`, `ProcessedAtUtc`, `RetryCount`, `Error`, and `Status`. Migration: `20260517012236_AddOutboxMessages`. |
| SaveChanges behavior | `ApplicationDbContext.SaveChangesAsync()` collects domain events, writes selected outbox messages in the same EF transaction as aggregate changes, and skips pre-save in-process dispatch for outboxed events. |
| Converted event | `OrderCreatedEvent` is serialized to outbox and later published by `OutboxMessageProcessor`, so order-created notifications/emails run after the order commit. |
| Compatibility path | Events not recognized by `OutboxMessageFactory` still dispatch in-process before `base.SaveChangesAsync()` to preserve existing behavior, including stock/status side effects that currently depend on the same save cycle. |
| Worker | `OutboxBackgroundService` polls via scoped `OutboxMessageProcessor`; `Outbox:Enabled` defaults to true, with `BatchSize`, `MaxRetryCount`, and `PollIntervalSeconds` options. |
| Retry/status | Processor picks `Pending`/retryable `Failed` messages, marks `Processing`, publishes the event, then marks `Processed`; failures increment `RetryCount`, store truncated `Error`, and stop retrying after `MaxRetryCount`. |

Events converted/pending:

| Event/flow | Status | Notes |
| --- | --- | --- |
| `OrderCreatedEvent` | CONVERTED | Outboxed and processed after commit. Existing domain event handler remains the consumer. |
| `OrderStatusChangedEvent` | PENDING | Still dispatches before save because stock restoration currently mutates tracked entities in the existing save cycle. Needs separate command-safe handler or outbox consumer before conversion. |
| Return status/completed flows | PENDING | Return lifecycle has handlers, but no scoped conversion was done in this pass. |
| Payment success/failed | PENDING | Payment callback currently updates transaction/payment/order state directly. Dedicated integration events should be introduced before outboxing payment side effects. |
| Email/notification side effects | PARTIAL | Order-created email/notification side effects now run from the outbox processor. Other notification flows remain in-process. |

Operational notes:

| Item | Note |
| --- | --- |
| Migration | Apply `20260517012236_AddOutboxMessages` before enabling the worker in shared environments. |
| Multi-instance processing | Current worker is intentionally simple and does not use provider-specific row locking/leases; add a claim/lease strategy before running many API instances against the same outbox table. |
| Cleanup | Processed messages are retained. Add retention/archival policy later. |
| Integration tests | The integration test factory disables the background worker with `Outbox:Enabled=false` and invokes `OutboxMessageProcessor` directly for deterministic tests. |

Tests added/updated:

| Test | Expected behavior |
| --- | --- |
| `SaveChanges_WhenOrderCreated_CommitsOutboxMessage` | Creating an order commits a pending `OrderCreatedEvent` outbox message with the aggregate changes. |
| `SaveChanges_WhenTransactionRollsBack_DoesNotCommitOutboxMessage` | Rolling back the transaction leaves neither order nor outbox message committed. |
| `OutboxProcessor_ProcessesPendingMessage_AndDoesNotReprocessProcessedMessage` | Processor publishes the event, marks the message processed, creates notification side effects once, and ignores the processed message on the next run. |

### Phase 4D update

Status: DONE for authorization maintainability cleanup in the scoped backend surface.

Authorization constants:

| Area | Result |
| --- | --- |
| Permission constants | Active WebAPI/Application `[Authorize(Policy = ...)]` usages now reference `EPermissions` where the policy is a DB-backed permission. |
| Legacy policy names | Centralized `AdminOnly`, `Admin:ManageRoles`, `Products.Delete`, and staff composite policies in `AuthorizationPolicyNames`. `Products.Delete` remains as a compatibility policy name and is not renamed to avoid changing existing controller semantics. |
| Permission claim type | Centralized as `AuthorizationClaimTypes.Permission`; token generation, profile claim reads, policy registration, and `AuthorizationBehavior` now use the same constant. |
| Role constants | Replaced active `"Admin"`/`"Staff"` role checks in touched authorization paths with `EUserRoles`. |
| Policy registration | `AuthorizationPolicies.ConfigurePolicies()` now owns the legacy product-delete policy registration; the extra `Program.cs` string registration was removed. |

Cache invalidation and claims refresh:

| Mutation | Invalidation behavior |
| --- | --- |
| Assign/revoke role to user | `AssignRoleToUserCommandHandler` invalidates the target user's authorization/user cache. |
| Add/remove permissions from role | `AssignPermissionToRoleCommandHandler` refreshes user claims for that role and invalidates role authorization cache plus cached user permission entries. |
| Direct user permission update | `AssignPermissionToUserCommandHandler` invalidates the target user's cache. |
| Role permission cache service | `InvalidateRoleCache()` now removes `role_permissions_{role}` and the `user_permissions_` prefix, then invalidates user list cache. |

Audit/logging:

| Operation | Audit behavior |
| --- | --- |
| Role assignment | Logs `UserRolesChanged` as `ELogType.AccessControl`. |
| Role permission update | Logs `RolePermissionsChanged` as `ELogType.AccessControl`. |
| Direct user permission update | Logs `UserPermissionsChanged` as `ELogType.AccessControl`. |
| Account lock/unlock | Logs `AccountLockChanged` as `ELogType.AccessControl` in addition to existing user activity logging. |

Token/claims stale strategy:

| Item | Status |
| --- | --- |
| New access token / refresh path | `RefreshTokenCommandHandler` already loads current roles and permissions from repositories before issuing a new access token, so refreshed tokens pick up permission changes. |
| Existing access tokens | Still valid until access token expiry because authorization policies read JWT claims. No permission-version/security-stamp revocation was added in this pass. |
| Deferred | Add permission-version/security-stamp validation if immediate revocation of already-issued access tokens is required. |

String literal audit:

| Pattern | Result |
| --- | --- |
| Active `[Authorize(Policy = "...")]` | No active production/Application matches remain outside test-only synthetic requests. |
| `"AdminOnly"`, `"Products.Delete"`, staff composite policy names | Present only in `AuthorizationPolicyNames` constants. |
| DB permission seed names | Replaced matching seed literals with `EPermissions` constants where constants already exist. Legacy seed names without matching constants were left unchanged to avoid inventing permissions in this pass. |

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
| Web concerns in Application | Payment service contracts no longer reference ASP.NET Core `HttpContext`/`IQueryCollection` after Phase 4B. Other non-payment Application Web concerns remain, including authorization/logging/marquee paths. |

### Frontend quality gates

| App | Finding |
| --- | --- |
| `apps/frontend/ecommerce-client` | `next.config.ts` sets `eslint.ignoreDuringBuilds = true` and `typescript.ignoreBuildErrors = true`; package scripts include `build`, `lint`, and `typecheck`. |
| `apps/frontend/ecommerce-dashboard` | `next.config.ts` sets `eslint.ignoreDuringBuilds = true`; package scripts include `build`, `lint`, and `typecheck`. |

### Phase 5A update

Status: IN_PROGRESS for frontend quality gate scaffolding. CI/scripts are in place, but Next.js build ignores are intentionally retained until existing typecheck/lint debt is fixed.

Scripts and CI:

| Area | Result |
| --- | --- |
| Client scripts | `apps/frontend/ecommerce-client/package.json` now has `typecheck`, `lint`, and `build`. `lint` uses `eslint .` because `next lint` is not available in the current Next.js version. |
| Dashboard scripts | `apps/frontend/ecommerce-dashboard/package.json` now has `typecheck`, `lint`, and `build`. `lint` uses `eslint .`. |
| ESLint config | Both apps ignore `.next`, `node_modules`, `coverage`, `dist`, `out`, and generated `next-env.d.ts` so lint scans source code instead of generated build artifacts. |
| CI | Added `.github/workflows/frontend-quality.yml` with a matrix for `ecommerce-client` and `ecommerce-dashboard`: `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build`. |

Current `next.config.ts` quality-gate state:

| App | Current state | Reason retained |
| --- | --- | --- |
| `ecommerce-client` | Keeps `eslint.ignoreDuringBuilds = true` and `typescript.ignoreBuildErrors = true`. | `npm run typecheck` fails and `npm run lint` reports existing source errors. |
| `ecommerce-dashboard` | Keeps `eslint.ignoreDuringBuilds = true`. | `npm run lint` reports existing source errors. Typecheck passes. |

Top failing areas:

| App | Typecheck | Lint |
| --- | --- | --- |
| `ecommerce-client` | Fails in `app/(routes)/checkout/page.tsx` because `orderId` can be undefined, in `lib/analytics.ts` because analytics event payload typing excludes item arrays, and in `lib/seo-utils.ts` because `og:product` is not assignable to Next.js `OpenGraph` metadata types. | 50 errors and 40 warnings after generated-file ignores. Main errors are `no-explicit-any`, conditional hooks in `components/product-listing.tsx`, and `tailwind.config.js` `require()` import. |
| `ecommerce-dashboard` | Passes. | 148 errors and 63 warnings after generated-file ignores. Main errors are widespread `no-explicit-any`, `react-hooks/rules-of-hooks` in `hooks/use-account-lock.ts`, and service/list-config typing debt. |

Deferred:

| Item | Reason |
| --- | --- |
| Remove Next.js lint/type ignores | Blocked until the above typecheck/lint debt is fixed. |
| Bulk UI/type cleanup | Out of scope for Phase 5A; this pass only establishes the gate and records failures. |
| npm audit remediation | `npm ci` reports 3 vulnerabilities in each frontend app. No dependency changes were made in this task. |

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
| `dotnet build apps/backend/Ecommerce/Ecommerce.sln` after Phase 3A | PASS | 0 warnings, 0 errors on the post-change build run. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/Ecommerce.WebAPI.IntegrationTests.csproj --no-build --filter Phase3OwnershipTests` after Phase 3A | PASS | 6/6 ownership integration tests passed. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.sln --no-build` after Phase 3A | PASS | Domain 57/57, Application 191/191, WebAPI Integration 36/36, total 284/284. Integration tests took about 9m56s. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.Application.Tests/Ecommerce.Application.Tests.csproj --filter FullyQualifiedName~CreateReviewCommandHandlerTests` after Phase 3B | PASS | 4/4 review command tests passed. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.Application.Tests/Ecommerce.Application.Tests.csproj` after Phase 3B | PASS | 195/195 application tests passed. |
| `dotnet test apps/backend/Ecommerce/tests/Ecommerce.Domain.Tests/Ecommerce.Domain.Tests.csproj` after Phase 3B | PASS | 57/57 domain tests passed. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/Ecommerce.WebAPI.IntegrationTests.csproj --no-build` after Phase 3B | TIMEOUT | Timed out after 180s in this run; process was stopped. Previous Phase 3A integration suite passed 36/36. No new integration tests were added for Phase 3B. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.sln` after Phase 3B | TIMEOUT | Timed out after 240s because integration tests continued running. Application/domain tests were rerun separately and passed. |
| `dotnet build apps/backend/Ecommerce/Ecommerce.sln` after Phase 3B | PASS | 0 warnings, 0 errors. |
| `npm run lint` in `apps/frontend/ecommerce-client` after Phase 3B | FAIL | Fails on pre-existing lint debt, including `no-explicit-any` in unrelated files and hook rule errors in `components/product-listing.tsx`; changed review files only show existing warnings, not fatal errors. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.Application.Tests/Ecommerce.Application.Tests.csproj --filter FullyQualifiedName~CreateReturnRequestCommandHandlerTests` after Phase 3C | PASS | 5/5 return command tests passed. |
| `dotnet build apps/backend/Ecommerce/Ecommerce.sln` after Phase 3C | PASS | 28 warnings, 0 errors. Warnings are existing nullable/reference warnings outside the RMA changes. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.Application.Tests/Ecommerce.Application.Tests.csproj` after Phase 3C | PASS | 200/200 application tests passed. |
| `dotnet test apps/backend/Ecommerce/tests/Ecommerce.Domain.Tests/Ecommerce.Domain.Tests.csproj` after Phase 3C | PASS | 57/57 domain tests passed. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/Ecommerce.WebAPI.IntegrationTests.csproj --no-build --filter Phase3OwnershipTests` after Phase 3C | PASS | 6/6 ownership integration tests passed. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.sln --no-build` after Phase 3C | PASS | Domain 57/57, Application 200/200, WebAPI Integration 36/36, total 293/293. Integration tests took about 9m49s. |
| `dotnet build apps/backend/Ecommerce/Ecommerce.sln` after Phase 4A | PASS | 71 warnings, 0 errors. Warnings are existing nullable/reference warnings outside the marker-interface transaction change. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.Application.Tests/Ecommerce.Application.Tests.csproj --filter FullyQualifiedName~TransactionBehaviorTests --no-build` after Phase 4A | PASS | 5/5 transaction behavior tests passed. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.sln --no-build` after Phase 4A | PASS | Domain 57/57, Application 201/201, WebAPI Integration 36/36, total 294/294. Integration tests took about 10m08s. |
| `dotnet build apps/backend/Ecommerce/Ecommerce.sln` after Phase 4B | PASS | 69 warnings, 0 errors. Warnings are existing nullable/reference warnings outside the payment adapter move. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.Application.Tests/Ecommerce.Application.Tests.csproj --filter FullyQualifiedName~CreatePaymentForOrderCommandHandlerTests --no-build` after Phase 4B | PASS | 6/6 payment creation handler tests passed against `IPaymentGateway`. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/Ecommerce.WebAPI.IntegrationTests.csproj --filter PaymentCorrectnessTests --no-build` after Phase 4B | PASS | 9/9 payment integration tests passed, covering URL creation, IPN/return idempotency, invalid signature, amount mismatch, and failed response code. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.sln --no-build` after Phase 4B | PASS | Domain 57/57, Application 201/201, WebAPI Integration 36/36, total 294/294. Integration tests took about 9m59s. |
| `dotnet build apps/backend/Ecommerce/Ecommerce.sln` after Phase 4C | PASS | 0 warnings, 0 errors. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/Ecommerce.WebAPI.IntegrationTests.csproj --filter OutboxPatternTests --no-build` after Phase 4C | PASS | 3/3 outbox integration tests passed. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.sln --no-build` after Phase 4C | PASS | Domain 57/57, Application 201/201, WebAPI Integration 39/39, total 297/297. Integration tests took about 10m50s. |
| `dotnet build apps/backend/Ecommerce/Ecommerce.sln` after Phase 4D | PASS | 0 warnings, 0 errors. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.Application.Tests/Ecommerce.Application.Tests.csproj --filter FullyQualifiedName~AuthorizationMaintainabilityTests --no-build` after Phase 4D | PASS | 2/2 authorization maintainability tests passed. |
| `dotnet test apps/backend/Ecommerce/Ecommerce.sln --no-build` after Phase 4D | PASS | Domain 57/57, Application 203/203, WebAPI Integration 39/39, total 299/299. Integration tests took about 10m54s. |
| `npm ci` in `apps/frontend/ecommerce-client` after Phase 5A | PASS | Installed/audited 446 packages. npm reported 3 vulnerabilities: 1 moderate, 2 high. |
| `npm run typecheck` in `apps/frontend/ecommerce-client` after Phase 5A | FAIL | Fails on existing TypeScript issues in checkout payment model, analytics event payload typing, and SEO OpenGraph metadata typing. |
| `npm run lint` in `apps/frontend/ecommerce-client` after Phase 5A | FAIL | After excluding generated artifacts, ESLint reports 50 errors and 40 warnings across existing source files. |
| `npm run build` in `apps/frontend/ecommerce-client` after Phase 5A | PASS | Next build succeeds because existing config still skips type validation and linting. |
| `npm ci` in `apps/frontend/ecommerce-dashboard` after Phase 5A | PASS | Installed/audited 526 packages. npm reported 3 vulnerabilities: 1 moderate, 2 high. |
| `npm run typecheck` in `apps/frontend/ecommerce-dashboard` after Phase 5A | PASS | `tsc --noEmit` completed successfully. |
| `npm run lint` in `apps/frontend/ecommerce-dashboard` after Phase 5A | FAIL | After excluding generated artifacts, ESLint reports 148 errors and 63 warnings across existing source files. |
| `npm run build` in `apps/frontend/ecommerce-dashboard` after Phase 5A | PASS | Next build succeeds; existing config still skips linting. Type validation ran and passed. |

## Next recommended prompt

Continue Phase 5B: fix frontend quality-gate debt without changing UI behavior, starting with client typecheck failures in checkout payment, analytics event payload types, and SEO metadata, then reduce `no-explicit-any`/hook-rule lint errors so Next.js lint/type ignores can be removed.

# ShopViet Improvement Progress

## Summary

This document tracks incremental technical improvements for ShopViet E-Commerce without changing production behavior in the audit phase. The current pass records verified risks, maps them to phases, and creates a backlog suitable for implementation through small, reviewable changes.

## Phases

| Phase | Name | Goal | Status |
| --- | --- | --- | --- |
| Phase 0 | Critical security hardening | Lock down public mutations/admin endpoints, production Swagger/test endpoints, HTTPS, and obvious dev surfaces. | IN_PROGRESS |
| Phase 1 | Payment, promo, checkout correctness | Close payment confirmation flow, align promo usage timing, and make checkout side effects explicit. | IN_PROGRESS |
| Phase 2 | Stock va order lifecycle | Unify Product stock, SKU stock, inventory items, and order/return stock transitions. | TODO |
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
| P1-002 | Make VNPay callbacks/IPN idempotent and update orders through Application command boundary. | TODO | `PaymentsController.cs`, `VnPayService.cs` | TBD | IPN delegates to service; callback still lives in `VnPayService`. Do not pre-create `PaymentTransaction` until callback duplicate handling can process existing pending rows. |
| P1-003 | Move promo usage increment from apply/preview to redeem/order confirmation. | TODO | Promo handlers/repositories/cart | TBD | Current promo apply increments `TimesUsed` in multiple paths. |
| P2-001 | Define stock source of truth for non-variant Product stock, ProductVariantSku stock, and InventoryItem serials. | TODO | Product/order/inventory handlers | TBD | Order creation currently decrements `Products.StockQuantity` only. |
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
| Payment transaction | Create-url did not create pending transaction. | Still intentionally not creating pending transaction in Phase 1A. Current callback uses `INSERT ... ON CONFLICT DO NOTHING` and returns immediately on existing `TxnRef`, so pre-creating pending rows would block real callback processing. Tracked for P1-002. |

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

### Promo code apply/redeem timing

| Item checked | Finding |
| --- | --- |
| `PromoCodesController.ApplyPromoCode` | `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/PromoCodesController.cs:74` sends `ApplyPromoCodeCommand`. |
| `Features/PromoCodes/Commands/ApplyPromoCode` | Handler atomically increments `"TimesUsed" = "TimesUsed" + 1` before returning discount preview/result in `ApplyPromoCodeCommandHandler.cs:37-45`. |
| Cart promo paths | `CartRepository.ApplyPromoCodeAsync` increments `validationResult.PromoCode.TimesUsed++` and updates promo in `apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Repositories/CartRepository.cs:200`; `RefreshCartTotalsAsync` can also increment at `CartRepository.cs:227`. |
| Naming | Current entity uses `TimesUsed`, not `CurrentUsage`; older `Discount.CurrentUsageCount` also exists. The report risk maps to `TimesUsed` mutation timing. |

### Orders, reports, and stock

| Item checked | Finding |
| --- | --- |
| `OrdersController.GetMyOrderHistoryStats` | Controller computes grouped stats directly in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/OrdersController.cs:148`. |
| `OrdersController.GetOrderHistoryOverview` | Controller uses `PageSize = int.MaxValue` in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/OrdersController.cs:193` and computes report overview in the controller. |
| `ReportsController` | Existing reports generally dispatch MediatR queries, but the controller has no `[Authorize]`/report policy at class or action level in `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/ReportsController.cs`. |
| Stock source of truth | `CreateOrderCommandHandler` checks/decrements `Product.StockQuantity` with SQL in `apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs:57-77`; `ProductVariantSku.StockQuantity` and `InventoryItem` exist separately, and inventory import updates SKU stock in `ImportInventoryBatchCommandHandler.cs:59`. |

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
| Frontend scripts audit | DONE | Both frontend apps have `build` and `lint` scripts. No frontend build/lint was required or run for this task. |

## Next recommended prompt

Implement Phase 1B payment callback/IPN correctness: make VNPay callback idempotency process existing pending transactions safely, move callback order/payment updates behind an Application command boundary, and then enable pending `PaymentTransaction` creation during payment URL initiation.

# ShopViet Improvement Progress

## Summary

This document tracks incremental technical improvements for ShopViet E-Commerce without changing production behavior in the audit phase. The current pass records verified risks, maps them to phases, and creates a backlog suitable for implementation through small, reviewable changes.

## Phases

| Phase | Name | Goal | Status |
| --- | --- | --- | --- |
| Phase 0 | Critical security hardening | Lock down public mutations/admin endpoints, production Swagger/test endpoints, HTTPS, and obvious dev surfaces. | IN_PROGRESS |
| Phase 1 | Payment, promo, checkout correctness | Close payment confirmation flow, align promo usage timing, and make checkout side effects explicit. | TODO |
| Phase 2 | Stock va order lifecycle | Unify Product stock, SKU stock, inventory items, and order/return stock transitions. | TODO |
| Phase 3 | Ownership, privacy, review/return rules | Enforce ownership in user-scoped APIs and move privacy/rule checks into Application handlers. | TODO |
| Phase 4 | Architecture cleanup va outbox | Move web concerns out of Application, keep reporting/query logic out of controllers, and dispatch domain events after durable commit/outbox. | TODO |
| Phase 5 | Frontend quality gate va observability | Re-enable frontend type/lint gates and add operational visibility around checkout/payment/security flows. | TODO |

## Checklist

| Task id | Description | Status | Files touched | Tests added/updated | Notes |
| --- | --- | --- | --- | --- | --- |
| AUDIT-001 | Create improvement tracking document and record audit scope. | DONE | `docs/improvement-progress.md` | None | Documentation-only task. |
| P0-001 | Add explicit authorization/policies to public admin/content mutations. | DONE | `AboutController.cs`, `ContactController.cs`, `BannerController.cs`, `BrandsController.cs`, `CategoriesController.cs`, `PromoCodesController.cs`, `ProductsController.cs`, `ReportsController.cs` | `Phase0AuthorizationTests.cs` | Phase 0A secured high-risk content/catalog/promo/report mutations. |
| P0-002 | Gate Swagger/UI by environment or config. | TODO | `apps/backend/Ecommerce/Ecommerce.WebAPI/Program.cs` | TBD | Currently enabled for all environments. |
| P0-003 | Re-enable or explicitly configure HTTPS redirection/proxy behavior. | TODO | `apps/backend/Ecommerce/Ecommerce.WebAPI/Program.cs` | TBD | `UseHttpsRedirection()` is commented out. |
| P0-004 | Remove or protect test/dev controllers. | DONE | `DevelopmentOnlyAttribute.cs`, `TestStorageController.cs`, `WeatherForecastController.cs` | `Phase0AuthorizationTests.cs` | Test/dev controllers now return 404 outside Development. |
| P1-001 | Replace client-supplied payment amount/order data with server-derived order payment initiation. | TODO | `PaymentsController.cs`, `VnPayService.cs`, payment commands | TBD | Current create-url accepts amount and order id from request body. |
| P1-002 | Make VNPay callbacks/IPN idempotent and update orders through Application command boundary. | TODO | `PaymentsController.cs`, `VnPayService.cs` | TBD | IPN delegates to service; create-url and service use Web types in Application. |
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
| Frontend scripts audit | DONE | Both frontend apps have `build` and `lint` scripts. No frontend build/lint was required or run for this task. |

## Next recommended prompt

Implement Phase 0 security hardening only: add explicit authorization policies to public admin/content mutation endpoints, gate Swagger to Development/config, decide HTTPS redirection behavior behind proxy, and remove or protect test/dev controllers. Keep behavior-compatible tests and do not touch payment/promo/stock logic yet.

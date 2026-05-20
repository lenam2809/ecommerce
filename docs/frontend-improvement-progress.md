# Frontend Improvement Progress

## Prompt 1 - Audit

Status: Done

Ngay bat dau: 2026-05-19

## Pham vi cai tien

- `apps/frontend/ecommerce-client`
- `apps/frontend/ecommerce-dashboard`

Muc tieu cua dot audit dau tien la ghi nhan hien trang chat luong frontend theo bao cao phan tich, chua thay doi logic nghiep vu va chua xoa tinh nang.

## Danh sach hang muc can lam

| Hang muc | Trang thai |
| --- | --- |
| Fix lint/type errors | TODO |
| Bat lai kiem tra ESLint/TypeScript khi build | TODO |
| Chuan hoa React/@types React | TODO |
| Cai thien auth guard | TODO |
| Tach shared API/auth utilities neu phu hop | TODO |
| Don code thua | TODO |
| Review image/security config | TODO |

## Cau hinh hien trang

| App | Scripts hien co | Build gate dang tat |
| --- | --- | --- |
| `apps/frontend/ecommerce-client` | `npm run lint`, `npm run typecheck` | `next.config.ts` co `eslint.ignoreDuringBuilds: true` va `typescript.ignoreBuildErrors: true` |
| `apps/frontend/ecommerce-dashboard` | `npm run lint`, `npm run typecheck` | `next.config.ts` co `eslint.ignoreDuringBuilds: true`; khong thay `typescript.ignoreBuildErrors` |

Ghi chu React: `ecommerce-client` dung `react@^19.0.0` va `@types/react@^19`; `ecommerce-dashboard` dung `react@^18.3.1` nhung `@types/react@^19`, can chuan hoa trong cac buoc sau.

## Ket qua kiem tra ngay 2026-05-19

| App | Command | Ket qua | Tom tat |
| --- | --- | --- | --- |
| `apps/frontend/ecommerce-client` | `npm run lint` | Failed | 90 problems: 50 errors, 40 warnings |
| `apps/frontend/ecommerce-client` | `npm run typecheck` | Failed | TypeScript errors trong checkout payment, analytics event data, va SEO OpenGraph metadata |
| `apps/frontend/ecommerce-dashboard` | `npm run lint` | Failed | 207 problems: 144 errors, 63 warnings |
| `apps/frontend/ecommerce-dashboard` | `npm run typecheck` | Passed | `tsc --noEmit` hoan thanh thanh cong |

Tat ca command tren chay duoc trong moi truong hien tai; khong bi chan boi thieu dependency hay bien moi truong.

## File loi noi bat

### `apps/frontend/ecommerce-client`

Lint noi bat:

- `app/(auth)/forgot-password/page.tsx`: `no-explicit-any`.
- `components/account/address-form.tsx`, `components/account/address-item.tsx`, `components/account/order-item.tsx`: nhieu `no-explicit-any`.
- `components/product-listing.tsx`: loi `react-hooks/rules-of-hooks` do goi hook co dieu kien.
- `hooks/use-cart.ts`: nhieu `no-explicit-any`.
- `hubs/signalr-context.tsx`, `lib/analytics.ts`, `lib/api-error.ts`, `services/base-service.ts`, `services/wishlist-service.ts`: nhieu `no-explicit-any`.
- `tailwind.config.js`: `@typescript-eslint/no-require-imports`.
- Nhieu warning ve unused imports, dependency array cua hook, va `<img>` thay vi `next/image`.

Typecheck noi bat:

- `app/(routes)/checkout/page.tsx`: `orderId` co the `undefined` nhung `PaymentInformationModel.orderId` yeu cau `string`.
- `lib/analytics.ts`: kieu `EventData` khong chap nhan truong `items` dang array trong nhieu event ecommerce.
- `lib/seo-utils.ts`: OpenGraph metadata dung `type: "og:product"` khong phu hop voi kieu Next Metadata hien tai.

### `apps/frontend/ecommerce-dashboard`

Lint noi bat:

- `config/config-generator.tsx`: `no-explicit-any`.
- `hooks/use-about.ts`, `hooks/use-account-lock.ts`, `hooks/use-banners.ts`, `hooks/use-brands.ts`, `hooks/use-categories.ts`, `hooks/use-contact.ts`, `hooks/use-orders.ts`, `hooks/use-permissions.ts`, `hooks/use-products.ts`, `hooks/use-promo-codes.ts`, `hooks/use-users.ts`: nhieu `no-explicit-any`.
- `hooks/use-account-lock.ts`: function `useccountLockById` vi pham `react-hooks/rules-of-hooks`, co ve la sai ten custom hook.
- `lib/api-error.ts`, `lib/export-utils.ts`, `notifications/signalr-connection-manager.ts`, `services/*`, `types/list-config.ts`, `types/log.ts`, `types/order.ts`, `types/user-activity.ts`: nhieu `no-explicit-any`.
- Nhieu warning ve unused imports/variables, dependency array cua hook, va `<img>` thay vi `next/image`.

Typecheck:

- Khong ghi nhan loi trong lan chay `npm run typecheck`.

## Nhan dinh ban dau

- Lint debt cua ca hai app chu yeu den tu `any`, unused code, hook dependency/rules, va mot so cau hinh/asset warning.
- `ecommerce-client` co type debt dang chan viec bat lai TypeScript build gate.
- `ecommerce-dashboard` co mismatch React runtime va type packages: React 18 nhung `@types/react` 19.
- Image/security config can review tiep: client dang bat `dangerouslyAllowSVG: true` voi CSP rieng va cho phep nhieu remote pattern local/Supabase; dashboard cho phep remote localhost va Supabase.

## Nguyen tac cho cac buoc tiep theo

- Khong thay doi logic nghiep vu khi chi don lint/type.
- Uu tien sua loi rules-of-hooks va type errors co nguy co runtime truoc cac warning cosmetic.
- Bat lai build gate sau khi command `lint` va `typecheck` xanh o tung app.
- Neu tach shared API/auth utilities, can lam theo huong giam trung lap giua hai app ma khong thay doi contract hien co voi backend.

## Prompt 2 - Fix ecommerce-client lint

Status: Partial

Ngay thuc hien: 2026-05-19

Pham vi: chi sua `apps/frontend/ecommerce-client`; khong sua dashboard va khong bat lai strict build gate.

### File da sua

- `apps/frontend/ecommerce-client/app/(routes)/account/returns/[returnId]/page.tsx`
- `apps/frontend/ecommerce-client/app/(routes)/cart/page.tsx`
- `apps/frontend/ecommerce-client/app/(routes)/compare/page.tsx`
- `apps/frontend/ecommerce-client/app/(routes)/contact/page.tsx`
- `apps/frontend/ecommerce-client/app/(routes)/layout.tsx`
- `apps/frontend/ecommerce-client/app/(routes)/payment/vnpay-return/page.tsx`
- `apps/frontend/ecommerce-client/app/page.tsx`
- `apps/frontend/ecommerce-client/components/account/profile-tab.tsx`
- `apps/frontend/ecommerce-client/components/cart/OrderSummary.tsx`
- `apps/frontend/ecommerce-client/components/checkout/order-totals.tsx`
- `apps/frontend/ecommerce-client/components/checkout/payment-method.tsx`
- `apps/frontend/ecommerce-client/components/checkout/shipping-information.tsx`
- `apps/frontend/ecommerce-client/components/filter/product-comparison.tsx`
- `apps/frontend/ecommerce-client/components/header/index.tsx`
- `apps/frontend/ecommerce-client/components/header/search-input.tsx`
- `apps/frontend/ecommerce-client/components/product-filters/brand-filter.tsx`
- `apps/frontend/ecommerce-client/components/product-listing.tsx`
- `apps/frontend/ecommerce-client/components/product-reviews.tsx`
- `apps/frontend/ecommerce-client/components/products/product-tabs.tsx`
- `apps/frontend/ecommerce-client/components/ui/image-with-fallback.tsx`
- `apps/frontend/ecommerce-client/hooks/use-reviews.tsx`
- `apps/frontend/ecommerce-client/hooks/use-search-suggestions.ts`
- `apps/frontend/ecommerce-client/lib/api.ts`
- `apps/frontend/ecommerce-client/services/address-service.ts`
- `apps/frontend/ecommerce-client/services/order-service.ts`
- `apps/frontend/ecommerce-client/tailwind.config.js`

### Loi da het

- Da xoa cac unused imports/variables ro rang trong cac file tren, gom `AuthProvider` trong `app/(routes)/layout.tsx`.
- Da xu ly cac warning dependency hook an toan trong `app/(routes)/cart/page.tsx`, `components/checkout/shipping-information.tsx`, `components/header/search-input.tsx`, `components/product-listing.tsx`, va `components/product-reviews.tsx`.
- Da sua loi `react-hooks/rules-of-hooks` trong `components/product-listing.tsx` bang cach goi `useCategoryBySlug`/`useBrandBySlug` khong dieu kien voi slug rong khi khong co input.
- Da giam lint tu baseline `90 problems (50 errors, 40 warnings)` xuong `49 problems (47 errors, 2 warnings)`.

### Loi con lai

- `npm run lint` van fail do `@typescript-eslint/no-explicit-any` o nhieu file: `app/(auth)/forgot-password/page.tsx`, `components/account/*`, `components/cart/*`, `components/checkout/*`, `hooks/use-cart.ts`, `hubs/signalr-context.tsx`, `lib/analytics.ts`, `lib/api-error.ts`, `services/base-service.ts`, `services/wishlist-service.ts`, `types/auth.ts`.
- Con 2 warning `@next/next/no-img-element` trong return evidence/order item UI. Chua doi sang `next/image` trong prompt nay de tranh thay doi UI/behavior ngoai pham vi lint co hoc.
- Cac loi `no-explicit-any` con lai can dot rieng de thay type dung theo API/domain model, khong nen doi hang loat sang `unknown` neu chua soat contract.

### Command da chay

| Command | Ket qua | Ghi chu |
| --- | --- | --- |
| `cd apps/frontend/ecommerce-client && npm run lint` | Failed | Baseline truoc sua: `90 problems (50 errors, 40 warnings)` |
| `cd apps/frontend/ecommerce-client && npm run lint` | Failed | Sau sua: `49 problems (47 errors, 2 warnings)` |
| `cd apps/frontend/ecommerce-client && npm run typecheck` | Failed | Van fail o baseline type errors: checkout payment `orderId` co the undefined, `lib/analytics.ts` EventData khong chap nhan `items` array, `lib/seo-utils.ts` OpenGraph `og:product` khong hop type Next Metadata |

## Prompt 3 - Fix ecommerce-dashboard lint/type

Status: Partial

Ngay thuc hien: 2026-05-19

Pham vi: chi sua `apps/frontend/ecommerce-dashboard`; khong refactor kien truc, khong thay doi business logic va khong doi UI ngoai cac sua lint/type bat buoc.

### File da sua

- `apps/frontend/ecommerce-dashboard/app/(dashboard)/account-locks/[id]/page.tsx`
- `apps/frontend/ecommerce-dashboard/app/(dashboard)/returns/[returnId]/page.tsx`
- `apps/frontend/ecommerce-dashboard/components/auth/forgot-password-form.tsx`
- `apps/frontend/ecommerce-dashboard/components/date-picker.tsx`
- `apps/frontend/ecommerce-dashboard/components/date-range-picker.tsx`
- `apps/frontend/ecommerce-dashboard/components/date-time-picker.tsx`
- `apps/frontend/ecommerce-dashboard/components/inventory/inventory-table.tsx`
- `apps/frontend/ecommerce-dashboard/components/orders/form-sections/order-items.tsx`
- `apps/frontend/ecommerce-dashboard/components/returns/return-detail.tsx`
- `apps/frontend/ecommerce-dashboard/components/table/bulk-actions.tsx`
- `apps/frontend/ecommerce-dashboard/config/account-lock-list-config.tsx`
- `apps/frontend/ecommerce-dashboard/config/banner-list-config.tsx`
- `apps/frontend/ecommerce-dashboard/config/brand-list-config.tsx`
- `apps/frontend/ecommerce-dashboard/config/category-list-config.tsx`
- `apps/frontend/ecommerce-dashboard/config/config-generator.tsx`
- `apps/frontend/ecommerce-dashboard/config/permission-list-config.tsx`
- `apps/frontend/ecommerce-dashboard/config/promo-code-list-config.tsx`
- `apps/frontend/ecommerce-dashboard/config/user-activity-list-config.tsx`
- `apps/frontend/ecommerce-dashboard/config/user-list-config.tsx`
- `apps/frontend/ecommerce-dashboard/hooks/use-about.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-account-lock.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-account.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-banners.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-brands.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-breadcrumbs.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-categories.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-contact.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-marquees.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-notifications.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-orders.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-permissions.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-product-import.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-products.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-promo-codes.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-report.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-reviews.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-roles.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-signalr.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-toast.ts`
- `apps/frontend/ecommerce-dashboard/hooks/use-users.ts`
- `apps/frontend/ecommerce-dashboard/services/base-service.ts`
- `apps/frontend/ecommerce-dashboard/services/contact-service.ts`
- `apps/frontend/ecommerce-dashboard/services/notification-service.ts`
- `apps/frontend/ecommerce-dashboard/services/report-service.ts`

### Loi da het

- Da xoa nhieu unused imports/variables ro rang trong components, config, hooks va services.
- Da sua ten hook `useccountLockById` thanh `useAccountLockById` de het loi `react-hooks/rules-of-hooks`.
- Da bo cac `isPending` khong dung trong nhieu config action.
- Da sua mot so dependency warning an toan trong returns detail page, date picker components, order items va SignalR hook.
- Da chuyen cac `onError: (error: any)` ro rang sang `unknown` trong nhieu hooks ma khong doi contract xu ly loi.
- `npm run typecheck` hien pass.
- Lint giam tu baseline `207 problems (144 errors, 63 warnings)` xuong `85 problems (82 errors, 3 warnings)`.

### Loi con lai

- `npm run lint` van fail vi 82 loi `@typescript-eslint/no-explicit-any`, chu yeu trong `hooks/*`, `services/*`, `lib/api-error.ts`, `lib/export-utils.ts`, `notifications/signalr-connection-manager.ts`, va cac file `types/*`.
- Con 3 warning `@next/next/no-img-element` trong `components/products/product-reviews.tsx`, `components/returns/return-detail.tsx`, va `config/banner-list-config.tsx`.
- Cac loi `any` con lai can mot dot typing rieng theo API/domain model; khong nen thay hang loat bang `unknown` neu chua soat contract du lieu.

### Command da chay

| Command | Ket qua | Ghi chu |
| --- | --- | --- |
| `cd apps/frontend/ecommerce-dashboard && npm run lint` | Failed | Baseline truoc sua: `207 problems (144 errors, 63 warnings)` |
| `cd apps/frontend/ecommerce-dashboard && npm run typecheck` | Passed | Baseline typecheck pass |
| `cd apps/frontend/ecommerce-dashboard && npm run lint` | Failed | Sau sua: `85 problems (82 errors, 3 warnings)` |
| `cd apps/frontend/ecommerce-dashboard && npm run typecheck` | Passed | Sau sua: `tsc --noEmit` hoan thanh thanh cong |

## Prompt 4 - Enforce frontend build checks

Status: Partial

Ngay thuc hien: 2026-05-20

Pham vi: bat lai build gate mac dinh cho `apps/frontend/ecommerce-client` va `apps/frontend/ecommerce-dashboard`; khong dung `ignoreDuringBuilds`/`ignoreBuildErrors` de ne loi.

### Cau hinh da thay doi

- `apps/frontend/ecommerce-client/next.config.ts`: xoa `eslint.ignoreDuringBuilds: true`.
- `apps/frontend/ecommerce-client/next.config.ts`: xoa `typescript.ignoreBuildErrors: true`.
- `apps/frontend/ecommerce-dashboard/next.config.ts`: xoa `eslint.ignoreDuringBuilds: true`.

### Sua type nho trong client

- `apps/frontend/ecommerce-client/app/(routes)/checkout/page.tsx`: bao dam `orderId` co gia tri truoc khi tao VNPay URL va dung bien `orderId` da narrow type.
- `apps/frontend/ecommerce-client/lib/analytics.ts`: mo rong `EventData` de chap nhan `items` array cua ecommerce events.
- `apps/frontend/ecommerce-client/lib/seo-utils.ts`: dua OpenGraph product metadata ve type Next ho tro (`website`/`article`) thay vi `og:product` khong hop type.

### Ket qua command

| App | Command | Ket qua | Ghi chu |
| --- | --- | --- | --- |
| `apps/frontend/ecommerce-client` | `npm run lint` | Failed | `49 problems (47 errors, 2 warnings)` |
| `apps/frontend/ecommerce-client` | `npm run typecheck` | Passed | Chay rieng sau build de tranh race voi `.next/types`; `tsc --noEmit` hoan thanh thanh cong |
| `apps/frontend/ecommerce-client` | `npm run build` | Failed | Build compile thanh cong nhung fail o buoc lint/type gate do lint errors con lai |
| `apps/frontend/ecommerce-dashboard` | `npm run lint` | Failed | `85 problems (82 errors, 3 warnings)` |
| `apps/frontend/ecommerce-dashboard` | `npm run typecheck` | Passed | `tsc --noEmit` hoan thanh thanh cong |
| `apps/frontend/ecommerce-dashboard` | `npm run build` | Failed | Build compile thanh cong nhung fail o buoc lint/type gate do lint errors con lai |

### Blocker con lai

- `ecommerce-client`: build bi chan boi lint debt con lai, chu yeu `@typescript-eslint/no-explicit-any` trong account/cart/checkout hooks/services/libs va 2 warning `<img>`.
- `ecommerce-dashboard`: build bi chan boi lint debt con lai, chu yeu `@typescript-eslint/no-explicit-any` trong hooks/services/libs/types va 3 warning `<img>`.
- Khong bat lai ignore de che cac blocker nay; can prompt rieng de typed API/domain model va review image usage.

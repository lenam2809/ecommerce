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

## Prompt 5 - Normalize React versions

Status: Partial

Ngay thuc hien: 2026-05-20

### Phuong an da chon

- Giu `ecommerce-client` o React 19 vi package dang nhat quan: `react`/`react-dom` `^19.0.0` va `@types/react`/`@types/react-dom` `^19`.
- Giu `ecommerce-dashboard` o React 18 de giam rui ro runtime va dependency, chi dua React type packages ve nhom React 18 tuong thich.
- Khong nang dashboard len React 19 trong buoc nay vi app co nhieu dependency UI/table/chart/drag-drop dang chay voi React 18; nang runtime se co rui ro lon hon viec chuan hoa type.

### Package da thay doi

- `apps/frontend/ecommerce-dashboard/package.json`
  - `@types/react`: `^19` -> `^18.3.29`
  - `@types/react-dom`: `^19` -> `^18.3.7`
- `apps/frontend/ecommerce-dashboard/package-lock.json`
  - Lockfile da cap nhat theo `npm install --save-dev @types/react@^18.3.18 @types/react-dom@^18.3.5`.
  - Version thuc te sau install: `@types/react@18.3.29`, `@types/react-dom@18.3.7`.

### Ket qua command

| App | Command | Ket qua | Ghi chu |
| --- | --- | --- | --- |
| `apps/frontend/ecommerce-dashboard` | `npm install --save-dev @types/react@^18.3.18 @types/react-dom@^18.3.5` | Passed | Co npm peer warning trong qua trinh resolve tu type 19 ve type 18; ket qua `npm ls` xac nhan React/type da nhat quan |
| `apps/frontend/ecommerce-dashboard` | `npm ls react react-dom @types/react @types/react-dom --depth=0` | Passed | `react@18.3.1`, `react-dom@18.3.1`, `@types/react@18.3.29`, `@types/react-dom@18.3.7` |
| `apps/frontend/ecommerce-dashboard` | `npm run typecheck` | Passed | `tsc --noEmit` hoan thanh thanh cong |
| `apps/frontend/ecommerce-dashboard` | `npm run lint` | Failed | Van la blocker cu: `85 problems (82 errors, 3 warnings)` |
| `apps/frontend/ecommerce-dashboard` | `npm run build` | Failed | Compile thanh cong, fail o lint/type gate do lint errors con lai |
| `apps/frontend/ecommerce-client` | `npm run typecheck` | Passed | Khong doi package client |
| `apps/frontend/ecommerce-client` | `npm run lint` | Failed | Van la blocker cu: `49 problems (47 errors, 2 warnings)` |
| `apps/frontend/ecommerce-client` | `npm run build` | Failed | Compile thanh cong, fail o lint/type gate do lint errors con lai |

### Rui ro con lai

- Lint debt con lai van chan build production vi build gate da duoc bat lai o Prompt 4.
- `npm install` bao `5 vulnerabilities (3 moderate, 2 high)` trong dashboard; chua chay `npm audit fix` de tranh nang cap dependency hang loat ngoai pham vi.

## Prompt 6 - Dashboard auth guard

Status: Partial

Ngay thuc hien: 2026-05-20

### Route duoc bao ve

- `/dashboard`
- Cac route con nam trong `app/(dashboard)`, gom cac nhom URL: `/about`, `/account`, `/account-locks`, `/brands`, `/bulk-management`, `/categories`, `/configs`, `/contact`, `/help`, `/inventory`, `/logs`, `/notifications`, `/orders`, `/permissions`, `/products`, `/reports`, `/returns`, `/roles`, `/settings`, `/user-activities`, `/users`.
- Giu matcher `/admin` neu co route/alias cu can bao ve.
- Khong bao ve `/login` va `/forgot-password`; `/login` chi redirect ve `/dashboard` khi session hien tai hop le.

### Cach guard hoat dong

- `middleware.ts` chay truoc khi render cac route dashboard thuc te, forward cookie/authorization header den `/api/auth/me/profile`, va chi cho render khi backend xac nhan profile co `userId`.
- Khi chua dang nhap hoac session khong hop le, middleware redirect ve `/login?reason=unauthorized&returnUrl=<current-path>`.
- `returnUrl` giu ca query string cua route goc; login form chi chap nhan returnUrl noi bo bat dau bang `/` va khong bat dau bang `//` de tranh open redirect.
- `app/(dashboard)/layout.tsx` giu fallback server-side bang cookie `access_token` de tranh render layout dashboard neu middleware khong chay, nhung khong decode role/JWT va khong cap quyen frontend bang hardcode role.
- Backend van la nguon kiem tra quyen cuoi cung; frontend guard chi la lop UX/security boundary truoc render.

### File da sua

- `apps/frontend/ecommerce-dashboard/middleware.ts`
- `apps/frontend/ecommerce-dashboard/app/(dashboard)/layout.tsx`
- `apps/frontend/ecommerce-dashboard/components/auth/login-form.tsx`
- `apps/frontend/ecommerce-dashboard/hooks/use-auth.tsx`

### Test thu cong / command da chay

| Command | Ket qua | Ghi chu |
| --- | --- | --- |
| `cd apps/frontend/ecommerce-dashboard && npm run typecheck` | Passed | Chay rieng sau build de tranh race voi `.next/types`; `tsc --noEmit` hoan thanh thanh cong |
| `cd apps/frontend/ecommerce-dashboard && npm run lint` | Failed | Van la blocker cu: `85 problems (82 errors, 3 warnings)` |
| `cd apps/frontend/ecommerce-dashboard && npm run build` | Failed | Compile thanh cong, fail o lint/type gate do lint errors cu trong `lib/api-error.ts`, `lib/export-utils.ts` va warning image |

### Rui ro con lai

- Chua chay dev server/browser manual test trong prompt nay; can kiem tra thuc te cac case `/users -> /login?returnUrl=/users`, login thanh cong quay lai returnUrl, va truy cap `/login` khi da co session.
- Lint debt cu van chan build production.

## Prompt 7 - Client auth and checkout guard

Status: Partial

Ngay thuc hien: 2026-05-20

### Quyet dinh route guest/login

- `apps/frontend/ecommerce-client/app/(routes)/account/**`: bat buoc dang nhap. Cac trang profile, orders, order detail, returns, return detail, addresses va new address tiep tuc nam duoi `account/layout.tsx` va duoc bao bang `AuthGuard`.
- `apps/frontend/ecommerce-client/app/(routes)/checkout`: giu guest checkout theo hanh vi hien tai. Guest cart khong bi thay doi; user co the mua nhu khach hoac chon dang nhap de dung tai khoan.
- `/login`: route guest, nhung sau login se redirect ve `returnUrl` noi bo neu co.

### Cach guard hoat dong

- `components/auth-guard.tsx` la client guard ro rang cho account layout: hien spinner trong luc `useAuth` dang kiem tra session, redirect bang `router.replace('/login?returnUrl=...')` khi chua dang nhap, va giu ca query string cua route account hien tai.
- `app/(auth)/login/page.tsx` sanitize `returnUrl`/`redirect` de chi chap nhan URL noi bo bat dau bang `/` va khong bat dau bang `//`.
- `hooks/use-auth.tsx` khong con push mac dinh ve `/` sau login; page login chiu trach nhiem dieu huong den `returnUrl`.
- Checkout giu guest flow va doi nut dang nhap sang `/login?returnUrl=/checkout`; da bo timeout gia trong login submit de tranh logic cho 5 giay khong lam gi.

### File da sua

- `apps/frontend/ecommerce-client/components/auth-guard.tsx`
- `apps/frontend/ecommerce-client/hooks/use-auth.tsx`
- `apps/frontend/ecommerce-client/app/(auth)/login/page.tsx`
- `apps/frontend/ecommerce-client/app/(routes)/checkout/page.tsx`

### Command da chay

| Command | Ket qua | Ghi chu |
| --- | --- | --- |
| `cd apps/frontend/ecommerce-client && npm run typecheck` | Passed | Chay rieng sau build de tranh race voi `.next/types`; `tsc --noEmit` hoan thanh thanh cong |
| `cd apps/frontend/ecommerce-client && npm run lint` | Failed | Van la blocker cu: `49 problems (47 errors, 2 warnings)` |
| `cd apps/frontend/ecommerce-client && npm run build` | Failed | Compile thanh cong, fail o lint/type gate do lint errors cu |

### Rui ro con lai

- Chua chay browser manual test; can kiem tra `/account/orders?x=1` redirect ve login voi returnUrl dung, login xong quay lai account route, va `/checkout` van cho guest checkout.
- Lint debt cu van chan build production.

## Prompt 8 - Shared frontend utilities

Status: Done

Ngay thuc hien: 2026-05-20

### Ket qua so sanh

- `ecommerce-client/lib/api.ts` va `ecommerce-dashboard/lib/axios.ts` trung lap cac phan nen: axios base config `baseURL: '/api'`, `withCredentials: true`, CSRF cookie helper, refresh-token queue, broadcast `SESSION_REFRESH`, redirect login voi `returnUrl`.
- `ecommerce-client/lib/api.ts` co hanh vi rieng cho storefront: guest cart header `X-Guest-ID`, soft endpoints khong redirect guest (`wishlist`, `me/profile`, `products`, `cart`, `categories`, `banner`), retry limit refresh-token 3 lan/phut, va fallback data cho soft endpoint.
- `ecommerce-dashboard/lib/axios.ts` co hanh vi chat hon cho admin/dashboard: 401 refresh mot lan, refresh fail thi redirect login, khong co guest cart/soft endpoint.
- `session-sync.ts` gan nhu trung lap, chi khac comment/cleanup nho; event names chung la `LOGOUT`, `LOGIN`, `SESSION_REFRESH`.
- `logger.ts` trung y tuong sanitize sensitive fields, nhung API khac nho: client co `log`, dashboard co `info`.

### Quyet dinh

- Chua tach shared utility trong prompt nay.
- Ly do: root repo khong co `package.json`/workspace setup, hai app chi co `@/*` alias cuc bo tro ve tung app, nen them `packages/frontend-shared` hoac `apps/frontend/shared` se can cau hinh monorepo/build/tsconfig rieng va co rui ro cao hon pham vi prompt.
- Khong dung relative import xuyen app vi de vo Next build boundary, alias `@/`, va ownership cua tung app.
- Khong hop nhat axios refresh code luc nay vi client va dashboard co auth behavior khac nhau; hop nhat sai co the lam mat guest cart hoac lam dashboard cho guest di qua soft endpoints.

### Recommendation tiep theo

- Khi co workspace setup on dinh, tao package rieng, vi du `packages/frontend-shared`, export cac primitive khong phu thuoc app:
  - `AUTH_SESSION_EVENTS` / `SessionEventType`
  - `createSessionSync(channelName, options)`
  - `getCsrfToken(cookieName = 'csrf_token')`
  - `createRefreshQueue()`
  - `createLogger({ exposeInfoAlias?: boolean })`
- Giu phan policy rieng trong tung app:
  - client: guest cart, soft endpoints, retry limit
  - dashboard: dashboard/admin redirect policy va stricter auth failure

### File da sua

- `docs/frontend-improvement-progress.md`

Khong sua source code cua hai app trong prompt nay de tranh thay doi hanh vi auth hien co.

### Command da chay

| Command | Ket qua | Ghi chu |
| --- | --- | --- |
| `cd apps/frontend/ecommerce-client && npm run typecheck` | Passed | `tsc --noEmit` hoan thanh thanh cong |
| `cd apps/frontend/ecommerce-client && npm run lint` | Failed | Van la blocker cu: `49 problems (47 errors, 2 warnings)` |
| `cd apps/frontend/ecommerce-dashboard && npm run typecheck` | Passed | `tsc --noEmit` hoan thanh thanh cong |
| `cd apps/frontend/ecommerce-dashboard && npm run lint` | Failed | Van la blocker cu: `85 problems (82 errors, 3 warnings)` |

### Rui ro con lai

- Trung lap code API/session/logger van con ton tai.
- Can workspace/shared package setup truoc khi tach utility de tranh import khong on dinh va khong pha behavior auth/guest checkout.

## Prompt 9 - Image and frontend security config

Status: Partial

Ngay thuc hien: 2026-05-20

### Cau hinh da doi

- `apps/frontend/ecommerce-client/next.config.ts`
  - Tach `images.remotePatterns` thanh `sharedRemotePatterns` va `developmentRemotePatterns`.
  - `localhost`, `localhost:3000`, `localhost:5000/uploads/**`, `localhost:6262/uploads/**` chi duoc them khi `NODE_ENV !== "production"`.
  - Giu `images.unsplash.com` va Supabase Storage `*.supabase.co/storage/v1/object/public/**`.
  - Them allowlist production qua bien moi truong `NEXT_PUBLIC_IMAGE_REMOTE_URLS` (comma-separated URL prefixes), de trien khai domain that ma khong hardcode domain gia.
  - Tat `dangerouslyAllowSVG`; bo CSP rieng cho remote SVG vi chua thay nhu cau remote SVG bat buoc. SVG local trong `public` khong bi anh huong.
- `apps/frontend/ecommerce-dashboard/next.config.ts`
  - Tach `images.remotePatterns` thanh `sharedRemotePatterns` va `developmentRemotePatterns`.
  - `localhost` chi duoc them khi `NODE_ENV !== "production"`.
  - Giu Supabase Storage `*.supabase.co/storage/v1/object/public/**`.
  - Them allowlist production qua `NEXT_PUBLIC_IMAGE_REMOTE_URLS`.

### Ly do

- Localhost va cac port dev (`3000`, `5000`, `6262`) khong nen nam trong production remote image allowlist.
- Upload path hien tai van duoc rewrite qua `/uploads/:path*` den backend, nen anh upload same-origin khong can remote host production neu UI dung `/uploads/...`.
- Neu backend tra absolute production image URLs, can khai bao domain that qua `NEXT_PUBLIC_IMAGE_REMOTE_URLS`, vi prompt yeu cau khong hardcode production domain gia.
- Remote SVG khong duoc mo mac dinh de giam rui ro scriptable SVG; chi nen bat lai neu co use case remote SVG ro rang va CSP chat.

### Checklist kiem thu anh

- Development: anh tu `http://localhost`, `http://localhost:5000/uploads/**`, `http://localhost:6262/uploads/**` van render.
- Production/staging: set `NEXT_PUBLIC_IMAGE_REMOTE_URLS` voi domain upload/CDN that, vi du URL prefix cua backend/CDN that, roi verify product/category/brand/banner/user avatar images.
- Supabase: verify anh `https://*.supabase.co/storage/v1/object/public/**` van render.
- Unsplash client: verify homepage/marketing images tu `images.unsplash.com` van render neu con duoc dung.
- SVG: verify local `/placeholder.svg` van render; neu co remote SVG bi chan thi can danh gia lai nhu cau va CSP truoc khi bat `dangerouslyAllowSVG`.

### Command da chay

| App | Command | Ket qua | Ghi chu |
| --- | --- | --- | --- |
| `apps/frontend/ecommerce-client` | `npm run typecheck` | Passed | `tsc --noEmit` hoan thanh thanh cong |
| `apps/frontend/ecommerce-client` | `npm run lint` | Failed | Van la blocker cu: `49 problems (47 errors, 2 warnings)` |
| `apps/frontend/ecommerce-client` | `npm run build` | Failed | Compile thanh cong, fail o lint/type gate do lint errors cu |
| `apps/frontend/ecommerce-dashboard` | `npm run typecheck` | Passed | `tsc --noEmit` hoan thanh thanh cong |
| `apps/frontend/ecommerce-dashboard` | `npm run lint` | Failed | Van la blocker cu: `85 problems (82 errors, 3 warnings)` |
| `apps/frontend/ecommerce-dashboard` | `npm run build` | Failed | Compile thanh cong, fail o lint/type gate do lint errors cu |

### Rui ro con lai

- Chua co production image domain that trong repo; can cau hinh `NEXT_PUBLIC_IMAGE_REMOTE_URLS` tren moi truong deploy neu API/CDN tra absolute URLs.
- Chua test browser thuc te; can verify cac man hinh product, category, brand, banner, avatar va upload preview.
- Lint debt cu van chan build production.

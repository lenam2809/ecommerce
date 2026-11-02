> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 28/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/reports/KIEM_KE_HIEN_TRANG.md`](../reports/KIEM_KE_HIEN_TRANG.md) và [`AGENTS.md`](../../AGENTS.md).

# BÁO CÁO ĐẠI KIỂM THỬ ĐỢT 1 (QA-1): BIÊN DỊCH 3 HỆ THỐNG, BẢO MẬT BUNDLE, PHÂN QUYỀN RBAC & SSoT 2026 (AUDIT & REVISED)

**Ngày thực hiện:** 28/10/2026  
**Vai trò:** Principal QA & Security Auditor (Chuyên sâu & Thẩm tra độc lập)  
**Phạm vi:** 
- Backend .NET 8 (`apps/backend/Ecommerce`)
- Admin Dashboard Next.js 15 (`apps/frontend/ecommerce-dashboard` - Port 3001)
- Storefront Client Next.js 15 (`apps/frontend/ecommerce-client` - Port 3000)

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM ĐỊNH (SYSTEM SCORECARD)

| Phân mục kiểm tra | Tiêu chuẩn đánh giá | Kết quả thực tế | Trạng thái | Ghi chú & Điểm cần lưu ý |
|---|---|---|:---:|---|
| **1.1. Backend Build** | `dotnet build --configuration Release` (0 Errors, 0 Warnings) | 0 Errors, 84 Warnings (6 cảnh báo bảo mật NuGet NU1902/NU1903 + 78 CS86xx) | ⚠️ **WARNING** | Không có lỗi biên dịch. Phát hiện 6 cảnh báo lỗ hổng bảo mật mức High/Moderate trong thư viện `SixLabors.ImageSharp 3.1.12`. |
| **1.2. EF Core Migrations** | Khớp hoàn toàn với DbContext (`has-pending-model-changes`) | Khớp 100% ("No changes have been made to the model") | 🟢 **PASS** | Đã bao gồm các migration: `InitialCreate`, `RefactorCartItemSurrogateKey`, `AddTechEcommerceSchema2026`, `AddTechEcommerceSpecsAndShowrooms2026`. |
| **1.3. Dashboard TypeCheck** | `npx tsc --noEmit` | 0 Errors | 🟢 **PASS** | Exit code 0, không có lỗi TypeScript. |
| **1.4. Dashboard Lint** | `npm run lint` (0 Errors, 0 Warnings) | 0 Errors, 110 Warnings | ⚠️ **WARNING** | 0 error. 110 warnings: unused-vars, explicit-any, exhaustive-deps, unoptimized `<img>`. |
| **1.5. Dashboard Build** | `npm run build` | 0 Errors, Thành công 49/49 pages | 🟢 **PASS** | 49 pages tĩnh/động xuất bản thành công vào `.next/`. |
| **1.6. Storefront TypeCheck** | `npx tsc --noEmit` | 0 Errors | 🟢 **PASS** | Exit code 0, lỗi `TS2339 driverName/driverPhone` đã được vá triệt để. |
| **1.7. Storefront Build** | `npm run build` (0 Errors, 0 Warnings) | 0 Errors, 0 Warnings, 22/22 (28/28) pages | 🟢 **PASS** | Next.js 15.5.15 build sạch hoàn toàn, không có cảnh báo nào. |
| **2.1. Gemini API Key Leak & Route Security** | Quét `.next/static` và client bundle + kiểm tra Endpoint Route Handler | 0 chuỗi rò rỉ trong static bundle. **TUY NHIÊN**: Server route `/api/ai/generate-specs` chưa có authentication guard | ⚠️ **SECURITY WARN** | API key an toàn trên server, nhưng Route Handler không kiểm tra session/auth và nằm ngoài middleware matcher -> Nguy cơ cạn kiệt Quota / DoS. |
| **2.2. Dashboard RBAC** | Middleware, Permission Types & Sidebar Menu | Middleware chặn khách/Customer. Sidebar Menu thiếu thuộc tính `permissions` tại nhiều mục | ⚠️ **FAIL/WARN** | `app-sidebar.tsx` thiếu gán `permissions` cho `/inventory`, `/returns`, `/configs/product-addons`, `/configs/flash-sales` và toàn bộ nhóm `/configs/*`, `/bulk-management`. |
| **2.3. Backend RBAC** | `[Authorize]` trên các Controller mới | Customer/Anonymous bị chặn 401/403 trên endpoint quản trị. **Phát hiện lỗi logic tại `GetReturnRequestByIdQueryHandler`** | ⚠️ **WARN** | `GetReturnRequestByIdQueryHandler.cs` chỉ kiểm tra `Admin` và `Manager`, chặn nhầm role `Staff` (có quyền `ViewReturns`) nhận mã 403 Forbidden khi xem chi tiết RMA. |
| **2.4. Cấm mã Hex cứng** | Quét regex `\[#[0-9a-fA-F]{3,8}\]` trong `.tsx` Tailwind | 0 vi phạm | 🟢 **PASS** | Toàn bộ Tailwind styling sử dụng semantic tokens (`bg-brand`, `bg-tech-blue`, `border-line`, `bg-card`). |
| **2.5. Định dạng Tiền tệ** | `font-mono tabular-nums whitespace-nowrap` hoặc `.price-tag` | Hầu hết đạt chuẩn; phát hiện 5 vị trí thiếu class | ⚠️ **WARN** | 5 vị trí hiển thị giá thiếu `whitespace-nowrap` hoặc `font-mono` chi tiết bên dưới. |
| **2.6. Dữ liệu chuẩn SSoT** | 45 Showrooms, Hotline 1800 6868 / 1800 6869, Freeship 500k | Đồng bộ 100% trên cả 3 tầng hệ thống | 🟢 **PASS** | Backend seed, Client Header/Cart/Checkout, Dashboard đều tuân thủ chính xác. |

---

## 2. CHI TIẾT TỪNG NỘI DUNG KIỂM ĐỊNH & THẨM TRA ĐỘC LẬP

### 2.1. Kiểm định Biên dịch & Kiểu dữ liệu

#### A. Backend .NET 8 (`apps/backend/Ecommerce`)
- **Lệnh thực thi:** `dotnet build --configuration Release`
- **Kết quả thực tế:** `0 Error(s)`, `84 Warning(s)`. Thời gian build: ~58s.
- **Phát hiện và đính chính so với báo cáo sơ bộ:**
  - Báo cáo sơ bộ chỉ ghi nhận 67 cảnh báo CS86xx Nullable Types.
  - **Thực tế:** Có **84 cảnh báo**, trong đó có **6 cảnh báo lỗ hổng bảo mật NuGet Package (NU1902, NU1903)** trên thư viện `SixLabors.ImageSharp 3.1.12`:
    - `GHSA-gwg2-r3hj-4w44` (Moderate)
    - `GHSA-j3p4-wp97-rph4` (High Severity)
    - `GHSA-j9gm-c75j-xc9q` (High Severity)
    - `GHSA-jjfr-hcj7-qf5w` (High Severity)
    - `GHSA-v76p-62qx-wwq2` (High Severity)
    - `GHSA-wmxv-xphr-5c9g` (Moderate)
  - 78 cảnh báo còn lại là Nullable Reference Types (`CS8600`, `CS8601`, `CS8602`, `CS8603`, `CS8604`, `CS8618`, `CS8625`) tại các service cũ/mới trong tầng Application/Infrastructure.
- **EF Core Migrations:** 
  - Lệnh: `dotnet ef migrations has-pending-model-changes --project Ecommerce.Infrastructure --startup-project Ecommerce.WebAPI`
  - Kết quả: `"No changes have been made to the model since the last migration."` (Khớp 100% giữa Entity Model Snapshot và Migration scripts).

#### B. Admin Dashboard (`apps/frontend/ecommerce-dashboard`)
- **`npx tsc --noEmit`:** 0 Errors. Không có lỗi kiểu dữ liệu TypeScript.
- **`npm run lint`:** 0 Errors, 110 Warnings (ESLint).
  - Cảnh báo tập trung vào:
    - `@typescript-eslint/no-unused-vars`: Biến khai báo nhưng chưa dùng (ví dụ: `ProductAddOnType` trong `configs/product-addons/page.tsx:5`, `isPro` trong `api/ai/generate-specs/route.ts:82`, `hasActiveWarranty` trong `order-serial-manager.tsx:116`).
    - `@typescript-eslint/no-explicit-any`: Ép kiểu `any` ở các service và form component.
    - `react-hooks/exhaustive-deps`: Dependency object trong `useMemo` ở `showrooms/page.tsx:82`, `specifications.tsx:85`.
    - `@next/next/no-img-element`: Dùng thẻ `<img>` thay vì `next/image` ở `flash-sale-form.tsx:334`, `return-detail.tsx:699`.
- **`npm run build`:** Thành công 100%. Next.js biên dịch hoàn tất 49 dynamic/static routes, tạo bundle đầy đủ không lỗi.

#### C. Storefront Client (`apps/frontend/ecommerce-client`)
- **`npx tsc --noEmit`:** 0 Errors.
- **Xác nhận lỗi `TS2339 driverName/driverPhone`:**
  - File: `apps/frontend/ecommerce-client/types/order.ts` (Dòng 71-72):
    ```typescript
    driverName?: string;
    driverPhone?: string;
    ```
  - File sử dụng: `apps/frontend/ecommerce-client/components/account/order-details.tsx` (Dòng 217). Kiểu dữ liệu khớp hoàn toàn, không có lỗi biên dịch.
- **`npm run build`:** Thành công 100% với **0 Errors và 0 Warnings**. Biên dịch thành công toàn bộ 22 route App Router (28 static/dynamic pages).

---

## 3. KIỂM ĐỊNH BẢO MẬT & PHÂN QUYỀN (SECURITY & RBAC AUDIT)

### 3.1. Quét Rò Rỉ `GEMINI_API_KEY` & Đánh Giá Route Handler
- **Kết quả quét `.next/static`:**
  - Tìm kiếm chuỗi `GEMINI_API_KEY` và `GOOGLE_API_KEY`: **0 kết quả** trong thư mục `.next/static`. Không có leak API key ra client bundle.
- **Kiến trúc Server Route Handler:**
  - `GEMINI_API_KEY` chỉ được đọc trên môi trường Node.js Server tại:  
    `apps/frontend/ecommerce-dashboard/app/api/ai/generate-specs/route.ts` (Dòng 190):  
    `const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;`
- **LỖ HỔNG BẢO MẬT PHÁT HIỆN TẠI ROUTE HANDLER (API Quota Draining):**
  - Trong `apps/frontend/ecommerce-dashboard/middleware.ts`, matcher và `PROTECTED_PATH_PREFIXES` **hoàn toàn loại trừ `/api/*`**.
  - Route handler `app/api/ai/generate-specs/route.ts` (POST) **không thực hiện bất kỳ bước xác thực nào** (không kiểm tra cookie token, session hay role `Admin/Manager/Staff`).
  - **Hệ quả:** Bất kỳ ai trên internet đều có thể gửi POST request ẩn danh vào `/api/ai/generate-specs`, kích hoạt gọi thẳng lên Google Gemini API `gemini-2.5-flash:generateContent`, dẫn đến rủi ro cạn kiệt hạn ngạch (quota exhaustion) và chi phí API không kiểm soát.

### 3.2. Middleware & Phân quyền RBAC (Frontend Dashboard)
- **Kiểm tra `middleware.ts`:**
  - Tất cả route prefixes: `/about`, `/account`, `/brands`, `/bulk-management`, `/categories`, `/configs`, `/contact`, `/dashboard`, `/inventory`, `/orders`, `/products`, `/reports`, `/returns`, `/roles`, `/showrooms`, `/users` đều nằm trong danh sách `PROTECTED_PATH_PREFIXES` và được bảo vệ bởi hàm `isRoleAllowedForDashboard(profile)`.
  - Chỉ các role `['Admin', 'Manager', 'Staff']` mới được phép truy cập vào ứng dụng Dashboard.
- **LỖ HỔNG MENU SIDEBAR (`components/app-sidebar.tsx`):**
  - Trong `components/nav-main.tsx` và `types/permission.ts`: Nếu một menu item không có thuộc tính `permissions`, hàm `hasPermission` mặc định trả về `true`.
  - **4 phân hệ mới bị hở:**
    1. `Kho hàng (IMEI)` (`/inventory` - Dòng 113): **Thiếu** `permissions: [...PermissionGroups.InventoryManagement]`.
    2. `Đổi/Trả hàng` (`/returns` - Dòng 132): **Thiếu** `permissions: [...PermissionGroups.ReturnManagement]`.
    3. `Gói bảo hành & Mua kèm` (`/configs/product-addons` - Dòng 207): **Thiếu** `permissions: [...PermissionGroups.ProductManagement]`.
    4. `Chiến dịch Flash Sale` (`/configs/flash-sales` - Dòng 212): **Thiếu** `permissions: [...PermissionGroups.PromotionManagement]`.
  - **Các mục menu hệ thống khác cũng chưa gán permissions:**
    - `/configs/banners`, `/configs/marquee`, `/configs/logo`, `/configs/promo-codes`
    - `/bulk-management/products`, `/logs`, `/notifications`, `/about`, `/contact`

### 3.3. Phân Quyền Backend .NET 8 (`[Authorize]` Attributes) & Logic Query Handler
- **`ShowroomsController.cs`:**
  - Read-only (`GetAll`, `CheckStock`): Public cho khách tra cứu tồn kho O2O.
  - Quản trị (`GetAdminShowrooms`, `GetInventory`): `[Authorize(Policy = EPermissions.ViewShowrooms)]`.
  - CRUD Showroom: `[Authorize(Policy = EPermissions.ManageShowrooms)]`.
  - Tồn kho & Điều chuyển: `[Authorize(Policy = EPermissions.ManageInventory)]`.
- **`InventoryController.cs`:**
  - Guard toàn bộ class: `[Authorize(Roles = EUserRoles.Admin)]`.
- **`OrdersController.cs`:**
  - `AssignItemSerial`, `RemoveSerial`, `ActivateWarranty`, `UploadInvoicePdf`, `UpdateDepositStatus` đều guard bởi `[Authorize(Policy = EPermissions.EditOrder)]`. Customer không thể gọi (bị 403 Forbidden).
- **`ProductAddOnsController.cs` & `PromotionsController.cs`:**
  - CRUD Add-ons: `[Authorize(Policy = EPermissions.CreateProduct/EditProduct/DeleteProduct)]`.
  - CRUD Flash Sales: `[Authorize(Policy = EPermissions.EditPromotion)]`.
- **LỖ HỔNG LOGIC PHÁT HIỆN TẠI `GetReturnRequestByIdQueryHandler.cs` (Dòng 40-45):**
  ```csharp
  var canViewAll = _currentUserService.IsInRole(EUserRoles.Admin)
                   || _currentUserService.IsInRole(EUserRoles.Manager);
  if (!canViewAll && entity.CustomerId != currentUserId.Value)
  {
      return Result<ReturnRequestDto>.Forbidden("Bạn không có quyền xem yêu cầu đổi/trả này.");
  }
  ```
  - Trong `EPermissions.cs`, role `Staff` được gán nhóm quyền `ReturnManagement` (`ViewReturns`, `ManageReturns`).
  - Khi Staff truy cập vào Dashboard để xem chi tiết đơn đổi/trả (`GET /api/returns/{id}`), do `GetReturnRequestByIdQueryHandler` chỉ kiểm tra `Admin` và `Manager`, Staff sẽ bị chặn với mã **403 Forbidden** mặc dù họ có quyền quản lý RMA!
  - **Khắc phục:** Cần bổ sung `_currentUserService.IsInRole(EUserRoles.Staff)` hoặc `_currentUserService.HasPermission(EPermissions.ViewReturns)` vào điều kiện `canViewAll`.

---

## 4. KIỂM ĐỊNH QUY CHUẨN SSoT 2026

### 4.1. Cấm Mã Hex Cứng Trong Tailwind Classes
- **Biểu thức quét regex:** `\[#[0-9a-fA-F]{3,8}\]` trong tất cả file `.tsx` của `apps/frontend`.
- **Kết quả:** **0 vi phạm**.
- Toàn bộ Tailwind styling sử dụng semantic tokens (`bg-brand`, `bg-tech-blue`, `border-line`, `bg-card`).

### 4.2. Định Dạng Tiền Tệ (`font-mono tabular-nums whitespace-nowrap` hoặc `.price-tag`)
Phát hiện **5 vị trí** chưa bao bọc đầy đủ class chuẩn chống rớt chữ "₫":
1. [`apps/frontend/ecommerce-dashboard/components/returns/return-list.tsx:78`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-dashboard/components/returns/return-list.tsx#L78):
   `<TableCell className="text-right font-medium">{formatCurrency(item.refundAmount)}</TableCell>`  
   *(Thiếu `font-mono tabular-nums whitespace-nowrap price-tag`).*
2. [`apps/frontend/ecommerce-client/components/account/order-details.tsx:278`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/account/order-details.tsx#L278):
   `<span className="text-tech-blue font-semibold">• Kèm: {item.addOnName} (+{formatPrice(item.addOnPrice || 0)})</span>`  
   *(Cần bọc giá vào thẻ có class `price-tag font-mono tabular-nums whitespace-nowrap`).*
3. [`apps/frontend/ecommerce-dashboard/components/orders/order-serial-manager.tsx:199`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-dashboard/components/orders/order-serial-manager.tsx#L199):
   `{item.addOnName} (+{formatVnd(item.addOnPrice || 0)})` nằm trong Badge  
   *(Cần bọc phần giá vào thẻ có class `price-tag font-mono tabular-nums whitespace-nowrap`).*
4. [`apps/frontend/ecommerce-client/components/checkout/payment-method.tsx:212,216`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/checkout/payment-method.tsx#L212):
   `<strong className="font-extrabold tabular-nums whitespace-nowrap">{formatPrice(depositAmount)}</strong>`  
   *(Có `tabular-nums whitespace-nowrap` nhưng thiếu `font-mono`).*
5. [`apps/frontend/ecommerce-client/components/products/product-price.tsx:59`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/products/product-price.tsx#L59):
   `<span>Đã bao gồm gói bảo hành mở rộng AppleCare+ (+{formatPrice(appleCarePlusPrice)})</span>`  
   *(Cụm văn bản dài trong badge có thể xuống dòng trên màn hình hẹp, cần bọc phần `+{formatPrice(...)}` vào `<span className="font-mono tabular-nums whitespace-nowrap">`).*

### 4.3. Dữ Liệu Chuẩn SSoT 2026
- **Mạng lưới 45 Showroom:** Đồng bộ 100% trong Backend seed data, trang `/about`, `/contact`, `/showrooms`, `/checkout`.
- **Cặp Hotline:** Bán hàng/CSKH `1800 6868` và Kỹ thuật/Bảo hành `1800 6869` thống nhất trên Announcement bar, Header, Footer, OrderDetails, ReturnDetails.
- **Mốc Freeship:** Thống nhất ngưỡng `500.000₫` (`FREE_SHIPPING_THRESHOLD = 500000`) trên CartHeader, OrderTotals và Announcement bar.

---

## 5. DANH MỤC KHUYẾN NGHỊ KHẮC PHỤC DÀNH CHO ORCHESTRATOR / FIXER

1. **Khắc phục Bảo mật Package NuGet (P0 - Security):**
   - Nâng cấp gói `SixLabors.ImageSharp` từ phiên bản `3.1.12` lên `3.1.13+` trong `Ecommerce.Infrastructure.csproj` để loại bỏ 4 lỗ hổng High severity và 2 Moderate severity (NU1902, NU1903).
2. **Khắc phục Bảo mật API Route Handler (P1 - Security):**
   - Bổ sung xác thực kiểm tra Cookie Auth / Session trong `apps/frontend/ecommerce-dashboard/app/api/ai/generate-specs/route.ts` để chặn người dùng vãng lai lạm dụng gọi AI Gemini tiêu hao quota.
3. **Khắc phục Logic Quyền Xem RMA của Staff (P1 - RBAC):**
   - Trong `Ecommerce.Application/Features/Returns/Queries/GetReturnRequestById/GetReturnRequestByIdQueryHandler.cs`, cập nhật điều kiện `canViewAll` cho phép cả role `Staff` (hoặc kiểm tra claim `ViewReturns`).
4. **Khắc phục RBAC Sidebar Menu Dashboard (P1 - RBAC):**
   - Cập nhật `apps/frontend/ecommerce-dashboard/components/app-sidebar.tsx`: gán thuộc tính `permissions` cho `/inventory`, `/returns`, `/configs/product-addons`, `/configs/flash-sales`.
5. **Chuẩn hóa 5 vị trí hiển thị tiền tệ (P2 - SSoT 2026):**
   - Bổ sung `font-mono tabular-nums whitespace-nowrap` tại `return-list.tsx:78`, `order-details.tsx:278`, `order-serial-manager.tsx:199`, `payment-method.tsx:212,216`, `product-price.tsx:59`.

---
*Báo cáo kiểm định độc lập được thực hiện bởi Principal QA & Security Auditor.*

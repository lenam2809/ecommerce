## Kế hoạch refactor UI/UX theo vertical slice

Tài liệu này liệt kê các **vertical slice** chính của E‑Commerce Dashboard, mức độ ảnh hưởng business, đánh giá UI/UX hiện tại và mục tiêu refactor theo Style Guide (`docs/ui-style-guide.md`).

---

## 1. Danh sách vertical slice & ưu tiên

| Ưu tiên | Vertical                | Mức độ ảnh hưởng business | Mô tả ngắn                                                |
|--------:|-------------------------|---------------------------|-----------------------------------------------------------|
| 1       | Products                | Cao                       | Quản lý sản phẩm, thông tin, giá, tồn kho, hình ảnh      |
| 2       | Orders                  | Cao                       | Danh sách & chi tiết đơn hàng, trạng thái xử lý          |
| 3       | Promotions / PromoCodes | Cao                       | Quản lý mã khuyến mãi, ảnh hưởng giá bán & chiến dịch    |
| 4       | Reports & Analytics     | Trung bình                | Báo cáo, phân tích doanh thu, top sản phẩm, khách hàng   |
| 5       | Customers / Users       | Trung bình                | Quản lý tài khoản khách/admin, lịch sử đơn, phân quyền   |
| 6       | Notifications           | Trung bình                | Quản lý & gửi thông báo hệ thống / người dùng            |
| 7       | Account & Profile       | Trung bình – Thấp         | Trang tài khoản admin, bảo mật, activity, privacy        |
| 8       | Settings & Configuration| Thấp                      | Cài đặt hệ thống, cấu hình chung                         |
| 9       | Catalog metadata        | Thấp                      | Brands, Categories, Banners, About, Contact              |
| 10      | Permissions & Roles     | Thấp                      | Phân quyền chi tiết, role/permission matrices            |
| 11      | Logs & User Activities  | Thấp                      | Nhật ký hệ thống, hoạt động người dùng                   |
| 12      | Auth (Login)            | Thấp                      | Màn đăng nhập vào dashboard                              |
| 13      | Dashboard Overview      | Thấp                      | Màn tổng quan, KPI, chart cho admin                      |

Chi tiết từng vertical ở các mục bên dưới.

---

## 2. Products

- **Tên vertical**: Products
- **Mô tả ngắn**:  
  Quản lý toàn bộ thông tin sản phẩm: mã, tên, giá, tồn kho, hình ảnh, thuộc tính, biến thể, đánh giá. Đây là nguồn dữ liệu cơ bản cho storefront.

- **Các route / page chính**
  - Danh sách:
    - `app/(dashboard)/products/page.tsx`
      - Sử dụng `DashboardShell` + `GenericList` với `productListConfig`.
  - Tạo mới:
    - `app/(dashboard)/products/new/page.tsx`
      - Render `FormSection` + `ProductForm`.
  - Chi tiết (view mode):
    - `app/(dashboard)/products/[productId]/page.tsx`
      - Lấy `productId` từ URL, fetch bằng `useGetProduct`, hiển thị spinner/alert, render `Card` + `ProductEditForm` `isDetail={true}`.
  - Chỉnh sửa:
    - `app/(dashboard)/products/[productId]/edit/page.tsx`
      - Tương tự, nhưng `ProductEditForm` ở chế độ edit (submit).

- **Các component chính liên quan**
  - UI list & bảng:
    - `components/generic/generic-list.tsx`
    - `components/table/data-table.tsx`
    - `config/product-list-config.tsx`
  - Form & detail:
    - `components/products/product-form.tsx`
    - `components/products/product-edit-form.tsx`
    - `components/products/form-sections/*` (basic info, pricing, images-upload, specifications, variants)
  - Hooks & services:
    - `hooks/use-products.ts`
    - `services/product-service.ts`
    - `schemas/product/*`, `types/product.ts`

- **Mức độ ảnh hưởng business**: **Cao**

- **Đánh giá nhanh UI/UX hiện tại**
  - Điểm mạnh:
    - Page mỏng, tách rõ phần data (hook/service) và phần UI (`ProductForm`/`ProductEditForm`).
    - Form đã chia thành nhiều section (`BasicInfoSection`, `PricingSection`, `ImagesUploadSection`, `SpecificationsSection`, `VariantsSection`), giúp tránh “form khổng lồ”.
    - Có trạng thái loading/error rõ (spinner + `Alert` destructive) khi fetch sản phẩm.
  - Điểm yếu:
    - Text copy trong card title/description đôi chỗ chưa chuẩn, khó hiểu (dịch, copy-paste).
    - Layout form dài, trên mobile dễ phải scroll nhiều; CTA chỉ có ở cuối, có thể khó thao tác ở form dài.
    - Một số field quan trọng (giá, tồn kho, trạng thái active) chưa được nhấn mạnh thị giác.
    - Một vài kiểu dữ liệu phức tạp (specs, variants, ảnh) có thể chưa có empty/empty‑state/hint đủ rõ cho admin không rành kỹ thuật.

- **Đề xuất refactor**
  - Mục tiêu chính:
    - Chuẩn hóa layout form theo Style Guide: section rõ, heading + mô tả, spacing đều.
    - Tối ưu mobile: đảm bảo form đọc được, các nhóm field quan trọng xuất hiện đầu tiên.
    - Làm rõ CTA: khu vực hành động cố định, text nút rõ ràng (“Lưu”, “Lưu & quay lại”, v.v.).
  - Loại thay đổi:
    - Chủ yếu UI + UX (sắp xếp lại section, label, hint, trạng thái lỗi, CTA).
    - Không đổi business logic, không đổi payload DTO hay service API.

---

## 3. Orders

- **Tên vertical**: Orders
- **Mô tả ngắn**:  
  Quản lý đơn hàng: danh sách, lọc, xem chi tiết, chỉnh sửa thông tin & trạng thái, xem lịch sử đơn.

- **Các route / page chính**
  - Danh sách:
    - `app/(dashboard)/orders/page.tsx`
      - `DashboardShell` + `GenericList` với `orderListConfig`.
  - Tạo mới:
    - `app/(dashboard)/orders/new/page.tsx`
      - Render `OrderForm` trong layout form section.
  - Chi tiết:
    - `app/(dashboard)/orders/[orderId]/page.tsx`
      - Fetch bằng `useGetOrder`, hiển thị spinner/alert, render `Card` + `OrderEditForm` `isDetail={true}`.
  - Chỉnh sửa:
    - `app/(dashboard)/orders/[orderId]/edit/page.tsx`
      - Tương tự, `OrderEditForm` ở chế độ edit.

- **Các component chính liên quan**
  - UI list & bảng:
    - `components/generic/generic-list.tsx`
    - `components/table/data-table.tsx`
    - `config/order-list-config.tsx`
  - Form & detail:
    - `components/orders/order-form.tsx`
    - `components/orders/order-edit-form.tsx`
    - `components/orders/order-history.tsx`
    - `components/orders/orders-by-user.tsx` (dialog xem đơn của 1 user)
  - Hooks & services:
    - `hooks/use-orders.ts`
    - `services/order-service.ts`
    - `types/order.ts`

- **Mức độ ảnh hưởng business**: **Cao**

- **Đánh giá nhanh UI/UX hiện tại**
  - Điểm mạnh:
    - Pattern list/detail giống với Products → dễ reuse refactor.
    - Đã có loading + error rõ ràng trong detail page.
    - `OrdersByUserDialog` có đầy đủ loading/error/empty state, scroll area cho bảng.
  - Điểm yếu:
    - Copy text ở một số nơi chưa thống nhất (ví dụ title/description card dùng từ “danh mục” thay vì “đơn hàng”).
    - Chi tiết đơn hàng có thể chưa tách rõ block (thông tin khách, shipping, payment, items, timeline), dễ khó scan khi đơn phức tạp.
    - Trên mobile, cấu trúc card + bảng ở detail có nguy cơ overflow / khó đọc nếu không tối ưu.

- **Đề xuất refactor**
  - Mục tiêu chính:
    - Tách chi tiết đơn hàng thành các section rõ ràng, dùng `Card`/`CardHeader` chuẩn.
    - Nổi bật trạng thái đơn, action chính (cập nhật trạng thái, in hóa đơn…) bằng `Button`/`Badge`/`StatusIndicator`.
    - Đảm bảo list Orders dễ scan trên mobile (ẩn bớt cột phụ, hiển thị chip trạng thái, tổng tiền rõ).
  - Loại thay đổi:
    - UI + UX flow hiển thị (không đổi logic trạng thái hay API).

---

## 4. Promotions / PromoCodes

- **Tên vertical**: Promotions / PromoCodes
- **Mô tả ngắn**:  
  Quản lý mã khuyến mãi, điều kiện, ngày hiệu lực, áp dụng cho giỏ hàng.

- **Các route / page chính**
  - Danh sách:
    - `app/(dashboard)/configs/promo-codes/page.tsx`
      - `DashboardShell` + `GenericList` với `promoCodeListConfig`.
  - Tạo mới / sửa / chi tiết:
    - `app/(dashboard)/configs/promo-codes/new/page.tsx`
    - `app/(dashboard)/configs/promo-codes/[promoCodeId]/page.tsx` (nếu có; từ cấu trúc folder).

- **Các component chính liên quan**
  - `components/promo-codes/*` (form-sections, list, v.v.)
  - `config/promo-code-list-config.tsx`
  - `hooks/use-promo-codes.ts`
  - `services/promo-code-service.ts`

- **Mức độ ảnh hưởng business**: **Cao**

- **Đánh giá nhanh UI/UX hiện tại**
  - Điểm mạnh:
    - Dùng pattern `GenericList` → thống nhất với Products/Orders.
    - Có hooks chuyên biệt cho create/update/delete/apply promo code, dùng toast cho feedback.
  - Điểm yếu:
    - Một số card form dùng class trực tiếp (`rounded-lg border p-3 shadow-sm`) thay vì `Card`, làm style không đồng nhất.
    - Các field điều kiện (ngày, min order value, type giảm giá) nếu không group rõ sẽ khó hiểu cho admin.

- **Đề xuất refactor**
  - Mục tiêu chính:
    - Chuẩn hóa form promo code theo Style Guide, dùng `Card` + `FormSection`.
    - Thể hiện rõ loại mã (%, số tiền, free ship), phạm vi áp dụng, trạng thái hiệu lực bằng `Badge`/status.
  - Loại thay đổi:
    - UI + UX, giữ nguyên logic áp dụng mã và API.

---

## 5. Reports & Analytics

- **Tên vertical**: Reports & Analytics
- **Mô tả ngắn**:  
  Các màn báo cáo doanh thu, top sản phẩm, khách hàng, tỷ lệ đơn, theo thời gian.

- **Các route / page chính**
  - Tổng quan dashboard:
    - `app/(dashboard)/dashboard/page.tsx`
  - Reports chi tiết:
    - `app/(dashboard)/reports/orders/*`
    - `app/(dashboard)/reports/products/*`
    - `app/(dashboard)/reports/revenue/*`
    - `app/(dashboard)/reports/users/*`

- **Các component chính liên quan**
  - Dashboard:
    - `components/dashboard/dashboard.tsx`
    - `components/dashboard/dashboard-overview.tsx`
    - `components/dashboard/dashboard-analytics.tsx`
    - `components/dashboard/dashboard-reports.tsx`
    - `components/dashboard/kpi-cards.tsx`
    - `components/dashboard/revenue-chart.tsx`
    - `components/dashboard/top-products.tsx`
    - `components/dashboard/customers-table.tsx`
  - Charts:
    - `components/ui/chart.tsx`
    - Các chart trong `components/reports/charts/*`

- **Mức độ ảnh hưởng business**: **Trung bình**

- **Đánh giá nhanh UI/UX hiện tại**
  - Điểm mạnh:
    - Layout card + grid hiện đại, sử dụng chart & table rõ ràng.
    - Có date range picker, tabs (overview/analytics/reports).
  - Điểm yếu:
    - Nhiều thông tin trên một màn, có thể nặng cho mobile (chart + bảng nhiều cột).
    - Chưa có chỉ dẫn rõ để đi tiếp từ report sang hành động (vd: “Xem chi tiết sản phẩm”, “Xử lý đơn chậm”).

- **Đề xuất refactor**
  - Mục tiêu chính:
    - Đơn giản hóa số widget trên màn hình nhỏ, ưu tiên KPI quan trọng.
    - Thêm CTA rõ từ dashboard/report tới Products/Orders tương ứng.
  - Loại thay đổi:
    - UI + UX điều hướng, không đổi logic dữ liệu.

---

## 6. Customers / Users

- **Tên vertical**: Customers / Users
- **Mô tả ngắn**:  
  Quản lý người dùng (khách + admin), thông tin hồ sơ, lịch sử đơn, hoạt động.

- **Các route / page chính**
  - Danh sách user:
    - `app/(dashboard)/users/page.tsx`
  - Tạo mới / sửa / chi tiết:
    - `app/(dashboard)/users/new/page.tsx`
    - `app/(dashboard)/users/[userId]/page.tsx`
    - `app/(dashboard)/users/[userId]/edit/page.tsx`
    - `app/(dashboard)/users/[userId]/permissions/page.tsx`

- **Các component chính liên quan**
  - `components/users/user-form.tsx`
  - `components/users/user-permissions-form.tsx` (nếu có)
  - `components/orders/orders-by-user.tsx`
  - `components/account/*` (dùng chung cho profile user hiện tại)
  - `config/user-list-config.tsx`
  - `hooks/use-users.ts`, `hooks/use-account.ts`
  - `services/user-service.ts`, `services/account-service.ts`

- **Mức độ ảnh hưởng business**: **Trung bình**

- **Đánh giá nhanh UI/UX hiện tại**
  - Điểm mạnh:
    - Dùng `GenericList` cho list user → thống nhất filter/search.
    - Có dialog `OrdersByUserDialog` để xem đơn của user, với loading/error/empty rõ ràng.
  - Điểm yếu:
    - Form user & permissions có nhiều thông tin, nếu không group tốt sẽ khó thao tác.
    - Phân biệt giữa “khách hàng” và “admin staff” có thể chưa rõ ràng về mặt UI (role, badge…).

- **Đề xuất refactor**
  - Mục tiêu chính:
    - Làm rõ vai trò (role), level khách hàng, trạng thái tài khoản bằng `Badge`/status.
    - Group form thành khối: thông tin chung, quyền hạn, bảo mật.
  - Loại thay đổi:
    - UI + UX; không đổi logic phân quyền.

---

## 7. Notifications

- **Tên vertical**: Notifications
- **Mô tả ngắn**:  
  Quản lý thông báo hệ thống & người dùng, thống kê hiệu quả, lọc theo ngày, loại.

- **Các route / page chính**
  - Admin notifications:
    - `app/(dashboard)/notifications/page.tsx`

- **Các component chính liên quan**
  - `components/notifications/notifications-list.tsx`
  - `components/notifications/notification-stats.tsx`
  - `components/notifications/create-notification-dialog.tsx`

- **Mức độ ảnh hưởng business**: **Trung bình**

- **Đánh giá nhanh UI/UX hiện tại**
  - Điểm mạnh:
    - Có tabs cho hệ thống vs người dùng, card list, thống kê theo date range.
    - UI sử dụng `Card`, `Tabs`, `Calendar28` theo style thống nhất.
  - Điểm yếu:
    - Form tạo thông báo có thể phức tạp, cần đảm bảo validation & preview rõ ràng.
    - Trên mobile, nhiều card & bảng dễ bị dài và khó scroll.

- **Đề xuất refactor**
  - Mục tiêu chính:
    - Chuẩn hóa form tạo thông báo (title, nội dung, đối tượng, lịch gửi).
    - Cải thiện mobile layout: chia nhỏ section, tận dụng accordion/tabs.
  - Loại thay đổi:
    - UI/UX hiển thị & thao tác; không đổi logic gửi.

---

## 8. Account & Profile

- **Tên vertical**: Account & Profile
- **Mô tả ngắn**:  
  Trang tài khoản của user hiện tại (admin): hồ sơ, bảo mật, hoạt động, thông báo, quyền riêng tư.

- **Các route / page chính**
  - `app/(dashboard)/account/page.tsx`

- **Các component chính liên quan**
  - `components/account/account-tabs.tsx`
  - `components/account/profile-form.tsx`
  - `components/account/security-form.tsx`
  - `components/account/activity-history.tsx`
  - `components/account/notification-settings.tsx`
  - `components/account/privacy-settings.tsx`

- **Mức độ ảnh hưởng business**: **Trung bình – Thấp**

- **Đánh giá nhanh UI/UX hiện tại**
  - Điểm mạnh:
    - Tab rõ ràng (profile, security, activity, notifications, privacy).
    - Có skeleton loading (`AccountTabsSkeleton`).
  - Điểm yếu:
    - 5 tab cùng hàng có thể chật trên mobile.
    - Một số block setting dùng pattern `rounded-lg border p-4` lặp nhiều lần.

- **Đề xuất refactor**
  - Mục tiêu chính:
    - Tối ưu tabs trên mobile (scroll ngang, icon + text).
    - Chuẩn hóa block setting theo `Card` hoặc `SettingsToggleRow`.
  - Loại thay đổi:
    - UI/UX form & navigation; không đổi logic tài khoản.

---

## 9. Settings & Configuration

- **Tên vertical**: Settings & Configuration
- **Mô tả ngắn**:  
  Cài đặt chung của hệ thống, tuỳ chọn, feature flags.

- **Các route / page chính**
  - `app/(dashboard)/settings/page.tsx`
  - `app/(dashboard)/configs/*` (banners, promo-codes… – phần đã tách ở vertical khác)

- **Các component chính liên quan**
  - `components/settings/settings-form.tsx`

- **Mức độ ảnh hưởng business**: **Thấp**

- **Đánh giá nhanh UI/UX hiện tại**
  - Điểm mạnh:
    - Biểu diễn từng setting dưới dạng row có toggle/checkbox, dễ hiểu.
  - Điểm yếu:
    - Lặp lại class `rounded-lg border p-4` nhiều nơi; style chưa hoàn toàn thống nhất với `Card`.

- **Đề xuất refactor**
  - Mục tiêu chính:
    - Tạo component base cho setting row theo Style Guide.
    - Đảm bảo layout setting rõ, dễ scan, mobile-friendly.
  - Loại thay đổi:
    - Chủ yếu UI.

---

## 10. Catalog metadata (Brands, Categories, Banners, About, Contact)

- **Tên vertical**: Catalog metadata
- **Mô tả ngắn**:  
  Các thực thể phụ trợ cho catalog & nội dung: thương hiệu, danh mục, banner, trang giới thiệu, liên hệ.

- **Các route / page chính**
  - Brands:
    - `app/(dashboard)/brands/page.tsx`
  - Categories:
    - `app/(dashboard)/categories/page.tsx`
  - Banners:
    - `app/(dashboard)/configs/banners/*`
  - About:
    - `app/(dashboard)/about/page.tsx`
  - Contact:
    - `app/(dashboard)/contact/page.tsx`

- **Các component chính liên quan**
  - `components/brands/*`, `config/brand-list-config.tsx`
  - `components/categories/*`, `config/category-list-config.tsx`
  - `components/banners/*`
  - `components/about/*`
  - `components/contact/*`

- **Mức độ ảnh hưởng business**: **Thấp**

- **Đánh giá nhanh UI/UX hiện tại**
  - Điểm mạnh:
    - Nhiều nơi reuse `GenericList`.
    - Form đã được chia section ở một số module (banners, about).
  - Điểm yếu:
    - Một số form còn verbose, sử dụng nhiều `div` style lặp lại.

- **Đề xuất refactor**
  - Mục tiêu chính:
    - Chuẩn hóa list/filter theo pattern Products/Orders.
    - Đơn giản hóa form UI, dùng lại component base cho card/section.
  - Loại thay đổi:
    - UI, nhỏ lẻ, làm sau.

---

## 11. Permissions & Roles

- **Tên vertical**: Permissions & Roles
- **Mô tả ngắn**:  
  Phân quyền chi tiết theo role/permission, ảnh hưởng bảo mật & khả năng thao tác của user.

- **Các route / page chính**
  - Permissions:
    - `app/(dashboard)/permissions/*`
  - Roles:
    - `app/(dashboard)/roles/*`
  - User‑specific permissions:
    - `app/(dashboard)/users/[userId]/permissions/page.tsx`

- **Các component chính liên quan**
  - `components/permissions/*`
  - `components/roles/*`
  - `config/permission-list-config.tsx`
  - `config/role-list-config.tsx`

- **Mức độ ảnh hưởng business**: **Thấp** (nhưng quan trọng về bảo mật)

- **Đánh giá nhanh UI/UX hiện tại**
  - Điểm mạnh:
    - Có phân tách rõ list và detail.
  - Điểm yếu:
    - UI phân quyền thường phức tạp, dễ gây rối nếu không group tốt; hiện chưa rõ pattern tree/checkbox có thân thiện trên mobile hay không (cần refactor sau).

- **Đề xuất refactor**
  - Mục tiêu chính:
    - Cải thiện readability: grouping theo module, dùng `Badge`/status để mô tả quickly.
  - Loại thay đổi:
    - UX tổ chức thông tin; làm sau khi các vertical chính ổn định.

---

## 12. Logs & User Activities

- **Tên vertical**: Logs & User Activities
- **Mô tả ngắn**:  
  Nhật ký hệ thống & log hoạt động của người dùng.

- **Các route / page chính**
  - Logs:
    - `app/(dashboard)/logs/*`
  - User activities:
    - `app/(dashboard)/user-activities/page.tsx`

- **Các component chính liên quan**
  - `components/logs/*`, `config/log-system-list-config.tsx`
  - `components/users/user-activity-dialog.tsx`
  - `config/user-activity-list-config.tsx`

- **Mức độ ảnh hưởng business**: **Thấp**

- **Đánh giá nhanh UI/UX hiện tại**
  - Điểm mạnh:
    - Đã có dialog riêng cho user activity, dùng `Badge`, icon.
  - Điểm yếu:
    - Bảng log nhiều cột dễ khó đọc, đặc biệt trên mobile.

- **Đề xuất refactor**
  - Mục tiêu chính:
    - Làm rõ severity, type bằng icon/màu; ẩn cột phụ trên mobile.

---

## 13. Auth (Login)

- **Tên vertical**: Auth (Login)
- **Mô tả ngắn**:  
  Màn đăng nhập vào dashboard admin.

- **Các route / page chính**
  - `app/(auth)/login/page.tsx`

- **Các component chính liên quan**
  - `components/auth/login-form.tsx`
  - `hooks/use-auth.tsx`
  - `services/auth-service.ts`

- **Mức độ ảnh hưởng business**: **Thấp** (trong bối cảnh dashboard; quan trọng về bảo mật)

- **Đánh giá nhanh UI/UX hiện tại**
  - Điểm mạnh:
    - Layout 2 cột đẹp trên desktop (hình + form).
    - Text rõ ràng, CTA “Đăng nhập” đứng đầu, có message lỗi qua toast.
  - Điểm yếu:
    - Trên mobile, hình nền có thể chiếm nhiều nếu không tối ưu (hiện đã ẩn cột trái trên mobile, tương đối ổn).

- **Đề xuất refactor**
  - Mục tiêu chính:
    - Chỉ tinh chỉnh nhỏ (copy, trạng thái lỗi, loading button).

---

## 14. Dashboard Overview

- **Tên vertical**: Dashboard Overview
- **Mô tả ngắn**:  
  Màn `/dashboard` hiển thị KPI và sơ bộ analytics.

- **Các route / page chính**
  - `app/(dashboard)/dashboard/page.tsx`

- **Các component chính liên quan**
  - `components/dashboard/dashboard.tsx`
  - `components/dashboard/dashboard-overview.tsx`
  - `components/dashboard/dashboard-analytics.tsx`
  - `components/dashboard/dashboard-reports.tsx`

- **Mức độ ảnh hưởng business**: **Thấp** (gián tiếp)

- **Đánh giá nhanh UI/UX hiện tại**
  - Điểm mạnh:
    - Layout rõ ràng, có Tabs, date range picker, CTA tải báo cáo.
  - Điểm yếu:
    - Có thể hơi “nặng” trên mobile; cần sắp xếp lại thứ tự block cho hợp lý.

- **Đề xuất refactor**
  - Mục tiêu chính:
    - Rà lại layout cho mobile-first, ưu tiên KPI quan trọng.

---

## 15. Thứ tự ưu tiên refactor (tóm tắt)

1. **Products** – ảnh hưởng trực tiếp đến chất lượng dữ liệu sản phẩm (giá, tồn kho, ảnh), là nền tảng cho toàn bộ e-commerce.
2. **Orders** – quyết định hiệu quả xử lý đơn, giao hàng; sai sót UI dẫn tới lỗi fulfillment.
3. **Promotions / PromoCodes** – tác động mạnh đến chiến dịch giá, chiết khấu; UX kém dễ gây sai cấu hình.
4. **Reports & Analytics** – hỗ trợ quyết định kinh doanh; UI tốt giúp đọc nhanh và hành động kịp thời.
5. **Customers / Users** – quản lý khách/admin, phân loại, lịch sử; quan trọng nhưng sau khi Products/Orders ổn.
6. **Notifications** – kênh giao tiếp tới người dùng; tối ưu sau các phần core.
7. **Account & Profile** – trải nghiệm cho admin, quan trọng nhưng ít tác động trực tiếp đến doanh thu.
8. **Settings & Configuration** – cấu hình hiếm khi thay đổi; refactor sau khi các flow chính đã sạch.
9. **Catalog metadata** (Brands, Categories, Banners, About, Contact) – hỗ trợ storefront, nhưng ít thao tác hàng ngày.
10. **Permissions & Roles** – phức tạp nhưng ít đổi; làm sau khi UI chung ổn định.
11. **Logs & User Activities** – phục vụ vận hành & debugging, không trực tiếp tạo doanh thu.
12. **Auth (Login)** – đã khá ổn, chỉ cần chỉnh nhẹ.
13. **Dashboard Overview** – chủ yếu cosmetic & sắp xếp thông tin, ưu tiên thấp nhất.


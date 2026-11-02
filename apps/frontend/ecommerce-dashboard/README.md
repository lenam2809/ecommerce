Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# ShopViet E-Commerce Admin Dashboard (`ecommerce-dashboard`)

Giao diện quản trị tập trung (Admin & Operations Dashboard) cho nền tảng thương mại điện tử công nghệ ShopViet (SSoT 2026). Ứng dụng cung cấp bảng điều khiển thời gian thực, quản lý danh mục sản phẩm, thông số kỹ thuật đa tầng, chuỗi 45 showroom O2O, kho linh kiện IMEI/Serial, đơn hàng & quy trình đổi trả hàng RMA 7 ngày, quản lý tài khoản & phân quyền động RBAC.

---

## 1. Công nghệ & Thư viện cốt lõi (Tech Stack)

| Thành phần | Công nghệ / Thư viện | Phiên bản | Ghi chú kỹ thuật |
|---|---|---|---|
| **Framework** | Next.js (App Router) | `^15.5.14` | Cấu hình server actions, route handlers, proxy API rewrite |
| **Giao diện cốt lõi** | React & React DOM | **`^18.3.1`** | **Lưu ý:** Dashboard chạy **React 18.3.1** (khác với client chạy React 19) để đảm bảo độ ổn định tối đa với hệ sinh thái bảng biểu và kéo thả |
| **Styling** | Tailwind CSS & PostCSS | `^4.0.0` | Cấu hình qua `@tailwindcss/postcss`, tích hợp `tw-animate-css` |
| **Design Tokens** | SSoT 2026 Dual-Accent | — | Tech Crimson (`#E11D48`), Electric Blue (`#2563EB`), Deep Obsidian Dark Mode 4 tầng |
| **Quản lý Dữ liệu** | TanStack React Query | `^5.74.3` | Cache dữ liệu server, pagination, optimistic updates |
| **Bảng dữ liệu** | TanStack Table | `^8.21.3` | Sắp xếp đa cột, lọc facets, phân trang server-side, ghim cột |
| **Biểu đồ & Thống kê**| Recharts | `^2.15.2` | Biểu đồ doanh thu, cơ cấu đơn hàng, hiệu suất danh mục |
| **Kéo thả (DnD)** | @dnd-kit (Core, Sortable) | `^6.3.1` / `^10.0.0` | Sắp xếp thứ tự ảnh sản phẩm, banner, thứ tự thông số kỹ thuật |
| **Form & Validation** | React Hook Form & Zod | `^7.55.0` / `^3.24.2` | Validation schema kép đồng bộ với FluentValidation phía Backend |
| **Realtime** | @microsoft/signalr | `^8.0.7` | Nhận thông báo tức thời, cảnh báo đơn hàng mới qua WebSocket |
| **Bộ Icon & UI Base** | Tabler Icons, Lucide, Radix UI | — | `@tabler/icons-react: ^3.31.0`, `lucide-react: ^0.488.0`, Radix UI Primitives |
| **Component Testing** | Storybook | `^8.6.14` | Môi trường phát triển và kiểm thử component UI độc lập |

---

## 2. Cổng dịch vụ & Hướng dẫn khởi chạy (Getting Started)

Mặc định ứng dụng chạy trên cổng **`3001`** (để tránh xung đột với `ecommerce-client` chạy trên cổng `3000` và `backend` chạy trên cổng `5000`).

### Cài đặt môi trường:

```bash
# Di chuyển vào thư mục dashboard
cd apps/frontend/ecommerce-dashboard

# Cài đặt dependencies
npm install

# Khởi chạy máy chủ phát triển (port 3001)
npm run dev
```

Mở trình duyệt truy cập: [http://localhost:3001](http://localhost:3001)

### Danh mục câu lệnh chuẩn:

- `npm run dev`: Chạy dev server tại `http://localhost:3001` (`next dev -p 3001`).
- `npm run build`: Kiểm tra typecheck và build production gói Next.js.
- `npm run start`: Chạy production build tại port 3001 (`next start -p 3001`).
- `npm run lint`: Kiểm tra tuân thủ ESLint.
- `npm run typecheck`: Kiểm tra tĩnh kiểu TypeScript (`tsc --noEmit`).

---

## 3. Cấu trúc dự án (Architecture & Directory Layout)

```
apps/frontend/ecommerce-dashboard/
├── app/                              # Next.js App Router (71 routes)
│   ├── page.tsx                      # Root route: Redirect về /dashboard
│   ├── (auth)/                       # Phân hệ xác thực độc lập layout
│   │   ├── login/                    # Đăng nhập quản trị viên
│   │   └── forgot-password/          # Khôi phục mật khẩu quản trị
│   └── (dashboard)/                  # Phân hệ màn hình làm việc chính (Sidebar layout)
│       ├── layout.tsx                # Dashboard layout: Sidebar, Navbar, Notifications
│       ├── dashboard/                # Bảng điều khiển KPI & biểu đồ tổng quan
│       ├── account/                  # Hồ sơ cá nhân & đổi mật khẩu quản trị viên
│       ├── users/                    # Quản trị người dùng & khách hàng
│       ├── roles/                    # Quản trị vai trò (RBAC)
│       ├── permissions/              # Quản trị danh mục quyền hạn hệ thống
│       ├── account-locks/            # Quản lý khóa tài khoản vi phạm
│       ├── products/                 # Quản lý danh mục & biến thể sản phẩm
│       ├── bulk-management/products/ # Quản lý hàng loạt & xuất/nhập CSV
│       ├── categories/               # Cây danh mục sản phẩm
│       ├── brands/                   # Thương hiệu sản phẩm
│       ├── inventory/                # Quản lý kho Serial/IMEI theo SKU
│       ├── showrooms/                # Mạng lưới 45 showroom & điều chuyển kho O2O
│       ├── orders/                   # Quản lý đơn hàng, vận chuyển, gán IMEI
│       ├── returns/                  # Quy trình đổi trả RMA 5 bước & nhật ký kỹ thuật
│       ├── configs/                  # Cấu hình marketing & hiển thị (Banners, Flash Sale, Marquee, Promo, Add-Ons)
│       ├── reports/                  # Báo cáo doanh thu, sản phẩm, đơn hàng, người dùng
│       ├── logs/                     # Nhật ký hệ thống & audit logs
│       ├── user-activities/          # Lịch sử hoạt động của người dùng
│       ├── notifications/            # Trung tâm thông báo nội bộ
│       ├── settings/                 # Cài đặt hệ thống
│       ├── about/                    # Quản lý nội dung trang giới thiệu
│       ├── contact/                  # Quản lý thông tin liên hệ
│       └── help/                     # Trung tâm trợ giúp & hỗ trợ
├── components/                       # UI Components phân tầng
│   ├── ui/                           # Base components (Button, Input, Card, Badge, Dialog...)
│   ├── generic/                      # Data table patterns, Search bar, Filters
│   ├── app-sidebar.tsx               # Sidebar chính phân quyền theo role
│   ├── dashboard-header.tsx          # Thanh điều hướng trên
│   └── [domain]/                     # Component nghiệp vụ (products, orders, showrooms...)
├── services/                         # Kết nối API Backend (Axios client, HttpOnly Cookie, CSRF)
├── hooks/                            # Custom React Hooks & TanStack Query wrappers
├── types/                            # TypeScript interfaces & Enums chuẩn SSoT
└── docs/                             # Tài liệu kỹ thuật UI Style Guide
```

---

## 4. Danh mục Đối soát 71 Tuyến Route Màn hình Thực tế

Toàn bộ **71 tuyến màn hình** đã được kiểm chứng 100% trên mã nguồn thực tế (gồm 1 root redirect + 2 auth routes + 68 routes trong `app/(dashboard)/`):

| STT | Phân nhóm chức năng | Tuyến URL Route | Tệp mã nguồn thực tế | Chức năng nghiệp vụ chính |
|:---:|---|---|---|---|
| 1 | **Điều hướng gốc** | `/` | `app/page.tsx` | Chuyển hướng tự động về `/dashboard` |
| 2 | **Xác thực** | `/login` | `app/(auth)/login/page.tsx` | Đăng nhập tài khoản quản trị (Set httpOnly cookie & CSRF) |
| 3 | **Xác thực** | `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Quên mật khẩu, gửi email mã khôi phục |
| 4 | **Tổng quan** | `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Trung tâm điều hành KPI: Doanh thu, Đơn hàng, Biểu đồ |
| 5 | **Tổng quan** | `/account` | `app/(dashboard)/account/page.tsx` | Thông tin cá nhân quản trị viên, đổi mật khẩu |
| 6 | **Người dùng** | `/users` | `app/(dashboard)/users/page.tsx` | Danh sách tài khoản người dùng và khách hàng |
| 7 | **Người dùng** | `/users/new` | `app/(dashboard)/users/new/page.tsx` | Tạo mới người dùng nội bộ |
| 8 | **Người dùng** | `/users/[userId]` | `app/(dashboard)/users/[userId]/page.tsx` | Chi tiết tài khoản, lịch sử mua hàng, điểm thưởng |
| 9 | **Người dùng** | `/users/[userId]/edit` | `app/(dashboard)/users/[userId]/edit/page.tsx` | Chỉnh sửa thông tin, vai trò tài khoản |
| 10 | **Người dùng** | `/users/[userId]/permissions` | `app/(dashboard)/users/[userId]/permissions/page.tsx` | Phân quyền đặc quyền trực tiếp theo người dùng |
| 11 | **Vai trò (RBAC)** | `/roles` | `app/(dashboard)/roles/page.tsx` | Danh sách các vai trò (Admin, Manager, Staff...) |
| 12 | **Vai trò (RBAC)** | `/roles/new` | `app/(dashboard)/roles/new/page.tsx` | Khởi tạo vai trò mới |
| 13 | **Vai trò (RBAC)** | `/roles/[roleId]` | `app/(dashboard)/roles/[roleId]/page.tsx` | Xem chi tiết vai trò và danh sách thành viên |
| 14 | **Vai trò (RBAC)** | `/roles/[roleId]/edit` | `app/(dashboard)/roles/[roleId]/edit/page.tsx` | Cập nhật tên và mô tả vai trò |
| 15 | **Vai trò (RBAC)** | `/roles/[roleId]/permissions` | `app/(dashboard)/roles/[roleId]/permissions/page.tsx` | Ma trận gán quyền hạn cho vai trò |
| 16 | **Quyền hạn** | `/permissions` | `app/(dashboard)/permissions/page.tsx` | Danh mục toàn bộ quyền hạn hệ thống (`EPermissions`) |
| 17 | **Quyền hạn** | `/permissions/new` | `app/(dashboard)/permissions/new/page.tsx` | Đăng ký quyền hạn mới vào hệ thống |
| 18 | **Quyền hạn** | `/permissions/[permissionId]` | `app/(dashboard)/permissions/[permissionId]/page.tsx` | Chi tiết quyền hạn |
| 19 | **Quyền hạn** | `/permissions/[permissionId]/edit` | `app/(dashboard)/permissions/[permissionId]/edit/page.tsx` | Sửa mô tả quyền hạn |
| 20 | **Khóa tài khoản** | `/account-locks` | `app/(dashboard)/account-locks/page.tsx` | Danh sách tài khoản bị khóa vi phạm, lý do khóa |
| 21 | **Khóa tài khoản** | `/account-locks/[id]` | `app/(dashboard)/account-locks/[id]/page.tsx` | Chi tiết lệnh khóa, mở khóa tài khoản |
| 22 | **Sản phẩm** | `/products` | `app/(dashboard)/products/page.tsx` | Danh mục sản phẩm, bộ lọc facets, tìm kiếm nhanh |
| 23 | **Sản phẩm** | `/products/new` | `app/(dashboard)/products/new/page.tsx` | Thêm sản phẩm mới, upload ảnh, 14 thông số kỹ thuật |
| 24 | **Sản phẩm** | `/products/[productId]` | `app/(dashboard)/products/[productId]/page.tsx` | Chi tiết sản phẩm, biến thể, giá bán, bảo hành |
| 25 | **Sản phẩm** | `/products/[productId]/edit` | `app/(dashboard)/products/[productId]/edit/page.tsx` | Chỉnh sửa thông số, biến thể, SKU, Add-Ons |
| 26 | **Sản phẩm** | `/bulk-management/products` | `app/(dashboard)/bulk-management/products/page.tsx` | Quản lý sản phẩm hàng loạt, xuất/nhập file mẫu CSV/Excel |
| 27 | **Danh mục** | `/categories` | `app/(dashboard)/categories/page.tsx` | Quản lý cây danh mục sản phẩm đa cấp |
| 28 | **Danh mục** | `/categories/new` | `app/(dashboard)/categories/new/page.tsx` | Tạo mới danh mục sản phẩm |
| 29 | **Danh mục** | `/categories/[categoryId]` | `app/(dashboard)/categories/[categoryId]/page.tsx` | Chi tiết danh mục và danh sách sản phẩm thuộc danh mục |
| 30 | **Danh mục** | `/categories/[categoryId]/edit`| `app/(dashboard)/categories/[categoryId]/edit/page.tsx` | Chỉnh sửa danh mục, icon, banner |
| 31 | **Thương hiệu** | `/brands` | `app/(dashboard)/brands/page.tsx` | Danh sách các thương hiệu đối tác |
| 32 | **Thương hiệu** | `/brands/new` | `app/(dashboard)/brands/new/page.tsx` | Thêm mới thương hiệu, upload logo |
| 33 | **Thương hiệu** | `/brands/[brandId]` | `app/(dashboard)/brands/[brandId]/page.tsx` | Chi tiết thương hiệu và liên kết danh mục |
| 34 | **Thương hiệu** | `/brands/[brandId]/edit` | `app/(dashboard)/brands/[brandId]/edit/page.tsx` | Chỉnh sửa thông tin thương hiệu |
| 35 | **Kho IMEI/Serial**| `/inventory` | `app/(dashboard)/inventory/page.tsx` | Tra cứu IMEI/Serial theo SKU, import file lô serial |
| 36 | **Showroom O2O** | `/showrooms` | `app/(dashboard)/showrooms/page.tsx` | Quản lý 45 showroom toàn quốc, tồn kho chi nhánh, phiếu chuyển kho |
| 37 | **Đơn hàng** | `/orders` | `app/(dashboard)/orders/page.tsx` | Danh sách đơn hàng, lọc 9 trạng thái `EOrderStatus` |
| 38 | **Đơn hàng** | `/orders/new` | `app/(dashboard)/orders/new/page.tsx` | Tạo đơn hàng thủ công tại quầy (POS/Showroom) |
| 39 | **Đơn hàng** | `/orders/[orderId]` | `app/(dashboard)/orders/[orderId]/page.tsx` | Chi tiết đơn: cọc COD 10%, VAT, gán IMEI, vận đơn |
| 40 | **Đơn hàng** | `/orders/[orderId]/edit` | `app/(dashboard)/orders/[orderId]/edit/page.tsx` | Cập nhật trạng thái đơn, địa chỉ nhận hàng, cọc |
| 41 | **Đổi trả (RMA)** | `/returns` | `app/(dashboard)/returns/page.tsx` | Danh sách yêu cầu đổi trả bảo hành trong 7 ngày |
| 42 | **Đổi trả (RMA)** | `/returns/[returnId]` | `app/(dashboard)/returns/[returnId]/page.tsx` | Stepper 5 bước RMA, biên bản thẩm định kỹ thuật, duyệt hoàn tiền |
| 43 | **Cấu hình Banners**| `/configs/banners` | `app/(dashboard)/configs/banners/page.tsx` | Danh sách banners trang chủ và danh mục |
| 44 | **Cấu hình Banners**| `/configs/banners/new` | `app/(dashboard)/configs/banners/new/page.tsx` | Thêm mới banner quảng cáo |
| 45 | **Cấu hình Banners**| `/configs/banners/[bannerId]` | `app/(dashboard)/configs/banners/[bannerId]/page.tsx` | Chi tiết banner |
| 46 | **Cấu hình Banners**| `/configs/banners/[bannerId]/edit`| `app/(dashboard)/configs/banners/[bannerId]/edit/page.tsx`| Chỉnh sửa liên kết banner, vị trí hiển thị |
| 47 | **Cấu hình Flash Sale**| `/configs/flash-sales`| `app/(dashboard)/configs/flash-sales/page.tsx` | Quản lý các chiến dịch Flash Sale theo khung giờ |
| 48 | **Cấu hình Flash Sale**| `/configs/flash-sales/new`| `app/(dashboard)/configs/flash-sales/new/page.tsx` | Khởi tạo chiến dịch Flash Sale mới |
| 49 | **Cấu hình Flash Sale**| `/configs/flash-sales/[id]/edit`| `app/(dashboard)/configs/flash-sales/[id]/edit/page.tsx` | Chỉnh sửa danh sách sản phẩm và quota Flash Sale |
| 50 | **Cấu hình Marquee**| `/configs/marquee` | `app/(dashboard)/configs/marquee/page.tsx` | Quản lý tin tức cuộn khẩn cấp trên thanh thông báo |
| 51 | **Cấu hình Marquee**| `/configs/marquee/new` | `app/(dashboard)/configs/marquee/new/page.tsx` | Thêm mới thông điệp Marquee |
| 52 | **Cấu hình Marquee**| `/configs/marquee/[marqueeId]/edit`| `app/(dashboard)/configs/marquee/[marqueeId]/edit/page.tsx`| Chỉnh sửa nội dung thông điệp, bật/tắt khẩn cấp |
| 53 | **Mã giảm giá** | `/configs/promo-codes` | `app/(dashboard)/configs/promo-codes/page.tsx` | Danh sách voucher, mã miễn phí vận chuyển FREESHIP |
| 54 | **Mã giảm giá** | `/configs/promo-codes/new` | `app/(dashboard)/configs/promo-codes/new/page.tsx` | Tạo voucher mới, điều kiện áp dụng, ngân sách |
| 55 | **Mã giảm giá** | `/configs/promo-codes/[promoCodeId]` | `app/(dashboard)/configs/promo-codes/[promoCodeId]/page.tsx`| Chi tiết mã giảm giá, số lượt đã sử dụng |
| 56 | **Mã giảm giá** | `/configs/promo-codes/[promoCodeId]/edit`| `app/(dashboard)/configs/promo-codes/[promoCodeId]/edit/page.tsx`| Chỉnh sửa ngày hết hạn, giới hạn số lượt |
| 57 | **Cấu hình Add-Ons**| `/configs/product-addons` | `app/(dashboard)/configs/product-addons/page.tsx` | Quản lý gói bảo hành mở rộng (AppleCare+, ShopViet Care 24T) |
| 58 | **Cài đặt** | `/settings` | `app/(dashboard)/settings/page.tsx` | Cấu hình tham số hệ thống chung, ngưỡng freeship |
| 59 | **Báo cáo** | `/reports/orders` | `app/(dashboard)/reports/orders/page.tsx` | Báo cáo chi tiết đơn hàng, tỷ lệ chuyển đổi |
| 60 | **Báo cáo** | `/reports/products` | `app/(dashboard)/reports/products/page.tsx` | Báo cáo sản phẩm bán chạy, cảnh báo tồn kho thấp |
| 61 | **Báo cáo** | `/reports/revenue` | `app/(dashboard)/reports/revenue/page.tsx` | Báo cáo doanh thu tài chính, dòng tiền theo phương thức thanh toán |
| 62 | **Báo cáo** | `/reports/users` | `app/(dashboard)/reports/users/page.tsx` | Báo cáo tăng trưởng người dùng, phân bổ hạng VIP |
| 63 | **Nhật ký** | `/logs` | `app/(dashboard)/logs/page.tsx` | Giám sát System Logs & Audit Logs tập trung |
| 64 | **Nhật ký** | `/logs/[logId]` | `app/(dashboard)/logs/[logId]/page.tsx` | Chi tiết stack trace và context lỗi hệ thống |
| 65 | **Nhật ký** | `/user-activities` | `app/(dashboard)/user-activities/page.tsx` | Lịch sử hoạt động người dùng (IP, User-Agent, hành vi) |
| 66 | **Thông báo** | `/notifications` | `app/(dashboard)/notifications/page.tsx` | Quản lý và gửi thông báo hệ thống qua SignalR |
| 67 | **Nội dung** | `/about` | `app/(dashboard)/about/page.tsx` | Quản trị bài viết giới thiệu, danh sách đối tác B2B |
| 68 | **Nội dung** | `/contact` | `app/(dashboard)/contact/page.tsx` | Quản trị thông tin liên hệ, hòm thư khách hàng |
| 69 | **Trợ giúp** | `/help` | `app/(dashboard)/help/page.tsx` | Tài liệu hướng dẫn sử dụng Dashboard cho nhân viên |
| 70 | **Trợ giúp** | `/help/contact` | `app/(dashboard)/help/contact/page.tsx` | Liên hệ hỗ trợ kỹ thuật nội bộ |
| 71 | **Toàn bộ** | *(Tổng cộng)* | — | **71 Tuyến màn hình hoàn chỉnh** |

---

## 5. Các Tính Năng Nổi Bật & Tích Hợp Chuyên Sâu

### 5.1. Quản lý Sản phẩm Hàng loạt & Xuất Mẫu CSV (`/bulk-management/products`)
Hệ thống tích hợp công cụ xuất mẫu và nhập liệu sản phẩm thông minh:
- **API xuất mẫu CSV:** `GET /api/products/export-template?format=csv` (xử lý phía backend bởi `ExcelService.cs` qua CsvHelper và EPPlus).
- Hỗ trợ tải file mẫu chuẩn gồm đầy đủ các cột: Tên sản phẩm, Mã SKU, Danh mục, Thương hiệu, Giá gốc, Giá khuyến mãi, Tồn kho, Bảo hành (tháng), và 14 thông số kỹ thuật chuẩn.
- Hỗ trợ xem trước dữ liệu (preview grid) và kiểm tra lỗi định dạng (validate) trước khi lưu chính thức vào cơ sở dữ liệu.

### 5.2. Quản lý Kho IMEI/Serial Number (`/inventory`)
- Quản lý vòng đời serial theo từng đơn vị sản phẩm vật lý (`InventoryItem`).
- 5 trạng thái vòng đời chuẩn: `Available (0)`, `Reserved (1)`, `Sold (2)`, `Defective (3)`, `ReturnedToStock (4)`.
- Cho phép import lô hàng ngàn IMEI/Serial qua file CSV/Excel theo mã SKU sản phẩm.

### 5.3. Mạng lưới 45 Showroom & Điều chuyển kho O2O (`/showrooms`)
- Đồng bộ danh sách 45 Showroom công nghệ hiện đại toàn quốc (SSoT 2026).
- Quản lý mức tồn kho tức thời của từng Showroom (`ShowroomInventory`).
- Hỗ trợ lập phiếu điều chuyển kho (Stock Transfer) giữa hai chi nhánh trong một Transaction đảm bảo tính toàn vẹn dữ liệu.

### 5.4. Quy trình Đổi trả Hàng RMA 7 Ngày (`/returns`)
- Quản lý toàn bộ yêu cầu bảo hành/đổi trả trong thời hạn **7 ngày** kể từ ngày giao hàng thành công.
- Visual Stepper 5 bước trực quan: Tiếp nhận $\rightarrow$ Thẩm định kỹ thuật $\rightarrow$ Nhập kho đổi trả $\rightarrow$ Xuất hàng mới/Hoàn tiền $\rightarrow$ Đóng hồ sơ.
- Ghi nhận nhật ký kỹ thuật viên (`ReturnRequestLog`) kèm hình ảnh/video bằng chứng lỗi (`ReturnEvidence`).

---

## 6. Cảnh Báo Kỹ Thuật & Sai Lệch Đã Biết (Known Technical Discrepancies)

1. **Cơ chế Kiểm soát Xung đột Dữ liệu (RowVersion) khi Cập nhật Trạng thái Đơn hàng:**
   - **Thực trạng:** Tại backend, command `UpdateOrderStatusCommand.cs` đánh dấu trường `public required string RowVersion { get; set; }` để kích hoạt cơ chế Optimistic Concurrency Control (OCC).
   - **Cảnh báo:** Trong `apps/frontend/ecommerce-dashboard/services/order-service.ts`, hàm `updateOrderStatus` hiện chỉ truyền `{ status, expectedDeliveryDate }`. Quản trị viên và kỹ sư frontend cần lưu ý bổ sung trường `rowVersion` từ dữ liệu đơn hàng hiện tại vào payload gửi lên API để tránh lỗi `400 Bad Request` hoặc xung đột ghi đè dữ liệu.
2. **Đồng bộ Enum Trạng thái Đơn hàng (`EOrderStatus`):**
   - Dashboard đã triển khai đầy đủ **9 trạng thái** của `EOrderStatus`: `Pending = 0`, `Processing = 1`, `Shipped = 2`, `Completed = 3`, `Cancelled = 4`, `Refunded = 5`, `Delivered = 6`, `ReturnRequested = 7`, `Returned = 8`.
   - Lưu ý rằng giao diện Storefront Client (`types/order.ts`) hiện đang có độ lệch (chỉ có 6 trạng thái và gán `Delivered = 3`). Khi xử lý đơn hàng từ Dashboard, luồng chuyển trạng thái luôn tuân thủ quy tắc Domain: `Shipped -> Delivered -> Completed`.
3. **Cơ chế Xác thực (Auth) & Cookie Security:**
   - Token JWT được cấp phát có thời hạn trong payload claim là 60 phút, tuy nhiên Cookie trình duyệt `access_token` được cấu hình thời hạn 15 phút (nhằm tăng cường bảo mật cho phân hệ quản trị).
   - Mọi thao tác ghi dữ liệu (POST, PUT, DELETE) đều được bảo vệ bởi Double Submit Cookie CSRF thông qua header `X-CSRF-Token`.

Cập nhật lần cuối: 27/11/2026 — đối chiếu commit 27ff08f

Backend trên Render dùng `GET /health/ready` để kiểm tra kết nối cơ sở dữ liệu khi triển khai.

# ShopViet E-Commerce Client (Storefront)

Giao diện cửa hàng trực tuyến hiện đại dành cho khách hàng của nền tảng thương mại điện tử **ShopViet**, chuyên kinh doanh thiết bị công nghệ cao cấp (Laptop, Smartphone, Linh kiện, Phụ kiện chính hãng). Ứng dụng được xây dựng trên nền tảng Next.js 15 (App Router) với React 19, áp dụng hệ thống thiết kế công nghệ phân vai màu kép (Dual-Accent Tech Hierarchy) và kiến trúc kết nối API phân tầng Clean DDD.

---

## 1. Công nghệ & Thư viện Chủ chốt (Tech Stack)

| Lớp (Layer) | Công nghệ / Thư viện | Phiên bản | Ghi chú vai trò |
|---|---|---|---|
| **Core Framework** | [Next.js](https://nextjs.org/) (App Router) | `^15.5.14` | Server Components, Client Components, Route Groups |
| **UI Library** | [React](https://react.dev/) / React DOM | `^19.0.0` | React 19 Core Engine |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) v4 | `^4.0.0` | Cấu hình `@theme inline` qua `@tailwindcss/postcss`, `tw-animate-css` |
| **Data Fetching** | [TanStack React Query](https://tanstack.com/query) | `^5.69.0` | Quản lý server state, caching, revalidation và background fetching |
| **HTTP Client** | [Axios](https://axios-http.com/) | `^1.8.4` | Tích hợp interceptor gửi/nhận cookie và header CSRF `X-CSRF-Token` |
| **Form & Validation** | [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) | `^7.54.2` / `^3.24.2` | Quản lý form hiệu năng cao, validate schema kiểu tĩnh đồng bộ `@hookform/resolvers: ^4.1.3` |
| **Real-time** | [@microsoft/signalr](https://www.npmjs.com/package/@microsoft/signalr) | `^8.0.7` | Kết nối WebSocket thời gian thực đến `NotificationHub` và `ReviewHub` |
| **Motion & Animation** | [Framer Motion](https://www.framer.com/motion/) | `^12.23.12` | Hoạt họa chuyển cảnh mượt mà, Dark Bento Grid, Micro-interactions |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/) | `^1.1.x` - `^2.1.x` | Dialog, Dropdown, Accordion, Tabs, Popover, Slider truy cập chuẩn WCAG |
| **Icons & Media** | [Lucide React](https://lucide.dev/) / Embla Carousel | `^0.483.0` / `^8.5.2` | Bộ icon công nghệ tối giản và carousel banner responsive |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) | `^2.0.1` | Toast thông báo thao tác giỏ hàng, thông báo lỗi hệ thống |

---

## 2. Cổng Chạy & Hướng dẫn Cài đặt

Ứng dụng Storefront chạy mặc định tại cổng **3000** (`http://localhost:3000`).

### Yêu cầu môi trường
- **Node.js**: Phiên bản `>= 20.x`
- **npm**: Phiên bản `>= 10.x`
- **Backend API**: ASP.NET Core 8 WebAPI đang chạy tại cổng `5000` (`http://localhost:5000`).

### Khởi chạy dự án

```bash
# Điều hướng vào thư mục ứng dụng client
cd apps/frontend/ecommerce-client

# Cài đặt các gói phụ thuộc
npm install

# Khởi chạy máy chủ phát triển (Development Server trên port 3000)
npm run dev

# Mở trình duyệt tại: http://localhost:3000
```

### Các lệnh Scripts chuẩn (NPM Scripts)

| Lệnh | Mô tả chi tiết |
|---|---|
| `npm run dev` | Khởi chạy Next.js development server tại cổng 3000 (`next dev -p 3000`) |
| `npm run build` | Biên dịch và tối ưu hóa toàn bộ ứng dụng cho môi trường production (`next build`) |
| `npm run start` | Khởi chạy máy chủ production đã build tại cổng 3000 (`next start -p 3000`) |
| `npm run lint` | Chạy bộ linter ESLint 9 để kiểm tra chất lượng mã nguồn (`eslint .`) |
| `npm run typecheck` | Kiểm tra kiểu dữ liệu tĩnh TypeScript mà không sinh file xuất (`tsc --noEmit`) |

---

## 3. Cấu hình Biến Môi trường (.env)

Tạo tệp `.env.local` tại thư mục gốc của `ecommerce-client`:

```env
# URL gốc của REST API backend (ASP.NET Core WebAPI)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# URL gốc kết nối SignalR WebSocket Hubs
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Base URL của ứng dụng client
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cấu hình CDN / Local Uploads URL
NEXT_PUBLIC_IMAGE_DOMAIN=localhost
```

---

## 4. Cơ chế Giỏ hàng & Xác thực Bảo mật

### 4.1. Giỏ hàng Khách vãng lai (Guest Cart) & Hợp nhất giỏ
- **Cơ chế nhận diện:** Khách vãng lai chưa đăng nhập được gán định danh duy nhất thông qua cookie `guest_id` (server-side httpOnly cookie có thời hạn **7 ngày**) sinh tự động bởi `GuestCartMiddleware` của backend.
- **Lưu trữ CSDL chuẩn xác:** Dữ liệu giỏ hàng khách vãng lai được lưu trữ trực tiếp trong cơ sở dữ liệu (CSDL) tại bảng `Carts` qua cột `AnonymousId` (**hoàn toàn không sử dụng Redis** để lưu trữ giỏ hàng).
- **Hợp nhất giỏ (Merge Cart):** Khi người dùng tiến hành đăng nhập (`/login`), hệ thống tự động gọi API hợp nhất các mục sản phẩm từ giỏ khách vãng lai (`AnonymousId`) vào giỏ hàng người dùng chính thức (`UserId`), giữ nguyên cấu hình biến thể và gói phụ kiện bảo hành đi kèm.

### 4.2. Cơ chế Xác thực Dual-Token qua httpOnly Cookie
- Hệ thống áp dụng mô hình bảo mật cấp ngân hàng, **tuyệt đối không lưu token xác thực trong LocalStorage** để triệt tiêu nguy cơ bị đánh cắp qua tấn công Cross-Site Scripting (XSS).
- **Access Token:**
  - JWT Payload Claim sinh ra có thời hạn sống danh định là **60 phút** (`AccessTokenExpirationMinutes = 60`).
  - Cookie `access_token` được trình duyệt thiết lập thời hạn **15 phút** (`CookieSettings:AccessTokenMinutes ?? 15`). Trình duyệt sẽ tự động thu hồi cookie này sau 15 phút không hoạt động.
- **Refresh Token:** Lưu trữ trong cookie `refresh_token` với thời hạn sống **7 ngày**.
- **CSRF Protection:** Mọi yêu cầu làm thay đổi trạng thái (POST/PUT/DELETE) được bảo vệ bởi middleware CSRF; client tự động đính kèm mã chống giả mạo trong header `X-CSRF-Token`.

---

## 5. Danh mục 27 Tuyến Route / Màn hình Thực tế

Ứng dụng Storefront gồm chính xác **27 routes** (tương ứng 27 tệp `page.tsx`), được tổ chức khoa học qua các Route Groups:

### Nhóm 1: Trang chủ & Thông tin Công khai (4 routes)
| STT | Tuyến Route (URL) | Đường dẫn tệp mã nguồn | Chức năng & Đặc điểm giao diện |
|:---:|---|---|---|
| 1 | `/` | `app/page.tsx` | **Trang chủ:** Dark Bento Grid, Flagship Hero Banner, danh mục công nghệ Bento, Top Deals |
| 2 | `/about` | `app/(routes)/about/page.tsx` | **Giới thiệu:** Giới thiệu thương hiệu ShopViet, mạng lưới 45 Showroom toàn quốc, form liên hệ B2B |
| 3 | `/contact` | `app/(routes)/contact/page.tsx` | **Liên hệ:** Bản đồ tương tác Flagship Showroom, tổng đài miễn cước 1800 6868 / 1800 6869 |
| 4 | `/compare` | `app/(routes)/compare/page.tsx` | **So sánh thông số:** So sánh ma trận 2-4 sản phẩm công nghệ, lọc điểm khác biệt, highlight badge |

### Nhóm 2: Danh mục & Chi tiết Sản phẩm (6 routes)
| STT | Tuyến Route (URL) | Đường dẫn tệp mã nguồn | Chức năng & Đặc điểm giao diện |
|:---:|---|---|---|
| 5 | `/products` | `app/(routes)/products/page.tsx` | **Tất cả sản phẩm:** Bộ lọc đa diện (Facets RAM, SSD, Giá, Hãng), sắp xếp giá/mới nhất |
| 6 | `/products/[category]` | `app/(routes)/products/[category]/page.tsx` | **Lọc theo danh mục:** Danh sách thiết bị theo danh mục chuyên biệt (Laptop, Smartphone, Tablet...) |
| 7 | `/products/[category]/[brand]` | `app/(routes)/products/[category]/[brand]/page.tsx` | **Lọc danh mục & thương hiệu:** Tìm kiếm theo thương hiệu (Apple, Asus, Dell, Lenovo...) |
| 8 | `/products/[category]/[brand]/[slug]` | `app/(routes)/products/[category]/[brand]/[slug]/page.tsx` | **Chi tiết sản phẩm đa cấp:** URL thân thiện SEO chuẩn mực cho từng dòng sản phẩm |
| 9 | `/product/[slug]` | `app/(routes)/product/[slug]/page.tsx` | **Chi tiết sản phẩm rút gọn (PDP):** 14 thông số chuẩn, chọn gói bảo hành Add-Ons, kiểm tra kho showroom |
| 10 | `/[categorySlug]` | `app/(routes)/[categorySlug]/page.tsx` | **Danh mục động cấp cao:** Định tuyến danh mục cấp 1 linh hoạt |

### Nhóm 3: Giỏ hàng, Đặt hàng & Thanh toán (4 routes)
| STT | Tuyến Route (URL) | Đường dẫn tệp mã nguồn | Chức năng & Đặc điểm giao diện |
|:---:|---|---|---|
| 11 | `/cart` | `app/(routes)/cart/page.tsx` | **Giỏ hàng:** Hỗ trợ guest/user, thanh tiến độ Freeship 500k, voucher giảm giá, chọn số lượng |
| 12 | `/checkout` | `app/(routes)/checkout/page.tsx` | **Thanh toán:** Sổ địa chỉ, nhận tại 45 Showroom, cọc COD 10% đơn > 20 triệu, xuất hóa đơn VAT điện tử |
| 13 | `/wishlist` | `app/(routes)/wishlist/page.tsx` | **Danh sách yêu thích:** Lưu trữ sản phẩm quan tâm, thêm nhanh vào giỏ hàng |
| 14 | `/payment/vnpay-return` | `app/(routes)/payment/vnpay-return/page.tsx` | **Kết quả VNPay:** Tiếp nhận callback Sandbox, mã đối soát, timer đếm ngược 30 phút giữ đơn khi lỗi |

### Nhóm 4: Xác thực Tài khoản Khách hàng (6 routes)
| STT | Tuyến Route (URL) | Đường dẫn tệp mã nguồn | Chức năng & Đặc điểm giao diện |
|:---:|---|---|---|
| 15 | `/login` | `app/(auth)/login/page.tsx` | **Đăng nhập:** Xác thực email/password, chuyển hướng an toàn qua tham số `returnUrl` |
| 16 | `/register` | `app/(auth)/register/page.tsx` | **Đăng ký:** Đăng ký tài khoản người dùng mới, tự động gửi thư kích hoạt tài khoản |
| 17 | `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | **Quên mật khẩu:** Gửi email yêu cầu đặt lại mật khẩu với liên kết bảo mật |
| 18 | `/reset-password` | `app/(auth)/reset-password/page.tsx` | **Yêu cầu đổi mật khẩu:** Trang hỗ trợ nhập thông tin xác minh đặt lại mật khẩu |
| 19 | `/reset-password/[token]` | `app/(auth)/reset-password/[token]/page.tsx` | **Đặt lại mật khẩu mới:** Biểu mẫu nhập mật khẩu mới theo token bảo mật được cấp qua email |
| 20 | `/auth/google-callback` | `app/auth/google-callback/page.tsx` | **Google OAuth Callback:** Tiếp nhận redirect xác thực từ Google Identity Platform |

### Nhóm 5: Trung tâm Khách hàng & Hậu mãi (7 routes)
| STT | Tuyến Route (URL) | Đường dẫn tệp mã nguồn | Chức năng & Đặc điểm giao diện |
|:---:|---|---|---|
| 21 | `/account` | `app/(routes)/account/page.tsx` | **Tổng quan hồ sơ:** Phân hạng thành viên VIP, tổng quan đơn hàng và liên kết nhanh |
| 22 | `/account/orders` | `app/(routes)/account/orders/page.tsx` | **Lịch sử đơn hàng:** Danh sách đơn hàng đã đặt, lọc theo trạng thái, tìm kiếm mã đơn |
| 23 | `/account/orders/[orderId]` | `app/(routes)/account/orders/[orderId]/page.tsx` | **Chi tiết đơn hàng:** Dòng thời gian giao vận, hiển thị IMEI/Serial thiết bị, Add-Ons kèm theo |
| 24 | `/account/addresses` | `app/(routes)/account/addresses/page.tsx` | **Sổ địa chỉ:** Quản lý danh sách địa chỉ nhận hàng, thiết lập địa chỉ mặc định |
| 25 | `/account/addresses/new` | `app/(routes)/account/addresses/new/page.tsx` | **Thêm mới địa chỉ:** Form nhập địa chỉ phân cấp chuẩn 3 cấp hành chính Việt Nam |
| 26 | `/account/returns` | `app/(routes)/account/returns/page.tsx` | **Danh sách Đổi trả RMA:** Quản lý các yêu cầu đổi trả hàng bảo hành trong vòng 7 ngày |
| 27 | `/account/returns/[returnId]` | `app/(routes)/account/returns/[returnId]/page.tsx` | **Chi tiết RMA:** Dòng thời gian 5 bước xử lý RMA, upload ảnh/video lỗi, chọn nhận hàng tại Showroom |

---

## 6. Quy chuẩn UI/UX & Dữ liệu SSoT 2026

Storefront tuân thủ nghiêm ngặt các quy chuẩn giao diện và dữ liệu duy nhất một nguồn (SSoT 2026):

1. **Phân vai Màu sắc Kép (Dual-Accent Tech Hierarchy):**
   - **Tech Crimson (`#E11D48` / `bg-brand` / `text-brand`):** Dành riêng cho các hành động mua hàng và chuyển đổi doanh số (`Nút Mua ngay`, `Nút Thanh toán`, `Giá bán khuyến mãi`, `Badge % giảm giá`, `Hot Deal`).
   - **Electric Blue (`#2563EB` ở Light Mode, `#3B82F6` ở Dark Mode / `bg-tech-blue`):** Dành cho các tính năng công nghệ và tương tác (`Nút Thêm vào giỏ`, `Bộ lọc đang chọn`, `Badge bảo hành 24T chính hãng`, `Icon kỹ thuật`, `Focus ring`).
   - *Tuyệt đối không hardcode mã màu hex cứng vào JSX/TSX.*
2. **Quy chuẩn Định dạng Tiền tệ:**
   - Mọi nơi hiển thị giá tiền bắt buộc sử dụng lớp:
     ```html
     font-mono tabular-nums whitespace-nowrap price-tag
     ```
   - Ký hiệu tiền tệ `₫` không bao giờ bị rớt dòng một mình.
3. **Chế độ Tối Deep Obsidian (Dark Mode):**
   - Phân tầng 4 lớp bề mặt chống mỏi mắt: Lớp 0 (`#090D16`), Lớp 1 (`#111827`), Lớp 2 (`#182234`), Lớp 3 (`#1E293B`), đảm bảo độ tương phản WCAG 2.1 AA $\ge 4.5:1$.
4. **Hệ thống Showroom & Hotline:**
   - Mạng lưới **45 Showroom công nghệ** phủ khắp toàn quốc, hỗ trợ nhận hàng và đổi trả trực tiếp.
   - Hotline bán hàng: `1800 6868` & Hotline kỹ thuật: `1800 6869` (miễn phí cước cuộc gọi).
5. **Chính sách Đổi trả RMA:**
   - Hạn tạo yêu cầu đổi trả là **7 ngày** kể từ thời điểm đơn hàng đạt trạng thái `Delivered` (Đã giao hàng thành công).
6. **Cọc COD 10% cho đơn hàng giá trị cao:**
   - Đơn hàng chọn hình thức COD có tổng tiền $> 20.000.000₫$ bắt buộc phải đặt cọc trước **10%** (`DepositRequired = Math.Round(TotalAmount * 0.10m)`), 90% còn lại thu khi giao hàng.
7. **Miễn phí vận chuyển (Freeship):**
   - Đơn hàng có tổng tiền hàng $\ge 500.000₫$ được miễn phí vận chuyển toàn quốc. Đơn dưới 500k tính phí 30.000₫. Đơn rỗng tính 0₫.

---

## 7. Cấu trúc Thư mục Mã nguồn (Project Layout)

```
ecommerce-client/
├── app/                        # Next.js 15 App Router
│   ├── (auth)/                 # Nhóm route xác thực (login, register, forgot/reset-password)
│   ├── (routes)/               # Nhóm route nghiệp vụ khách hàng (cart, checkout, account, products...)
│   ├── auth/google-callback/   # Tiếp nhận Google OAuth callback
│   ├── globals.css             # Tailwind CSS v4 Theme, Deep Obsidian Dark Mode variables
│   ├── layout.tsx              # Root Layout bọc TanStack Query Provider, ThemeProvider
│   └── page.tsx                # Trang chủ Dark Bento Grid
├── components/                 # Các thành phần giao diện tái sử dụng
│   ├── account/                # Sidebar tài khoản, danh sách đơn hàng, form địa chỉ
│   ├── cart/                   # CartItem, CartSummary, Freeship Progress Bar
│   ├── checkout/               # Form địa chỉ, PaymentMethod, VAT invoice
│   ├── layout/                 # Header, Footer, MobileNav, Marquee Bar
│   ├── product/                # ProductCard, ProductGallery, SpecTable, AddOnSelector
│   └── ui/                     # Radix UI primitives (Button, Dialog, Dropdown, Tabs...)
├── hooks/                      # Custom React hooks (wrappers quanh TanStack Query)
├── hubs/                       # Logic khởi tạo và lắng nghe SignalR WebSockets
├── lib/                        # Axios instance, tiện ích format tiền tệ, helper functions
├── services/                   # Lớp gọi REST API backend (auth, cart, order, product, showroom...)
└── types/                      # Định nghĩa kiểu dữ liệu TypeScript (product, order, cart, showroom...)
```

---

## 8. Sai lệch Đã biết (Known Discrepancies)

Ghi nhận các điểm chênh lệch giữa hành vi mã nguồn và thiết kế nhằm phục vụ bảo trì và đồng bộ hóa:

1. **Toán tử Ngưỡng Freeship 500.000₫:**
   - *Giao diện Client (`CartHeader.tsx:16`, `OrderSummary.tsx:51`):* Áp dụng Freeship khi `subtotal >= 500.000₫`.
   - *Backend (`ShippingCalculator.cs:34`):* Đang dùng phép so sánh lớn hơn hẳn `subtotal > 500_000m`. Do đó, đơn hàng có đúng 500.000₫ tại backend vẫn bị tính phí 30.000₫.
2. **Thời hạn Token giữa Cookie và JWT Claim:**
   - *JWT Payload Claim (`TokenService.cs:54`):* Sinh thời hạn hết hạn là 60 phút.
   - *Cookie Trình duyệt (`CookieAuthExtensions.cs:36`):* Thiết lập thời hạn 15 phút. Người dùng sẽ bị thu hồi phiên đăng nhập tại trình duyệt sau 15 phút dù JWT còn hạn.
3. **Cổng thanh toán MoMo, ZaloPay, VietQR:**
   - *Giao diện Client (`payment-method.tsx`):* Cho phép người dùng chọn MoMo, ZaloPay, VietQR Pro.
   - *Backend:* Chưa tích hợp webhook/IPN thực tế cho các ví này, chỉ ghi nhận chuỗi phương thức thanh toán vào CSDL. Chỉ có **COD** và **VNPay** (`VnPayPaymentGateway.cs`) là được xử lý giao dịch thực tế.
4. **Lệch Enum `OrderStatus` trong TypeScript:**
   - *Backend `EOrderStatus`:* Khai báo 9 trạng thái (`Pending=0, Processing=1, Shipped=2, Completed=3, Cancelled=4, Refunded=5, Delivered=6, ReturnRequested=7, Returned=8`).
   - *Client (`types/order.ts:150-157`):* Đang chỉ khai báo 6 trạng thái và gán lệch `Delivered=3`, thiếu `Completed` và `Refunded`.

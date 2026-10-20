# GIAI ĐOẠN 2 - BƯỚC 2B: KẾ HOẠCH THỰC THI THIẾT KẾ GOOGLE STITCH (STITCH EXECUTION PLAN & TRACKING MATRIX)

> **Dự án:** ShopViet E-Commerce — `apps/frontend/ecommerce-client`  
> **Phong cách thiết kế:** **Hybrid Premium Tech** (Apple Store / ThinkPro Bento Grid + CellphoneS / GearVN High-Conversion Tech Specs)  
> **Mục tiêu:** Quy hoạch chi tiết quy trình gọi Google Stitch MCP theo 3 Batch (11 cụm màn hình × 2 Viewports Desktop `1440px` & Mobile `390px`), sẵn sàng cho **Giai đoạn 3 (Sinh thiết kế trên Google Stitch)**.

---

## 1. QUY TRÌNH KHỞI TẠO PROJECT & DESIGN SYSTEM TRÊN GOOGLE STITCH MCP

Trước khi chạy Batch 1 ở Giai đoạn 3, hệ thống sẽ thực hiện tuần tự 2 bước khởi tạo nền tảng trên Google Stitch MCP:

1. **Bước 0.1 — Tạo Stitch Project (`StitchMCP:create_project`):**
   - **Tham số đầu vào:**
     ```json
     {
       "title": "ShopViet E-Commerce — Hybrid Premium Tech Redesign (2026)"
     }
     ```
   - **Kết quả kỳ vọng:** Nhận về `projectId` (ví dụ: `projects/...`) để lưu vào Bảng Theo Dõi.

2. **Bước 0.2 — Khởi tạo Design System chuẩn Hybrid Premium Tech (`StitchMCP:create_design_system`):**
   - **Tham số đầu vào:**
     - `projectId`: ID từ Bước 0.1
     - `designSystem.displayName`: `"ShopViet Hybrid Premium Tech System"`
     - `designSystem.theme`:
       - `colorMode`: `"LIGHT"` (kèm biến thể Dark Bento cho Hero/Banner và quy tắc ánh xạ `.dark`)
       - `customColor`: `"#2563EB"` (Tech Primary Electric Blue) kết hợp `"#E11D48"` (Conversion CTA Crimson)
       - `font`: `"PLUS_JAKARTA_SANS"` (`Plus Jakarta Sans` / `Inter`)
       - `roundness`: `"ROUND_SIXTEEN"` (`16px` chuẩn Bento Card)
   - **Áp dụng đồng bộ:** Mọi màn hình sinh ra qua `StitchMCP:generate_screen_from_text` (`modelId: "GEMINI_3_1_PRO"`) sẽ tuân thủ tuyệt đối bộ token trong `docs/ui-redesign/03-design-system-spec.md`.

---

## 2. KẾ HOẠCH THỰC THI CHI TIẾT THEO 3 BATCH (DESIGN PROMPTS CHUẨN HÓA)

### BATCH 1: CORE DISCOVERY & CATALOG (KHÁM PHÁ & DANH MỤC SẢN PHẨM)

#### [MH-01] Trang chủ (`/` — Homepage Hybrid Bento Showcase)
- **Viewports cần sinh:** `DESKTOP` (1440px) & `MOBILE` (390px)
- **Tool gọi ở Giai đoạn 3:** `StitchMCP:generate_screen_from_text` (`deviceType: "DESKTOP"` & `"MOBILE"`)
- **Design Prompt chuẩn hóa cho Stitch:**
  > Thiết kế giao diện Trang chủ cửa hàng bán lẻ công nghệ cao cấp **ShopViet Tech Store** (ngôn ngữ Tiếng Việt) theo phong cách **Hybrid Premium Tech** (kết hợp bố cục Bento Grid sắc lạnh của Apple Store/ThinkPro và mật độ thông tin chuyển đổi của CellphoneS).
  > - **Hệ màu:** Nền trang Light Mode `#F8FAFC`, Card `#FFFFFF`, viền `#E2E8F0`. Màu nhấn công nghệ Electric Blue `#2563EB` (cho badge Chính hãng, Spec Chips, liên kết); màu chuyển đổi Tech Crimson `#E11D48` (chỉ dùng cho nút Mua ngay, Giá khuyến mãi và Badge `-XX%`).
  > - **Header:** Top Announcement Bar nền `#F1F5F9` ghi rõ `"Miễn phí vận chuyển toàn quốc cho đơn từ 500.000₫ • Bảo hành chính hãng 12–24 tháng • Đổi trả 30 ngày"`. Main Sticky Header gồm Logo ShopViet, nút Danh mục Mega Menu, thanh Search lớn có phím tắt `⌘K`, cụm icon So sánh (2), Yêu thích (3), Thông báo, Giỏ hàng (2) và Tài khoản.
  > - **Hero Bento Showcase (12 cột):** Khối chính (8 cột) dùng nền Dark Bento `#0D1322` sang trọng giới thiệu **iPhone 16 Pro Max 256GB VN/A** kèm chip thông số `Chip A18 Pro • Titan Tự Nhiên • Màn hình 6.9" 120Hz`, nút CTA chính `"Mua ngay - 28.990.000 ₫"` (`#E11D48`) và nút phụ `"Xem cấu hình chi tiết"`. Cột phải (4 cột) xếp 2 thẻ Bento phụ: `MacBook Air M3 13 inch 16GB/256GB (Giảm 3.500.000 ₫)` và `Sony WH-1000XM5 Chống ồn chủ động`.
  > - **USP Strip (4 cột Bento):** Chính hãng 100% VN/A, Miễn phí giao nhanh đơn từ `500.000₫`, Bảo hành tận tâm 1 đổi 1 trong 30 ngày, Hỗ trợ kỹ thuật 24/7 (icon màu `#2563EB` trên nền `#EFF6FF`).
  > - **Danh mục Bento Grid (4 cột):** Điện thoại & Tablet, Laptop & MacBook, Âm thanh Hi-Res, Đồng hồ & Phụ kiện thông minh (có số lượng sản phẩm và ảnh thiết bị sắc nét).
  > - **Lưới Sản phẩm Nổi bật & Bán chạy (4 cột Desktop / 2 cột Mobile):** Mỗi `ProductCard` hiển thị đầy đủ: Badge `-15%` (`#E11D48`) góc trái, Badge `Chính hãng` (`#2563EB`) + 2 nút tròn `Yêu thích (♥)` và `So sánh (⇄)` góc phải, ảnh sản phẩm trên nền `#F1F5F9`, tên thương hiệu `APPLE`, tên SP 2 dòng, hàng **3 Spec Chips** (`256GB`, `8GB RAM`, `6.9" 120Hz`), đánh giá `★ 4.9 (128)` + `• Còn hàng`, giá bán `28.990.000 ₫` (`tabular-nums` màu `#E11D48`), giá gốc gạch ngang `33.990.000 ₫` và nút thêm nhanh vào giỏ.
  > - **Privilege VIP Banner:** Khối Dark Bento `#0D1322` giới thiệu đặc quyền thành viên giảm 500.000₫ với mã `TECHVIP500` có nút Sao chép mã.

---

#### [MH-02] Danh sách sản phẩm & Bộ lọc chuyên sâu (`/products`, `/products/[category]`)
- **Viewports cần sinh:** `DESKTOP` (1440px — Sidebar Filter + Grid/List + Instant Search Dropdown) & `MOBILE` (390px — Filter Drawer + 2-Column Grid + Compare Floating Bar)
- **Tool gọi ở Giai đoạn 3:** `StitchMCP:generate_screen_from_text`
- **Design Prompt chuẩn hóa cho Stitch:**
  > Thiết kế trang Danh mục & Lọc sản phẩm công nghệ `/products` của **ShopViet** theo phong cách **Hybrid Premium Tech**.
  > - **Bố cục Desktop (1440px):**
  >   - Breadcrumb (`Trang chủ / Điện thoại & Laptop`) + Thanh Quick Category Pills ngang (`Tất cả`, `Apple`, `Samsung`, `ASUS ROG`, `Sony`, `Dưới 15 triệu`, `Trả góp 0%`).
  >   - **Cột trái (`280px` Sticky Filter Sidebar):** Khoảng giá (Slider + nút chọn nhanh `< 10 triệu`, `10 - 20 triệu`, `> 20 triệu`), Thương hiệu (Checkbox có đếm số lượng, trạng thái chọn màu `#2563EB`), Dung lượng RAM/ROM (`8GB`, `16GB`, `256GB`, `512GB` dạng chip chọn), Tình trạng hàng (`Còn hàng`), Đánh giá từ 4 sao trở lên, nút `"Xóa bộ lọc"`.
  >   - **Cột phải (Main Catalog):** Thanh Toolbar hiển thị `"Hiển thị 24 trên 148 sản phẩm"`, các tag bộ lọc đang áp dụng (`Apple ×`, `256GB ×`), dropdown Sắp xếp (`Bán chạy nhất`, `Giá thấp đến cao`, `Mới nhất`) và nút chuyển đổi chế độ xem **Grid / List** (active màu `#2563EB`).
  >   - **Lưới sản phẩm (3 cột trên Desktop có Sidebar / 2 cột trên Mobile):** Các thẻ `ProductCard` chuẩn công nghệ có **Spec Chips** (`M3 Max`, `16GB`, `512GB SSD`), giá `tabular-nums`, trạng thái kho và cả trạng thái **Image Fallback chuẩn công nghệ** (hiển thị vector thiết bị tinh tế khi 1 sản phẩm chưa có ảnh thay vì khung rỗng).
  >   - **Thanh So sánh nổi (`Compare Floating Bar`) ở đáy màn hình:** Hiển thị 2 sản phẩm đang được chọn so sánh (`iPhone 16 Pro Max` vs `Samsung Galaxy S24 Ultra`), 2 ô trống chờ thêm, và nút `"So sánh ngay (2/4)"` màu `#2563EB`.
  > - **Bố cục Mobile (390px):** Hiển thị lưới 2 cột sản phẩm kết hợp trạng thái mở **Filter Drawer** từ cạnh dưới/phải với nút `"Xem 24 sản phẩm"` màu `#2563EB`.

---

#### [MH-03] Chi tiết sản phẩm (`/product/[slug]` & `/products/[category]/[brand]/[slug]`)
- **Viewports cần sinh:** `DESKTOP` (1440px — 2-Column PDP + Tech Specs Table + Reviews) & `MOBILE` (390px — Mobile PDP + Sticky Buy Bar cố định ở đáy)
- **Tool gọi ở Giai đoạn 3:** `StitchMCP:generate_screen_from_text`
- **Design Prompt chuẩn hóa cho Stitch:**
  > Thiết kế trang Chi tiết sản phẩm công nghệ `/product/[slug]` của **ShopViet** cho sản phẩm **MacBook Pro 14 inch M3 Pro 18GB/512GB Chính hãng VN/A**.
  > - **Khu vực Above-the-Fold (2 cột Desktop: 5 cột Gallery - 7 cột Thông tin mua hàng):**
  >   - **Cột trái (Gallery):** Khung ảnh chính tỷ lệ 1:1 nền `#F1F5F9` có nhãn `Bảo hành chính hãng Apple Việt Nam 12 tháng`, dải 5 ảnh thumbnail bên dưới (viền ảnh đang chọn màu `#2563EB`), và cụm 4 cam kết bảo hành dưới ảnh.
  >   - **Cột phải (Buy Box):** Badge thương hiệu `APPLE` + Mã SKU `MBP14-M3P-512` (`JetBrains Mono`), Tên sản phẩm H1 đậm nét, xếp hạng `★ 4.9 (86 đánh giá) | Đã bán 312 | Còn hàng (15 sản phẩm)`.
  >   - **Khối Giá bán Bento:** Nền `#FFF1F2` viền `#E11D48/20` hiển thị giá khuyến mãi `46.990.000 ₫` (`tabular-nums` cỡ lớn màu `#E11D48`), giá niêm yết `52.990.000 ₫` và nhãn `Tiết kiệm 6.000.000 ₫ (-11%)`.
  >   - **Bộ chọn Biến thể (Variant Selectors):** Chọn Màu sắc (`Đen Space Black`, `Bạc Silver`) và Chọn Phiên bản cấu hình (`18GB / 512GB - 46.990.000₫` đang active với viền `#2563EB` nền `#EFF6FF` và dấu tick xanh; `18GB / 1TB - 51.990.000₫`).
  >   - **Tóm tắt 4 Thông số cốt lõi (Key Spec Bento Grid):** Chip `Apple M3 Pro 11-core`, RAM `18GB Unified`, Ổ cứng `512GB SSD`, Màn hình `14.2" Liquid Retina XDR 120Hz`.
  >   - **Cụm Hành động (CTA):** Bộ chọn số lượng `- 1 +`, nút lớn **"Mua ngay — Giao nhanh 2h"** (`bg-[#E11D48] text-white`), nút **"Thêm vào giỏ hàng"** (`border-[#2563EB] text-[#2563EB] bg-[#EFF6FF]`), nút Yêu thích và nút Thêm vào so sánh.
  > - **Khu vực Below-the-Fold:**
  >   - Bố cục 2 cột công nghệ: Cột trái (7 cột) là **Bài viết đánh giá & Mô tả chi tiết + Hệ thống Đánh giá thực tế (Rating Breakdown 5 sao + Bộ lọc đánh giá có hình ảnh + Realtime Review Form)**; Cột phải (5 cột) là **Bảng Thông số kỹ thuật chi tiết** (dạng bảng kẻ sọc xen kẽ `#F8FAFC` / `#FFFFFF` kèm nút `"Xem cấu hình chi tiết"`).
  >   - Cuối trang là dải **Sản phẩm tương tự (Related Products)**.
  > - **Đặc biệt trên Mobile (390px):** Phải có thanh **Sticky Buy Bar** cố định ở đáy màn hình hiển thị Giá `46.990.000 ₫` + nút `Thêm giỏ` và nút `Mua ngay` màu `#E11D48`.

---

### BATCH 2: CONVERSION FUNNEL (PHỄU CHUYỂN ĐỔI GIỎ HÀNG & THANH TOÁN)

#### [MH-04] Giỏ hàng (`/cart` — Khắc phục triệt để lỗi nền tối chữ tối & giá `0 ₫`)
- **Viewports cần sinh:** `DESKTOP` (1440px — Light Mode & Dark Mode đối chiếu + Trạng thái Giỏ hàng rỗng) & `MOBILE` (390px)
- **Tool gọi ở Giai đoạn 3:** `StitchMCP:generate_screen_from_text`
- **Design Prompt chuẩn hóa cho Stitch:**
  > Thiết kế trang Giỏ hàng `/cart` của **ShopViet** theo phong cách **Hybrid Premium Tech**, khắc phục hoàn toàn lỗi nền tối chữ tối ở Light Mode và lỗi hiển thị giá `0 ₫`.
  > - **Light Mode chuẩn:** Nền trang `#F8FAFC`, khung danh sách sản phẩm (`CartContent`) và khung tóm tắt đơn hàng (`OrderSummary`) dùng nền trắng `#FFFFFF` (`bg-card`), viền `#E2E8F0` (`border-line`), chữ tiêu đề và tên sản phẩm màu `#0F172A` (`text-ink`) sắc nét, độ tương phản tuyệt đối `> 12:1`. (Kèm bản đối chiếu Dark Mode nền `#090D16`, card `#111827`, chữ `#F8FAFC`).
  > - **Thanh Tiến trình Freeship (Đồng bộ ngưỡng `500.000₫`):** Đặt ở đầu cột Tóm tắt đơn hàng, nền `#EFF6FF` viền `#2563EB/20` với thanh progress màu `#059669` (Emerald) thông báo: `"Chúc mừng! Đơn hàng của bạn được Miễn phí vận chuyển toàn quốc (Đơn từ 500.000₫)"`.
  > - **Bảng Sản phẩm trong giỏ (8 cột trái):** Hiển thị 3 sản phẩm công nghệ thực tế (`iPhone 16 Pro Max 256GB - 28.990.000 ₫`, `Sạc nhanh Apple 20W USB-C - 550.000 ₫`, `Ốp lưng MagSafe - 1.190.000 ₫`) — tất cả đều có ảnh sản phẩm rõ nét, chip phân loại (`Titan Tự Nhiên • 256GB`), đơn giá và thành tiền định dạng `tabular-nums` chính xác (tuyệt đối không có sản phẩm nào `0 ₫`), bộ tăng giảm số lượng `- 1 +` và nút xóa `<Trash2 />`.
  > - **Cột Tóm tắt đơn hàng (`OrderSummary` - 4 cột phải Sticky):** Ô nhập mã giảm giá (`TECHVIP500` + nút `Áp dụng` màu `#2563EB`), Tạm tính `30.730.000 ₫`, Giảm giá `-500.000 ₫`, Phí vận chuyển `Miễn phí (0 ₫)`, Tổng thanh toán `30.230.000 ₫` (`text-cta-crimson font-extrabold tabular-nums`), và nút CTA lớn **"Tiến hành thanh toán"** (`bg-[#E11D48] hover:bg-[#BE123C] text-white`).

---

#### [MH-05] Thanh toán (`/checkout` — Guest Checkout vs Member Checkout + VNPay/COD)
- **Viewports cần sinh:** `DESKTOP` (1440px) & `MOBILE` (390px)
- **Tool gọi ở Giai đoạn 3:** `StitchMCP:generate_screen_from_text`
- **Design Prompt chuẩn hóa cho Stitch:**
  > Thiết kế trang Thanh toán `/checkout` của **ShopViet** hỗ trợ mượt mà cả **Khách vãng lai (Guest Checkout)** và **Thành viên (Member Checkout)**.
  > - **Thanh Tiến trình Checkout (Stepper):** `1. Giỏ hàng (Hoàn tất)` -> `2. Thông tin & Thanh toán (Đang ở bước này - màu #2563EB)` -> `3. Xác nhận đơn hàng`.
  > - **Cột trái (7 cột — Thông tin giao nhận & Phương thức thanh toán):**
  >   - **Khối 1 — Địa chỉ nhận hàng:** Có nút chuyển nhanh giữa *"Chọn từ Sổ địa chỉ đã lưu"* (dạng thẻ radio chọn nhanh có nhãn `Mặc định` màu `#2563EB`) và *"Nhập địa chỉ giao hàng mới"* (Họ tên, Số điện thoại, Email nhận hóa đơn điện tử, Tỉnh/Thành phố, Quận/Huyện, Địa chỉ chi tiết, Ghi chú giao hàng).
  >   - **Khối 2 — Phương thức thanh toán:** 2 thẻ lựa chọn lớn có icon trực quan:
  >     1. **Thanh toán khi nhận hàng (COD):** Kiểm tra hàng trước khi thanh toán.
  >     2. **Thanh toán trực tuyến qua cổng VNPay (QR / Thẻ ATM / Quốc tế):** Đang được chọn với viền `#2563EB` nền `#EFF6FF` và nhãn `"Khuyên dùng • Xác nhận tức thì"`.
  > - **Cột phải (5 cột Sticky — `OrderSummary`):** Danh sách sản phẩm rút gọn có badge số lượng, chi tiết Tạm tính, Phí vận chuyển (`Miễn phí` cho đơn trên `500.000₫`), Tổng cộng `30.230.000 ₫` (`tabular-nums`), nút **"Hoàn tất đơn hàng"** (`#E11D48`) và cam kết bảo mật SSL 256-bit.

---

#### [MH-06] Xác nhận đơn hàng & Kết quả thanh toán (`/checkout/confirmation` & `/orders/confirmation`)
- **Viewports cần sinh:** `DESKTOP` (1440px) & `MOBILE` (390px)
- **Tool gọi ở Giai đoạn 3:** `StitchMCP:generate_screen_from_text`
- **Design Prompt chuẩn hóa cho Stitch:**
  > Thiết kế màn hình Xác nhận đặt hàng thành công & Kết quả giao dịch VNPay (`/checkout/confirmation` & `/orders/confirmation`) của **ShopViet**.
  > - Khối trung tâm bố cục Bento Card sang trọng: Biểu tượng Checkmark thành công màu Emerald (`#059669`), tiêu đề `"Đặt hàng thành công!"`, mã đơn hàng nổi bật `#ORD-20261019-8892` (font `JetBrains Mono` có nút Sao chép) và trạng thái thanh toán `"Đã thanh toán qua VNPay"`.
  > - Khung tóm tắt lộ trình đơn hàng (4 bước: `Đã tiếp nhận` -> `Đang đóng gói` -> `Đang vận chuyển` -> `Giao thành công`), thông tin người nhận, danh sách sản phẩm đã đặt và tổng tiền `30.230.000 ₫`.
  > - 2 nút điều hướng: `"Theo dõi đơn hàng"` (`bg-[#2563EB] text-white`) và `"Tiếp tục mua sắm"` (viền `border-border`).

---

### BATCH 3: USER ACCOUNT, WISHLIST, AUTH & UTILITY (TÀI KHOẢN, YÊU THÍCH, XÁC THỰC & TIỆN ÍCH)

#### [MH-07] Trung tâm Tài khoản (`/account`, `/account/orders`, `/account/orders/[orderId]`, `/account/returns`, `/account/addresses`)
- **Viewports cần sinh:** `DESKTOP` (1440px) & `MOBILE` (390px)
- **Tool gọi ở Giai đoạn 3:** `StitchMCP:generate_screen_from_text`
- **Design Prompt chuẩn hóa cho Stitch:**
  > Thiết kế Trung tâm Quản lý Tài khoản `/account` của **ShopViet** theo kiến trúc **Unified Member Bento**, loại bỏ hoàn toàn sự trùng lặp điều hướng giữa Sidebar và các Tab nội bộ.
  > - **Cột trái (3 cột — `AccountSidebar`):** Thẻ tóm tắt thành viên (Avatar, Họ tên `Nguyễn Minh Quân`, Email, một nhãn hạng thẻ thống nhất duy nhất `Hội viên Tech Member`) và menu dọc 4 mục (`Thông tin cá nhân`, `Đơn hàng của tôi`, `Đổi/Trả hàng`, `Sổ địa chỉ` + nút `Đăng xuất`), mục đang chọn có nền `#EFF6FF` chữ `#2563EB`.
  > - **Cột phải (9 cột — Nội dung chính hợp nhất):**
  >   - **Hàng 1 — 3 Thẻ KPI Tương tác (Clickable Navigation Cards):** `Đơn hàng của tôi` (Link tới `/account/orders`), `Yêu cầu Đổi/Trả` (Link tới `/account/returns`), `Sổ địa chỉ nhận hàng` (Link tới `/account/addresses`) với số liệu đồng bộ thực tế và mũi tên điều hướng.
  >   - **Hàng 2 — Khối Hồ sơ cá nhân & Bảo mật (Không lặp lại Avatar/Header dư thừa):** Hiển thị trực tiếp form thông tin cá nhân gọn gàng (Họ, Tên, Email cố định, Số điện thoại, Ảnh đại diện) kèm nút `"Chỉnh sửa hồ sơ"` (`#2563EB`), và khối xem nhanh **Đơn hàng gần nhất** kèm trạng thái vận chuyển trực quan.

---

#### [MH-08] Danh sách Yêu thích (`/wishlist` — Sửa lỗi nút trắng trên nền trắng Dark Mode & Thay icon Xóa)
- **Viewports cần sinh:** `DESKTOP` (1440px — Đối chiếu rõ Light Mode & Dark Mode) & `MOBILE` (390px)
- **Tool gọi ở Giai đoạn 3:** `StitchMCP:generate_screen_from_text`
- **Design Prompt chuẩn hóa cho Stitch:**
  > Thiết kế trang Danh sách Yêu thích `/wishlist` của **ShopViet** (hiển thị song song hoặc rõ nét cả **Light Mode** và **Dark Mode**), giải quyết triệt để 3 lỗi UX hiện hữu:
  > 1. **Nút chọn hàng loạt (Batch Selection):** Ở góc trên bên trái mỗi thẻ sản phẩm có một ô **Checkbox** tường minh (có thể tick chọn từng sản phẩm dễ dàng), đi kèm thanh Batch Action Bar ở trên (`"Đã chọn 2 sản phẩm"` + nút `"Thêm tất cả vào giỏ"` và `"Xóa mục đã chọn"`).
  > 2. **Nút Xóa từng món (Góc trên bên phải thẻ):** Sử dụng icon thùng rác **`Trash2`** rõ ràng (màu `#64748B`, khi hover chuyển sang đỏ `#EF4444` nền `#FEE2E2`) thay vì icon Trái tim đỏ gây nhầm lẫn nhận thức.
  > 3. **Nút CTA "Thêm vào giỏ" ở đáy mỗi thẻ:** Sử dụng nền **Tech Primary Blue (`#2563EB` ở Light Mode / `#3B82F6` ở Dark Mode)** với chữ **Trắng (`#FFFFFF`)** kèm icon giỏ hàng — đảm bảo nổi bật và đọc rõ 100% ở cả chế độ Sáng lẫn Tối (tuyệt đối không dùng chữ trắng trên nền nút trắng).

---

#### [MH-09] Cụm màn hình Xác thực (`/login`, `/register`, `/forgot-password`, `/reset-password`)
- **Viewports cần sinh:** `DESKTOP` (1440px — Split-screen Tech Auth Layout) & `MOBILE` (390px)
- **Tool gọi ở Giai đoạn 3:** `StitchMCP:generate_screen_from_text`
- **Design Prompt chuẩn hóa cho Stitch:**
  > Thiết kế cụm màn hình Đăng nhập `/login` & Đăng ký `/register` của **ShopViet** theo bố cục **Split-screen Premium Tech**:
  > - **Cột trái (50% trên Desktop — Dark Bento Brand Showcase `#0D1322`):** Hiển thị hình ảnh hệ sinh thái thiết bị công nghệ cao cấp, thông điệp `"Trải nghiệm mua sắm công nghệ chính hãng chuẩn tương lai"`, và 3 thẻ lợi ích thành viên (Bảo hành điện tử tự động, Theo dõi đơn hàng thời gian thực, Ưu đãi độc quyền).
  > - **Cột phải (50% — Auth Form Card):** Form đăng nhập/đăng ký sạch sẽ trên nền `#FFFFFF` (Light) / `#111827` (Dark), các ô input có icon dẫn hướng, nút ẩn/hiện mật khẩu, liên kết `"Quên mật khẩu?"` màu `#2563EB`, nút chính `"Đăng nhập"` (`bg-[#2563EB] hover:bg-[#1D4ED8] text-white`) và nút **"Tiếp tục với Google"** có logo Google chuẩn.

---

#### [MH-10] Trang Giới thiệu (`/about`) & Liên hệ (`/contact`)
- **Viewports cần sinh:** `DESKTOP` (1440px) & `MOBILE` (390px)
- **Tool gọi ở Giai đoạn 3:** `StitchMCP:generate_screen_from_text`
- **Design Prompt chuẩn hóa cho Stitch:**
  > Thiết kế trang Giới thiệu `/about` & Liên hệ `/contact` của hệ thống bán lẻ công nghệ **ShopViet** theo bố cục **Editorial Bento Grid**:
  > - **Khối Số liệu ấn tượng (`tabular-nums`):** `50.000+ Khách hàng tin dùng`, `100% Sản phẩm chính hãng VN/A`, `30 Ngày đổi trả lỗi NSX`, `24/7 Hỗ trợ kỹ thuật`.
  > - **Khối Liên hệ & Showroom (`/contact`):** Cột trái là danh sách Showroom trải nghiệm công nghệ (TP.HCM & Hà Nội), Hotline kỹ thuật & bảo hành, Email hỗ trợ; Cột phải là Form gửi yêu cầu hỗ trợ có phân loại chủ đề (`Tư vấn cấu hình`, `Bảo hành & Kỹ thuật`, `Đơn hàng & Doanh nghiệp B2B`) và khối FAQ câu hỏi thường gặp.

---

#### [MH-11] Trang lỗi 404 (`app/not-found.tsx`) & Các trạng thái Rỗng / Lỗi hệ thống (`Empty / Error States`)
- **Viewports cần sinh:** `DESKTOP` (1440px) & `MOBILE` (390px)
- **Tool gọi ở Giai đoạn 3:** `StitchMCP:generate_screen_from_text`
- **Design Prompt chuẩn hóa cho Stitch:**
  > Thiết kế màn hình Lỗi `404 Not Found` và bộ 3 trạng thái Empty State (`Giỏ hàng trống`, `Danh sách yêu thích trống`, `Không tìm thấy sản phẩm khớp bộ lọc`) của **ShopViet**:
  > - Minh họa đồ họa vector công nghệ tinh tế (số `404` phong cách mạch điện tử / thiết bị phần cứng với điểm nhấn `#2563EB`), thông điệp tiếng Việt thân thiện, thanh tìm kiếm nhanh ngay trên trang 404, các từ khóa gợi ý (`iPhone 16 Pro Max`, `MacBook M3`, `Tai nghe chống ồn`) và nút `"Quay về trang chủ"` (`bg-[#2563EB] text-white`).

---

## 3. BẢNG THEO DÕI TRẠNG THÁI MÀN HÌNH STITCH (STITCH TRACKING MATRIX)

Bảng dưới đây dùng để kiểm soát tiến độ sinh thiết kế ở **Giai đoạn 3** và đối chiếu nghiệm thu ở **Giai đoạn 4**:

| Mã MH | Tên màn hình & Biến thể trạng thái | Route (`ecommerce-client`) | Viewport | Batch | Trạng thái Stitch | Stitch Screen ID / Link | Ghi chú kỹ thuật & UI/UX |
|---|---|---|---|---|---|---|---|
| **MH-01D** | Trang chủ — Hybrid Bento Showcase (Desktop) | `/` | `1440px` (Desktop) | Batch 1 | `Completed` | Screen ID: `597103e45dad44cb87532067c9f25744`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1VYb2PVXhOi2zBryY7x-AfPu6xyovqWjdfA31MSq2k1gwXAiSkkUVnZmSIIcqbJVYlxBQfCOWtebXqN0HSlFqHedCQhvSnfE3E9nFdRWVoIS7kFPrbN6nsmpQLqCmatPOj_8FnIytHdzpi2hNiWKScxmDZ17H6zL7eWn1uj_5RUA3-7_4Wt1f4L9JC1kZV5Am1L3wGJY7Duojx17hpJyUHfg3-xJGsE7lB7Y4atRPQeGhR2rLfmPQRB3Yg) | Hero Dark Bento S26 Ultra + USP Freeship `500.000₫` + 8 Tech Product Cards có Spec Chips + Dropdown tìm kiếm ⌘K + VIP Privilege Club Banner. |
| **MH-01M** | Trang chủ — Hybrid Bento Showcase (Mobile) | `/` | `390px` (Mobile) | Batch 1 | `Completed` | Screen ID: `9dffad94930e4ad59d77993086fb1134`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1UKfj76m2iDs1_A6UPlcdKmLYsdCohCdjeW0dnyVmwhqfTTeDlRciO1TeluzeBa14XUF-UpJ6TQC85LI22IDGUydmrOtt4LyiMw_-kTPFr84QmpHozB7Id3IGVsqutl-zC9h3_Srwi9oNhDENi9Idtz4Z6IKXqdZIdLlneCSDFsEkHCdXmPveD3PNHT3aeTjFOuvuU0uAsoKFVbKKm6zDXAKMSX9U_rYFAyX7YFHjJi_jy5FWztW0f_fM8) | Lưới 2 cột 6 SP công nghệ thực tế (iPhone 16 Pro Max, S26 Ultra, M3, Keychron Q1 Pro...) + Dark Bento Hero + 2x2 Trust Strip + VIP TECHVIP500 + Sticky Bottom Nav 5 tabs. |
| **MH-02D** | Danh sách sản phẩm + Bộ lọc + Compare Bar (Desktop) | `/products`, `/products/[category]` | `1440px` (Desktop) | Batch 1 | `Completed` | Screen ID: `f2540aff63984ca3834c44ac6ed2c1a5`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1X-vSqlyZiIX8gjm9nvoCOxhgoYmcFvWiiZ8XzaQu5UYGiDClsYsl1vSN1UhAtBz74C4RNqgy_mVuwpqct78Mp98B4zJkgcep8W6BO4vbXrs1SrqNzNaG0nCdYGgy2IJZSoatA2bBdJol4x4J6h9RLr-JB43rhoxyCigyy2SwMIeBl8ie90AHFGlwjyTGbEVkLUSd92Pu_KHZB8DbLJdYpvScKpmzYuD5GYOn9P5Ig2LnPDTVQprZN2bYo) | 280px Filter Sidebar (giá, thương hiệu, RAM/ROM chips) + 3-col Grid 6 Tech Cards + Featured ProductListItem + Floating Compare Bar (2/4 SP) + Active Filter Pills. |
| **MH-02M** | Danh sách sản phẩm + Filter Drawer (Mobile) | `/products`, `/products/[category]` | `390px` (Mobile) | Batch 1 | `Completed` | Screen ID: `28d636253cfd4ea6a26c5404262809da`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1X4kpXFseu9fndUcmsAAtiHo1k-MlSuONIgtfX-6dRVOyw9xt-7PaCLZcbDuLdgIhTgeTVIOenEerUFPUFKL4ioeDuqXrUye4w7vZ3-U79vu7wRzwwUtihBkkgwflASc7-dqkkfghY3KeVGQeF14eQxi5vHNOs_3r89yOOfZI9FjD2I3MJ0wqZ79RS0aPEpdV0f3l0grmZXMJWLMxsqVEsyq_r4TTEX5_JI9zpki5_bKZhF9tsBPFqqwOA) | Thanh Sticky Bộ lọc + Bottom Sheet Filter Drawer (khoảng giá, thương hiệu, RAM/ROM) + nút 'Áp dụng bộ lọc (148 SP)' màu Electric Blue + Lưới 2 cột SP. |
| **MH-03D** | Chi tiết sản phẩm — PDP & Bảng thông số (Desktop) | `/product/[slug]` | `1440px` (Desktop) | Batch 1 | `Completed` | Screen ID: `77a75115633043f7b48718291cf1d615`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1XVcIyTkg-3UofOqPM40b9irx7MYDzPZJqJb0gPc7gpbG6lHcDYnbQ2K1OY9C9dYUOL1gnDyO72X6FjNgqgSS9gLR4kOmFz3ubdVxEe8KeXiLidlNbR-92eIRWur65g1dyRKQ0EbyBwEQTk5f_9BmTWAUgXScJXohrwM1OTkVXgehmAO5PMfSSVrl-tpm01ig2_2KO32wpEmoKakMtW4nYKUgFgL5zUzIskCo0lE9u_5cQLCiQ88BlrDlQ) | MacBook Pro 14" M3 Pro 18GB/512GB (46.990.000₫) + Bộ chọn màu/dung lượng viền Electric Blue + Key Specs Bento + Bảng thông số chi tiết + Đánh giá 5 sao. |
| **MH-03M** | Chi tiết sản phẩm + Sticky Buy Bar (Mobile) | `/product/[slug]` | `390px` (Mobile) | Batch 1 | `Completed` | Screen ID: `75adf4bc438341cab1e028fbfe0c5b3e`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1V1-TFgAFVj705hdbxcV3lALvMJtQIgnrZGmOnImffW-mcKvp61U661blX5A1EUGgSpCz6AbIemrFUKkB33H-rB-yk8mKHWI9k__ZGGheVoWo5oV6qRiA2d49KX0WubOjjRb4z115Y4_D0UhvkvTNWwgTJnSxh2Oy9nOKPlH62U1UO3OZbkyz0qbyeM9VMpAzxolHT8kzGmjTHzHiVjqrFDWHYke-3zLUqMWpP4cBnk5lNOF0ArhXnlTn8) | Gallery 1/4 + Thumb-friendly Variant Selectors + Accordions Specs/Reviews + **Mobile Sticky Buy Bar** cố định đáy (giá + nút Thêm giỏ + nút Mua ngay 2H). |
| **MH-03C** | So sánh sản phẩm — Product Comparison Matrix (Desktop) | `/compare` | `1440px` (Desktop) | Batch 1 | `Completed` | Screen ID: `6f321a098a8d4c6bbfd7c77a93b6085a`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1W5S-RRyvilX4B_4_1XKnOM4aUBrCZ0U0G16fX4etFou3MCca-Uclp3_5htDZQAqi_PQ_uPGcw8vjATa_Pn5pvgeSyTzIsBHA6gnPyKffz_AVjihh_YIt4-l4VgY1zOg2oyDYXTbb_-CoDgeAQBAKSu9bnnjNAXK8vx8fPM1TCC76wRWEkRaq35jjE3u6LPtvQCDAPbYeWmW0KGZS_BnkzVJYFz8S9vGbh8kzl7CdW_KFrflpxDoXh6Lg) | Ma trận so sánh 4 cột (iPhone 16 Pro Max, S26 Ultra, Xiaomi 14 Ultra + 1 ô trống) + Công tắc lọc khác biệt + Highlight thông số vượt trội + Compare Floating Tray. |
| **MH-04D** | Giỏ hàng — Có hàng, Rỗng & Freeship `500.000₫` (Desktop) | `/cart` | `1440px` (Desktop) | Batch 2 | `Completed` | Screen ID: `6a9edcbe5077430389ca8c9609d94dd9`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1Va8mUfS1ZfTp-VSw1CxqqlrOCXOupUqYjRro5AqA6pnW1HLBZAkcG2XpF0MZcJjPMJGDkPqmZcecblluc877A71STQEmN8Yv6o7pzXHURC6leQkOcGxnA9b7-1v73N5ofCRa9gFCDuhmB7dG--XbY5PX84v2DcwIv3OllvVyUk5r-57Z9mVkkgKkOMA9kExOnTdk5Fqkgw7z1S6EXKaQYh3S3YNvmlneodLXPsfKHrvRnXac-AYohomp8) | Bảng sản phẩm nền trắng `#FFFFFF` trên `#F8FAFC` (xóa triệt để lỗi nền đen chữ đen) + Freeship progress bar `500.000₫` + Voucher `TECHVIP500` + Preview EmptyCart. |
| **MH-04M** | Giỏ hàng — Tối ưu thao tác di động (Mobile) | `/cart` | `390px` (Mobile) | Batch 2 | `Completed` | Screen ID: `23f951f42dc44547a496a39d5e13ab55`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1W-XtXofwmAXBy2a0jbapEa1CVK1clU6M_P35pPSDEJVH1zuwe2qVDW_2RMqWvAYbTyrKk-GT9w7jrYaklp1Am-9wMNBA1gnhmWt_DXrCkUjV2yCkK0mPTMYBWPfLhhgW4Ei95mg-l7AmEpxE3ihdLcZHQqDsEHOS8osXB5a6oIrwGI2fiP47v5XnF-HPQtaGvNzT6FvNkQw4LzflacxKo6okcG68Z4LmXNhFhMLfQWn4PJdmMscA7d9NY) | Thẻ sản phẩm ngang gọn gàng (không tràn ngang) + Freeship bar `500.000₫` + Voucher chip + Sticky Bottom Checkout Bar (`31.680.000₫` + nút Thanh toán đỏ). |
| **MH-05D** | Thanh toán — Guest & Member Checkout (Desktop) | `/checkout` | `1440px` (Desktop) | Batch 2 | `Completed` | Screen ID: `58741753a2734ced9803e486634e5668`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1WxRWQtyJuV8sb5cILkAdQ3YLEyofyFZObU-gIlKOrvfb5Z3TYNW8QvMncnEe7DxYFgggDfXsDfU5EGTYi_7EhKTK_HT4_CPcsxE2Bcufb_GkPaZi5rytzpCCZhm2Kwx9wuE-V0q4CnZpDGKNjP2D6J3IoeI2L7zEycVVFHZ3sF-Dj8gVBJoYhi9cNriSVJtPskrKteRi5I0FBSt0_-jtCOxqqLTWGCoYL_aut3Mr7rYHWTqRvckXpD3xk) | Stepper Bước 2 + Toggle Khách vãng lai vs Thành viên + 3 dropdown Tỉnh/Quận/Phường + VNPAY/COD Radio Cards + OrderSummary 3 món. |
| **MH-05M** | Thanh toán — Guest & Member Checkout (Mobile) | `/checkout` | `390px` (Mobile) | Batch 2 | `Completed` | Screen ID: `39f7e49abc2e4a7d9c18c5fdcddd1d9b`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1Vq7eVvgJbGUiCQYBGa3VMM2XsLtsqF76c95vS4UczvhrF1vcfjn0-W2fLobGpaLNeDkmeqCcxvwwg2EWDYMimZryePLYKKEUiNvDh3VKCeq-Nar3iBmXqtzWGNEMHpFvutu-50gxTL0AWshuwFBUrCmIez3mdbaiEIBQNE9GjcO063py_pGrMiFcEZDcM9yyc1IMRemic-mNnqqaaRBftCbUJFgrWiryuXf-gZkJtBl4jI4M7YLWtumQ) | Form 1 cột + Collapsible Order Summary Accordion ở đầu trang + VNPAY/COD + Sticky Bottom Bar (`31.680.000₫` + Hoàn tất đơn hàng). |
| **MH-06D** | Xác nhận đơn hàng & Kết quả VNPay (Desktop) | `/checkout/confirmation`, `/orders/confirmation` | `1440px` (Desktop) | Batch 2 | `Completed` | Screen ID: `9ddad5b6c6c34fe68d019e507289d0fd`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1UY_FpyW7em6QQSuipwTfSYhDyalitzOBTqjaO59MaGzO5cpJfGdcG_LIKjjLvSl-18-V0nU_sJWaVAPcAxEN909VfCOwF4_ZCQbo3IVx7o1Mlne6qFsJ8oJq3_ZoK1MiYVNwzC3rEEw4Ywr0LqzynEclNgnHJlJ3wjy9nwGMj2SHB1Rq-EoeTUbdZqxexcKYIAasn7oc82alIWS5yzWWpr0uCVfGXQe1xoAJdhpFaDeeTWzOtGrGOHo_0) | Dual State hiển thị song song 2 cột: Case A Thành công (check xanh, mã #ORD, VNP14298834, lộ trình 4 bước) + Case B Thất bại (Mã 24, Thử lại VNPAY / Đổi sang COD). |
| **MH-06M** | Xác nhận đơn hàng & Kết quả VNPay (Mobile) | `/checkout/confirmation`, `/orders/confirmation` | `390px` (Mobile) | Batch 2 | `Pending` | *(Chờ Giai đoạn 3)* | Tối ưu hiển thị mã đơn `JetBrains Mono` & CTA theo dõi đơn |
| **MH-07D** | Tài khoản — Profile & Addresses (Desktop) | `/account`, `/account/addresses` | `1440px` (Desktop) | Batch 3 | `Completed` | Screen ID: `c43a82a3b08a4d29a2f0faf2284b7305`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1XRaW5qNdYocBhQ2eimbzz9CER05gZMC3lVWJV3JHL2aYIP9dECSdktoS95v6nAq5x0b9pUEgKNsF7C-gEhTzE1yX-I4p9X32WIeMjzVXNKRPxWqqGzZz-OlYDpybr6Jph8kk2trD_On6cQ2wM0odO6QdGZGDuRZnyUA-GdVU0mHU3b_OaW9sfW5mjP3xHVKXzeSW0O9WlPGz-4qr32heUYpXWodiKZNsyd03lJt413ervyPKZHoOkaha8) | Sidebar 300px chuẩn hóa (Avatar 'NA' không tràn chữ, VIP Diamond 1.250 điểm) + 3 KPI Cards + Form thông tin cá nhân xác thực OTP + Sổ địa chỉ (Nhà riêng mặc định & Công ty). |
| **MH-07D-ORD** | Tài khoản — Quản lý & Chi tiết đơn hàng (Desktop) | `/account/orders`, `/account/orders/[orderId]` | `1440px` (Desktop) | Batch 3 | `Completed` | Screen ID: `482c0279e4ee48339bc41be5ae1c6d9a`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1WlozqzKSf3YVCp40WQVgenEheni_Yb5uNXDLkIxECaWEgl3HqJh1SysU6O274s-gCdOD_G6hhRpmShJ5DA7UvhdywJ92PEkRFfF-3anqjFXqPdOhN_ZX6j727rVA_tJcn9KruCeJelwG7E8OiT3G-JzFHENHv9gWtV6lbfLGKy64sk0-rKns70xb6jfWz92rwibf2LPRYALofDdmbeFGxAw4wwvZRigPemHvgXH3hYU1zsn7nh2N9abA) | Sidebar 'Đơn hàng' Active + Tab lọc trạng thái + Tìm kiếm + Chi tiết đơn #ORD-8892 (GHN8492048VN, Stepper 4 bước, MacBook M3 & Magic Mouse 3, tổng 48.980.000₫ VNPAY). |
| **MH-07D-RET** | Tài khoản — Quản lý & Chi tiết đổi trả hàng (Desktop) | `/account/returns`, `/account/returns/[returnId]` | `1440px` (Desktop) | Batch 3 | `Completed` | Screen ID: `5e799a7d10c64e5486c98bc3d9a0e789`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1XHmX-37AgrgmYJptK8Ka7VvMymoMV2s1EIg3UP0W66jdjSBWu7NH50MnoJNz0GpUzu732hXkgQ-XdLA-uMqdYLFguZ7w62NqvtVr7dw5fkao_l7WygexeQG9xYfGKf_b0GpI5KhinER_hD2_pLRRjmkzBIDYYvpjA2DX7gNYkfLIZ11wAzuBkgXlsxiVy22xejwaULXAMa1J6k52aV2ceLdba9x2V7Of7M7gQcJtvcsMdjr6KZizlacg) | Sidebar 'Đổi/Trả' Active + Phiếu #RET-104 (Đã duyệt - Chờ nhận hàng, Stepper 5 bước, Anker Prime 100W GaN, bằng chứng ảnh/video, GHN thu hồi tận nhà miễn phí). |
| **MH-07M** | Tài khoản — Horizontal Pill Nav & Order Cards (Mobile) | `/account/*` | `390px` (Mobile) | Batch 3 | `Pending` | *(Chờ Giai đoạn 3)* | Thanh Pill cuộn ngang + Danh sách đơn hàng dạng thẻ |
| **MH-08D** | Yêu thích — Chuẩn Light/Dark Mode & Batch Select (Desktop) | `/wishlist` | `1440px` (Desktop) | Batch 3 | `Completed` | Screen ID: `b59aacc012304151b567a806999d1e3a`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1WO99zMAZJHvcfmNoGFLDxDMf3nHTuX7TyymB3_ZfhAPTlDI-rWCwUprB39Mz2Jv5LhVCAS9mE8bekUGEazTww1of9hM25QEqetpr6YahrC8QtRoIYD09DbKHssX3eCEbWVuDg-CLi-JamG0ThVGOGh577Y0pGGqEUeyP4HHlZ3DjDuHNQMqCrplzSd7JMxoPUeZrVtvWY07J3Gd7kLBPmS1PTKxN1t4Y3DHvRMLgBF7n76SR2T8zAyPg) | Bulk Action Bar (chọn tất cả/riêng lẻ, thêm giỏ/xóa loạt) + Icon Trash2 xóa khỏi wishlist (loại bỏ nhầm lẫn tim) + Nút 'Thêm vào giỏ' Electric Blue tương phản cao + 4 SP công nghệ. |
| **MH-08M** | Yêu thích — Chuẩn Light/Dark Mode (Mobile) | `/wishlist` | `390px` (Mobile) | Batch 3 | `Pending` | *(Chờ Giai đoạn 3)* | Lưới 2 cột + Batch Action Bar cố định |
| **MH-09D** | Xác thực — Split-Screen Login, Register, Forgot Password (Desktop) | `/login`, `/register`, `/forgot-password` | `1440px` (Desktop) | Batch 3 | `Completed` | Screen ID: `b5b352e93f524296be8c966594aaa4e4`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1VS2VdcIVFWQWXFFgtiSdeHfVawJwRDRXUiZ00xMkLRPFfIOhlTINgLV66fflPIpOv8g_zWcD4mIZ_sdqgOmDJXreYZFhZ3d9gWEKuL4a6PqCR5zmjX9azTA57U_J5Yon5LtG9vW2y6rTb0sbZr-n0ToG20ISKnZOtoEdc6lGbEAqr2vGb-pyLioKwm30Mwi1xDXJYqQT9GNrjkaVHb-2hSHdBXzppAjAQgbrNQIMs0hpQ7GU4uUMTzxvY) | Split-screen 50/50: Nửa trái Dark Bento Thẻ VIP Black Diamond 3D + 4 đặc quyền thành viên; Nửa phải Card Form Đăng nhập/Đăng ký tabs, Google OAuth lớn, form inputs, SSL 256-bit. |
| **MH-09M** | Xác thực — Login & Register (Mobile) | `/login`, `/register` | `390px` (Mobile) | Batch 3 | `Pending` | *(Chờ Giai đoạn 3)* | Form tập trung, nút bấm chuẩn `44px` touch target |
| **MH-10D** | Giới thiệu & Liên hệ Showroom công nghệ (Desktop) | `/about`, `/contact` | `1440px` (Desktop) | Batch 3 | `Completed` | Screen ID: `1c6c9409dbcf4fc7b7be4b0bf7b0aee5`<br>[Xem Screenshot](https://lh3.googleusercontent.com/aida/AEtjO1U_z4CM4NoSfy0wn0sEZNwG04gm-qb_BNfYJIF86XP6nWcsAJ7W8DYlfbtexnh5QN9TxLYlRvOKihd_sd2M2VLG52IgOuI-i7xp6uKPL2sb0T2h9rFfHQVKK8DYtcdKWMetLWh5CD9SC8661jk5eNq8nqZqlZUed3N94Wt2FMvsem0AcWTylN1dTZ2WFYwFobMIb-3_PKDSslVj2pyN0sfyAqW4kOTtYdQLiscN1cGIp22ZpKciqGJOCiw) | Dark Tech Hero + 4 KPI stats uy tín + Showroom Hà Nội (48 Tố Hữu) & TP.HCM (157 Khánh Hội) + Hotline 0975 431 485 + Interactive Map + Form yêu cầu B2B/Bảo hành phản hồi 2h. |
| **MH-10M** | Giới thiệu & Liên hệ Showroom công nghệ (Mobile) | `/about`, `/contact` | `390px` (Mobile) | Batch 3 | `Pending` | *(Chờ Giai đoạn 3)* | Bố cục xếp chồng 1 cột + Nút gọi nhanh Hotline |
| **MH-11D** | Trang lỗi 404 & Bộ trạng thái Empty / Error States (Desktop) | `not-found.tsx` | `1440px` (Desktop) | Batch 3 | `Pending` | *(Chờ Giai đoạn 3)* | Vector 404 công nghệ + Ô tìm kiếm nhanh + Gợi ý danh mục |
| **MH-11M** | Trang lỗi 404 & Bộ trạng thái Empty / Error States (Mobile) | `not-found.tsx` | `390px` (Mobile) | Batch 3 | `Pending` | *(Chờ Giai đoạn 3)* | Tối ưu hiển thị gọn gàng trên màn hình dọc |

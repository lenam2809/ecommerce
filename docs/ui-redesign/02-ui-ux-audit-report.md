# GIAI ĐOẠN 2 - BƯỚC 2B: BÁO CÁO PHÂN TÍCH LỖI UI/UX & NGUYÊN NHÂN GỐC RỄ (ROOT-CAUSE AUDIT REPORT)

> **Dự án:** ShopViet E-Commerce — `apps/frontend/ecommerce-client` (Next.js 15 + Tailwind CSS v4)  
> **Cơ sở dữ liệu đối chiếu:** `docs/ui-redesign/01-current-state-inventory.md` & Source Code thực tế  
> **Định hướng mục tiêu:** Hybrid Premium Tech (Chuẩn công nghệ cao cấp, phân cấp thị giác sắc nét, đồng bộ Light/Dark Mode 100%)

---

## 1. TỔNG QUAN PHÂN LOẠI MỨC ĐỘ NGHIÊM TRỌNG (SEVERITY MATRIX)

| Mã lỗi | Hạng mục / Màn hình | Mô tả tóm tắt vấn đề | Mức độ | Tác động UX & Chuyển đổi |
|---|---|---|---|---|
| **BUG-01** | Giỏ hàng (`/cart`) | Nền tối `#131926` + chữ tối `text-ink` khi ở Light Mode làm mất khả năng đọc bảng sản phẩm & tóm tắt đơn | **Critical (P0)** | Khách hàng ở Light Mode không đọc được tên SP, giá tiền và tổng thanh toán -> Bỏ giỏ hàng |
| **BUG-02** | Yêu thích (`/wishlist`) | Nút "Thêm vào giỏ" hiển thị nền trắng (`bg-ink`) + chữ trắng (`dark:text-foreground`) khi ở Dark Mode | **Critical (P0)** | Mất hoàn toàn nhãn CTA chuyển đổi chính từ Wishlist sang Giỏ hàng trên nền tối |
| **BUG-03** | Toàn hệ thống (`ProductCard`, `Cart`, `Checkout`, `Wishlist`) | Khung ảnh trống trơn / 404 do thiếu file `public/placeholder.svg` và đường dẫn ảnh seed không khớp | **Critical (P0)** | Phá vỡ niềm tin thương hiệu công nghệ, giao diện trông như bị lỗi tải trang |
| **BUG-04** | Giỏ hàng (`/cart`) & Thanh toán (`/checkout`) | Một số sản phẩm hiển thị đơn giá và thành tiền `0 ₫` trong giỏ hàng và trang thanh toán | **Critical (P0)** | Sai lệch dữ liệu tài chính nghiêm trọng ở bước chốt đơn |
| **BUG-05** | Hệ màu nền tảng (`app/globals.css` & JSX) | Biến CSS lệch tông ấm/hồng nâu (`#906f70`, `#5c3f40`) trộn lẫn với hơn 45 vị trí gán cứng mã hex (`#131926`, `#e11d48`) | **High (P1)** | Giao diện thiếu tính nhất quán công nghệ, đứt gãy khi chuyển đổi Light/Dark Mode |
| **BUG-06** | Topbar, Trang chủ vs Giỏ hàng, Thanh toán | Mâu thuẫn ngưỡng Freeship: Topbar & Trang chủ ghi `2.000.000₫` nhưng logic tính phí ở Giỏ hàng & Checkout là `500.000₫` | **High (P1)** | Gây hoang mang cho người mua về chính sách vận chuyển và giá trị đơn hàng tối thiểu |
| **BUG-07** | Tài khoản (`/account/*`) | Trùng lặp điều hướng & thông tin giữa `AccountSidebar`, các thẻ KPI giả (`page.tsx`) và cấu trúc `*-tab.tsx` nội bộ | **High (P1)** | Dư thừa thông tin, mâu thuẫn hạng thẻ (`VIP Diamond` vs `Active Standard Account`), tốn diện tích màn hình |
| **BUG-08** | Yêu thích (`/wishlist`) | Dùng icon trái tim đỏ (`Heart`) làm nút xóa từng món kết hợp vùng click chọn hàng loạt không tường minh | **Medium (P2)** | Nhầm lẫn nhận thức (Cognitive Friction): icon trái tim đỏ mang nghĩa "Đang thích", không phải "Xóa" |
| **BUG-09** | Thẻ sản phẩm (`product-card.tsx`, `product-list-item.tsx`) | Thiếu thông số kỹ thuật cốt lõi (Spec Chips), thiếu nút So sánh (`AddToComparison`) và badge Bảo hành trên Card | **Medium (P2)** | Chưa đạt chuẩn chuỗi bán lẻ công nghệ (CellphoneS/ThinkPro/Apple), người dùng phải mở từng trang để xem cấu hình |
| **BUG-10** | Chi tiết sản phẩm (`/product/[slug]`) trên Mobile | Chưa có thanh **Sticky Buy Bar** cố định ở đáy màn hình Mobile khi cuộn đọc thông số dài | **Medium (P2)** | Giảm tỷ lệ chuyển đổi trên thiết bị di động (390px) khi người dùng cuộn xuống phần đánh giá/thông số |

---

## 2. PHÂN TÍCH CHI TIẾT NGUYÊN NHÂN GỐC RỄ (ROOT-CAUSE ANALYSIS)

### 2.1. Nhóm Critical (P0) — Lỗi hiển thị & dữ liệu nghiêm trọng

#### [BUG-01] Lỗi nền tối chữ tối ở `/cart` khi bật Light Mode (Dark-on-Dark Contrast Failure)
- **Tệp và dòng code gây lỗi:**
  1. [`apps/frontend/ecommerce-client/components/cart/CartContent.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/cart/CartContent.tsx#L44) (dòng **44**):
     ```tsx
     <div className="bg-[#131926] rounded-2xl border border-white/8 overflow-hidden shadow-md">
     ```
  2. [`apps/frontend/ecommerce-client/components/cart/OrderSummary.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/cart/OrderSummary.tsx#L52) (dòng **52**, **110**, **134**):
     ```tsx
     // Dòng 52:
     <aside className="bg-[#131926] rounded-3xl border border-white/8 overflow-hidden sticky top-28 shadow-lg">
     // Dòng 110 (Khung tiến độ Freeship):
     <div className="bg-[#181c24] rounded-2xl border border-white/8 p-3.5 space-y-2.5">
     // Dòng 134 (Ô nhập mã giảm giá):
     className="h-10 rounded-full border-white/10 bg-[#0b0f17] text-tiny text-ink placeholder:text-ink-faint focus-visible:ring-brand/40"
     ```
- **Nguyên nhân gốc rễ:**
  - Các container cha của bảng giỏ hàng (`CartContent`) và cột tóm tắt đơn hàng (`OrderSummary`) bị gán cứng mã màu nền tối `bg-[#131926]`, `bg-[#181c24]`, `bg-[#0b0f17]` và viền `border-white/8` (không có tiền tố `dark:`).
  - Trong khi đó, toàn bộ các phần tử chữ bên trong (`CartContent.tsx:47` `text-ink-faint`, `CartItem.tsx:73, 92, 129, 145` `text-ink`, `OrderSummary.tsx:56, 75, 83, 102` `text-ink`) lại sử dụng biến semantic `--ink`.
  - Khi ở **Light Mode**, `--ink` trong [`app/globals.css`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/globals.css#L161) có giá trị `240 4% 11%` (`#1B1B1D` — màu đen đậm). Kết quả là chữ màu đen `#1B1B1D` hiển thị trực tiếp trên nền xanh đen `#131926` (tỷ lệ tương phản `< 1.15:1`, hoàn toàn không thể đọc được).
- **Hướng khắc phục (Design System Spec):**
  - Xóa bỏ toàn bộ mã hex cứng `#131926`, `#181c24`, `#0b0f17` và `border-white/8`.
  - Thay bằng semantic classes: `bg-card border-line` cho khung chính, `bg-surface border-line` cho khung Freeship và input.

---

#### [BUG-02] Lỗi nút "Thêm vào giỏ" trắng trên nền trắng ở `/wishlist` khi bật Dark Mode (White-on-White Button)
- **Tệp và dòng code gây lỗi:**
  - [`apps/frontend/ecommerce-client/components/wishlist/wishlist-item.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/wishlist/wishlist-item.tsx#L120-L127) (dòng **120–127**, cụ thể tại dòng **122**):
    ```tsx
    <AddToCartButton
        productId={product.productId}
        className="w-full mt-2 h-11 rounded-full bg-ink text-background hover:bg-brand dark:text-foreground dark:hover:text-white hover:text-white border-0 transition-colors"
    >
        Thêm vào giỏ
    </AddToCartButton>
    ```
- **Nguyên nhân gốc rễ:**
  - Trong [`app/globals.css`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/globals.css#L190-L234) ở khối `.dark`:
    - `--ink` (dòng **231**) được định nghĩa là `210 40% 98%` (`#F8FAFC` — màu trắng sáng). Do đó `bg-ink` tạo ra nền nút màu trắng sáng khi ở Dark Mode.
    - `--background` (dòng **189**) là `222 47% 7%` (`#090D16` — màu tối), lẽ ra `text-background` đã giúp chữ có màu tối trên nền trắng `bg-ink`.
    - Tuy nhiên, lập trình viên lại ghi đè thêm class `dark:text-foreground` ở dòng **122**, mà `--foreground` trong `.dark` (dòng **190**) cũng là `210 40% 98%` (`#F8FAFC` — màu trắng sáng)!
    - Hậu quả: Nút có nền `#F8FAFC` (`bg-ink`) và chữ `#F8FAFC` (`dark:text-foreground`) -> Trắng hoàn toàn trên nền trắng khi bật Dark Mode.
- **Hướng khắc phục (Design System Spec):**
  - Chuẩn hóa nút CTA trong `WishlistItem` theo đúng phân cấp màu công nghệ: sử dụng `bg-tech-blue text-white hover:bg-tech-blue-hover` hoặc `bg-cta-crimson text-white hover:bg-cta-crimson-hover` (không bao giờ trộn `bg-ink` với `dark:text-foreground`).

---

#### [BUG-03] Lỗi khung ảnh trống trơn / 404 khi ảnh sản phẩm lỗi hoặc thiếu (`Missing Image Fallback`)
- **Tệp và dòng code gây lỗi:**
  1. Hàm chuẩn hóa ảnh [`apps/frontend/ecommerce-client/lib/image.ts`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/lib/image.ts#L6-L9) (dòng **8**):
     ```ts
     export function normalizeImageUrl(src?: string | null): string {
         if (!src) return "/placeholder.svg"
     ```
  2. Các sự kiện `onError` trên khắp các component:
     - [`components/product-card.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/product-card.tsx#L99) (dòng **99**): `onError={() => setImgSrc("/placeholder.svg")}`
     - [`components/product-list-item.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/product-list-item.tsx#L71) (dòng **71**): `onError={() => setImgSrc("/placeholder.svg")}`
     - [`components/wishlist/wishlist-item.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/wishlist/wishlist-item.tsx#L95) (dòng **95**): `onError={() => setImgSrc("/placeholder.svg")}`
     - [`components/cart/CartItem.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/cart/CartItem.tsx#L48) (dòng **48**): `onError={() => setImgSrc("/placeholder.svg")}`
     - [`components/checkout/order-item.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/checkout/order-item.tsx#L29) (dòng **29**): `onError={() => setImgSrc("/placeholder.svg")}`
     - [`components/account/profile-tab.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/account/profile-tab.tsx#L92) (dòng **92**, **190**): `src={userData.avatar || "/placeholder.svg"}`
- **Nguyên nhân gốc rễ (Kép):**
  1. **Thiếu tài nguyên tĩnh ở Frontend:** Thư mục `apps/frontend/ecommerce-client/public/` hoàn toàn **không có file `placeholder.svg`**. Khi ảnh gốc lỗi và `onError` chuyển `imgSrc` sang `"/placeholder.svg"`, trình duyệt tiếp tục nhận lỗi `404 Not Found` cho `/placeholder.svg`, khiến thẻ `<Image>` của Next.js hiển thị khung rỗng hoặc icon broken image của trình duyệt.
  2. **Sai lệch dữ liệu Seed ở Backend:** Trong [`ApplicationDbContextSeed.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/ApplicationDbContextSeed.cs#L790-L1313), các sản phẩm seed dùng chuỗi `"products/apple_iphone_15_pro_256gb-20260323132839160-67905a.jpg"`, nhưng thư mục thực tế `Ecommerce.WebAPI/wwwroot/uploads/products/` chỉ chứa các file đặt tên theo quy chuẩn mới (ví dụ: `iphone-16-pro-max-256gb-main.jpg`).
- **Hướng khắc phục (Design System Spec):**
  - Tạo file vector chuẩn công nghệ `public/placeholder.svg` (biểu tượng thiết bị công nghệ tối giản trên nền Slate/Obsidian).
  - Xây dựng component `<TechImageFallback />` (hoặc trạng thái `hasError` trong `ProductCard`/`CartItem`) hiển thị icon thiết bị + tên danh mục/thương hiệu tinh tế khi ảnh lỗi thay vì phụ thuộc hoàn toàn vào ảnh 404.

---

#### [BUG-04] Nguyên nhân một số sản phẩm hiển thị giá `0 ₫` trong Giỏ hàng & Thanh toán
- **Tệp và dòng code gây lỗi:**
  1. **Xử lý hiển thị ở ProductCard (Đúng):** Tại [`components/product-card.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/product-card.tsx#L36-L38) (dòng **36–38**):
     ```tsx
     const hasSalePrice = Boolean(product.salePrice && product.salePrice > 0 && product.salePrice < product.price)
     const displayPrice = hasSalePrice ? product.salePrice! : product.price
     ```
     Ở ngoài trang danh sách/trang chủ, nếu một sản phẩm trong DB có ` salePrice = 0 ` (thay vì `null`), `ProductCard` kiểm tra `product.salePrice > 0` nên bỏ qua số `0` và hiển thị `product.price` bình thường.
  2. **Xử lý tính giá ở Backend Cart (Sai khi `SalePrice == 0`):**
     - [`AddToCartCommandHandler.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Cart/Commands/AddToCart/AddToCartCommandHandler.cs#L113) (dòng **113**): `Price = i.Product.SalePrice ?? i.Product.Price`
     - [`GetCartQueryHandler.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Cart/Queries/GetCart/GetCartQueryHandler.cs#L59) (dòng **59**): `Price = i.Product.SalePrice ?? i.Product.Price`
     - [`RedisGuestCartService.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Services/RedisGuestCartService.cs#L80) (dòng **80**): `Price = product.SalePrice ?? product.Price`
     - [`CartItem.cs` (Domain Entity)](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Domain/Entities/CartItem.cs#L59) (dòng **59**): `public decimal UnitPrice => Product?.SalePrice ?? Product?.Price ?? 0;`
     Khi sản phẩm được tạo/cập nhật trong DB với `SalePrice = 0m` (không phải `null`), toán tử `??` (null-coalescing) trong C# đánh giá `0m` là khác `null`, nên trả về `UnitPrice = 0`!
  3. **Xử lý map dữ liệu ở Frontend Cart & Checkout:**
     - [`hooks/use-cart.ts`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/hooks/use-cart.ts#L28) (dòng **28**): `price: item.unitPrice ?? item.price ?? 0`
     - [`components/cart/CartItem.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/cart/CartItem.tsx#L92) (dòng **92**, **145**) và [`components/checkout/order-item.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/checkout/order-item.tsx#L48-L51) (dòng **48**, **51**) render trực tiếp `formatPrice(item.price)` mà không có cơ chế phòng vệ khi `unitPrice === 0`.
- **Hướng khắc phục:**
  - Tại Frontend (`hooks/use-cart.ts:28`): Bổ sung logic bảo vệ ưu tiên giá hợp lệ `const validUnitPrice = (item.unitPrice && item.unitPrice > 0) ? item.unitPrice : (item.price && item.price > 0 ? item.price : item.originalPrice ?? 0)` và hiển thị nhãn cảnh báo nếu dữ liệu giá từ API bị lỗi. (Ghi chú: Backend cũng cần sửa `SalePrice > 0 ? SalePrice.Value : Price` trong giai đoạn tích hợp nếu được phép, hoặc xử lý triệt để ở tầng mapper frontend nếu giữ nguyên ràng buộc chỉ sửa UI).

---

### 2.2. Nhóm High (P1) — Đứt gãy hệ thống thiết kế & Mâu thuẫn thông tin

#### [BUG-05] Biến màu CSS lệch tông ấm/hồng nâu trong `app/globals.css` & Mã màu Hex gán cứng trong JSX
- **Tệp và dòng code gây lỗi (`app/globals.css`):**
  - [`apps/frontend/ecommerce-client/app/globals.css`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/globals.css#L179-L185) (dòng **179–185**):
    ```css
    --surface-container: #f0eff1;
    --surface-container-high: #eae9eb;
    --on-surface: #1b1b1d;
    --on-surface-variant: #5c3f40; /* Ám nâu đỏ */
    --outline: #906f70;            /* Ám hồng nâu đất */
    --outline-variant: #e5bdbe;    /* Ám hồng phấn */
    --primary-container: #ffdad9;  /* Hồng đào */
    ```
  - Các biến Material Design 3 được sinh tự động từ seed màu đỏ khiến toàn bộ hệ màu phụ (`--outline`, `--outline-variant`, `--on-surface-variant`) bị ám hồng nâu (`#906f70`, `#5c3f40`), đối chọi gay gắt với phong cách công nghệ sắc lạnh (Slate/Zinc).
- **Bảng kiểm kê toàn bộ vị trí gán cứng mã màu Hex trong JSX (`apps/frontend/ecommerce-client`):**

| STT | File | Dòng | Mã Hex cứng đang dùng | Ngữ cảnh hiện tại | Semantic Token thay thế (Chuẩn mới) |
|---|---|---|---|---|---|
| 1 | [`app/page.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/page.tsx#L62) | 62 | `dark:bg-[#131926]`, `dark:text-[#f8fafc]`, `dark:hover:bg-[#1c2028]` | Nút "Xem tất cả" trên trang chủ | `bg-card text-foreground hover:bg-elevated border-border` |
| 2 | [`app/page.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/page.tsx#L84) | 84 | `bg-[#e11d48]`, `hover:bg-[#be123c]` | Nút "Khám phá thêm sản phẩm" | `bg-tech-blue hover:bg-tech-blue-hover text-white` (Action điều hướng) |
| 3 | [`components/hero.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/hero.tsx#L37) | 37, 105 | `bg-[#e11d48]/10`, `bg-[#e11d48]/20` | Quầng sáng blur trang trí Hero | `bg-tech-blue/15` kết hợp `bg-cta-crimson/10` |
| 4 | [`components/hero.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/hero.tsx#L45-L46) | 45, 46 | `text-[#e11d48]`, `border-[#e11d48]/20` | Badge "Thế hệ công nghệ mới 2026" | `bg-tech-blue-soft text-tech-blue border-tech-blue/20` |
| 5 | [`components/hero.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/hero.tsx#L51) | 51 | `dark:text-[#f8fafc]` | Tiêu đề H1 Hero | `text-foreground` (hoặc `text-white` trong Dark Bento) |
| 6 | [`components/hero.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/hero.tsx#L64) | 64 | `bg-[#e11d48]`, `hover:bg-[#be123c]` | Nút CTA chính trên Hero | `bg-cta-crimson hover:bg-cta-crimson-hover text-white` |
| 7 | [`components/hero.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/hero.tsx#L72) | 72 | `dark:bg-[#131926]`, `dark:text-[#f8fafc]`, `dark:hover:bg-[#1c2028]` | Nút phụ trên Hero | `bg-card hover:bg-elevated text-foreground border-border` |
| 8 | [`components/hero.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/hero.tsx#L81-L93) | 81, 87, 93 | `bg-[#e11d48]/10 text-[#e11d48]` | Icon cam kết chính hãng/bảo hành | `bg-tech-blue-soft text-tech-blue` |
| 9 | [`components/hero.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/hero.tsx#L123-L130) | 123, 124, 129, 130 | `dark:bg-[#0b0f17]/85`, `dark:text-[#f8fafc]`, `bg-[#e11d48]`, `text-[#e11d48]` | Floating glass badges trên ảnh Hero | `bg-card/90 text-foreground`, icon `text-tech-blue` |
| 10 | [`components/header/index.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/header/index.tsx#L102) | 102 | `dark:bg-[#17181b]`, `dark:text-[#a1a1aa]`, `dark:border-[#2c2d33]` | Top Announcement Bar | `bg-surface text-muted-foreground border-border` |
| 11 | [`components/features-section.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/features-section.tsx#L36-L46) | 36, 42, 46 | `dark:bg-[#131926]`, `bg-[#e11d48]/10`, `text-[#e11d48]`, `dark:text-[#f8fafc]` | Khối 4 cam kết dịch vụ (USP) | `bg-card border-border`, icon `bg-tech-blue-soft text-tech-blue` |
| 12 | [`components/category-section.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/category-section.tsx#L171-L200) | 171, 176, 200 | `from-[#0b0f17]/95`, `bg-[#0b0f17]/75`, `group-hover:text-[#fb7185]` | Bento Category Card overlay | `from-obsidian-950/90`, hover `group-hover:text-tech-blue-light` |
| 13 | [`components/product-card.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/product-card.tsx#L56-L167) | 56, 60, 64, 82, 104, 105, 129, 152, 167 | `dark:bg-[#131926]`, `dark:hover:bg-[#1c2028]`, `bg-[#e11d48]`, `dark:bg-[#181f2e]`, `bg-[#0b0f17]/75`, `dark:text-[#f8fafc]` | Toàn bộ bề mặt, badge, giá và nút trên `ProductCard` | Chuyển 100% sang `bg-card`, `hover:bg-elevated`, `bg-surface`, `text-cta-crimson` (giá/sale), `text-tech-blue` (hover title/specs) |
| 14 | [`components/product-card-skeleton.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/product-card-skeleton.tsx#L5-L7) | 5, 7 | `dark:bg-[#131926]`, `dark:bg-[#181f2e]` | Skeleton loading của ProductCard | `bg-card border-border`, khung ảnh `bg-surface` |
| 15 | [`components/promotion-banner.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/promotion-banner.tsx#L25-L85) | 25, 28, 32, 37, 38, 42, 48, 54, 59, 79, 85 | `bg-[#131926]`, `text-[#f8fafc]`, `bg-[#e11d48]`, `text-[#fb7185]`, `hover:bg-[#be123c]` | Privilege VIP Banner | Sử dụng token `.theme-dark-bento` (`bg-bento-dark text-bento-dark-fg`) + `bg-cta-crimson` |
| 16 | [`components/cart/CartContent.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/cart/CartContent.tsx#L44) | 44 | `bg-[#131926]` | Bảng sản phẩm trong giỏ hàng | `bg-card border-border` |
| 17 | [`components/cart/OrderSummary.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/cart/OrderSummary.tsx#L52-L134) | 52, 110, 134 | `bg-[#131926]`, `bg-[#181c24]`, `bg-[#0b0f17]` | Tóm tắt đơn hàng, thanh Freeship, ô Coupon | `bg-card`, `bg-surface`, `bg-background border-border` |

*(Lưu ý: Các mã màu thương hiệu mạng xã hội trong `components/footer.tsx:38,47`, `app/(routes)/contact/page.tsx:241-245` và logo Google OAuth trong `components/auth/google-login-button.tsx:44-56` là màu nhận diện của bên thứ ba nên được phép giữ nguyên).*

---

#### [BUG-06] Mâu thuẫn thông tin Freeship (2.000.000₫ vs 500.000₫)
- **Tệp và dòng code gây lỗi:**
  1. **Nhóm báo ngưỡng `2.000.000₫` (Sai lệch với logic tính toán):**
     - [`components/header/index.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/header/index.tsx#L107) (dòng **107**):
       ```tsx
       <span>Miễn phí vận chuyển toàn quốc cho đơn từ 2.000.000₫</span>
       ```
     - [`components/features-section.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/features-section.tsx#L9) (dòng **9**):
       ```tsx
       description: "Đơn hàng từ 2.000.000₫ toàn quốc",
       ```
  2. **Nhóm áp dụng logic tính toán thực tế `500.000₫`:**
     - [`components/cart/CartHeader.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/cart/CartHeader.tsx#L44) (dòng **44**): `"Miễn phí vận chuyển cho đơn hàng từ 500.000₫ • Đổi trả miễn phí trong 30 ngày"`
     - [`components/cart/OrderSummary.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/cart/OrderSummary.tsx#L49) (dòng **49**): `const FREE_SHIPPING_THRESHOLD = 500000`
     - [`components/checkout/order-totals.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/checkout/order-totals.tsx#L18) (dòng **18**): `const FREE_SHIPPING_THRESHOLD = 500000`
     - [`app/(routes)/checkout/page.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/%28routes%29/checkout/page.tsx#L66) (dòng **66**): `const shippingCost = subtotal > 500000 ? 0 : 30000`
- **Hướng khắc phục:**
  - Khai báo hằng số dùng chung `FREE_SHIPPING_THRESHOLD = 500000` trong `lib/contants.ts` và đồng bộ toàn bộ văn bản trên Topbar (`components/header/index.tsx:107`), USP (`components/features-section.tsx:9`), Cart và Checkout về cùng một con số `500.000₫`.

---

#### [BUG-07] Sự trùng lặp điều hướng và mâu thuẫn thông tin giữa `AccountSidebar` và nội dung `/account`
- **Tệp và dòng code gây lỗi:**
  1. [`app/(routes)/account/layout.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/%28routes%29/account/layout.tsx#L28-L35) (dòng **28–35**) và [`components/account/account-sidebar.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/account/account-sidebar.tsx#L24-L117) (dòng **24–29**, **51–60**, **97–117**):
     - Hiển thị Avatar, Họ tên, Email của người dùng (dòng **51–60**) và 4 mục điều hướng (`Thông tin cá nhân`, `Đơn hàng của tôi`, `Đổi/Trả hàng`, `Địa chỉ`).
  2. [`app/(routes)/account/page.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/%28routes%29/account/page.tsx#L69-L134) (dòng **69–134**):
     - Dòng **70–89**: Hiển thị banner `"Hội Viên VIP Diamond • Tích lũy 2.450 điểm thưởng"`.
     - Dòng **92–125**: Hiển thị 3 thẻ `"Đơn hàng: 12"`, `"Đổi / Trả: 1"`, `"Hạng thẻ: VIP Diamond"`. Các con số `12` và `1` là **dữ liệu giả gán cứng (hardcoded)**, hoàn toàn không lấy từ `useMyOrders()` hay `returnService.getMyReturns()`, lặp lại tên danh mục của `AccountSidebar` nhưng lại là thẻ `<div>` tĩnh (không click để chuyển sang `/account/orders` hay `/account/returns` được).
  3. [`components/account/profile-tab.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/account/profile-tab.tsx#L58-L104) (dòng **58–104**):
     - Được đặt tên và thiết kế như một Tab nội bộ (`{/* Tab header */}` ở dòng **59**), tiếp tục hiển thị lại Avatar + Họ tên lần thứ hai trên cùng một màn hình (dòng **89–104**), và gắn nhãn cứng `"Active Standard Account"` (dòng **101**) — **mâu thuẫn trực tiếp** với nhãn `"Hội Viên VIP Diamond"` ngay phía trên ở `account/page.tsx:78`!
- **Hướng khắc phục (Design System Spec):**
  - Hợp nhất khu vực đầu trang `/account` thành một **Member Bento Header** duy nhất (gồm Avatar lớn, thông tin tài khoản thực tế, nút Chỉnh sửa nhanh, và các thẻ KPI có gắn `<Link>` điều hướng tới `/account/orders`, `/account/returns`, `/account/addresses` với số liệu thực hoặc trạng thái đồng bộ).
  - Loại bỏ khối重复 Avatar/Name trong `ProfileTab` (`profile-tab.tsx:89-104`) để phần thân đi thẳng vào lưới thông tin hồ sơ & bảo mật.

---

### 2.3. Nhóm Medium (P2) — Trải nghiệm nhận thức (Cognitive UX) & Mật độ thông tin công nghệ

#### [BUG-08] Dùng icon Trái tim (`Heart`) làm nút Xóa trong `/wishlist` & Xung đột vùng click chọn
- **Tệp và dòng code gây lỗi:**
  1. [`components/wishlist/wishlist-item.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/wishlist/wishlist-item.tsx#L42-L53) (dòng **42–53**):
     ```tsx
     <Button
         size="icon"
         variant="ghost"
         onClick={() => onRemove(product.productId)}
         className="h-8 w-8 rounded-full bg-white/80 dark:bg-card/80 backdrop-blur-md text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xs"
         aria-label="Xóa khỏi yêu thích"
     >
         <Heart className="h-4 w-4 fill-red-500" />
     </Button>
     ```
  2. [`components/wishlist/wishlist-client.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/wishlist/wishlist-client.tsx#L164-L179) (dòng **164–179**):
     ```tsx
     <div
         key={product.productId}
         className="relative"
         onClick={() => handleSelectItem(product.productId)}
     >
         ...
         <div onClick={(e) => e.stopPropagation()}>
             <WishlistItem product={product} onRemove={removeFromWishlist} />
         </div>
     </div>
     ```
- **Nguyên nhân gốc rễ:**
  - **Nhầm lẫn nhận thức:** Ở trang `/wishlist`, tất cả sản phẩm đều đã nằm trong danh sách yêu thích. Việc đặt nút `<Heart className="fill-red-500" />` ở góc trên bên phải thẻ khiến người dùng chỉ nhìn thấy trạng thái "Đã thích" chứ không nhận ra đó là nút "Xóa", trong khi thanh công cụ phía trên (`wishlist-client.tsx:136`) lại dùng icon thùng rác `<Trash2 />` cho hành động "Xóa".
  - **Vô hiệu hóa chọn nhiều mục (Dead Click Handler):** Tại `wishlist-client.tsx:167`, `onClick={() => handleSelectItem(product.productId)}` được gắn ở `div` ngoài, nhưng ngay bên trong (`dòng 174`), `<div onClick={(e) => e.stopPropagation()}>` lại bọc kín 100% diện tích của `<WishlistItem />`! Hệ quả là người dùng **không bao giờ click chọn từng sản phẩm được** (chỉ có thể bấm "Chọn tất cả" ở dòng 147).
- **Hướng khắc phục (Design System Spec):**
  - Thay icon `<Heart />` trên thẻ `WishlistItem` bằng nút `<Trash2 />` (hoặc `<X />` kèm tooltip "Xóa khỏi yêu thích") rõ ràng.
  - Hiển thị một ô Checkbox chọn sản phẩm tường minh ở góc trên bên trái mỗi thẻ `WishlistItem` (truyền prop `isSelected` và `onSelectChange` vào `WishlistItem`) thay vì dùng `stopPropagation()` nuốt sự kiện.

---

#### [BUG-09] Thiếu Spec Chips, Bảo hành và nút So sánh trên `ProductCard` & `ProductListItem`
- **Tệp và dòng code gây lỗi:**
  - [`components/product-card.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/product-card.tsx#L1-L177) và [`components/product-list-item.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/product-list-item.tsx#L1-L148).
  - [`components/add-to-comparison-button.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/add-to-comparison-button.tsx#L1-L116) đã được xây dựng hoàn chỉnh (đồng bộ `localStorage` + custom event `comparisonUpdated`), nhưng hiện **chưa được gắn vào `ProductCard` hay `ProductListItem`**.
- **Nguyên nhân gốc rễ:**
  - `ProductCard` hiện tại được thiết kế theo kiểu thời trang/tối giản (chỉ có Ảnh, Category, Tên, Sao, Giá và nút `+`), bỏ phí dữ liệu `specifications`, `colors`, `sizes`, `brandName` có sẵn từ API.
- **Hướng khắc phục (Design System Spec):**
  - Nâng cấp lên **Hybrid Premium Tech Product Card**: bổ sung hàng **Tech Spec Chips** (2–3 thông số cốt lõi hoặc biến thể dung lượng/màu sắc), badge **Chính hãng / Bảo hành**, nút **So sánh (`AddToComparisonButton`)** cạnh nút Yêu thích, và hiển thị giá `tabular-nums` sắc nét.

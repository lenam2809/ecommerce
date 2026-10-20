# GIAI ĐOẠN 2 - BƯỚC 2B: ĐẶC TẢ HỆ THỐNG THIẾT KẾ (HYBRID PREMIUM TECH DESIGN SYSTEM SPECIFICATION)

> **Dự án:** ShopViet E-Commerce — `apps/frontend/ecommerce-client`  
> **Định hướng thẩm mỹ:** **Hybrid Premium Tech** — Kết hợp bố cục Bento Grid thoáng đãng, sắc lạnh của **Apple Store / ThinkPro** với mật độ thông tin kỹ thuật & hiệu suất chuyển đổi cao của **CellphoneS / GearVN**.  
> **Nền tảng kỹ thuật:** Tailwind CSS v4 (`@import "tailwindcss";` + `@theme inline`) & `next-themes` (`attribute="class"`).

---

## 1. TRIẾT LÝ THỊ GIÁC & NGUYÊN TẮC PHÂN VAI MÀU SẮC (COLOR ARCHITECTURE)

Để giải quyết triệt để cảm giác "thời trang/mỹ phẩm" khi lạm dụng màu đỏ hồng trên toàn trang và khắc phục hoàn toàn lỗi tương phản Light/Dark Mode, hệ màu của ShopViet được cấu trúc theo **Nguyên tắc Phân Vai Kép (Dual-Accent Tech Hierarchy)**:

1. **Bề mặt Trung tính Sắc lạnh (Cold Slate & Deep Obsidian):**
   - **Light Mode (Mặc định gốc):** Sử dụng nền trang **Cool Alabaster Slate (`#F8FAFC`)** kết hợp thẻ sản phẩm **Pure White (`#FFFFFF`)** và vùng đệm thông số **Slate Subtle (`#F1F5F9`)**, viền sắc nét `#E2E8F0`. Tuyệt đối loại bỏ các mã màu ấm/hồng nâu (`#906f70`, `#5c3f40`).
   - **Dark Mode (Ánh xạ 1-1):** Phân tầng 3 lớp độ sâu rõ rệt theo chuẩn **Deep Obsidian**:
     - Lớp 0 (Page Background): `#090D16` (Obsidian 950)
     - Lớp 1 (Card / Container Surface): `#111827` (Slate/Gray 900)
     - Lớp 2 (Sub-surface / Spec Chip / Input): `#182234` (Obsidian 850)
     - Lớp 3 (Elevated / Hover / Dropdown): `#1E293B` (Slate 800)
   - **Vùng nhấn Dark Bento (`.theme-dark-bento`):** Dành riêng cho **Hero Showcase** và **Privilege VIP Banner** để luôn giữ vẻ sang trọng của thiết bị phần cứng cao cấp ngay cả khi trang đang ở Light Mode.

2. **Màu Chủ đạo Công nghệ (`Tech Primary / Interactive Accent` — Electric Blue):**
   - Light Mode: `#2563EB` (Blue 600) | Dark Mode: `#3B82F6` (Blue 500).
   - **Vai trò:** Liên kết điều hướng, trạng thái active của bộ lọc, viền biến thể sản phẩm đang chọn (RAM/ROM/Màu sắc), tab chỉ mục, icon cam kết công nghệ, badge "Chính hãng / Bảo hành 12–24 tháng", nút "So sánh" đang active và focus ring.

3. **Màu Hành động Chuyển đổi (`Action / Conversion CTA` — Tech Crimson):**
   - Light & Dark Mode: `#E11D48` (Rose/Crimson 600) -> Hover: `#BE123C` (Crimson 700).
   - **Vai trò độc quyền:** Chỉ dùng cho **Nút Mua ngay / Thanh toán / Thêm vào giỏ chính**, **Giá bán khuyến mãi**, **Badge % Giảm giá** và **Flash Sale**. Không dùng làm màu viền input, màu tab hay màu icon trang trí thông thường.

---

## 2. BẢNG SEMANTIC TOKENS & CSS VARIABLES (TAILWIND CSS V4)

### 2.1. Bảng ánh xạ 1-1 giữa `:root` (Light Mode) và `.dark` (Dark Mode)

| Nhóm Token | Biến CSS (`app/globals.css`) | Class Tailwind v4 | Light Mode (`:root`) | Dark Mode (`.dark`) | Mục đích sử dụng chuẩn |
|---|---|---|---|---|---|
| **Surfaces** | `--background` / `--bg` | `bg-background` | `#F8FAFC` (`210 40% 98%`) | `#090D16` (`222 42% 6%`) | Nền tổng thể của trang (`<body>`) |
| | `--card` | `bg-card` | `#FFFFFF` (`0 0% 100%`) | `#111827` (`221 39% 11%`) | Nền `ProductCard`, `CartContent`, `OrderSummary`, Modal |
| | `--surface` | `bg-surface` | `#F1F5F9` (`210 40% 96.1%`) | `#182234` (`219 37% 15%`) | Nền khung ảnh SP, Spec Chips, ô tìm kiếm, bảng thông số |
| | `--surface-2` / `--elevated` | `bg-elevated` / `bg-surface-2` | `#E2E8F0` (`214 32% 91.4%`) | `#1E293B` (`217 33% 17.5%`) | Trạng thái hover của Card, Skeleton, Secondary Button |
| | `--bento-dark` | `bg-bento-dark` | `#0D1322` (Cố định nền tối) | `#111827` | Nền khối Hero Bento & Privilege VIP Banner |
| **Typography** | `--foreground` / `--ink` | `text-foreground` / `text-ink` | `#0F172A` (`222 47% 11%`) | `#F8FAFC` (`210 40% 98%`) | Tiêu đề chính, tên sản phẩm, tổng tiền |
| | `--ink-soft` / `--muted-foreground` | `text-ink-soft` / `text-muted-foreground` | `#475569` (`215 19% 35%`) | `#94A3B8` (`215 20% 65%`) | Mô tả phụ, thông số kỹ thuật, nhãn trường form |
| | `--ink-faint` | `text-ink-faint` | `#64748B` (`215 16% 47%`) | `#64748B` (`215 16% 47%`) | Giá gạch ngang, breadcrumb, placeholder, timestamp |
| **Borders** | `--border` / `--line` | `border-border` / `border-line` | `#E2E8F0` (`214 32% 91%`) | `#1E293B` (`217 33% 17.5%`) | Viền mặc định của Card, Table, Sidebar, Input |
| | `--line-strong` | `border-line-strong` | `#CBD5E1` (`213 27% 84%`) | `#334155` (`215 25% 27%`) | Viền khi hover Card hoặc trạng thái focus nhẹ |
| **Tech Primary** | `--tech-blue` / `--primary` | `bg-tech-blue` / `text-tech-blue` / `border-tech-blue` | `#2563EB` (`221 83% 53%`) | `#3B82F6` (`217 91% 60%`) | Active Filter, Selected Variant, Warranty Badge, Links |
| | `--tech-blue-hover` | `hover:bg-tech-blue-hover` | `#1D4ED8` (`224 76% 48%`) | `#60A5FA` (`213 94% 68%`) | Hover cho nút/liên kết công nghệ |
| | `--tech-blue-soft` | `bg-tech-blue-soft` | `#EFF6FF` (`214 100% 97%`) | `rgba(59, 130, 246, 0.14)` | Nền badge Chính hãng, nền Spec Chip được highlight |
| **Conversion CTA** | `--cta-crimson` / `--brand` | `bg-cta-crimson` / `text-cta-crimson` | `#E11D48` (`347 77% 50%`) | `#E11D48` (`347 77% 50%`) | Nút Mua ngay / Thanh toán, Giá khuyến mãi, Badge `-XX%` |
| | `--cta-crimson-hover` / `--brand-hover` | `hover:bg-cta-crimson-hover` | `#BE123C` (`345 83% 41%`) | `#F43F5E` (`350 89% 60%`) | Trạng thái hover của nút Mua ngay / Thanh toán |
| | `--cta-crimson-soft` / `--brand-soft` | `bg-cta-crimson-soft` | `#FFF1F2` (`356 100% 97%`) | `rgba(225, 29, 72, 0.15)` | Nền nhãn tiết kiệm tiền, nền cảnh báo sale |
| **Status** | `--success` | `text-success` / `bg-success-soft` | `#059669` (Emerald 600) | `#10B981` (Emerald 500) | Còn hàng (`In Stock`), Đã giao hàng, Freeship đạt ngưỡng |
| | `--warning` | `text-warning` / `bg-warning-soft` | `#D97706` (Amber 600) | `#F59E0B` (Amber 500) | Sắp hết hàng (`Low Stock <= 5`), Sao đánh giá (`#F59E0B`) |
| | `--destructive` / `--danger` | `text-destructive` / `bg-destructive` | `#DC2626` (Red 600) | `#EF4444` (Red 500) | Lỗi form validation, nút Xóa giỏ hàng / Hủy đơn |

### 2.2. Cấu trúc khai báo chuẩn cho `app/globals.css` (Dùng cho Giai đoạn Thực thi Code)

```css
:root {
  /* Surfaces - Cold Slate */
  --background: 210 40% 98%;          /* #F8FAFC */
  --foreground: 222 47% 11%;          /* #0F172A */
  --card: 0 0% 100%;                  /* #FFFFFF */
  --card-foreground: 222 47% 11%;     /* #0F172A */
  --popover: 0 0% 100%;               /* #FFFFFF */
  --popover-foreground: 222 47% 11%;  /* #0F172A */
  --surface: 210 40% 96.1%;           /* #F1F5F9 */
  --surface-2: 214 32% 91.4%;         /* #E2E8F0 */

  /* Typography */
  --ink: 222 47% 11%;                 /* #0F172A */
  --ink-soft: 215 19% 35%;            /* #475569 */
  --ink-faint: 215 16% 47%;           /* #64748B */

  /* Borders */
  --border: 214 32% 91%;              /* #E2E8F0 */
  --input: 214 32% 91%;               /* #E2E8F0 */
  --line: 214 32% 91%;                /* #E2E8F0 */
  --line-strong: 213 27% 84%;         /* #CBD5E1 */

  /* Tech Primary (Electric Blue) */
  --tech-blue: 221 83% 53%;           /* #2563EB */
  --tech-blue-hover: 224 76% 48%;     /* #1D4ED8 */
  --tech-blue-soft: 214 100% 97%;     /* #EFF6FF */
  --ring: 221 83% 53%;                /* #2563EB */

  /* Conversion CTA (Tech Crimson) */
  --brand: 347 77% 50%;               /* #E11D48 */
  --brand-hover: 345 83% 41%;         /* #BE123C */
  --brand-soft: 356 100% 97%;         /* #FFF1F2 */
}

.dark {
  /* Surfaces - Deep Obsidian 3-Tier */
  --background: 222 42% 6%;           /* #090D16 */
  --foreground: 210 40% 98%;          /* #F8FAFC */
  --card: 221 39% 11%;                /* #111827 */
  --card-foreground: 210 40% 98%;     /* #F8FAFC */
  --popover: 217 33% 17.5%;           /* #1E293B */
  --popover-foreground: 210 40% 98%;  /* #F8FAFC */
  --surface: 219 37% 15%;             /* #182234 */
  --surface-2: 217 33% 17.5%;         /* #1E293B */

  /* Typography */
  --ink: 210 40% 98%;                 /* #F8FAFC */
  --ink-soft: 215 20% 65%;            /* #94A3B8 */
  --ink-faint: 215 16% 47%;           /* #64748B */

  /* Borders */
  --border: 217 33% 17.5%;            /* #1E293B */
  --input: 217 33% 17.5%;             /* #1E293B */
  --line: 217 33% 17.5%;              /* #1E293B */
  --line-strong: 215 25% 27%;         /* #334155 */

  /* Tech Primary (Cyber Indigo / Blue) */
  --tech-blue: 217 91% 60%;           /* #3B82F6 */
  --tech-blue-hover: 213 94% 68%;     /* #60A5FA */
  --tech-blue-soft: 217 91% 16%;      /* Dark Blue Tint */
  --ring: 217 91% 60%;                /* #3B82F6 */

  /* Conversion CTA (Tech Crimson) */
  --brand: 347 77% 50%;               /* #E11D48 */
  --brand-hover: 350 89% 60%;         /* #F43F5E */
  --brand-soft: 347 77% 16%;          /* Dark Crimson Tint */
}
```

---

## 3. QUY CHUẨN TYPOGRAPHY (TECH EDITORIAL TYPE SCALE)

- **Font Family:**
  - **Primary Sans (`--font-sans`):** `'Plus Jakarta Sans'`, `'Inter'`, `-apple-system`, `sans-serif` — Độ mở chữ rộng, hỗ trợ dấu tiếng Việt hoàn hảo, hiện đại chuẩn công nghệ.
  - **Tech Mono (`--font-mono`):** `'JetBrains Mono'`, `monospace` — Dùng cho Mã đơn hàng (`#ORD-2026...`), SKU sản phẩm, Mã giảm giá (`TECHVIP500`) và cột thông số kỹ thuật chuyên sâu.
- **Quy tắc bắt buộc cho chữ số (`tabular-nums`):**
  - Mọi thành phần hiển thị **Giá tiền (`28.990.000 ₫`)**, **Phần trăm giảm giá (`-15%`)**, **Số lượng trong giỏ**, **Điểm đánh giá (`4.9`)** và **Thông số kỹ thuật (`256GB`, `120Hz`)** bắt buộc áp dụng `font-variant-numeric: tabular-nums` (class `tabular-nums`) để các con số thẳng hàng dọc tuyệt đối trong lưới sản phẩm và bảng thanh toán.

| Token Class | Kích thước (Desktop -> Mobile) | Line Height | Font Weight | Letter Spacing | Ứng dụng chuẩn |
|---|---|---|---|---|---|
| `text-display` | `48px` (`3rem`) -> `32px` (`2rem`) | `1.12` | `800` (ExtraBold) | `-0.03em` | Tiêu đề Hero Bento Showcase |
| `text-h1` | `34px` (`2.125rem`) -> `26px` (`1.625rem`) | `1.20` | `700` (Bold) | `-0.025em` | Tên sản phẩm trên trang PDP (`/product/[slug]`), Tiêu đề trang |
| `text-h2` | `24px` (`1.5rem`) -> `20px` (`1.25rem`) | `1.28` | `700` (Bold) | `-0.02em` | Tiêu đề các Section (`Sản phẩm nổi bật`, `Thông số kỹ thuật`) |
| `text-h3` | `18px` (`1.125rem`) -> `16px` (`1rem`) | `1.35` | `600` (SemiBold) | `-0.015em` | Tiêu đề khối Bento, Tên nhóm Filter, Tiêu đề Modal |
| `text-card-title`| `14px` (`0.875rem`) | `1.40` | `600` (SemiBold) | `-0.01em` | Tên sản phẩm trong `ProductCard` (`line-clamp-2`, chiều cao cố định `2.8em`) |
| `text-price-lg` | `26px` (`1.625rem`) -> `22px` (`1.375rem`) | `1.15` | `800` (ExtraBold) | `-0.02em` | Giá bán chính trên trang PDP & Tổng cộng đơn hàng (`tabular-nums`) |
| `text-price-card`| `17px` (`1.0625rem`) -> `15px` (`0.9375rem`)| `1.20` | `700` (Bold) | `-0.01em` | Giá bán trên `ProductCard` (`tabular-nums text-cta-crimson`) |
| `text-body` | `15px` (`0.9375rem`) | `1.60` | `400` / `500` | `0em` | Nội dung bài viết mô tả sản phẩm, đánh giá, form input |
| `text-small` | `13px` (`0.8125rem`) | `1.45` | `500` (Medium) | `0em` | Menu điều hướng, nhãn bộ lọc, thông tin phụ trong giỏ hàng |
| `text-spec-chip` | `11px` (`0.6875rem`) | `1.20` | `600` (SemiBold) | `0.01em` | Chữ bên trong **Product Spec Chips** (`8GB/256GB`, `Màn 6.7"`, `Chính hãng`) |

---

## 4. SPACING, BORDER RADIUS, ELEVATION & BENTO GRID LAYOUT

1. **Container & Grid System:**
   - Max-width chuẩn: `1344px` (`max-w-[84rem]`), padding ngang `16px` (Mobile 390px), `24px` (Tablet 768px), `32px` (Desktop 1440px).
   - **Bento Grid (Homepage & Category Showcase):**
     - Khoảng cách lưới (`gap`): `16px` (`gap-4`) trên Mobile, `20px` (`gap-5`) trên Desktop.
     - Tổ hợp Bento 12 cột trên Desktop: Khối Hero chính chiếm `8 cột` + 2 khối Tech Deal phụ xếp dọc chiếm `4 cột`; hoặc lưới Danh mục 4 cột cân xứng với chiều cao chuẩn `280px`–`340px`.
   - **Product Listing Grid:**
     - Desktop (`1440px`, có Sidebar lọc `280px`): **3 hoặc 4 cột** (`grid-cols-3 xl:grid-cols-4 gap-4`).
     - Desktop (`1440px`, toàn chiều rộng trên Trang chủ): **4 cột** (`lg:grid-cols-4 gap-5`).
     - Tablet (`768px`): **3 cột** (`md:grid-cols-3 gap-4`).
     - Mobile (`390px`): **2 cột** (`grid-cols-2 gap-3`) — tối ưu mật độ hiển thị 2 sản phẩm song song chuẩn TMĐT Việt Nam.

2. **Border Radius (Bo góc chuẩn phần cứng công nghệ):**
   - Khối Bento lớn / Banner / Form Container: `rounded-2xl` (`16px`) hoặc `rounded-3xl` (`24px`).
   - `ProductCard` / `CartItem` / `OrderSummary`: `rounded-2xl` (`16px`) — gọn gàng, cứng cáp hơn kiểu bo tròn quá đà.
   - Nút bấm (Buttons) & Input: `rounded-xl` (`12px`) cho các nút chức năng/mua hàng công nghệ để tạo cảm giác vững chãi, hiện đại; `rounded-full` chỉ dùng cho **Filter Pills**, **Status Badges** và **Search Bar**.
   - `Product Spec Chips`: `rounded-md` (`6px`) — tạo hình khối kỹ thuật vuông vức, tách biệt rõ với badge khuyến mãi tròn.

3. **Elevation & Performance Guardrails:**
   - **Light Mode:** `shadow-[0_1px_3px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.02)]`, khi hover nâng lên `shadow-[0_10px_25px_-5px_rgba(15,23,42,0.08)]` kèm viền `border-line-strong`.
   - **Dark Mode:** Không dùng bóng đổ đen mờ vô nghĩa; phân tách độ nổi bằng **1px Border Highlight (`border-[#1E293B]` -> hover `border-[#334155]` hoặc `border-tech-blue/40`)** và nâng sáng nền từ `#111827` lên `#182234`.
   - **Quy tắc hiệu năng (`@tanstack/react-virtual`):** Tuyệt đối KHÔNG dùng `backdrop-blur` trên từng `ProductCard` để bảo đảm tốc độ cuộn 60fps. Chỉ dùng `backdrop-blur-md` trên Sticky Header, Mobile Sticky Buy Bar và Floating Compare Bar.

---

## 5. ĐẶC TẢ CHI TIẾT CÁC CORE COMPONENTS (COMPONENT SPECIFICATIONS)

### 5.1. Header Hệ thống (`components/header/index.tsx`)
1. **Top Announcement Bar (Chiều cao `36px`):**
   - Nền `bg-surface border-b border-border text-ink-soft text-xs`.
   - **Đồng bộ thông điệp Freeship:** `"Miễn phí vận chuyển toàn quốc cho đơn từ 500.000₫"` (khớp 100% với logic `FREE_SHIPPING_THRESHOLD = 500000` ở Giỏ hàng & Thanh toán), đi kèm badge `"Bảo hành chính hãng 100%"` và `"Đổi trả 30 ngày"`.
2. **Main Sticky Header (Chiều cao `72px` Desktop / `60px` Mobile):**
   - Logo **ShopViet** kèm nhãn phụ `TECH STORE` màu `text-tech-blue`.
   - Nút **Danh mục sản phẩm (Mega Menu Trigger)** có icon `Grid` + viền `border-border bg-surface hover:border-tech-blue`.
   - **Thanh tìm kiếm thông minh (`Search ⌘K`):**
     - Rộng tối đa `480px`, nền `bg-surface focus-within:bg-card focus-within:border-tech-blue focus-within:ring-2 focus-within:ring-tech-blue/20`.
     - Hiển thị phím tắt `<kbd>⌘K</kbd>` ở góc phải; khi gõ hoặc focus mở **Instant Search Dropdown** hiển thị từ khóa xu hướng + danh sách sản phẩm gợi ý có ảnh thumbnail, giá `tabular-nums` và spec ngắn.
   - **Cụm Action Icons:** So sánh (kèm badge số lượng), Yêu thích (badge), Thông báo SignalR realtime (badge), Giỏ hàng (badge nổi bật `bg-cta-crimson`), Chuyển đổi Light/Dark Mode và Tài khoản.

### 5.2. Tech Product Card — Grid & List (`product-card.tsx` & `product-list-item.tsx`)
Mỗi thẻ `ProductCard` được cấu trúc thành **5 tầng thông tin chuẩn chuỗi bán lẻ công nghệ** (tất cả chiều cao các tầng được cố định để các thẻ trong cùng một hàng luôn bằng nhau tuyệt đối):

```
+---------------------------------------------------+
| [-15%] (Crimson)             [Chính hãng] (Blue)  | <- Tầng 1: Top Badges & Quick Actions
|                                     [♥]   [⇄]     |    (Yêu thích + Thêm vào so sánh)
|                                                   |
|              [ ẢNH SẢN PHẨM 1:1 ]                 | <- Khung ảnh bg-surface (hoặc TechImageFallback)
|                                                   |
+---------------------------------------------------+
| APPLE • Đã bán 124                                | <- Tầng 2: Brand (Tech Blue) + Social Proof
| iPhone 16 Pro Max 256GB Chính hãng VN/A           | <- Tên SP (2 dòng cố định, hover:text-tech-blue)
| [256GB]  [Titan Tự Nhiên]  [Apple A18 Pro]        | <- Tầng 3: Tech Spec Chips (Tối đa 3 chips)
| ★ 4.9 (42 đánh giá)            • Còn hàng (Xanh)  | <- Tầng 4: Rating + Tình trạng kho
| 28.990.000 ₫                   +----------------+ | <- Tầng 5: Giá bán (Crimson tabular-nums)
| 34.990.000 ₫ (gạch ngang)      | [Giỏ hàng +]   | |    + Nút Thêm nhanh vào giỏ
+---------------------------------------------------+
```

- **Quy tắc trích xuất dữ liệu cho `Product Spec Chips` (`components/product-spec-chips.tsx`):**
  - Tự động đọc từ đối tượng `product`:
    1. Nếu `product.specifications` có phần tử: lấy 2–3 giá trị đầu tiên (`spec.value`).
    2. Nếu danh sách ngoài chưa trả về `specifications`: trích xuất thông minh từ `product.sizes` (ví dụ dung lượng `256GB`, `512GB`), `product.colors` (số màu sắc: `4 màu`), `product.brandName` và phân tích regex tên sản phẩm (`/\b(\d+GB|\d+TB|\d+Hz|\d+W|M\d\s?(?:Pro|Max)?|i\d-\d+\w*|RTX\s?\d+)\b/gi`) kết hợp badge mặc định `BH Chính hãng`.
- **Nút Hành động nhanh ở góc ảnh:**
  - Gồm 2 nút tròn xếp dọc (`32x32px`): `<AddToWishlistButton />` (Icon Trái tim) và `<AddToComparisonButton />` (Icon `Scale` / `GitCompare` đổi sang nền `bg-tech-blue text-white` khi sản phẩm đã được thêm vào danh sách so sánh).

### 5.3. Component Ảnh Dự Phòng (`TechImageFallback` & `/placeholder.svg`)
- Tạo file tĩnh `public/placeholder.svg` (biểu tượng thiết bị công nghệ vector sắc nét trên nền `#F1F5F9` / `#182234`).
- Khi ảnh sản phẩm bị lỗi (`onError`) hoặc `mainImage` rỗng, hiển thị khung fallback có:
  - Icon vector đại diện theo danh mục (`Smartphone`, `Laptop`, `Headphones`, `Watch`, hoặc `Cpu`).
  - Nhãn phụ `text-[11px] font-medium text-ink-faint`: `"Chưa có ảnh thực tế"` kèm tên thương hiệu `product.brandName`, đảm bảo không bao giờ xuất hiện khung rỗng hay icon ảnh vỡ của trình duyệt.

### 5.4. Thanh Mua Hàng Cố Định Trên Mobile (`StickyBuyBar` — Trang PDP)
- Chỉ hiển thị trên màn hình `< 768px` (`md:hidden`) khi người dùng cuộn qua khỏi khu vực nút mua chính trên trang `/product/[slug]`.
- Chiều cao `68px`, cố định ở đáy màn hình (`fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-4 py-2.5 shadow-lg`).
- Bố cục:
  - Bên trái: Giá hiện tại (`text-cta-crimson font-extrabold tabular-nums text-base`) + Biến thể đang chọn (`Màu • Dung lượng`, `text-tiny text-ink-soft`).
  - Bên phải: Nút **Thêm vào giỏ** (viền `border-tech-blue text-tech-blue`) + Nút **Mua ngay** (`bg-cta-crimson text-white font-semibold`).

### 5.5. Thanh So Sánh Nổi (`CompareFloatingBar` — `components/product-comparison.tsx`)
- Khi người dùng bấm nút **So sánh (`⇄`)** trên bất kỳ `ProductCard` nào (lắng nghe sự kiện `comparisonUpdated` từ `localStorage`), hiển thị một thanh bar thu gọn ở cạnh dưới màn hình (`bottom-4` trên Desktop, `bottom-[76px]` trên Mobile):
  - Hiển thị tối đa 4 ô sản phẩm đã chọn (Ảnh nhỏ + Tên + nút `×` xóa nhanh).
  - Nút **"So sánh ngay (X/4)"** màu `bg-tech-blue text-white` mở Drawer/Modal bảng đối chiếu thông số kỹ thuật chi tiết và nút **"Xóa tất cả"**.

### 5.6. Chuẩn hóa Wishlist Card (`components/wishlist/wishlist-item.tsx`)
- **Nút chọn hàng loạt (Batch Selection):** Đặt `Checkbox` rõ ràng ở **góc trên bên trái** khung ảnh (`top-3 left-3 z-20`) — bỏ hoàn toàn kiểu bọc `stopPropagation()` gây liệt click.
- **Nút xóa từng món:** Đặt ở **góc trên bên phải** khung ảnh (`top-3 right-3 z-20`) sử dụng icon thùng rác **`<Trash2 className="h-4 w-4" />`** (màu `text-ink-soft hover:text-destructive hover:bg-destructive/10`), thay thế hoàn toàn icon Trái tim gây nhầm lẫn.
- **Nút CTA "Thêm vào giỏ":** Sử dụng `bg-tech-blue text-white hover:bg-tech-blue-hover dark:bg-tech-blue dark:text-white` — nổi bật, rõ chữ 100% ở cả Light Mode lẫn Dark Mode.

---

## 6. QUY TẮC ĐÁP ỨNG ĐA THIẾT BỊ (RESPONSIVE BREAKPOINT RULES)

| Thành phần UI | Desktop (`1440px`) | Tablet (`768px`) | Mobile (`390px`) |
|---|---|---|---|
| **Header & Điều hướng** | Full Topbar + Search Bar rộng + Mega Menu ngang + Đầy đủ Action Icons | Thu gọn Topbar 1 dòng + Search Bar vừa + Drawer Menu | Topbar 1 thông điệp Freeship + Logo + Nút Search mở hộp thoại + Hamburger Drawer |
| **Hero Bento Showcase** | Lưới Bento 12 cột (8 cột Banner chính + 4 cột 2 thẻ Deal công nghệ phụ) | Xếp chồng: Banner chính 100% + 2 thẻ Deal phụ chia 2 cột ngang | Xếp chồng 1 cột: Banner chính gọn + 2 thẻ Deal cuộn ngang hoặc 2 cột nhỏ |
| **Trang Danh sách (`/products`)** | Sidebar Bộ lọc cố định bên trái (`280px`) + Lưới 3–4 cột sản phẩm bên phải | Bộ lọc ẩn vào nút **"Bộ lọc (Filter Drawer)"** + Lưới 3 cột sản phẩm | Thanh công cụ Sticky (`Bộ lọc` + `Sắp xếp`) + Lưới **2 cột** sản phẩm (`gap-3`) |
| **Thẻ Sản phẩm (`ProductCard`)** | Đầy đủ: Ảnh `p-4`, 3 Spec Chips, Giá + Giá gốc, Nút `+` hoặc `Thêm vào giỏ` | Đầy đủ: Ảnh `p-3`, 2 Spec Chips, Giá + Nút `+` | Tối ưu mật độ: Ảnh `p-2.5`, 2 Spec Chips ngắn gọn, Giá `15px` + Nút icon giỏ hàng `32x32px` |
| **Chi tiết SP (`/product/[slug]`)** | 2 cột (`5 cột` Gallery + `7 cột` Mua hàng & Biến thể) + Bảng thông số 2 cột bên dưới | 2 cột cân bằng (`6-6`) | 1 cột dọc + **Sticky Buy Bar** cố định ở đáy màn hình |
| **Giỏ hàng (`/cart`) & Checkout** | 2 cột (`8 cột` Danh sách SP / Form giao hàng + `4 cột` Sticky `OrderSummary`) | 1 cột dọc (Danh sách SP ở trên, `OrderSummary` ở dưới) | 1 cột dọc: Thẻ sản phẩm giỏ hàng bố cục ngang компакт + Thanh tổng tiền & nút Thanh toán cố định ở đáy |
| **Tài khoản (`/account/*`)** | `AccountSidebar` dọc bên trái (`3 cột`) + Nội dung chính (`9 cột`) với Header Bento thống nhất | Thanh điều hướng ngang cuộn được (`Horizontal Pill Tabs`) + Nội dung `12 cột` | Thanh Pill Tabs cuộn ngang ở đầu trang + Danh sách đơn hàng dạng thẻ dọc |

# DESIGN SYSTEM: OBSIDIAN CRIMSON ATELIER (OPTIMIZED 2026)
> Generated via Google Stitch MCP for **ShopViet E-Commerce Platform**
> Project: `projects/4961361543848639322` | Asset Design System: `assets/205c2b1fed9546ff8e4610c062c775b8`

---

## 1. Brand Philosophy & Aesthetic Vision

The **Obsidian Crimson Atelier** design system embodies modern Vietnamese luxury retail—fusing architectural precision, editorial discipline, and ultra-contemporary digital craftsmanship. Crafted for high-discretion tastemakers and aspirational digital consumers, the aesthetic discards cluttered commercial tropes in favor of restrained minimalism, deep obsidian spatial depth, and high-impact crimson focal points.

- **Clean Editorial Tech Minimalism**: Crisp asymmetric modular layouts, bespoke typography rhythms, and structural bento-box framing inspired by high-end horology and architectural publications.
- **Controlled Velocity & Micro-Interactions**: High-contrast transitions, subtle optical rim lights on primary actions, and expansive negative space balancing dense product telemetry (specs, curated collections, pricing in ₫).
- **Performance-First Architecture**: Strategic, hardware-accelerated rendering that delivers silky smooth 60–120 FPS scrolling on all consumer devices.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Core Architectural Tokens
| Role | Token Name | Hex Value | Semantic Usage |
|---|---|---|---|
| **Primary Accent** | `--color-brand` / `--primary` | `#e11d48` | Primary conversion CTAs ("Thêm vào giỏ", "Mua ngay"), active selection states, exclusive drops |
| **Primary Hover** | `--color-brand-hover` | `#be123c` | Hover state with atmospheric ruby glow (`0 0 24px rgba(225, 29, 72, 0.4)`) |
| **Canvas Base** | `--background` / `--surface-base` | `#0b0f17` | Deep obsidian canvas background, zero elevation |
| **Card Substrate** | `--card` / `--surface-elevated` | `#131926` | Solid background for Product Cards, Bento modules, order containers |
| **Card Hover** | `--surface-card-hover` | `#1c2028` | Hover transition for solid cards |
| **Surface Container** | `--surface-container` | `#181c24` | Search inputs, form control wells, modal content bodies |
| **Surface High** | `--surface-container-high` | `#262a33` | Elevated popovers, active chip fills, secondary tabs |
| **Hairline Borders** | `--border` / `--line` | `rgba(248, 250, 252, 0.08)` | Ultra-thin 1px border lines separating components |
| **Border Active** | `--border-active` | `rgba(225, 29, 72, 0.4)` | Focus & active selection border highlight |
| **Text Primary** | `--foreground` / `--ink-high` | `#f8fafc` | Main titles, headlines, primary product names |
| **Text Secondary** | `--muted-foreground` | `#94a3b8` | Supporting descriptions, category tags, specs |
| **Text Muted** | `--ink-faint` | `#64748b` | Timestamps, micro-labels, placeholders |

### 2.2 Semantic Feedback Tokens (Non-conflicting with Primary Red)
Để đảm bảo người dùng không nhầm lẫn giữa màu thương hiệu/CTA chính (`#e11d48`) và các thông báo trạng thái, hệ thống sử dụng bộ màu phản hồi độc lập:
| State | CSS Variable | Hex Value | Usage |
|---|---|---|---|
| **Success** | `--status-success` | `#10b981` | Còn hàng trong kho, áp dụng mã voucher thành công, thanh toán hoàn tất |
| **Success Soft** | `--status-success-soft`| `rgba(16, 185, 129, 0.12)` | Nền badge thành công, trạng thái giao hàng |
| **Warning** | `--status-warning` | `#f59e0b` | Sắp hết hàng (dưới 5 sản phẩm), cảnh báo phiên đăng nhập, VIP tier |
| **Warning Soft** | `--status-warning-soft`| `rgba(245, 158, 11, 0.12)` | Nền badge cảnh báo nhẹ |
| **Danger / Error** | `--status-danger` | `#f87171` | Lỗi xác thực biểu mẫu, thông báo lỗi. Nút xóa giỏ hàng sử dụng style Ghost/Subtle với hover màu `#f87171` thay vì nền đỏ đặc |
| **Danger Soft** | `--status-danger-soft` | `rgba(248, 113, 113, 0.12)` | Nền thông báo lỗi nhẹ |

---

## 3. Performance Guardrail (Tier 1 Cards)

- **Không sử dụng `backdrop-filter: blur(...)` cho toàn bộ thẻ trong Product Grid**: Việc áp dụng kính mờ trên hàng chục thẻ sản phẩm đồng thời sẽ làm trình duyệt phải tính toán lại pixel trên GPU, gây giật lag hoặc tụt FPS khi cuộn trang (scroll drop).
- **Quy chuẩn Product Card**:
  - Nền thẻ là màu đặc: `#131926` (Solid Card Substrate).
  - Khi hover chuyển sắc mượt mà sang: `#1c2028` (`transition: background-color 0.25s ease, border-color 0.25s ease`).
  - Viền mạ kính: `1px solid rgba(248, 250, 252, 0.08)`, hover chuyển sang `rgba(248, 250, 252, 0.2)`.
- **Phạm vi được phép dùng `backdrop-filter: blur(...)`**:
  - Sticky Header / Navigation Bar (`backdrop-blur-md` với `rgba(11, 15, 23, 0.8)`).
  - Modal / Dialog Overlays.
  - Floating Quick Cart Tray & Sticky Mobile Conversion Dock.
  - Các badge giảm giá nhỏ hoặc nút Wishlist hình tròn nằm đè trực tiếp lên ảnh sản phẩm (`backdrop-blur-sm bg-black/40 text-white`).

---

## 4. Mobile-First Product Card CTA

- **Desktop (`md:` ≥ 768px)**:
  - Giữ trải nghiệm Clean Editorial: Thẻ sản phẩm hiển thị gọn gàng, nút "Thêm vào giỏ" dạng pill đen/crimson trượt lên từ mép dưới của ảnh (`group-hover:translate-y-0 translate-y-3 opacity-0 group-hover:opacity-100 transition-all duration-300`).
- **Mobile (`< 768px`)**:
  - Không dựa vào tương tác hover (vì màn hình cảm ứng không có hover).
  - Hiển thị trực tiếp **Nút icon "+ Giỏ hàng" cố định** (`h-9 w-9 rounded-full bg-[#e11d48] text-white flex items-center justify-center shadow-sm active:scale-95`) ngay cạnh khu vực hiển thị giá bán ở chân thẻ. Khách hàng có thể một chạm thêm ngay vào giỏ mà không cần mở chi tiết.

---

## 5. Vietnamese Typography & Accessibility

Primary Font Family: **Plus Jakarta Sans** (dự phòng: **Inter**, **Be Vietnam Pro**).

### 5.1 Xử lý dấu Tiếng Việt (Diacritical Balance)
- **Display Hero & Headline Lg**:
  - Nới lỏng `letter-spacing` về tối đa `-0.015em` (thay vì `-0.03em`) để các ký tự nguyên âm có dấu mũ và thanh điệu (như *ệ, ỗ, ứ, ẩ*) không bị dính vào nhau.
  - Đảm bảo `line-height` tối thiểu `1.2x` – `1.3x` đối với tiêu đề để tuyệt đối không bị clipping (cắt mất dấu hỏi, ngã, sắc phía trên).
- **Micro-Labels & Caps**:
  - Nâng kích thước `Label Sm / Caps` từ `10px` lên **`11px` hoặc `12px`** (`font-weight: 600`, `letter-spacing: 0.06em`, uppercase). Đảm bảo người dùng mắt kém hoặc màn hình nhỏ đọc được rõ ràng theo chuẩn WCAG 2.1 AA.
- **Hiển thị tiền tệ (VND)**:
  - Luôn định dạng có dấu chấm phân cách hàng nghìn kèm ký hiệu ₫: `₫ 48.990.000` hoặc `48.990.000 ₫`. Chữ số sử dụng `tabular-nums` để thẳng hàng khi liệt kê.

---

## 6. Elevation, Depth & Photonic Layering

- **Tier 0 (Canvas Base)**: Solid `#0b0f17`. Zero elevation.
- **Tier 1 (Bento Panels & Product Cards)**: Solid `#131926` với viền `1px solid rgba(248, 250, 252, 0.08)`. Hover sang `#1c2028`.
- **Tier 2 (Floating Action Trays / Popovers)**: `rgba(24, 32, 47, 0.85)` với `backdrop-filter: blur(24px)`, viền `1px solid rgba(255, 255, 255, 0.12)`, shadow `0 20px 40px -15px rgba(0, 0, 0, 0.7)`.
- **Tier 3 (Active Selection & CTA Glow)**: Crimson proximity rim light: `0 0 24px rgba(225, 29, 72, 0.4)` và hairline viền `rgba(225, 29, 72, 0.35)`.

---

## 7. Component Design Specifications

### 7.1 Thẻ sản phẩm (Product Card)
- **Tỷ lệ khung ảnh**: Chuẩn 3:4 hoặc 4:5 với `object-cover`, bo góc trên thẻ `rounded-t-2xl`.
- **Badge**:
  - Giảm giá: Pill đỏ Crimson (`bg-[#e11d48] text-white text-[11px] font-bold px-2 py-0.5 rounded-full`).
  - Nổi bật: Pill kính mờ tối (`backdrop-blur-sm bg-black/40 text-white border border-white/10 text-[11px]`).
- **Wishlist Button**: Tròn kính mờ ở góc trên bên phải (`backdrop-blur-sm bg-black/35 hover:bg-black/60 text-white border border-white/10`).
- **CTA**: Desktop slide-up hover; Mobile nút icon tròn cạnh giá bán.

### 7.2 Chi tiết sản phẩm (Product Detail)
- **Bố cục**: 2 cột Desktop (Trái: Gallery ảnh lớn kèm thumbnail thanh trượt; Phải: Thông tin sản phẩm, chọn màu/size, số lượng, cụm nút Mua ngay / Thêm vào giỏ).
- **Sticky Conversion Dock (Mobile)**: Thanh bar cố định dưới chân màn hình trên điện thoại hiển thị ảnh thumbnail nhỏ, giá bán và nút "Thêm vào giỏ" / "Mua ngay" màu Crimson.

### 7.3 Giỏ hàng (Cart) & Thanh toán (Checkout)
- **Bố cục**: 2 cột:
  - Cột chính: Danh sách sản phẩm với hình đại diện tỷ lệ 1:1 sắc nét, tên sản phẩm, biến thể tag pill, bộ đếm số lượng tinh xảo. Nút xóa dùng icon thùng rác ghost subtle (hover chuyển sang `--status-danger`: `#f87171`), không dùng nút đỏ đặc gây nhầm lẫn với nút thanh toán.
  - Cột phụ: Thẻ Bento tổng quan đơn hàng cố định (`bg-[#131926] border border-white/8 rounded-2xl p-6`), ô nhập voucher với nút áp dụng, và nút "Tiến hành thanh toán" màu Crimson nổi bật toàn chiều rộng (`w-full h-12 rounded-xl bg-[#e11d48] hover:bg-[#be123c]`).

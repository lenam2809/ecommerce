Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# DESIGN SYSTEM: OBSIDIAN CRIMSON ATELIER (SSoT 2026)
> Đặc tả hệ thống thiết kế giao diện ShopViet E-Commerce Platform — Chuẩn SSoT 2026  
> Kế thừa kiến trúc: Dual-Accent Tech Hierarchy, Deep Obsidian Surfaces & Performance-First Rendering

---

## 1. Brand Philosophy & Aesthetic Vision

Hệ thống thiết kế **Obsidian Crimson Atelier** thể hiện phong cách bán lẻ công nghệ cao cấp tại Việt Nam—kết hợp giữa độ chính xác kiến trúc, kỷ luật biên tập và kỹ thuật số hiện đại. Ngôn ngữ thiết kế loại bỏ hoàn toàn các chi tiết thương mại rườm rà, tập trung vào phong cách tối giản có chiều sâu, tương phản sắc nét và các điểm nhấn màu kép định hướng hành vi người dùng.

- **Clean Editorial Tech Minimalism**: Bố cục module bất đối xứng, lưới Bento-Grid sắc nét, nhịp điệu typography chuẩn mực lấy cảm hứng từ các tạp chí công nghệ và kiến trúc cao cấp.
- **Phân vai Màu sắc Kép (Dual-Accent Tech Hierarchy)**: Tách biệt rõ ràng giữa hành vi mua sắm thương mại (Tech Crimson) và hành vi tương tác công nghệ kỹ thuật (Electric Blue).
- **Phân tầng Chiều sâu Deep Obsidian (4 lớp)**: Hệ thống bề mặt phân lớp khoa học, đảm bảo độ tương phản WCAG 2.1 AA ($\ge 4.5:1$) trên mọi điều kiện ánh sáng.
- **Performance-First Architecture**: Tối ưu hóa GPU, không lạm dụng `backdrop-filter: blur(...)` trên các danh sách sản phẩm dài, duy trì mượt mà 60–120 FPS khi cuộn trang.

---

## 2. Color Palette & Semantic Tokens

Hệ màu SSoT 2026 tuyệt đối không sử dụng các mã màu Material Design 3 ám hồng nâu cũ (như `#906f70`, `#5c3f40`). Các kỹ sư bắt buộc sử dụng semantic tokens qua Tailwind CSS thay vì hardcode mã hex vào JSX/TSX.

### 2.1 Phân vai Màu sắc Kép (Dual-Accent Tech Hierarchy)
| Vai trò | Token / Semantic Class | Giá trị Hex (Light / Dark) | Mục đích sử dụng quy chuẩn |
|---|---|---|---|
| **Tech Crimson** | `--brand` / `bg-brand`, `text-brand` | `#E11D48` / `#E11D48` | **Chuyển đổi bán hàng:** Nút "Mua ngay", nút "Tiến hành thanh toán", giá khuyến mãi, badge % giảm giá, Hot deals |
| **Tech Crimson Hover** | `--brand-hover` / `hover:bg-brand-hover` | `#BE123C` / `#BE123C` | Trạng thái hover với vầng sáng ruby nhẹ (`0 0 24px rgba(225, 29, 72, 0.4)`) |
| **Electric Blue** | `--tech-blue` / `bg-tech-blue`, `text-tech-blue` | `#2563EB` (Light) / `#3B82F6` (Dark) | **Tương tác công nghệ:** Nút "Thêm vào giỏ", bộ lọc đang chọn, badge bảo hành 24T chính hãng, icon cam kết kỹ thuật, focus ring |
| **Electric Blue Hover** | `--tech-blue-hover` | `#1D4ED8` (Light) / `#2563EB` (Dark) | Hover của các nút và chip tương tác kỹ thuật |

### 2.2 Hệ thống Bề mặt (Surfaces Hierarchy)

#### Chế độ Tối (Dark Mode) — Deep Obsidian 4 lớp:
| Tầng | Token | Giá trị Hex | Ứng dụng thực tế |
|---|---|---|---|
| **Lớp 0 (Canvas Base)** | `--background` / `bg-background` | `#090D16` | Nền canvas chính của toàn trang, zero elevation |
| **Lớp 1 (Card & Container)** | `--card` / `bg-card` | `#111827` | Nền thẻ sản phẩm, panel Bento Grid, bảng dữ liệu, form container |
| **Lớp 2 (Chips & Substrates)** | `--secondary` / `bg-secondary` | `#182234` | Chip thông số kỹ thuật (Specs), ô nhập liệu tìm kiếm, header bảng |
| **Lớp 3 (Elevated & Hover)** | `--surface-hover` / `bg-surface-hover` | `#1E293B` | Trạng thái hover thẻ, floating action tray, popovers |

#### Chế độ Sáng (Light Mode):
| Thành phần | Token / Semantic Class | Giá trị Hex | Ứng dụng thực tế |
|---|---|---|---|
| **Nền Canvas** | `--background` / `bg-background` | `#F8FAFC` | Nền trắng xám hiện đại (Slate 50) |
| **Thẻ & Panel** | `--card` / `bg-card` | `#FFFFFF` | Nền card sản phẩm, container chính |
| **Bề mặt phụ** | `--surface` / `bg-surface` | `#F1F5F9` | Nền ô input, thanh lọc, tag thông số phụ |
| **Đường viền** | `--line` / `border-line` | `#E2E8F0` | Viền ngăn cách cấu trúc 1px |

### 2.3 Phản hồi Hệ thống (Semantic Feedback Tokens)
Hệ thống màu thông báo trạng thái hoạt động độc lập, không xung đột với Tech Crimson:
| Trạng thái | Biến CSS | Giá trị Hex | Ứng dụng |
|---|---|---|---|
| **Success** | `--status-success` | `#10B981` | Còn hàng trong kho, áp voucher thành công, thanh toán thành công |
| **Success Soft** | `--status-success-soft`| `rgba(16, 185, 129, 0.12)` | Nền badge thành công, trạng thái đã giao hàng |
| **Warning** | `--status-warning` | `#F59E0B` | Sắp hết hàng (< 5 món), cảnh báo hết hạn phiên, badge bảo trì |
| **Warning Soft** | `--status-warning-soft`| `rgba(245, 158, 11, 0.12)` | Nền badge cảnh báo |
| **Danger / Error** | `--status-danger` | `#F87171` | Báo lỗi xác thực, giao dịch thất bại. Nút xóa giỏ hàng dùng style Ghost subtle hover đỏ thay vì nền đặc |
| **Danger Soft** | `--status-danger-soft` | `rgba(248, 113, 113, 0.12)` | Nền thông báo lỗi |

---

## 3. Performance Guardrail (Hiệu năng Thẻ & Danh sách)

- **Tuyệt đối không áp dụng `backdrop-filter: blur(...)` trên toàn bộ Grid thẻ sản phẩm**: Việc lạm dụng kính mờ trên danh mục chứa hàng chục sản phẩm làm GPU phải tính toán lại pixel liên tục, gây giật lag khi cuộn trang.
- **Quy chuẩn Thẻ sản phẩm (Product Card)**:
  - Nền thẻ là màu đặc: Lớp 1 `#111827` (`bg-card`).
  - Khi hover chuyển sắc êm dịu sang Lớp 3 `#1E293B` (`hover:bg-surface-hover transition-colors duration-200`).
  - Đường viền mỏng: `1px solid border-line`.
- **Phạm vi cho phép dùng `backdrop-filter: blur(...)`**:
  - Sticky Navigation Bar (`backdrop-blur-md`).
  - Hộp thoại Modal / Dialog Overlay.
  - Quick Cart Drawer / Floating Conversion Bar trên mobile.
  - Badge nhỏ đè trên ảnh banner (`backdrop-blur-sm bg-black/40 text-white`).

---

## 4. Mobile-First Product Card & Tương tác Chuyển đổi

- **Màn hình Desktop (`md:` $\ge$ 768px)**:
  - Thẻ sản phẩm hiển thị thông thoáng. Nút "Thêm vào giỏ" trượt lên êm dịu từ mép dưới ảnh khi rê chuột (`group-hover:translate-y-0 translate-y-3 opacity-0 group-hover:opacity-100 transition-all duration-300`).
- **Màn hình Mobile (`< 768px`)**:
  - Không dựa vào hiệu ứng hover.
  - Hiển thị trực tiếp **Nút icon "+ Giỏ hàng" cố định** sử dụng màu xanh Electric Blue (`h-9 w-9 rounded-full bg-tech-blue text-white flex items-center justify-center shadow-sm active:scale-95`) đặt cạnh giá bán ở chân thẻ. Khách hàng một chạm thêm ngay vào giỏ.

---

## 5. Typography Tiếng Việt & Định dạng Tiền tệ

- **Phông chữ chính**: **Plus Jakarta Sans** (dự phòng: **Inter**, **Be Vietnam Pro**).
- **Phông chữ hiển thị thông số và giá**: **JetBrains Mono** hoặc `font-mono`.

### 5.1 Cân bằng Dấu Tiếng Việt (Diacritical Balance)
- **Tiêu đề Display / Hero**: `letter-spacing` tối đa `-0.015em`, `line-height` tối thiểu `1.25x` – `1.3x` để không cắt cụt các dấu thanh mũ phía trên (*ệ, ỗ, ứ, ẩ*).
- **Micro-labels & Badges**: Tối thiểu `11px` hoặc `12px` (`font-semibold uppercase tracking-wider`).

### 5.2 Quy chuẩn Định dạng Tiền tệ (VND Currency Formatting)
- Mọi nơi hiển thị giá tiền (ProductCard, Cart, Checkout, OrderDetails, Wishlist) **bắt buộc** phải sử dụng tổ hợp class:
  ```html
  <span class="font-mono tabular-nums whitespace-nowrap">48.990.000 ₫</span>
  ```
  hoặc áp dụng class `.price-tag`.
- **Tuyệt đối không để ký hiệu đơn vị tiền tệ (`₫` hoặc `VND`) rớt dòng một mình.**

---

## 6. Component Design Specifications

### 6.1 Thẻ sản phẩm (Product Card)
- **Tỷ lệ khung ảnh**: Chuẩn 3:4 hoặc 4:5 với `object-cover`, bo góc `rounded-2xl`.
- **Hệ thống Badge**:
  - Giảm giá: Pill Tech Crimson (`bg-brand text-white text-[11px] font-bold px-2 py-0.5 rounded-full`).
  - Bảo hành chính hãng: Pill Electric Blue (`bg-tech-blue/15 text-tech-blue border border-tech-blue/30 text-[11px] font-medium px-2 py-0.5 rounded-full`).
- **Wishlist Button**: Nút tròn kính mờ góc trên bên phải ảnh (`backdrop-blur-sm bg-black/40 hover:bg-black/70 text-white`).
- **Cụm giá & CTA**: Giá khuyến mãi mang màu sắc `text-brand font-mono tabular-nums whitespace-nowrap`, nút giỏ hàng mang màu `bg-tech-blue`.

### 6.2 Chi tiết sản phẩm (Product Detail)
- **Bố cục 2 cột**:
  - Cột trái: Gallery hình ảnh sản phẩm độ phân giải cao kèm danh sách thumbnail.
  - Cột phải: Tên sản phẩm, đánh giá sao, bảng thông số kỹ thuật (Spec chips `bg-secondary text-ink`), cụm nút kép:
    - Nút **"Thêm vào giỏ"**: Sử dụng viền hoặc nền `bg-tech-blue hover:bg-tech-blue-hover text-white`.
    - Nút **"Mua ngay"**: Sử dụng nền nổi bật `bg-brand hover:bg-brand-hover text-white font-semibold`.
- **Sticky Conversion Dock (Mobile)**: Thanh điều hướng cố định dưới chân màn hình hiển thị tóm tắt giá và 2 nút Mua ngay / Thêm giỏ.

### 6.3 Giỏ hàng (Cart) & Thanh toán (Checkout)
- **Giỏ hàng**:
  - Hỗ trợ thanh tiến độ Freeship chuẩn: Áp dụng miễn phí vận chuyển cho đơn hàng $\ge$ **500.000₫**.
  - Nút xóa sản phẩm dùng icon thùng rác ghost subtle (hover chuyển sang màu nguy hiểm `--status-danger`), không dùng nút đỏ đặc gây nhầm lẫn với nút tiến hành thanh toán.
- **Thanh toán (Checkout)**:
  - Cọc COD 10%: Tự động kích hoạt badge cảnh báo và ghi nhận số tiền cọc 10% khi phương thức thanh toán là COD và tổng tiền đơn hàng $> 20.000.000₫$.
  - Nút "Tiến hành đặt hàng / Thanh toán" toàn chiều rộng (`w-full h-12 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold shadow-lg shadow-brand/25`).

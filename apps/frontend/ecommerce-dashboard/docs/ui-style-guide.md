Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# E‑Commerce Dashboard – UI Style Guide (SSoT 2026)

Tài liệu này quy chuẩn toàn bộ hệ thống thiết kế giao diện (Design System), quy tắc định dạng hiển thị, bảng màu, typography, và cách sử dụng component cho phân hệ **E‑Commerce Admin Dashboard** (`apps/frontend/ecommerce-dashboard`), được xây dựng trên nền tảng **Next.js 15, React 18.3.1 và Tailwind CSS v4**.

---

## 1. Hệ Thống Màu Sắc Chuẩn SSoT 2026 (Color System)

Hệ thống màu sắc của Dashboard tuân thủ nghiêm ngặt nguyên lý **Phân Vai Màu Sắc Kép (Dual-Accent Tech Hierarchy)** và phân tầng bề mặt **Deep Obsidian 4 lớp** cho chế độ Dark Mode.

### 1.1. Phân vai màu sắc kép (Dual-Accent Tech Hierarchy)

| Màu chủ đạo | Giá trị Hex / Token | Class ngữ nghĩa Tailwind v4 | Vai trò sử dụng bắt buộc |
|---|---|---|---|
| **Tech Crimson** | `#E11D48` (`--color-brand`) | `bg-brand`, `text-brand`, `border-brand` | Dành riêng cho các chỉ số doanh thu tài chính quan trọng, cảnh báo khẩn cấp, badge % giảm giá, nút hành động có tính chuyển đổi cao. |
| **Electric Blue** | `#2563EB` (Light) / `#3B82F6` (Dark) | `bg-tech-blue`, `text-tech-blue`, `border-tech-blue` | Dành cho các tính năng công nghệ cốt lõi: Nút lưu/tạo mới chính (`Primary Button`), bộ lọc đang chọn (`Active Filter`), badge bảo hành chính hãng, focus ring, icon cam kết kỹ thuật. |

> **⚠️ QUY TẮC BẤT DI BẤT DỊCH:** Tuyệt đối **KHÔNG hardcode mã màu hex** (ví dụ `bg-[#2563eb]`, `text-[#e11d48]`) vào file TSX/JSX. Mọi thành phần phải sử dụng semantic tokens (`bg-brand`, `bg-tech-blue`, `bg-card`, `text-foreground`, `border-border`).

### 1.2. Phân tầng Bề mặt & Chế độ Tối Deep Obsidian (Surfaces & Dark Mode)

Để tạo chiều sâu thị giác và độ tương phản công nghệ cao trong môi trường làm việc của quản trị viên:

- **Light Mode:**
  - Nền chính canvas: `#F8FAFC` (`bg-background`)
  - Bề mặt Card & Container: `#FFFFFF` (`bg-card`)
  - Bề mặt phụ (Inputs, Sub-sections): `#F1F5F9` (`bg-surface`)
  - Đường viền chia tách: `#E2E8F0` (`border-line` / `border-border`)

- **Dark Mode (Deep Obsidian 4 Lớp):**
  - **Lớp 0 (Canvas Base):** `#090D16` (`--background` / `--color-bg-base`) — Nền toàn trang.
  - **Lớp 1 (Card & Containers):** `#111827` (`--card` / `--color-bg-card`) — Khối bảng biểu, form nhập liệu, widget KPI.
  - **Lớp 2 (Chips & Sub-surfaces):** `#182234` (`--secondary`) — Spec chips, thanh công cụ bảng, badge phụ.
  - **Lớp 3 (Elevated & Hover):** `#1E293B` (`--surface-hover` / `--color-bg-elevated`) — Menu dropdown, dialog modal, hiệu ứng hover hàng trong bảng.
  - *Tiêu chuẩn tiếp cận:* Đảm bảo độ tương phản chữ đạt tối thiểu WCAG 2.1 AA ($\ge 4.5:1$).

### 1.3. Khai báo Tokens trong `app/globals.css` (Tailwind v4 `@theme inline`)

```css
@theme inline {
  --color-brand: #E11D48;
  --color-tech-blue: #2563EB;
  --color-surface: #F1F5F9;
  --color-line: #E2E8F0;
  
  --color-bg-base: #090D16;
  --color-bg-card: rgba(17, 24, 39, 0.95);
  --color-bg-elevated: #1E293B;

  --font-sans: 'DM Sans', var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

---

## 2. Quy Chuẩn Định Dạng Tiền Tệ (Currency Formatting)

Trong toàn bộ hệ thống quản trị (Bảng danh sách đơn hàng, form chi tiết đơn, báo cáo doanh thu, phiếu hoàn tiền RMA, tiền cọc COD 10%):

- **Class CSS bắt buộc:** Mọi vị trí hiển thị giá tiền phải có các class:
  ```html
  <span className="font-mono tabular-nums whitespace-nowrap">49.990.000₫</span>
  ```
  hoặc sử dụng class chuyên dụng đã khai báo trong `globals.css`:
  ```html
  <span className="price-tag">49.990.000₫</span>
  ```
- **Quy tắc ngăn ngắt dòng:** Tuyệt đối không để ký hiệu đơn vị tiền tệ (`₫` hoặc `VND`) rớt dòng một mình sang dòng tiếp theo (luôn có `whitespace-nowrap`).

---

## 3. Hệ Thống Huy Hiệu Trạng Thái (Status Badges & Steppers)

### 3.1. Huy hiệu Trạng thái Đơn hàng (9 Trạng thái của `EOrderStatus`)

Dashboard chuẩn hóa màu sắc cho 9 trạng thái đơn hàng của Domain Backend:

| Giá trị | Trạng thái (`EOrderStatus`) | Màu sắc hiển thị | Biến thể Badge (`components/ui/badge.tsx`) |
|:---:|---|---|---|
| `0` | `Pending` (Chờ xử lý) | Hổ phách (Amber / Warning) | `variant="outline"` kèm `border-amber-500/50 text-amber-600 bg-amber-500/10` |
| `1` | `Processing` (Đang xử lý) | Xanh dương (Tech Blue / Info) | `variant="outline"` kèm `border-blue-500/50 text-blue-600 bg-blue-500/10` |
| `2` | `Shipped` (Đã giao vận chuyển) | Tím / Chàm (Indigo) | `variant="outline"` kèm `border-indigo-500/50 text-indigo-600 bg-indigo-500/10` |
| `3` | `Completed` (Hoàn tất giao dịch) | Xanh lá (Emerald / Success) | `variant="default"` kèm `bg-emerald-600 text-white` |
| `4` | `Cancelled` (Đã hủy) | Đỏ (Tech Crimson / Danger) | `variant="destructive"` |
| `5` | `Refunded` (Đã hoàn tiền) | Xám đá (Slate / Neutral) | `variant="secondary"` kèm `text-slate-400` |
| `6` | `Delivered` (Giao thành công) | Xanh mòng két (Teal) | `variant="outline"` kèm `border-teal-500/50 text-teal-600 bg-teal-500/10` |
| `7` | `ReturnRequested` (Yêu cầu RMA) | Cam sáng (Orange / Alert) | `variant="outline"` kèm `border-orange-500/50 text-orange-600 bg-orange-500/10` |
| `8` | `Returned` (Đã nhập hàng hoàn) | Xám kẽm (Zinc / Neutral) | `variant="outline"` kèm `border-zinc-500/50 text-zinc-400` |

### 3.2. Stepper & Trạng thái Đổi trả Hàng RMA 5 Bước (`/returns/[returnId]`)

Quy trình thẩm định RMA 7 ngày hiển thị dưới dạng thanh tiến trình 5 bước:
1. **Bước 1: Tiếp nhận yêu cầu** (`PendingApproval`)
2. **Bước 2: Thẩm định kỹ thuật viên** (`Approved` / `Rejected`)
3. **Bước 3: Nhập kho thu hồi** (`Processing`)
4. **Bước 4: Xuất máy đổi / Hoàn tiền** (`Completed`)
5. **Bước 5: Đóng hồ sơ** (`Closed`)

### 3.3. Trạng thái Đặt cọc COD 10% & Tồn kho Serial/IMEI

- **Cọc COD (`EDepositStatus`):**
  - `Pending (1)`: Cảnh báo vàng `Chờ đặt cọc 10% để giữ máy` (Đơn $> 20.000.000₫$).
  - `Paid (2)`: Xanh lá `Đã xác nhận cọc 10%`.
- **Kho IMEI/Serial (`EInventoryStatus`):**
  - `Available (0)`: Sẵn sàng xuất bán (Xanh lá).
  - `Reserved (1)`: Đã giữ cho đơn hàng (Vàng hổ phách).
  - `Sold (2)`: Đã xuất bán (Xanh dương).
  - `Defective (3)`: Lỗi kỹ thuật / Chờ bảo hành (Đỏ Crimson).
  - `ReturnedToStock (4)`: Đã hoàn kho sau RMA (Tím).

---

## 4. Typography & Phân Tầng Kiểu Chữ

### 4.1. Phông chữ hệ thống

- Phông nội dung chính: `--font-sans` (`DM Sans`, hỗ trợ hiển thị tiếng Việt sắc nét).
- Phông số liệu & bảng biểu: `--font-mono` (`Geist Mono`, tối ưu cho căn lề số liệu `tabular-nums`).

### 4.2. Thang kích thước chuẩn (Type Scale)

- **Tiêu đề trang (Page Title):**
  - Class: `font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground`.
  - Dùng trong header chính của từng màn hình dashboard.
- **Tiêu đề phân đoạn (Section Title):**
  - Class: `text-lg font-semibold text-foreground`.
  - Dùng cho tiêu đề Card, đầu bảng hoặc tab dữ liệu.
- **Văn bản nội dung (Body Text):**
  - Mặc định: `text-sm text-foreground leading-relaxed`.
- **Mô tả phụ & Chú thích (Caption):**
  - Class: `text-xs text-muted-foreground`.
- **Nhãn trường nhập (Form Label):**
  - Class: `text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70`.
  - Bắt buộc dùng component `Label` (`components/ui/label.tsx`).

---

## 5. Khoảng Cách & Bố Cục Giao Diện (Spacing & Layout)

### 5.1. Thang khoảng cách chuẩn (Spacing Scale 4px)

- `gap-1` / `p-1`: 4px (Icon và nhãn sát nhau).
- `gap-2` / `p-2`: 8px (Nhóm nút công cụ nhỏ).
- `gap-4` / `p-4`: 16px (Khoảng cách giữa các ô form trong cùng một hàng).
- `space-y-6` / `p-6`: 24px (Khoảng cách giữa các khối Card, padding trong của Card).
- `space-y-8`: 32px (Khoảng cách phân tách các cụm chức năng lớn).

### 5.2. Khung chứa trang (Page Layout Container)

Tất cả các trang con trong `app/(dashboard)/` được bao bọc bởi container chuẩn từ `app/(dashboard)/layout.tsx`:
- Padding ngang chuẩn: `px-4 lg:px-8 xl:px-10`.
- Padding dọc chuẩn: `py-6`.
- Chống vỡ layout ngang: Với các bảng dữ liệu có trên 6 cột, bắt buộc bọc bảng trong container `overflow-x-auto` và áp dụng class `.sticky` cho cột thao tác cuối cùng.

---

## 6. Thành Phần Giao Diện Cơ Sở (Base Components)

Tất cả các thành phần giao diện nền tảng nằm trong thư mục `components/ui/` và tuân thủ nguyên tắc không chứa logic nghiệp vụ.

### 6.1. Button (`components/ui/button.tsx`)

- `variant="default"`: Nút hành động chính (Lưu, Tạo mới, Đăng nhập) — Màu Electric Blue hoặc Slate Dark.
- `variant="secondary"`: Hành động phụ (Xem trước, Xuất file mẫu CSV).
- `variant="outline"`: Nút công cụ, bộ lọc, hủy bỏ.
- `variant="destructive"`: Xóa dữ liệu, Khóa tài khoản, Từ chối RMA — Màu Tech Crimson.
- `variant="ghost"`: Nút icon trên thanh điều hướng, nút mở menu hàng trong bảng.

### 6.2. Card (`components/ui/card.tsx`)

Mọi khối thông tin độc lập đều phải sử dụng cấu trúc `Card` chuẩn:
```tsx
<Card className="border-border bg-card">
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Cấu hình Thông số Kỹ thuật</CardTitle>
    <CardDescription>Nhập 14 thông số chi tiết chuẩn SSoT 2026</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Form hoặc Bảng con */}
  </CardContent>
  <CardFooter className="flex justify-end gap-2 border-t pt-4">
    {/* Nút thao tác */}
  </CardFooter>
</Card>
```

### 6.3. Bảng Dữ Liệu Lớn (TanStack Table & Pagination)

- Bắt buộc hỗ trợ phân trang server-side (`pageIndex`, `pageSize`).
- Cột giá tiền bắt buộc gắn class `.price-tag`.
- Trạng thái tải: Sử dụng `Skeleton` (`components/ui/skeleton.tsx`) theo đúng số hàng/cột của bảng thay vì spinner đơn độc.
- Trạng thái rỗng (Empty State): Hiển thị icon minh họa + thông điệp rõ ràng + nút CTA tương ứng (ví dụ: "Chưa có sản phẩm nào — Thêm sản phẩm mới").

---

## 7. Ghi Chú Tái Cấu Trúc & Tối Ưu Hóa (Refactor Checklist)

Khi phát triển thêm màn hình mới hoặc tinh chỉnh UI trong Dashboard:
1. **Kiểm tra mã màu hex:** Chạy `git diff` để đảm bảo không đưa class màu hex cứng (`[#...]`) vào mã nguồn.
2. **Kiểm tra hiển thị tiền tệ:** Đảm bảo toàn bộ giá trị tiền tệ có class `.price-tag` hoặc `font-mono tabular-nums whitespace-nowrap`.
3. **Kiểm tra Dark Mode:** Chuyển đổi qua lại giữa Light/Dark mode trên giao diện để kiểm tra độ tương phản bề mặt Deep Obsidian.
4. **Kiểm tra RowVersion:** Tại các form cập nhật (đặc biệt là đơn hàng), kiểm tra việc truyền `rowVersion` để hỗ trợ cơ chế Optimistic Locking.

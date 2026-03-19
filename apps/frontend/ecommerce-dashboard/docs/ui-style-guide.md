## E‑Commerce Dashboard – UI Style Guide

Style guide này ghi lại các quy ước UI/UX cho dự án **E‑Commerce Dashboard**.  
Mục tiêu:

- Giao diện hiện đại, tối giản, dễ scan.
- Thống nhất màu sắc, typography, spacing.
- Hạn chế lặp style bằng cách reuse component base trong `components/ui`.

> Lưu ý: Đây là **style guide**, không thay đổi business logic. Khi refactor, ưu tiên dùng các component/utility có sẵn, chỉ bổ sung khi cần.

---

## 1. Color System

### 1.1. Core tokens (đã có trong `app/globals.css`)

- `--background` / `--foreground`  
  - Nền trang + màu chữ chính.
- `--card` / `--card-foreground`  
  - Nền & text cho `Card`.
- `--primary` / `--primary-foreground`  
  - Màu **CTA chính** (Lưu, Tạo mới, Đăng nhập…).
- `--secondary` / `--secondary-foreground`  
  - Nút phụ, block thông tin nhẹ.
- `--muted` / `--muted-foreground`  
  - Background nhạt (section, chip nhẹ), text mô tả phụ.
- `--accent` / `--accent-foreground`  
  - Hover, highlight nhẹ, tag phụ.
- `--destructive`  
  - Action nguy hiểm (xoá, khoá, lỗi).
- `--border`, `--input`, `--ring`  
  - Border, background input, focus ring.

### 1.2. Semantic usage

- **Primary**
  - Class: `bg-primary`, `text-primary`, `text-primary-foreground`.
  - Dùng cho:
    - Nút chính: `Button` `variant="default"`.
    - Link/CTA nổi bật.
- **Secondary**
  - Class: `bg-secondary`, `text-secondary-foreground`.
  - Dùng cho:
    - Nút phụ ít quan trọng hơn.
    - Tag/section nhẹ.
- **Neutral / Muted**
  - Class: `bg-background`, `bg-muted`, `text-muted-foreground`, `border-border`.
  - Dùng cho:
    - Background của layout, section phụ, mô tả text.
- **Danger**
  - Class: `bg-destructive`, `text-destructive`, `border-destructive`.
  - Dùng cho:
    - Nút xoá/khoá: `Button` `variant="destructive"`.
    - `Alert` destructive, `Badge` destructive.
- **Planned tokens (tuỳ chọn, thêm khi cần)**
  - `--success` / `--success-foreground`
    - Màu cho trạng thái thành công (đơn hàng thành công, import OK…).
  - `--warning` / `--warning-foreground`
    - Màu cảnh báo (pending, risk).
  - Khi thêm, ưu tiên map vào `Badge`/`Status` component thay vì dùng màu lẻ trong từng page.

---

## 2. Typography

### 2.1. Font

- Font chính: `--font-sans` (được inject qua `ThemeProvider`).
- Heading: dùng `font-heading` (như trong `DashboardHeader`).

### 2.2. Type scale (Tailwind classes)

- **Page Title / Tiêu đề lớn**
  - Class: `font-heading text-3xl md:text-4xl font-semibold`.
  - Dùng cho: tiêu đề page trong `DashboardHeader`.

- **Section Title / Tiêu đề nhỏ**
  - Class gợi ý:
    - `text-xl font-semibold` cho tiêu đề section.
    - `text-lg font-semibold` cho tiêu đề khối nhỏ trong card.
  - Dùng cho: title form/tabs trong card, section trong dashboard.

- **Body text**
  - Mặc định: `text-sm` (desktop) / `text-base` cho đoạn dài hơn.
  - Không đổi font size tuỳ tiện; ưu tiên `text-sm` + `leading-relaxed`.

- **Caption / Mô tả phụ**
  - Class: `text-xs text-muted-foreground` hoặc `text-sm text-muted-foreground`.
  - Dùng cho: mô tả dưới tiêu đề, hint trong form, label trạng thái phụ.

- **Label form**
  - Class: `text-sm font-medium`.
  - Dùng component `Label` (`components/ui/label.tsx`) thay vì `<label>` raw với class rời.

---

## 3. Spacing & Layout

### 3.1. Spacing scale (4px)

Mapping đề xuất (Tailwind):

- `1` → 4px (`p-1`, `m-1`, `gap-1`)
- `2` → 8px (`p-2`, `gap-2`)
- `3` → 12px (`p-3`)
- `4` → 16px (`p-4`, `space-y-4`)
- `6` → 24px (`p-6`, `space-y-6`)
- `8` → 32px (`p-8`, `space-y-8`)

Quy ước:

- Khoảng cách trong form/card: `space-y-4` hoặc `space-y-6`.
- Khoảng cách giữa section lớn: `space-y-6` ~ `space-y-8`.
- Nhóm nút/icon: `gap-2` (nhỏ), `gap-4` (nhóm lớn).
- Padding card: dùng `py-6 px-6` (theo `Card` hiện tại).

### 3.2. Page layout

- Container nội dung:
  - Xem `app/(dashboard)/layout.tsx`: `py-4 md:py-6 px-4 lg:px-8 xl:px-12`.
  - Giữ pattern này cho tất cả page bên trong dashboard.
- Scroll:
  - Tránh overflow ngang; nếu bảng rộng → wrap bằng container có `overflow-x-auto`.

---

## 4. Base Components

Tất cả base UI components đặt trong `components/ui/`.  
Nguyên tắc: **không chứa business logic**; chỉ là trình bày + tương tác cơ bản.

### 4.1. Button (`components/ui/button.tsx`)

Variants (semantic):

- `variant="default"` – Primary
  - CTA chính (Lưu, Tạo mới, Đăng nhập).
- `variant="secondary"` – Secondary
  - Hành động phụ (VD: “Xem thêm”, “Xuất báo cáo”).
- `variant="outline"` – Tertiary / Ghost
  - Filter, toggle advanced search, nút ít quan trọng.
- `variant="ghost"`
  - Icon-only, action nhẹ trong toolbar, menu.
- `variant="destructive"`
  - Xoá, khoá, thao tác nguy hiểm.

Sizes:

- `size="sm"`: toolbar, trong bảng, dialog.
- `size="default"`: form, CTA chính.
- `size="lg"`: hero/auth, nút nổi bật hơn.
- `size="icon"`: icon-only (no label).

Quy ước:

- Tránh tạo `PrimaryButton`, `DangerButton` riêng; dùng `Button` + `variant`.
- Không override màu trực tiếp (`bg-...`) nếu không thật sự cần; giữ logic màu ở `buttonVariants`.

### 4.2. Card (`components/ui/card.tsx`)

Structure:

- `Card` – container (border, rounded, shadow).
- `CardHeader`
  - Bao gồm `CardTitle`, `CardDescription`, và optional `CardAction`.
- `CardContent` – nội dung chính (form, bảng nhỏ).
- `CardFooter` – vùng CTA, thông tin bổ sung.

Usage:

- Mọi khối thông tin có border và nội dung riêng biệt (form sản phẩm, chi tiết đơn hàng, settings…) nên dùng `Card` thay vì `div` tuỳ chỉnh.
- Nếu đang dùng `div` với `rounded-lg border p-4/6` → cân nhắc refactor về `Card`.

### 4.3. Input / Select / Checkbox / Radio

- **Input** – `components/ui/input.tsx`
  - Dùng cho mọi `<input>` text/email/number…  
  - Không tạo class riêng lẻ như `border rounded px-3 py-2` bên ngoài.

- **Select** – `components/ui/select.tsx`
  - Dùng `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`…  
  - Giữ kích thước bằng `size` prop trên `SelectTrigger`.

- **Checkbox** – `components/ui/checkbox.tsx`
  - Dùng cho boolean; luôn đặt cạnh `Label` để dễ đọc.

- **Radio** – `components/ui/radio-group.tsx`
  - Dùng `RadioGroup` + `RadioGroupItem` cho lựa chọn đơn (status, type…).

### 4.4. Badge / Label (`components/ui/badge.tsx`, `components/ui/status/*`)

- Variants:
  - `default` – trạng thái tích cực / active.
  - `secondary` – neutral/metadata.
  - `destructive` – negative (Hết hàng, Bị khoá, Lỗi).
  - `outline` – label nhẹ, không fill.

- Trạng thái nên dùng:
  - `Badge` (với `variant` phù hợp) cho status đơn giản.
  - `StatusIndicator` (`components/ui/status/status-indicator.tsx`) cho trạng thái active/inactive/loading.

Quy ước:

- Không dùng text màu đỏ/xanh lẻ; luôn dùng `Badge` hoặc `StatusIndicator` cho trạng thái.

---

## 5. States: Loading / Error / Empty

### 5.1. Loading

- Trong page/form:
  - Dùng `Loader2` (lucide) + text mô tả (`text-muted-foreground`).
  - Hoặc dùng `Skeleton` (`components/ui/skeleton.tsx`) cho layout đã biết.

### 5.2. Error

- Dùng `Alert` `variant="destructive"` (`components/ui/alert.tsx`), kèm:
  - `AlertTitle` ngắn gọn.
  - `AlertDescription` mô tả, có gợi ý hành động (thử lại, kiểm tra ID…).

### 5.3. Empty

- Sử dụng:
  - Icon (lucide) + text `text-muted-foreground`.
  - Nội dung gợi ý tiếp theo (VD: “Chưa có sản phẩm – Thêm mới ngay” với CTA `Button`).

---

## 6. Naming & Folder Structure

- **Base UI**: `components/ui/*`
  - Button, Input, Select, Card, Badge, Alert, Dialog, Sheet, Sidebar, Tabs, Table, Toast, Skeleton…
- **Status / Helpers**: `components/ui/status/*`
  - `StatusIndicator`, `StatusFilter`, `StatusToggle`, `BulkStatusActions`…
- **Generic patterns**: `components/generic/*`
  - `GenericList`, `SearchBar`, `AdvancedSearch`, `TableOptions`…
- **Domain components**: `components/products/*`, `components/orders/*`, `components/account/*`, …
  - Chỉ compose từ `components/ui` + hooks/services; không re‑implement button/card riêng.

Quy ước:

- Component base: PascalCase (`Button`, `Card`, `StatusIndicator`).
- Props semantic: `variant`, `size`, `status` thay vì đổi tên component.

---

## 7. Refactor Notes (các điểm lặp style cần chú ý)

Một số pattern hiện đang lặp style, có thể dần refactor theo style guide:

1. **Card-like rows** (`rounded-lg border p-3/4` + toggle)  
   - Ví dụ:
     - `components/settings/settings-form.tsx`
     - `components/promo-codes/form-sections/*`
     - `components/banners/form-sections/basic-info.tsx`
   - Đề xuất:
     - Tạo `SettingsToggleRow` hoặc `FormOptionCard` dựa trên `Card`/`FormItem` và reuse.

2. **Mô tả phụ `text-sm text-muted-foreground`**  
   - Xuất hiện nhiều trong: account, contact, about, banners, v.v.
   - Đề xuất:
     - Dùng `CardDescription` khi nằm trong card.
     - Hoặc tạo `MutedText`/`FormHint` base cho description trong form.

3. **Container bảng / preview** (`overflow-hidden rounded-lg border`)  
   - Ví dụ: `components/table/data-table.tsx`, `components/data-table.tsx`.
   - Đề xuất:
     - Tạo `TableContainer` base hoặc sử dụng `Card` để đồng bộ look & feel.

4. **Status badge**  
   - Mapping màu status đôi khi được định nghĩa trực tiếp trong từng module.
   - Đề xuất:
     - Chuẩn hoá qua helper (VD: `getStatusBadgeVariant`) và `Badge`/`StatusIndicator`, tránh dùng màu rời.

---

Style guide này là nền tảng để refactor các vertical slice (Products, Orders, Account, v.v.).  
Khi chỉnh UI/UX:

- Ưu tiên reuse component từ `components/ui`.
- Hạn chế thêm class Tailwind “tự do” nếu đã có component đáp ứng được.
- Không thay đổi API/service hoặc DTO trừ khi thật sự cần cho UX.


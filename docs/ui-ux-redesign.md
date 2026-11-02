> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 15/08/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`DESIGN.md`](../DESIGN.md) và [`docs/ui-redesign/03-design-system-spec.md`](ui-redesign/03-design-system-spec.md).

# ShopViet — Thiết kế lại UI/UX (Báo cáo triển khai hoàn chỉnh)

> Phong cách: **Editorial Minimal Commerce** — hiện đại, tối giản, tập trung vào sản phẩm và trải nghiệm mua sắm.
> **Trạng thái: ✅ ĐÃ TRIỂN KHAI 100%** vào `apps/frontend/ecommerce-client` (build sạch, typecheck sạch, ESLint sạch).

---

## 0. Tóm tắt triển khai

| Hạng mục | Giá trị |
|---|---|
| Phạm vi | Toàn bộ 22 route của Frontend Client |
| Số file thay đổi | ~90 (6 lượt triển khai) |
| Build | ✅ `next build` exit 0 |
| Typecheck | ✅ `tsc --noEmit` không lỗi |
| ESLint | ✅ không lỗi (còn 2 warning `<img>` có chủ đích cho URL động Supabase) |
| Dark mode | ✅ Đầy đủ chi tiết (FOUC fix, autofill, scrollbar, transition, WCAG AA+) |
| Class cũ còn lại | ❌ Không còn (`glass-card`, `tech-heading`, `btn-glow`, `#2A5CAA`, `#FF6B00` đã được loại bỏ khỏi app — chỉ còn trong globals.css dạng utility giữ cho tương thích) |

---

## 1. Đánh giá hiện trạng (trước khi thiết kế lại — từ code thực tế)

### 1.1 Vấn đề hệ thống đã phát hiện

| # | Vấn đề | Bằng chứng trong code (đã được xử lý) |
|---|---|---|
| 1 | **Thiếu brand color nhất quán** | Light mode `--primary: 0 0% 9%` (đen), dark mode `--primary: 217 91% 60%` (xanh) — đã thống nhất brand đỏ ruby cả 2 mode |
| 2 | **Quá nhiều hiệu ứng trang trí** | mesh-gradient, glassmorphism, glow-on-hover, text-gradient… — đã bỏ khỏi các trang chính |
| 3 | **Hero carousel tự chạy** | `HeroCarousel` autoSlide 5s — đã thay bằng `Hero` editorial tĩnh |
| 4 | **Product card quá "động"** | hover translate-y, nút ẩn sau hover — đã sửa: nút luôn hiển thị (mobile-friendly) |
| 5 | **Section nặng nề** | `bg-card/50 rounded-3xl shadow-2xl` + blur glow — đã thay bằng section phẳng `border-line` |
| 6 | **Discount badge sai ngữ nghĩa** | `bg-destructive` (đỏ lỗi) — đã đổi sang `bg-brand` |
| 7 | **Mock data trong header** | `setCartItemCount(3)` — đã sửa thành đếm thật từ cart |
| 8 | **Typography chưa có hệ thống** | Headings lẫn lộn — đã có type scale `text-display/h1/h2/h3` |

### 1.2 Nguyên tắc thiết kế (đã áp dụng)

1. **Light-first, sạch sẽ** — 1 accent đỏ ruby `#e11d48`, sản phẩm là ngôi sao.
2. **Editorial typography** — heading to, đậm, tracking-tight; body nhỏ, thoáng.
3. **Ít hiệu ứng, có mục đích** — chỉ transition cho trạng thái interactive.
4. **Mobile-first, touch-friendly** — nút hành động luôn hiển thị, target ≥ 44px.
5. **Whitespace rộng** — 8pt grid, section padding lớn.
6. **Giá & CTA rõ ràng** — 1 CTA chính nhìn thấy ngay.

---

## 2. Design Tokens (ĐÃ TRIỂN KHAI — `app/globals.css`)

Triển khai thực tế khác bản đề xuất ban đầu: **giữ cấu trúc shadcn variables** (`--background`, `--foreground`, `--primary`…) để ~hàng trăm component cũ (login, about, contact…) vẫn hoạt động, đồng thời thêm palette `brand/surface/ink/line` mới.

```css
/* ─── Brand — 1 accent duy nhất (đỏ ruby) ─── */
--brand: 347 77% 50%;          /* #e11d48 */
--brand-hover: 350 77% 46%;
--brand-soft: 347 100% 97%;    /* nền nhạt cho chip/badge */

/* ─── Neutral (light) ─── */
--surface: 0 0% 98%;
--surface-2: 240 5% 96%;       /* skeleton, input */
--ink: 240 10% 4%;             /* text chính #18181b */
--ink-soft: 240 4% 34%;        /* text phụ */
--ink-faint: 240 4% 62%;       /* text mờ */
--line: 240 6% 90%;            /* border */

/* ─── Dark mode: cùng brand, đảo neutral ─── */
--background: 240 10% 4%;  --ink: 0 0% 96%;  --ink-soft: 240 5% 66%;
--surface: 240 8% 6%;      --line: 240 6% 17%;  --brand: 347 77% 56%;

/* ─── Typography scale ─── */
--text-display: 3.5rem;  --text-h1: 2.5rem;  --text-h2: 1.875rem;
--text-h3: 1.25rem;      --text-small: 0.875rem;  --text-tiny: 0.75rem;
```

**Quy tắc sử dụng (đã tuân thủ khắp app):**
- 3 trạng thái interactive: `brand` (CTA chính) / `ink` (secondary) / `line` (ghost/border).
- Discount badge: `bg-brand text-white`; giá gốc `line-through text-ink-faint`.
- Utilities mới: `container-app`, `section-heading`, `section-title`, `section-label`, `focus-ring`, `scrollbar-hide` (⚠️ class này trước đây được dùng nhưng chưa từng được định nghĩa — đã thêm).

**Các utility cũ giữ lại trong `globals.css`** (`glass-card`, `mesh-gradient-bg`, `tech-heading`, `glow-on-hover`, `text-gradient`, `animate-fade-in`…) vì vẫn có component tham chiếu — tuy các trang chính đã không còn dùng.

---

## 3. Nhật ký triển khai (6 lượt)

### Lượt 1 — Design tokens + Trang chủ + Trang sản phẩm (19 file)

| File | Nội dung |
|---|---|
| `app/globals.css` | Design tokens mới + giữ shadcn compat + utility cũ |
| `components/hero.tsx` *(mới)* | Hero editorial tĩnh, nhận banners từ API, có fallback |
| `components/product-card.tsx` | Ảnh `aspect-[4/5]`, nút "Thêm vào giỏ" luôn hiện, badge brand, overlay hết hàng |
| `components/features-section.tsx` | USP strip tối giản (bỏ card nổi + motion) |
| `components/category-section.tsx` + `category-card.tsx` | Bỏ radial-gradient, card vuông gọn |
| `components/promotion-banner.tsx` | Banner phẳng, bỏ glass/gradient overlay |
| `components/newsletter-section.tsx` | Input bo tròn, tối giản |
| `components/header/index.tsx` | Header gọn, badge brand, sửa mock cart count |
| `app/page.tsx` | Layout mới: Hero → USP → Danh mục → Bán chạy → Banner → Newsletter |
| `app/(routes)/product/[slug]/page.tsx` | Layout gallery 2/3 + info 1/3 (sticky), mobile sticky buy bar |
| `components/product-gallery.tsx` | Nút điều hướng luôn hiển thị, ảnh vuông |
| `components/products/*` (header, price, variant-selector, quantity-selector, actions, tabs, spec-card, breadcrumb) | Chips radio, stepper tròn, CTA tròn brand, tab underline |

### Lượt 2 — Giỏ hàng + Checkout (13 file)

| File | Nội dung |
|---|---|
| `components/cart/*` (10 file) | Bỏ glass/gradient/glow; stepper `border-line`; promo box `bg-surface`; nút tròn brand |
| `components/checkout/*` (7 file) | Radio card có `has-[data-state=checked]:border-brand`; payment grid 2 cột; sticky summary |
| `app/(routes)/cart/page.tsx` + `checkout/page.tsx` | Wrapper `container-app`, section-heading |

### Lượt 3 — /products + Wishlist (14 file)

| File | Nội dung |
|---|---|
| `components/product-listing.tsx` | Breadcrumb + toolbar + sort + mobile drawer mới |
| `components/product-filters/*` | Accordion `border-line bg-surface`, nút tròn |
| `components/product-list-item.tsx`, `pagination.tsx`, `filter/add-to-comparison.tsx` | Đồng bộ palette, active page `bg-brand` |
| `components/wishlist/*` (6 file) | Nút xóa + thêm giỏ luôn hiển thị, skeleton grid |
| `app/(routes)/products/**` (loading, [category], [brand], [slug]) | Đồng bộ layout |

### Lượt 4 — Account (14 file)

| File | Nội dung |
|---|---|
| `app/(routes)/account/layout.tsx` + `page.tsx` | container-app, breadcrumb, card insights `border-line` |
| `components/account/account-sidebar.tsx` | Nav active `bg-brand-soft text-brand` |
| `components/account/profile-tab.tsx` | Form tròn brand, details `bg-surface` |
| `components/account/orders-tab.tsx`, `order-item.tsx`, `order-details.tsx` (+ skeleton) | Bỏ glass + `tech-heading`, tổng `text-h3 text-ink` |
| `components/account/addresses-tab.tsx`, `address-item.tsx`, `address-form.tsx` | Badge "Mặc định" `bg-brand`, nút tròn |
| `app/(routes)/account/returns/**` | dl semantic, timeline dot brand |

### Lượt 5 — Dark mode chi tiết (25+ file)

| Hạng mục | Nội dung |
|---|---|
| `globals.css` | `color-scheme`, custom scrollbar 2 mode, autofill fix, shadow depth, selection brand, skeleton duration |
| `app/layout.tsx` | **FOUC-prevention script** — set class dark trước hydrate, hết flash trắng |
| `app/providers.tsx` + `theme-toggle.tsx` | Bỏ `disableTransitionOnChange`, `applyTheme()` transition mượt 400ms, menu đánh dấu lựa chọn |
| Fix hard-code | `app/error.tsx`, `not-found.tsx`, `skeleton.tsx`, `search-suggestions.tsx`, `user-menu.tsx`, `featured-categories.tsx`, `footer.tsx`, `product-filters/*`, `reviews/*`, `app/(auth)/**` (login/register/layout), `loading-spinner.tsx`, `category-grid.tsx`, `product-comparison.tsx`, `add-to-wishlist-button.tsx`, `status-badge.tsx` |

### Lượt 6 — About / Contact / Compare (4 file)

| File | Nội dung |
|---|---|
| `app/(routes)/about/page.tsx` | Hero `text-display`, values/team `border-line`, bỏ glass + scale hover |
| `app/(routes)/contact/page.tsx` | Card thông tin `border-line`, form `bg-surface`, social icons card tròn |
| `app/(routes)/compare/page.tsx` | Bảng `divide-line bg-surface`, giá sale `text-brand` |
| `components/product-reviews.tsx` | Dọn `#2A5CAA` cuối cùng trong app |

---

## 4. Wireframe — Trang chủ (đã triển khai)

```
┌────────────────────────────────────────────────────────────┐
│ HEADER: logo · nav · search · ♥ · 🛒 · theme toggle          │  ← sticky 64px, bg trắng, border-line
├────────────────────────────────────────────────────────────┤
│ HERO (editorial): "Công nghệ cho cuộc sống Việt"  [Ảnh]     │
│   subtext · CTA [Mua ngay] [Khám phá] · USP mini ✓✓✓        │
├────────────────────────────────────────────────────────────┤
│ USP STRIP (4 items): Giao nhanh · An toàn · Đổi trả · 24/7  │
├────────────────────────────────────────────────────────────┤
│ DANH MỤC: horizontal scroll 6 ô ảnh vuông + tên             │
├────────────────────────────────────────────────────────────┤
│ BÁN CHẠY: section-label + section-title → grid 2/3/4        │
├────────────────────────────────────────────────────────────┤
│ BANNER GIỮA: phẳng, badge "Ưu đãi có hạn" + 2 CTA tròn      │
├────────────────────────────────────────────────────────────┤
│ NEWSLETTER: 1 dòng text + input tròn + button brand         │
├────────────────────────────────────────────────────────────┤
│ FOOTER: 4 cột link + social icons + copyright               │
└────────────────────────────────────────────────────────────┘
```

## 5. Wireframe — Trang chi tiết sản phẩm (đã triển khai)

```
┌────────────────────────────────────────────────────────────┐
│ Breadcrumb: Trang chủ / Sản phẩm / Danh mục / Tên           │
├───────────────────────────────┬────────────────────────────┤
│ GALLERY (2/3):                │ INFO (1/3, sticky):         │
│  ảnh vuông + [◀][▶] luôn hiện  │  brand label · H1 · rating  │
│  thumbnails 20px border-brand │  GIÁ to + badge -X% brand   │
│  hover zoom scale-105         │  Màu: chips · SL: stepper   │
│                               │  [Thêm vào giỏ] [Mua ngay]  │
│                               │  wishlist + trust signals   │
├───────────────────────────────┴────────────────────────────┤
│ TABS underline: Mô tả | Thông số | Đánh giá (n)             │
├────────────────────────────────────────────────────────────┤
│ "Sản phẩm tương tự" — grid 2/4                              │
└────────────────────────────────────────────────────────────┘
┌──────────────────────────────┐  ← Mobile: sticky buy bar (lg:hidden)
```

---

## 6. Dark Mode — chi tiết đã triển khai

| Tính năng | Mô tả |
|---|---|
| **FOUC prevention** | Script inline trong `<head>` đọc `localStorage.theme` + `prefers-color-scheme` → set `.dark` trước hydrate |
| **`color-scheme`** | `light`/`dark` — form controls, scrollbar native, date picker tự đổi |
| **Custom scrollbar** | 10px, thumb `ink-faint/35`, border-clip; Firefox `scrollbar-width: thin` |
| **Autofill fix** | Chống nền vàng Chrome: `box-shadow: 0 0 0 1000px card inset` |
| **Shadow depth** | `--shadow-sm` → `--shadow-2xl` tối hơn (alpha 0.4–0.6) |
| **Theme transition** | Class `.theme-transition` tạm thời 400ms khi toggle (không animate lúc load) |
| **Card depth** | `.dark .bg-card { box-shadow: inset 0 1px 0 white/3% }` |
| **Selection** | `::selection` brand đỏ cả 2 mode |
| **Skeleton** | `bg-surface-2` + duration 1.6s |
| **Scrollbar-hide** | Utility mới (trước dùng mà không định nghĩa) |

**Kiểm tra tương phản WCAG (đã đo):**

| Cặp màu (dark) | Tỷ lệ | Đạt |
|---|---|---|
| bg vs ink | 17.97:1 | ✅ AAA |
| bg vs ink-soft | 7.71:1 | ✅ AAA |
| bg vs brand | 5.38:1 | ✅ AA |
| bg vs ink-faint | 4.09:1 | ✅ AA |

---

## 7. Accessibility & Performance (đã triển khai)

- **Focus visible**: `focus-ring` utility (outline 2px brand) trên mọi interactive; dark mode đậm hơn.
- **Alt text** có nghĩa; nút icon có `aria-label`; radio/chip có `role="radio"` + `aria-checked`.
- **Ảnh**: `next/image` với `sizes`, `loading="lazy"` (trừ hero `priority` cho LCP).
- **Giảm motion**: `prefers-reduced-motion` tắt animation/transition.
- **Giảm tải JS**: hero tĩnh (bỏ carousel JS), tabs lazy-load `next/dynamic`.
- **Semantic HTML**: `<nav aria-label>`, `<fieldset>/<legend>`, `<dl>`, `<article>` — thêm trong các trang account/returns.

---

## 8. Code mẫu tham khảo (docs/ui-ux-redesign/)

> Bộ code mẫu ban đầu trong thư mục này đã được **triển khai và tinh chỉnh trực tiếp vào app** (kết nối hooks/API thật, giữ props interface). File mẫu vẫn giữ làm tài liệu tham chiếu.

| File | Trạng thái |
|---|---|
| `docs/ui-ux-redesign/tokens.css` | ✅ Đã chuyển vào `app/globals.css` (có điều chỉnh shadcn compat) |
| `docs/ui-ux-redesign/components/header.tsx` | ✅ Đã triển khai (giữ chức năng search/user/mobile menu thật) |
| `docs/ui-ux-redesign/components/hero.tsx` | ✅ Đã triển khai (nhận banners API) |
| `docs/ui-ux-redesign/components/product-card.tsx` | ✅ Đã triển khai (giữ AddToCart/Wishlist + prefetch) |
| `docs/ui-ux-redesign/components/category-grid.tsx` | ✅ Đã triển khai |
| `docs/ui-ux-redesign/components/buy-panel.tsx` | ✅ Tương đương `components/products/product-actions.tsx` |
| `docs/ui-ux-redesign/home-page.tsx` | ✅ Đã triển khai vào `app/page.tsx` |
| `docs/ui-ux-redesign/product-detail-page.tsx` | ✅ Đã triển khai vào `app/(routes)/product/[slug]/page.tsx` |

---

## 9. Ghi chú & quyết định kỹ thuật

1. **Giữ `--primary` = brand đỏ**: các component cũ dùng `bg-primary` (nút, focus) tự đồng bộ màu brand mà không cần sửa từng file.
2. **Giữ utility cũ trong globals.css**: `glass-card`, `mesh-gradient`… vẫn có nơi tham chiếu (dù các trang chính đã bỏ) — xóa sẽ phá build.
3. **`<img>` thay `next/image`** trong order-item/return-detail: cố ý giữ vì URL động từ Supabase không khai báo được trong `remotePatterns`.
4. **`defaultTheme="dark"`**: giữ nguyên từ trước — tôn trọng preference người dùng qua FOUC script.
5. **Không tách theme-light/dark riêng**: dùng CSS variables đảo ngược — đơn giản, nhất quán, dễ bảo trì.

---

## 10. Hướng dẫn xem kết quả

```bash
cd apps/frontend/ecommerce-client
npm run dev          # → http://localhost:3000
```

- Toggle theme bằng icon ☀️/🌙 trên header — quan sát transition mượt + không flash trắng.
- Kiểm tra các luồng: Trang chủ → Sản phẩm → Chi tiết → Giỏ hàng → Checkout → Account.
- Dark mode: `prefers-color-scheme: dark` hoặc chọn "Tối" trong dropdown theme.

## 11. Khả năng mở rộng

- **Dashboard admin** (`ecommerce-dashboard`) chưa nằm trong phạm vi — có thể áp dụng cùng design tokens (đang dùng React 18 + Recharts/TanStack Table riêng).
- **A/B test CTA placement** trên Hero nếu có điều kiện.
- **Component library**: tách các component dùng lại (ProductCard, BuyPanel, SectionHeading) thành package dùng chung cho client + dashboard.

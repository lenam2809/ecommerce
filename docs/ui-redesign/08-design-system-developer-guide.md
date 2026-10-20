# TÀI LIỆU HƯỚNG DẪN PHÁT TRIỂN HỆ THỐNG GIAO DIỆN (DEVELOPER GUIDE)
## SHOPVIET HYBRID PREMIUM TECH DESIGN SYSTEM (SSoT 2026)

> **Mục tiêu tài liệu:** Cung cấp hướng dẫn kỹ thuật toàn diện, quy chuẩn thiết kế, bảng tra cứu Semantic Tokens Tailwind CSS v4, nguyên tắc phân vai màu sắc và các đoạn mã mẫu (code snippets) chuẩn hóa để toàn bộ kỹ sư phát triển tuân thủ đồng nhất trên dự án `apps/frontend/ecommerce-client`.

---

## 1. HƯỚNG DẪN HỆ THỐNG SEMANTIC TOKENS (TAILWIND CSS V4)

ShopViet áp dụng kiến trúc **Tailwind CSS v4** trên nền tảng `@theme inline` kết hợp `next-themes` (`attribute="class"`). Mọi màu sắc và kích thước được trừu tượng hóa qua Semantic Tokens nhằm đảm bảo **tự động tương thích 100% Light Mode và Dark Mode**, đạt chuẩn trợ năng WCAG AA (độ tương phản văn bản tối thiểu $\ge 4.5:1$, tiêu đề $\ge 7:1$).

### 1.1. Kiến trúc Bề mặt (Surface Architecture)

- **Light Mode:** Sử dụng bảng màu **Cool Alabaster Slate** sạch sẽ, hiện đại.
  - Nền trang (`bg-background`): `#F8FAFC` (`slate-50`).
  - Thẻ card nội dung (`bg-card`): `#FFFFFF` (Pure White).
  - Vùng đệm thông số kỹ thuật, ô tìm kiếm (`bg-surface`): `#F1F5F9` (`slate-100`).
  - Viền phân tách cấu trúc (`border-border`): `#E2E8F0` (`slate-200`).
- **Dark Mode:** Hệ thống **Deep Obsidian** 4 lớp phân tầng độ sâu quang học:
  - Lớp 0 — Nền gốc tổng thể trang (`bg-background`): `#090D16` (Deep Obsidian 950).
  - Lớp 1 — Khối Card, Container nội dung (`bg-card`): `#111827` (Gray/Slate 900).
  - Lớp 2 — Khung ảnh SP, Spec Chips, Input (`bg-surface`): `#182234` (Obsidian 850).
  - Lớp 3 — Dropdown menu, Popover, Hover state (`bg-surface-2` / `bg-popover`): `#1E293B` (Slate 800).

### 1.2. Bảng Tra Cứu Ánh Xạ Tokens `:root` (Light) vs `.dark` (Dark)

| Semantic Token | Tailwind Class | Light Mode (`:root`) | Dark Mode (`.dark`) | Ý nghĩa & Vị trí áp dụng chuẩn |
|---|---|---|---|---|
| `--background` | `bg-background` | `#F8FAFC` (`210 40% 98%`) | `#090D16` (`222 42% 6%`) | Nền toàn trang (`body`, layout wrappers) |
| `--card` | `bg-card` | `#FFFFFF` (`0 0% 100%`) | `#111827` (`221 39% 11%`) | Thẻ sản phẩm, Order Summary, Modal dialog |
| `--surface` | `bg-surface` | `#F1F5F9` (`210 40% 96.1%`) | `#182234` (`219 37% 15%`) | Khung ảnh thumbnail, Spec Chips, Input base |
| `--surface-2` | `bg-surface-2` | `#E2E8F0` (`214 32% 91.4%`) | `#1E293B` (`217 33% 17.5%`) | Hover trạng thái thẻ, Nền Skeleton, Icon box |
| `--bento-dark` | `bg-bento-dark` | `#090D16` (Obsidian cố định) | `#111827` | Khối Hero Tech Bento, Privilege VIP Banner |
| `--ink` | `text-ink` | `#0F172A` (`222 47% 11%`) | `#F8FAFC` (`210 40% 98%`) | Tiêu đề H1/H2/H3, tên sản phẩm, tổng tiền |
| `--ink-soft` | `text-ink-soft` | `#475569` (`215 19% 35%`) | `#94A3B8` (`215 20% 65%`) | Mô tả chi tiết, nhãn phụ, thông số phụ |
| `--ink-faint` | `text-ink-faint` | `#64748B` (`215 16% 47%`) | `#94A3B8` (Contrast > 7:1) | Giá niêm yết gạch ngang, breadcrumb, timestamp |
| `--line` / `--border` | `border-line` / `border-border` | `#E2E8F0` (`214 32% 91%`) | `#1E293B` (`217 33% 17.5%`) | Đường viền các khối card, divider, separator |
| `--tech-blue` | `bg-tech-blue` / `text-tech-blue` | `#2563EB` (`221 83% 53%`) | `#3B82F6` (`217 91% 60%`) | Màu chủ đạo công nghệ, tương tác, cam kết |
| `--brand` / `--cta-crimson` | `bg-brand` / `text-brand` | `#E11D48` (`347 77% 50%`) | `#E11D48` (`347 77% 50%`) | Màu chuyển đổi bán hàng (Sale CTA, Giá bán) |

> [!CAUTION]
> **Tuyệt đối không hardcode hex code vào JSX!** Luôn sử dụng semantic utility classes (`bg-card`, `text-ink`, `border-line`, `text-brand`, `bg-tech-blue`). Việc ghi trực tiếp mã màu như `bg-[#fff]` hoặc `text-[#000]` sẽ phá vỡ tính năng đổi giao diện và vi phạm nguyên tắc kiểm soát chất lượng.

---

## 2. BẢNG QUY CHUẨN PHÂN VAI MÀU SẮC (DUAL-ACCENT TECH HIERARCHY)

Để loại bỏ hoàn toàn cảm giác "thời trang/mỹ phẩm" (khi lạm dụng tone đỏ/hồng) và tôn vinh tính chuyên nghiệp của nền tảng thiết bị công nghệ cao cấp, toàn bộ giao diện tuân theo **Quy tắc Phân Vai Kép (Dual-Accent Tech Hierarchy)**:

```
                            ┌───────────────────────────────────────────────┐
                            │           DUAL-ACCENT ARCHITECTURE            │
                            └──────────────────────┬────────────────────────┘
                                                   │
                   ┌───────────────────────────────┴───────────────────────────────┐
                   ▼                                                               ▼
    ┌─────────────────────────────┐                                 ┌─────────────────────────────┐
    │  ELECTRIC BLUE (#2563EB)    │                                 │   TECH CRIMSON (#E11D48)    │
    │  [Công nghệ & Tương tác]     │                                 │   [Chuyển đổi & Bán hàng]   │
    ├─────────────────────────────┤                                 ├─────────────────────────────┤
    │ • Nút Thêm vào giỏ hàng     │                                 │ • Nút Mua ngay (Buy Now)    │
    │ • Nút Tương tác / Bộ lọc    │                                 │ • Nút Tiến hành thanh toán  │
    │ • Badge "Chính hãng VN/A"   │                                 │ • Giá bán khuyến mãi        │
    │ • Badge "Bảo hành 24T"      │                                 │ • Badge % Giảm giá (-20%)   │
    │ • Liên kết điều hướng chính │                                 │ • Flash Sale / Hot Deals    │
    │ • Active Tab / Focus Ring   │                                 │ • Nút Xác nhận đặt hàng     │
    └─────────────────────────────┘                                 └─────────────────────────────┘
```

### 2.1. Ma Trận Quyết Định Sử Dụng Màu

| Thành phần UI | Màu sắc chuẩn | Token / Class CSS | Ghi chú & Logic áp dụng |
|---|---|---|---|
| **Nút "Mua ngay" (Buy Now)** | Tech Crimson | `bg-brand hover:bg-brand-hover text-white` | Kích thích hành động thanh toán trực tiếp tức thì |
| **Nút "Thêm vào giỏ" (Add to Cart)** | Electric Blue | `bg-tech-blue hover:bg-tech-blue-hover text-white` | Hành vi lưu trữ/chọn lựa sản phẩm công nghệ |
| **Nút "Tiến hành thanh toán"** | Tech Crimson | `bg-brand hover:bg-brand-hover text-white` | Nút hoàn tất đơn hàng quan trọng nhất tại Cart/Checkout |
| **Giá khuyến mãi (Sale Price)** | Tech Crimson | `text-brand font-mono tabular-nums whitespace-nowrap` | Nổi bật mức giá ưu đãi, bắt buộc đi kèm định dạng số chuẩn |
| **Giá gốc niêm yết (Original Price)** | Slate Neutral | `text-ink-faint line-through font-mono tabular-nums` | Màu mờ, có gạch ngang thể hiện giá tham chiếu |
| **Badge Giảm giá (`-15%`)** | Tech Crimson | `bg-brand text-white font-bold` | Thu hút sự chú ý vào mức tiết kiệm |
| **Badge Bảo hành (`24 Tháng VN/A`)** | Electric Blue | `bg-tech-blue/10 text-tech-blue border-tech-blue/20` | Tạo dựng niềm tin uy tín phần cứng chính hãng |
| **Badge Trạng thái (`Còn hàng`)** | Emerald Green | `text-emerald-600 dark:text-emerald-400 bg-emerald-500/10` | Khẳng định tình trạng sẵn có tại showroom |
| **Badge Cảnh báo (`Chỉ còn 3 chiếc`)**| Amber Warning | `text-amber-600 dark:text-amber-400 bg-amber-500/10` | Tạo tính cấp bách dựa trên tồn kho thực tế |
| **Icon Xóa / Hủy đơn / Thất bại** | Destructive Red | `text-destructive hover:bg-destructive/10` | Luôn dùng icon `Trash2` (không dùng icon Heart để xóa) |

---

## 3. MẪU CODE CHUẨN HÓA (REUSABLE CODE SNIPPETS)

### 3.1. Định dạng Tiền tệ Chuẩn (`PriceFormat`)
> [!IMPORTANT]
> **Quy tắc vàng 2026:** Mọi hiển thị tiền tệ VNĐ bắt buộc phải có thuộc tính `tabular-nums` (để các chữ số thẳng hàng tuyệt đối khi hiển thị dạng bảng hoặc danh sách) và `whitespace-nowrap` (tuyệt đối không để ký tự `₫` bị rớt dòng đơn độc).

```tsx
import { formatPrice } from "@/lib/contants"

interface PriceProps {
  price: number
  originalPrice?: number
  size?: "sm" | "md" | "lg" | "xl"
}

export function ProductPrice({ price, originalPrice, size = "md" }: PriceProps) {
  const sizeClasses = {
    sm: "text-small",
    md: "text-base",
    lg: "text-h3 font-semibold",
    xl: "text-h2 font-bold",
  }

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      {/* Giá bán / khuyến mãi - Tech Crimson */}
      <span
        className={`font-mono tabular-nums whitespace-nowrap text-brand font-bold ${sizeClasses[size]}`}
      >
        {formatPrice(price)}
      </span>

      {/* Giá gốc niêm yết gạch ngang (nếu có giảm giá) */}
      {originalPrice && originalPrice > price && (
        <span className="font-mono tabular-nums whitespace-nowrap text-tiny text-ink-faint line-through">
          {formatPrice(originalPrice)}
        </span>
      )}
    </div>
  )
}
```

### 3.2. Mẫu Nút Chuẩn (`Button`) — Tích hợp Trợ năng & Semantic
```tsx
import { Button } from "@/components/ui/button"
import { ShoppingCart, Zap } from "lucide-react"

export function ActionButtonGroup() {
  return (
    <div className="flex items-center gap-3 w-full">
      {/* Nút Thêm vào giỏ - Electric Blue */}
      <Button
        variant="outline"
        className="flex-1 h-12 rounded-xl border-tech-blue/30 text-tech-blue hover:bg-tech-blue-soft hover:border-tech-blue font-semibold transition-all focus-ring"
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        Thêm giỏ hàng
      </Button>

      {/* Nút Mua ngay - Tech Crimson */}
      <Button
        className="flex-1 h-12 rounded-xl bg-brand text-white hover:bg-brand-hover shadow-md shadow-brand/20 font-bold transition-all focus-ring"
      >
        <Zap className="h-5 w-5 mr-2 fill-current" />
        Mua ngay
      </Button>
    </div>
  )
}
```

### 3.3. Mẫu Thẻ Nhãn Chuẩn (`Badge`)
```tsx
import { ShieldCheck, Flame, CheckCircle } from "lucide-react"

export function StandardBadges() {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Badge Giảm giá Flash Sale */}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-tiny font-bold bg-brand text-white shadow-xs">
        <Flame className="h-3 w-3 fill-current" />
        -15%
      </span>

      {/* Badge Cam kết Phần cứng Chính hãng */}
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-tiny font-semibold bg-tech-blue-soft text-tech-blue border border-tech-blue/20">
        <ShieldCheck className="h-3.5 w-3.5" />
        Bảo hành 24T Chính Hãng
      </span>

      {/* Badge Trạng thái Kho hàng */}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-tiny font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <CheckCircle className="h-3 w-3" />
        Sẵn hàng tại 45 Showroom
      </span>
    </div>
  )
}
```

### 3.4. Mẫu Cấu Trúc Thẻ Sản Phẩm Chuẩn (`ProductCard`)
```tsx
import Image from "next/image"
import Link from "next/link"
import { ShieldCheck, Star } from "lucide-react"
import { formatPrice } from "@/lib/contants"
import AddToCartButton from "@/components/add-to-cart-button"
import AddToWishlistButton from "@/components/add-to-wishlist-button"
import AddToComparison from "@/components/filter/add-to-comparison"
import { Product } from "@/types/product"

export function StandardProductCard({ product }: { product: Product }) {
  const hasDiscount = Boolean(product.salePrice && product.salePrice < product.price)
  const displayPrice = hasDiscount ? product.salePrice! : product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0

  return (
    <article className="group relative flex flex-col rounded-2xl border border-line bg-card p-3 sm:p-4 transition-all duration-300 hover:shadow-lg hover:border-tech-blue/40 hover:-translate-y-1">
      {/* Khung ảnh sản phẩm tỉ lệ 1:1 với nền trung tính */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface mb-3">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.mainImage || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Cụm nút hành động góc trên bên phải */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
          <AddToWishlistButton productId={product.id} className="h-8 w-8 bg-card/90 backdrop-blur-xs" />
          <AddToComparison product={product} />
        </div>

        {/* Badge giảm giá góc trên bên trái */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-tiny font-bold bg-brand text-white shadow-xs">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          {/* Tối đa 2 Spec Chips cho phần cứng */}
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-surface-2 text-ink-soft">
              Apple M3 Pro
            </span>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-surface-2 text-ink-soft">
              36GB / 1TB
            </span>
          </div>

          <h3 className="line-clamp-2 text-small font-semibold text-ink group-hover:text-tech-blue transition-colors mb-2">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>

        <div>
          {/* Giá tiền chuẩn tabular-nums + whitespace-nowrap */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-mono tabular-nums whitespace-nowrap text-h3 font-bold text-brand">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="font-mono tabular-nums whitespace-nowrap text-tiny text-ink-faint line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Nút giỏ hàng chuẩn 44px touch target */}
          <AddToCartButton
            product={product}
            className="w-full h-10 rounded-xl bg-tech-blue hover:bg-tech-blue-hover text-white text-small font-semibold transition-colors"
          />
        </div>
      </div>
    </article>
  )
}
```

---

## 4. QUY CHUẨN DỮ LIỆU SSoT TOÀN DIỆN (SINGLE SOURCE OF TRUTH 2026)

Để đảm bảo tính nhất quán trên mọi trang màn hình (`Header`, `Footer`, `About`, `Contact`, `Cart`, `Checkout`), toàn bộ thông tin vận hành và cam kết của ShopViet tuân thủ bộ chỉ số chuẩn sau:

| Thông số nghiệp vụ | Giá trị chuẩn SSoT 2026 | Vị trí xuất hiện |
|---|---|---|
| **Mạng lưới Showroom** | **45 Showroom công nghệ** hiện đại toàn quốc (Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ, Hải Phòng) | Header marquee, Footer, About, Contact, Delivery picker |
| **Hotline Tư vấn & Bán hàng** | **1800 6868** (Miễn phí cước gọi, 8:00 – 21:30 hàng ngày) | TopBar, Header, Footer, Contact, Order confirmation |
| **Hotline Hỗ trợ Kỹ thuật** | **1800 6869** (Miễn phí cước gọi, 8:00 – 21:00 hàng ngày) | Footer, About, Returns & Warranty center |
| **Mốc Miễn Phí Vận Chuyển** | **Đơn hàng từ 500.000₫ trở lên** (Tiến độ % hiển thị trực quan) | Thanh CartHeader progress bar, OrderSummary, Checkout |
| **Phí Vận chuyển mặc định** | **30.000₫** đối với các đơn hàng dưới 500.000₫ | Cart, Checkout, Order Totals |
| **Chính sách Đổi trả** | **30 ngày 1 đổi 1** đối với lỗi từ nhà sản xuất | Product details, About, Guarantee footer banner |
| **Cam kết Phần cứng** | **100% Sản phẩm chính hãng phân phối tại VN/A** | Product Card badge, Header ticker, Checkout badge |

---

## 5. CHECKLIST TRƯỚC KHI TẠO PULL REQUEST (DEV QUALITY GATES)

Mọi đóng góp mã nguồn (Pull Request) liên quan đến giao diện người dùng phải vượt qua 5 tiêu chí nghiệm thu nghiêm ngặt sau:

- [x] **Zero Warning Build:** Chạy lệnh `npm run build` và `npm run lint` hoàn thành mà không có bất kỳ thông báo lỗi hoặc cảnh báo ESLint/TypeScript nào.
- [x] **100% Semantic Token:** Không tồn tại mã hex tĩnh (`#fff`, `#000`, `#e11d48`) trực tiếp trong các file JSX/TSX.
- [x] **Currency Strict Formatting:** Toàn bộ giá tiền có đầy đủ thuộc tính `tabular-nums` và `whitespace-nowrap`.
- [x] **Dual-Accent Compliance:** Nút Mua ngay / Thanh toán / Giảm giá dùng Tech Crimson (`#E11D48`), nút Thêm giỏ hàng / Tương tác / Filter dùng Electric Blue (`#2563EB`).
- [x] **WCAG 2.1 AA Certified:** Chế độ Dark Mode không sử dụng màu đen thuần `#000000` mà dùng hệ tầng Deep Obsidian (`#090D16`), đảm bảo độ tương phản văn bản đạt tỷ lệ tối thiểu $4.5:1$.

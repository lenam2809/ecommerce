Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Đặc Tả Kỹ Thuật: Đồng Bộ Dữ Liệu Frontend - Schema & API Backend .NET 8 (SSoT 2026)

> **Mục tiêu:** Rà soát 100% các điểm giao diện đang fix cứng (mock data) trên hệ thống `apps/frontend/ecommerce-client`, thiết kế chi tiết lược đồ cơ sở dữ liệu EF Core 8 (PostgreSQL) và danh mục API RESTful/WebSocket tương ứng nhằm thay thế hoàn toàn dữ liệu tĩnh bằng dữ liệu thực tế từ Backend.

---

## Phần 1: Bảng Kiểm Kê Mock Data Frontend (`apps/frontend/ecommerce-client`)

Bảng dưới đây kiểm kê toàn bộ mã nguồn Frontend đang sử dụng dữ liệu tĩnh hoặc hành vi giả lập, phân loại theo 6 phân hệ nghiệp vụ:

| STT | Phân hệ / Màn hình | File & Vị trí dòng | Chi tiết Mock Data / Hành vi giả lập | Phương án giải quyết phía Backend |
|---|---|---|---|---|
| 1 | **Trang chủ & Hero** | `app/page.tsx`<br>(L21–L94, L96–L121) | `FALLBACK_FLAGSHIP_PRODUCTS`: Ghi đè cứng danh sách sản phẩm flagship (iPhone 16 Pro Max, MacBook Pro 14 M3, Cáp sạc Ugreen) kèm hàm `normalizeSSoTProduct` format lại giá tiền và thông số kỹ thuật. | Bổ sung query `GET /api/Products/paged?isFlagship=true` hoặc `GET /api/Products/featured` trả về đúng thực thể kèm specs highlight. |
| 2 | **Hero Banner Flash Sale** | `components/hero.tsx`<br>(L25–L32, L39–L44, L113–L251) | - `QUICK_CATEGORIES`: Danh mục truy cập nhanh tĩnh.<br>- Đồng hồ đếm ngược Flash Sale cố định `08:45:12`.<br>- Bento Sub-Cards và sản phẩm Hero MacBook Pro M3 Pro fix cứng giá gốc `59.990.000₫` và giá sale `49.990.000₫`. | Xây dựng phân hệ `FlashSale` & `FlashSaleItem`. API `GET /api/FlashSales/active` trả về `StartTime`, `EndTime`, `Items` kèm quota số lượng đã bán. |
| 3 | **Danh mục Bento** | `components/category-section.tsx`<br>(L26–L85) | `TILES`: 6 khối Bento danh mục (Điện thoại, Laptop, Tablet, Âm thanh, Smart Home, Wearables) với badge và số lượng sản phẩm tĩnh. | Bổ sung API `GET /api/Categories/featured-tiles` trả về số lượng sản phẩm thực tế theo danh mục. |
| 4 | **Banner Khuyến Mãi** | `components/promotion-banner.tsx`<br>(L16, L25–L33) | - Gắn cứng mã voucher `TECHVIP500`.<br>- Form đăng ký nhận tin `handleNewsletterSubmit` chỉ chạy `setTimeout` 1000ms giả lập thành công. | Tạo Entity `Voucher`, API `POST /api/Cart/apply-voucher` và `POST /api/Newsletter/subscribe` lưu email đăng ký. |
| 5 | **Catalog & Bộ lọc** | `components/product-listing.tsx`<br>(L28–L174, L371–L386) | - `SSOT_FALLBACK_CATALOG`: 8 sản phẩm mẫu khi API trả về rỗng.<br>- Lọc RAM (`16GB`, `32GB`), SSD (`512GB`, `1TB`) thực hiện thuần túy bằng JavaScript lọc mảng phía client.<br>- Gắn cứng `totalCount = 148`. | Mở rộng `ProductSpecification` có trường `FilterKey`. API `GET /api/Products/paged` hỗ trợ lọc động qua `specs[ram]` hoặc `specs[ssd]`. |
| 6 | **Bộ lọc Spec Chip** | `components/product-filters/index.tsx`<br>(L17–L48) | `RAM_OPTIONS`, `SSD_OPTIONS`, trần thanh trượt giá `70.000.000₫` chỉ lưu trong state React, không gửi query params lên backend. | Mở rộng API `GET /api/Products/filter-facets` trả về các giá trị filter khả dụng theo từng danh mục. |
| 7 | **Thẻ sản phẩm (Card/ListItem)** | `components/product-card.tsx`<br>(L50–L107)<br>`components/product-list-item.tsx`<br>(L39–L86) | - Dùng Regular Expression phân tích tên sản phẩm để bóc tách chip RAM/Chipset.<br>- Gắn cứng badge `"Bảo hành 24T chính hãng"` và rating `"5.0"`. | Entity `Product` bổ sung `WarrantyMonths = 24`, `OriginBadge`. Entity `ProductSpecification` có cờ `IsHighlight = true` để render chip spec. |
| 8 | **Chi tiết sản phẩm (Specs)** | `components/products/spec-card.tsx`<br>(L25–L40, L45–L119) | `DEFAULT_14_SPECS`: Tự động điền 14 thông số kỹ thuật của MacBook Pro 14 vào bất kỳ sản phẩm nào có dưới 14 thông số. | Chuẩn hóa bảng `ProductSpecifications` theo nhóm (`GroupName`: Vi xử lý, Màn hình, Đồ họa, Pin & Sạc...). |
| 9 | **Chi tiết sản phẩm (Header/Actions)** | `components/products/product-header.tsx`<br>`product-actions.tsx`<br>`product-tabs.tsx` | - Gắn cứng `SKU="MBP14-M3P-36-1TB"`.<br>- Checkbox gói AppleCare+ giá `2.490.000₫` (`APPLE_CARE_PRICE`).<br>- Gói bảo hành không lưu vào Entity `CartItem` khi ấn Thêm giỏ hàng. | Entity `ProductAddOn` quản lý gói bảo hành mở rộng. Bảng `CartItem` và `OrderItem` lưu thêm `AddOnId`, `AddOnPrice`. |
| 10 | **Tồn kho Showroom O2O** | `app/(routes)/product/[slug]/page.tsx`<br>(L48–L79) | `SHOWROOM_STOCK_LIST`: Danh sách 4 showroom (Quận 1, Hai Bà Trưng, Cầu Giấy, Hải Châu) với số lượng tồn kho fix cứng. | Xây dựng Entity `Showroom` & `ShowroomInventory`. API `GET /api/Showrooms/product-stock/{productId}` trả về tồn kho thực. |
| 11 | **So sánh sản phẩm** | `app/(routes)/compare/page.tsx`<br>(L28–L182) | `SSOT_DEFAULT_COMPARE_PRODUCTS`: 3 sản phẩm cố định kèm danh sách thông số `enrichProductSpecs` giả lập. | API `GET /api/Products/compare?ids=...` trả về ma trận so sánh thông số theo `GroupName`. |
| 12 | **Giỏ hàng (Cart)** | `app/(routes)/cart/page.tsx`<br>`components/cart/*`<br>(L13–L119) | - `SSOT_DEFAULT_CART_ITEMS`: Sản phẩm fallback khi giỏ hàng trống.<br>- State `appleCareMap` chỉ lưu cục bộ ở React, link sản phẩm gán cứng `/product/macbook-pro-14-m3-pro`.<br>- Mặc định áp mã `TECHVIP500` trừ `500.000₫`. | Mở rộng `CartItem` có `slug`, `AddOnId`, `AddOnName`, `AddOnPrice`. API `POST /api/Cart/apply-voucher` tính toán chiết khấu trên server. |
| 13 | **Thanh toán (Checkout)** | `app/(routes)/checkout/page.tsx`<br>`components/checkout/*`<br>(L38–L134, L228–L237) | - `SAVED_VIP_ADDRESSES`: 3 địa chỉ VIP cố định của Nguyễn Minh Quân.<br>- Nuốt lỗi tạo đơn (`catch (err) { router.push(...) }`) để ép chuyển sang trang kết quả thành công.<br>- Checkbox xuất hóa đơn VAT (`RequireInvoice`, `TaxCode`, `CompanyName`) và Đặt cọc 10% COD không gửi lên API. | Mở rộng Entity `Order` với Value Object `OrderInvoice` và trường `DepositAmount`, `DeliveryMethod`, `ShowroomId`. Cập nhật `POST /api/Orders`. |
| 14 | **Kết quả thanh toán VNPay** | `app/(routes)/payment/vnpay-return/page.tsx`<br>(L28–L389) | Toàn bộ trang hiển thị mã đơn cứng `ORD-20261019-8892`, giao dịch `VNP14298834`, stepper GHN 2H, hóa đơn VAT mock. | API `GET /api/Orders/{id}` hoặc `GET /api/Orders/by-code/{code}` trả về dữ liệu hóa đơn, timeline giao hàng và mã VNPay thực tế. |
| 15 | **Trang cá nhân & Hạng VIP** | `app/(routes)/account/page.tsx`<br>`account-sidebar.tsx`<br>`profile-tab.tsx` | Thông tin khách hàng `"Nguyễn Minh Quân"`, hạng `"VIP Diamond"`, `"2.450 điểm"`, mã thành viên `"SV-VIP-889201"`, trạng thái eKYC. | Cập nhật `ApplicationUser` (`CustomerLevel = Diamond`, `PromotionPoints = 2450`). Entity `LoyaltyPointTransaction` ghi nhận sổ cái điểm thưởng. |
| 16 | **Quản lý Đơn hàng & Serial** | `components/account/order-details.tsx`<br>(L33–L341) | Danh sách IMEI/Serial cứng (`UG20261019-A01`, `C02Y98Z8MD6R`), hạn bảo hành `19/10/2028`, shipper `Nguyễn Văn Hùng (0912***789)`. | Entity `OrderItemSerial` lưu Serial, IMEI, hạn bảo hành e-Warranty (`WarrantyExpiresAt`). Mở rộng `OrderItemDto`. |
| 17 | **Đổi trả RMA (Returns)** | `app/(routes)/account/returns/*`<br>(L36–L240) | Mã RMA `#RMA-20261019-104`, kỹ thuật viên `"Trần Quốc Bảo (Showroom Flagship Q.1)"`, quy trình 5 bước `"Đổi lấy ngay 15 phút tại Showroom"`. | Tạo Entity `ReturnRequestLog`, mở rộng `ReturnRequest` lưu `SerialNumber`, `ShowroomId`, `AssignedTechnicianName`, `ProcessingMethod`. |
| 18 | **Hệ thống Showroom (About)** | `app/(routes)/about/page.tsx`<br>(L39–L132) | `SHOWROOM_NETWORK_2026`: 7 showroom fix cứng; form B2B `handleB2bSubmit` mock bằng `setTimeout`. | Bảng `Showrooms` seed đủ 45 chi nhánh SSoT 2026 toàn quốc. API `GET /api/Showrooms` và `POST /api/About/b2b-quotes`. |
| 19 | **Đánh giá thời gian thực (Reviews)** | `components/products/product-tabs.tsx` | Danh sách đánh giá chỉ load 1 lần khi render, không có cơ chế nhận đánh giá mới realtime từ người dùng khác. | Xây dựng SignalR `ReviewHub` đẩy event `ReceiveNewReview` khi có đánh giá mới được duyệt. |

---

## Phần 2: Thiết Kế Schema Cơ Sở Dữ Liệu (EF Core 8 / PostgreSQL)

Hệ thống cơ sở dữ liệu áp dụng nghiêm ngặt chuẩn **Clean Architecture** và **Domain-Driven Design (DDD)**:
- 100% cấu hình bằng EF Core Fluent API trong các class `EntityTypeConfiguration<T>`.
- **Cấm sử dụng Data Annotations** (`[Required]`, `[MaxLength]`, `[ForeignKey]`, `[Table]`, `[Column]`) trên các Entity và Value Object mới hoặc mở rộng.
- Áp dụng `DeleteBehavior.Restrict` cho các quan hệ liên quan đến `Order` và `Showroom` để bảo vệ tính toàn vẹn dữ liệu kế toán và lịch sử giao dịch.
- Tạo B-Tree Indexes cho các trường tìm kiếm trọng yếu: `FilterKey`, `Code` (Voucher/FlashSale), `SerialNumber`.

```
┌───────────────────────────────────────────────────────────────────────────┐
│                       SƠ ĐỒ THỰC THỂ CỐT LÕI (SSoT 2026)                  │
└───────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐           ┌──────────────────┐
  │   Application    │ 1       * │   CustomerAddress│ (UserAddress Alias)
  │      User        ├───────────┤   (AddressType,  │
  │ (CustomerLevel,  │           │   ReceiverName,  │
  │  PromotionPoints)│           │   ReceiverPhone) │
  └────────┬─────────┘           └──────────────────┘
           │ 1
           │
           │ *                   ┌──────────────────┐
           ├─────────────────────┤LoyaltyPointTrans │ (Sổ cái điểm thưởng)
           │                     │(Points, Note,    │
           │                     │ TransactionType) │
           │ 1                   └────────┬─────────┘
           │                              │ *
           │ *                            │ 0..1
  ┌────────┴─────────┐ *        1 ┌───────┴──────────┐
  │      Order       ├────────────┤     Showroom     │ (Hệ thống 45 Showroom)
  │  (DeliveryMethod,│            │  (Region, Phone, │
  │   DepositAmount) │            │   IsFlagship)    │
  │  [OrderInvoice]  │            └───────┬──────────┘
  └────────┬─────────┘                    │ 1
           │ 1                            │
           │ *                            │ *
  ┌────────┴─────────┐ *        1 ┌───────┴──────────┐
  │    OrderItem     ├────────────┤ShowroomInventory │ (Tồn kho O2O)
  │ (AddOnId, Price, │            │(StockQuantity,   │ Unique (Showroom, Product)
  │  WarrantyMonths) │            │ 2hDelivery)      │
  └────────┬─────────┘            └──────────────────┘
           │ 1
           │ *
  ┌────────┴─────────┐
  │ OrderItemSerial  │ (IMEI, Serial, WarrantyExpiresAt)
  └──────────────────┘

  ┌──────────────────┐           ┌──────────────────┐
  │    FlashSale     │ 1       * │  FlashSaleItem   │
  │ (Code, StartTime,├───────────┤(FlashSalePrice,  │
  │  EndTime, Active)│           │ Quota, SoldCount)│
  └──────────────────┘           └──────────────────┘

  ┌──────────────────┐           ┌──────────────────┐
  │     Voucher      │           │   ProductAddOn   │
  │(TECHVIP500, Min, │           │(AppleCare+ 3 năm,│
  │ DiscountValue)   │           │ Price, Duration) │
  └──────────────────┘           └──────────────────┘
```

### 1. Phân hệ Khuyến Mãi & Voucher (Promotions)

#### Bảng `Vouchers`
Quản lý các mã phiếu giảm giá chiến dịch (như `TECHVIP500` giảm 500k cho đơn từ 5tr).
- `Id`: `uuid`, Khóa chính (BaseEntity).
- `Code`: `varchar(50)`, Bắt buộc, Unique B-Tree Index.
- `DiscountType`: `varchar(20)`, Bắt buộc (Giá trị: `FixedAmount`, `Percentage`).
- `DiscountValue`: `decimal(18,2)`, Bắt buộc.
- `MinOrderValue`: `decimal(18,2)`, Bắt buộc (Giá trị đơn tối thiểu để hưởng khuyến mãi).
- `MaxDiscountAmount`: `decimal(18,2)`, Cho phép null (Mức giảm tối đa nếu dùng % chiết khấu).
- `ValidFrom`: `timestamptz`, Bắt buộc (Thời điểm bắt đầu hiệu lực).
- `ValidTo`: `timestamptz`, Bắt buộc (Thời điểm hết hạn).
- `UsageLimit`: `int`, Bắt buộc (Số lượt sử dụng tối đa của mã).
- `UsedCount`: `int`, Bắt buộc, Mặc định `0` (Số lượt thực tế đã dùng).
- `IsActive`: `boolean`, Bắt buộc, Mặc định `true`.
- `CreatedAt`, `UpdatedAt`, `IsDeleted`: Thuộc tính BaseEntity.

### 2. Sổ Cái Điểm Thưởng Khách Hàng (Loyalty Points Ledger)

#### Bảng `LoyaltyPointTransactions`
Minh bạch toàn bộ dòng tiền điểm thưởng cộng/trừ của khách hàng (đặc biệt là hạng VIP Diamond với 2.450 - 5.000 điểm).
- `Id`: `uuid`, Khóa chính.
- `UserId`: `uuid`, Bắt buộc, FK -> `Users(Id)`. `OnDelete(DeleteBehavior.Restrict)`.
- `OrderId`: `uuid`, Cho phép null, FK -> `Orders(Id)`. `OnDelete(DeleteBehavior.Restrict)`.
- `Points`: `int`, Bắt buộc (Giá trị dương: tích điểm khi hoàn tất đơn hàng; giá trị âm: tiêu điểm quy đổi voucher).
- `TransactionType`: `varchar(50)`, Bắt buộc (Giá trị: `OrderReward`, `RedeemVoucher`, `ManualAdjustment`, `RefundDeduction`).
- `Note`: `varchar(500)`, Cho phép null (Ghi chú diễn giải, ví dụ: *"Tích điểm 2% đơn hàng #ORD-20261019-8892"*).
- `CreatedAt`: `timestamptz`, Bắt buộc (Thời điểm phát sinh giao dịch).

### 3. Sổ Địa Chỉ Khách Hàng (CustomerAddress / UserAddress)

#### Bảng `CustomerAddresses` (Mở rộng từ Entity hiện hữu)
- `Id`: `uuid`, Khóa chính.
- `ApplicationUserId`: `uuid`, FK -> `Users(Id)`.
- `AddressType`: `varchar(50)`, Bắt buộc, Mặc định `"Home"` (Hỗ trợ: `"Home"`, `"Office"`, `"Showroom"`).
- `ReceiverName`: `varchar(100)`, Bắt buộc (Tên người nhận hàng cụ thể).
- `ReceiverPhone`: `varchar(20)`, Bắt buộc (Số điện thoại người nhận hàng).
- `Street`: `varchar(200)`, Bắt buộc (Số nhà, tên đường).
- `Ward`: `varchar(100)`, Cho phép null (Phường/Xã).
- `District`: `varchar(100)`, Cho phép null (Quận/Huyện).
- `City`: `varchar(100)`, Bắt buộc (Tỉnh/Thành phố).
- `IsDefault`: `boolean`, Bắt buộc, Mặc định `false` (Đánh dấu địa chỉ giao hàng mặc định).
- `Index`: B-Tree Index trên `(ApplicationUserId, IsDefault)`.

### 4. Mở Rộng Thông Số Kỹ Thuật (ProductSpecification)

#### Bảng `ProductSpecifications` (Mở rộng Entity hiện hữu)
- `Id`: `uuid`, Khóa chính.
- `ProductId`: `uuid`, Bắt buộc, FK -> `Products(Id)`.
- `Name`: `varchar(100)`, Bắt buộc (Tên thông số: `"RAM"`, `"Ổ cứng"`, `"Màn hình"`).
- `Value`: `varchar(500)`, Bắt buộc (Giá trị: `"36GB"`, `"1TB SSD"`, `"14.2 inch Liquid Retina XDR"`).
- `GroupName`: `varchar(100)`, Bắt buộc, Mặc định `"Chung"` (Nhóm thông số: `"Hiệu năng"`, `"Màn hình"`, `"Bộ nhớ & Lưu trữ"`, `"Pin & Sạc"`).
- `DisplayOrder`: `int`, Bắt buộc, Mặc định `0` (Thứ tự hiển thị trong nhóm).
- `IsHighlight`: `boolean`, Bắt buộc, Mặc định `false` (Nếu true: render thành Spec Chip trên ProductCard và trang Catalog).
- `FilterKey`: `varchar(50)`, Cho phép null, **B-Tree Index** (Khóa dùng để lọc nhanh trên URL: `"ram"`, `"ssd"`, `"refresh_rate"`, `"gpu"`).

### 5. Dịch Vụ Mở Rộng & Bảo Hành Kèm Theo (ProductAddOn)

#### Bảng `ProductAddOns`
Quản lý các gói dịch vụ gia tăng như AppleCare+, Samsung Care+, Dán cường lực 1 năm, Lắp đặt tại nhà.
- `Id`: `uuid`, Khóa chính.
- `ProductId`: `uuid`, Cho phép null, FK -> `Products(Id)` (Nếu gói áp dụng riêng cho 1 sản phẩm).
- `CategoryId`: `uuid`, Cho phép null, FK -> `Categories(Id)` (Nếu gói áp dụng cho cả danh mục).
- `BrandId`: `uuid`, Cho phép null, FK -> `Brands(Id)` (Nếu gói áp dụng cho hãng Apple).
- `Code`: `varchar(50)`, Bắt buộc (Ví dụ: `"APPLECARE_MBP14"`).
- `Name`: `varchar(255)`, Bắt buộc (Ví dụ: `"AppleCare+ 3 năm cho MacBook Pro 14"`).
- `Description`: `varchar(1000)`, Cho phép null.
- `AddOnType`: `varchar(50)`, Bắt buộc (Ví dụ: `"ExtendedWarranty"`, `"AccessoryBundle"`, `"ServiceInstallation"`).
- `Price`: `decimal(18,2)`, Bắt buộc (Ví dụ: `2.490.000₫`).
- `OriginalPrice`: `decimal(18,2)`, Cho phép null.
- `DurationMonths`: `int`, Cho phép null (Thời hạn bảo hiểm: `24` hoặc `36` tháng).
- `IsActive`: `boolean`, Bắt buộc, Mặc định `true`.
- `DisplayOrder`: `int`, Bắt buộc, Mặc định `0`.

### 6. Hệ Thống Showroom O2O & Tồn Kho Thực Tế

#### Bảng `Showrooms`
Quản lý mạng lưới 45 Showroom công nghệ hiện đại toàn quốc theo chuẩn SSoT 2026.
- `Id`: `uuid`, Khóa chính.
- `Code`: `varchar(50)`, Bắt buộc, Unique Index (Ví dụ: `"SR-HCM-Q1"`, `"SR-HN-TH"`).
- `Name`: `varchar(200)`, Bắt buộc (Ví dụ: `"Showroom Flagship Quận 1 - Lê Lợi"`).
- `Region`: `varchar(20)`, Bắt buộc (Phân vùng: `"HCM"`, `"HN"`, `"DN"`, `"CT"`, `"Other"`).
- `City`: `varchar(100)`, Bắt buộc (Ví dụ: `"TP. Hồ Chí Minh"`).
- `District`: `varchar(100)`, Bắt buộc (Ví dụ: `"Quận 1"`).
- `Ward`: `varchar(100)`, Cho phép null.
- `Address`: `varchar(300)`, Bắt buộc (Ví dụ: `"123 Lê Lợi, Phường Bến Nghé, Quận 1"`).
- `Phone`: `varchar(20)`, Bắt buộc, Mặc định `"1800 6868"` (Hotline bán hàng SSoT).
- `OpeningHours`: `varchar(100)`, Bắt buộc, Mặc định `"08:00 - 21:30 (Cả CN & Lễ)"`.
- `Latitude`: `float8`, Cho phép null.
- `Longitude`: `float8`, Cho phép null.
- `GoogleMapIframeUrl`: `varchar(1000)`, Cho phép null.
- `IsFlagship`: `boolean`, Bắt buộc, Mặc định `false`.
- `HasInstantPickup`: `boolean`, Bắt buộc, Mặc định `true` (Hỗ trợ nhận hàng ngay trong 15 phút).
- `IsActive`: `boolean`, Bắt buộc, Mặc định `true`.
- `DisplayOrder`: `int`, Bắt buộc, Mặc định `0`.

#### Bảng `ShowroomInventories`
Quản lý tồn kho vật lý tại từng Showroom theo từng Product và Variant SKU.
- `Id`: `uuid`, Khóa chính.
- `ShowroomId`: `uuid`, Bắt buộc, FK -> `Showrooms(Id)`. `OnDelete(DeleteBehavior.Restrict)`.
- `ProductId`: `uuid`, Bắt buộc, FK -> `Products(Id)`. `OnDelete(DeleteBehavior.Restrict)`.
- `ProductVariantSkuId`: `uuid`, Cho phép null, FK -> `ProductVariantSkus(Id)`. `OnDelete(DeleteBehavior.Restrict)`.
- `StockQuantity`: `int`, Bắt buộc, Mặc định `0`.
- `ReservedQuantity`: `int`, Bắt buộc, Mặc định `0`.
- `IsAvailableFor2hDelivery`: `boolean`, Bắt buộc, Mặc định `true` (Đủ điều kiện xuất kho giao hỏa tốc 2H).
- **Index:** Unique Index trên cặp `(ShowroomId, ProductId)` theo đúng yêu cầu đề bài.

### 7. Mở Rộng Đơn Hàng & Hóa Đơn Điện Tử VAT

#### Value Object `OrderInvoice` (Nhúng vào Bảng `Orders`)
Không tạo bảng riêng, mà nhúng trực tiếp dạng Owned Type vào bảng `Orders` qua EF Core Fluent API:
- `RequireInvoice`: `boolean`, Bắt buộc, Mặc định `false`.
- `TaxCode`: `varchar(50)`, Cho phép null (Mã số thuế doanh nghiệp).
- `CompanyName`: `varchar(255)`, Cho phép null (Tên công ty xuất hóa đơn).
- `CompanyAddress`: `varchar(500)`, Cho phép null (Địa chỉ trụ sở công ty).
- `InvoiceEmail`: `varchar(150)`, Cho phép null (Email nhận hóa đơn điện tử).
- `InvoiceFileUrl`: `varchar(500)`, Cho phép null (Đường dẫn PDF hóa đơn điện tử).

#### Các trường bổ sung trực tiếp trên Bảng `Orders`:
- `DeliveryMethod`: `varchar(50)`, Bắt buộc, Mặc định `"StandardDelivery"` (`"StandardDelivery"`, `"Express2H"`, `"ShowroomPickup"`).
- `ShowroomId`: `uuid`, Cho phép null, FK -> `Showrooms(Id)`. `OnDelete(DeleteBehavior.Restrict)`.
- `DepositAmount`: `decimal(18,2)`, Bắt buộc, Mặc định `0` (Tiền đặt cọc COD 10% với đơn > 20.000.000₫).
- `Subtotal`: `decimal(18,2)`, Bắt buộc, Mặc định `0`.
- `ShippingCost`: `decimal(18,2)`, Bắt buộc, Mặc định `0` (Freeship nếu Subtotal >= 500.000₫, ngược lại 30.000₫).
- `DiscountAmount`: `decimal(18,2)`, Bắt buộc, Mặc định `0`.
- `RemainingAmount`: `decimal(18,2)`, Bắt buộc, Mặc định `0`.
- `PaymentMethod`: `varchar(50)`, Bắt buộc, Mặc định `"COD"`.
- `PaymentStatus`: `varchar(50)`, Bắt buộc, Mặc định `"Pending"`.
- `TransactionId`: `varchar(100)`, Cho phép null (Mã giao dịch VNPay).
- `CarrierName`: `varchar(100)`, Cho phép null (Đơn vị vận chuyển: `"GHN"`, `"GHTK"`, `"ShopViet Express"`).
- `TrackingNumber`: `varchar(100)`, Cho phép null (Mã vận đơn).
- `DriverName`: `varchar(100)`, Cho phép null (Tên tài xế).
- `DriverPhone`: `varchar(30)`, Cho phép null (SĐT tài xế).
- `RecipientName`: `varchar(100)`, Cho phép null (Tên người nhận).

### 8. Quản Lý Serial, IMEI & Bảo Hành e-Warranty

#### Bảng `OrderItemSerials` (Mở rộng từ InventoryItem sang e-Warranty)
Lưu trữ danh sách IMEI/Serial của các thiết bị thực tế xuất bán trong đơn hàng và quản lý hạn bảo hành điện tử.
- `Id`: `uuid`, Khóa chính.
- `OrderItemId`: `uuid`, Bắt buộc, FK -> `OrderItems(Id)`. `OnDelete(DeleteBehavior.Restrict)`.
- `InventoryItemId`: `uuid`, Cho phép null, FK -> `InventoryItems(Id)`.
- `SerialNumber`: `varchar(100)`, Bắt buộc, **B-Tree Index** (Serial thiết bị hoặc IMEI 15 số).
- `Imei`: `varchar(50)`, Cho phép null (IMEI 1 / IMEI 2 đối với iPhone/Smartphone).
- `WarrantyMonths`: `int`, Bắt buộc, Mặc định `24` (Thời hạn bảo hành e-Warranty).
- `ActivatedAt`: `timestamptz`, Cho phép null (Thời điểm kích hoạt bảo hành).
- `WarrantyExpiresAt`: `timestamptz`, Cho phép null (Ngày hết hạn bảo hành).
- `WarrantyStatus`: `varchar(50)`, Bắt buộc, Mặc định `"Active"` (`"Active"`, `"Expired"`, `"Voided"`).

### 9. Quản Lý Đổi Trả RMA & Nhật Ký Xử Lý (RMA Logs)

#### Bảng `ReturnRequestLogs`
Nhật ký chi tiết các hành động nghiệp vụ của kỹ thuật viên tại Showroom khi tiếp nhận đổi trả sản phẩm lỗi.
- `Id`: `uuid`, Khóa chính.
- `ReturnRequestId`: `uuid`, Bắt buộc, FK -> `ReturnRequests(Id)`. `OnDelete(DeleteBehavior.Cascade)`.
- `Action`: `varchar(100)`, Bắt buộc (Ví dụ: `"ReceivedAtShowroom"`, `"TechnicianInspection"`, `"InstantReplacement"`, `"RefundIssued"`).
- `Title`: `varchar(200)`, Bắt buộc (Ví dụ: `"Tiếp nhận sản phẩm tại Showroom Flagship Q.1"`).
- `ActorName`: `varchar(100)`, Cho phép null (Ví dụ: `"Trần Quốc Bảo (Kỹ thuật viên trưởng)"`).
- `Location`: `varchar(200)`, Cho phép null (Ví dụ: `"Showroom 123 Lê Lợi, Bến Nghé, Q.1"`).
- `Note`: `varchar(1000)`, Cho phép null (Ghi chú chi tiết thẩm định kỹ thuật).
- `ProcessingMethod`: `varchar(100)`, Cho phép null (Ví dụ: `"Instant15MinShowroom"`, `"HomePickup"`).
- `LoggedAt`: `timestamptz`, Bắt buộc, Mặc định `DateTime.UtcNow`.

### 10. Chiến Dịch Flash Sale

#### Bảng `FlashSales`
- `Id`: `uuid`, Khóa chính.
- `Code`: `varchar(50)`, Bắt buộc, Unique B-Tree Index (Ví dụ: `"FLASH-20261020-NIGHT"`).
- `Title`: `varchar(200)`, Bắt buộc (Ví dụ: `"Đại Tiệc Công Nghệ - Flash Sale Đêm Muộn"`).
- `Subtitle`: `varchar(300)`, Cho phép null.
- `BannerImageUrl`: `varchar(500)`, Cho phép null.
- `StartTime`: `timestamptz`, Bắt buộc.
- `EndTime`: `timestamptz`, Bắt buộc.
- `IsActive`: `boolean`, Bắt buộc, Mặc định `true`.
- `Priority`: `int`, Bắt buộc, Mặc định `0`.

#### Bảng `FlashSaleItems`
- `Id`: `uuid`, Khóa chính.
- `FlashSaleId`: `uuid`, Bắt buộc, FK -> `FlashSales(Id)`. `OnDelete(DeleteBehavior.Cascade)`.
- `ProductId`: `uuid`, Bắt buộc, FK -> `Products(Id)`. `OnDelete(DeleteBehavior.Restrict)`.
- `ProductVariantSkuId`: `uuid`, Cho phép null, FK -> `ProductVariantSkus(Id)`.
- `FlashSalePrice`: `decimal(18,2)`, Bắt buộc.
- `OriginalPrice`: `decimal(18,2)`, Bắt buộc.
- `TotalQuota`: `int`, Bắt buộc (Tổng số lượng ưu đãi mở bán).
- `SoldCount`: `int`, Bắt buộc, Mặc định `0` (Số lượng đã bán thực tế để hiển thị progress bar).
- `MaxPerCustomer`: `int`, Bắt buộc, Mặc định `1`.
- `IsHeroFeatured`: `boolean`, Bắt buộc, Mặc định `false` (Đưa lên làm Hero Card trung tâm trang chủ).
- `BadgeText`: `varchar(50)`, Cho phép null (Ví dụ: `"-17%"`, `"Flash Sale"`).
- `DisplayOrder`: `int`, Bắt buộc, Mặc định `0`.

---

## Phần 3: Danh Mục API Endpoints Cần Viết Mới & Mở Rộng

### 1. Phân hệ Khuyến Mãi & Voucher
- **`POST /api/Cart/apply-voucher`**:
  - Request: `{ "code": "TECHVIP500", "cartId": "..." }`
  - Validation: Kiểm tra `IsActive`, `ValidFrom <= UtcNow <= ValidTo`, `UsedCount < UsageLimit`, `Cart.Subtotal >= MinOrderValue`.
  - Response: `{ "isValid": true, "voucherCode": "TECHVIP500", "discountAmount": 500000, "finalTotal": 44490000, "message": "Áp dụng mã giảm giá 500.000₫ thành công" }`
- **`DELETE /api/Cart/remove-voucher`**: Hủy mã đang áp dụng.

### 2. Phân hệ Điểm Thưởng Khách Hàng (Loyalty Points)
- **`GET /api/Account/loyalty`**:
  - Trả về tổng điểm hiện tại (`PromotionPoints`), hạng thành viên (`CustomerLevel`), ngưỡng nâng hạng tiếp theo (`NextLevelPoints`), và danh sách `LoyaltyPointTransactionDto` (lịch sử cộng/trừ điểm).
- **`POST /api/Account/loyalty/redeem`**:
  - Request: `{ "points": 500, "rewardType": "Voucher50k" }`
  - Response: Tạo mã voucher giảm giá cá nhân hóa và ghi transaction trừ điểm.

### 3. Phân hệ Showroom O2O & Tra Cứu Tồn Kho
- **`GET /api/Showrooms`**:
  - Query params: `?region=HCM&hasInstantPickup=true`
  - Response: Danh sách 45 Showroom (tọa độ GPS, hotline `1800 6868`, địa chỉ, flagship status).
- **`GET /api/Showrooms/product-stock/{productId}`**:
  - Query params: `?skuId=...&region=HCM`
  - Response: Tồn kho thực tế của sản phẩm tại các chi nhánh gần nhất để người dùng chọn nhận tại cửa hàng.

### 4. Phân hệ Flash Sale Thời Gian Thực
- **`GET /api/FlashSales/active`**:
  - Response: Chiến dịch đang chạy với `startTime`, `endTime`, `serverTime`, và danh sách `items` (Hero item MacBook Pro M3 Pro, phụ kiện, số lượng quota còn lại).

### 5. SignalR Realtime Reviews (`ReviewHub`)
Đặc tả WebSocket Hub cho đánh giá sản phẩm:
- **Endpoint:** `/hubs/reviews`
- **Client Methods:**
  - `JoinProductGroup(Guid productId)`: Client subscribe vào kênh của sản phẩm đang xem.
  - `LeaveProductGroup(Guid productId)`: Hủy subscribe khi rời trang.
- **Server Push Event:**
  - Event: `ReceiveNewReview`
  - Payload:
    ```json
    {
      "reviewId": "uuid",
      "productId": "uuid",
      "userName": "Nguyễn Minh Quân",
      "userAvatar": "/avatars/quan.jpg",
      "userLevel": "Diamond",
      "rating": 5,
      "comment": "MacBook Pro M3 Pro chạy cực êm và pin trâu...",
      "images": ["/uploads/reviews/rev1.jpg"],
      "createdAt": "2026-10-20T14:30:00Z",
      "isVerifiedPurchase": true
    }
    ```
  - Cơ chế kích hoạt: Khi API `POST /api/Reviews` được gọi hoặc Admin duyệt review, hệ thống broadcast sự kiện `ReceiveNewReview` tới tất cả client đang có kết nối trong nhóm `product-{id}`.

### 6. Phân hệ Giỏ Hàng & Checkout (Mở rộng)
- **`GET /api/Cart` / `POST /api/Cart/items`**:
  - Nhận và trả về thêm `slug`, `addOnId`, `addOnName`, `addOnPrice`.
- **`POST /api/Orders`**:
  - Hỗ trợ đầy đủ: `deliveryMethod` (`StandardDelivery`, `Express2H`, `ShowroomPickup`), `showroomId`, `depositAmount`, `invoiceInfo` (`requireInvoice`, `taxCode`, `companyName`, `companyAddress`, `invoiceEmail`), và `orderItems[].addOnId`.
- **`GET /api/Orders/{id}`**:
  - Trả về chi tiết tài chính (`subtotal`, `shippingCost`, `discountAmount`, `depositAmount`), mã VNPay, shipper info, tracking stepper, và `orderItems[].assignedSerials` (`serialNumber`, `imei`, `warrantyExpiresAt`).
- **`GET /api/Orders/{id}/invoice-pdf`**:
  - Xuất hóa đơn VAT điện tử chuẩn e-Invoice PDF.

---

## Phần 4: Quy Tắc Đảm Bảo SSoT 2026

1. **Chuẩn địa chỉ & Hotline:** Hệ thống chuẩn 45 Showroom công nghệ; hotline bán hàng `1800 6868`, hotline kỹ thuật `1800 6869` (miễn phí cước gọi).
2. **Quy chuẩn Freeship:** Đơn hàng từ **500.000₫** trở lên được miễn phí vận chuyển toàn quốc (`ShippingCost = 0`). Đơn dưới 500k tính cước chuẩn 30.000₫.
3. **Bảo vệ toàn vẹn dữ liệu:** Không cascade delete các bảng lịch sử đơn hàng, showroom và serial e-Warranty.

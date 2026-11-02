> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 28/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/backend-sync/03-fullstack-alignment-report.md`](03-fullstack-alignment-report.md) và [`docs/frontend-manual-test-checklist.md`](../frontend-manual-test-checklist.md).

# ĐẠI KIỂM THỬ ĐỢT 2 (QA-2): BÁO CÁO KIỂM THỬ LIÊN THÔNG E2E HAI CHIỀU (ADMIN 3001 ↔ BACKEND 5000 ↔ CLIENT 3000)

> **Thời điểm thực thi:** `2026-10-28T21:29:42+07:00`  
> **Môi trường kiểm thử:** Hybrid Development (`PostgreSQL 5432` + `Redis 6379` + `RabbitMQ 5672` trên Docker; `Backend .NET 8 :5000`, `Storefront Client :3000`, `Admin Dashboard :3001` trên Local)  
> **Trạng thái tổng thể:** **PASSED 100% (4/4 Vòng lặp E2E đồng bộ hai chiều • Đã phát hiện & vá triệt để 10 lỗi tích hợp)**

---

## 1. BẢNG MA TRẬN ĐỒNG BỘ DỮ LIỆU HAI CHIỀU (CROSS-APP E2E SYNCHRONIZATION MATRIX)

| Vòng lặp | Hạng mục kiểm định | Dữ liệu tại Admin (`localhost:3001`) | Dữ liệu tại Storefront (`localhost:3000`) | Kết quả |
| :--- | :--- | :--- | :--- | :---: |
| **Vòng 1** | **AI Spec Generator (14 thông số)** | Gọi `POST /api/ai/generate-specs` (`gemini-3.8-flash`) sinh đúng **14 thông số kỹ thuật** chuẩn JSON cho `MacBook Pro 14 M3 Pro` (`61.990.000₫`). | Trang `/product/macbook-pro-14-m3-pro` hiển thị **"Bảng thông số kỹ thuật chi tiết (14 hạng mục)"**, không tràn chữ (`hasTextOverflow: false`). | **PASS (100%)** |
| **Vòng 1** | **Giới hạn tối đa 2 Key Specs** | Tự động tích 2 chip `CPU` & `RAM` (`Đã chọn 2/2 Key Specs`). Thử tích thông số thứ 3 (`Tốc độ CPU`) bị khóa (`disabled: true`). | Thẻ sản phẩm trên `/products` hiển thị đúng 2 chip: `Apple M3 Pro (11-core CPU, 14-core GPU)` và `18GB Unified Memory`. | **PASS (100%)** |
| **Vòng 1** | **Gói bảo hành AppleCare+ (`+2.490.000₫`)** | Gắn gói `AppleCare+ 3 năm chính hãng Apple (+2.490.000₫)` vào sản phẩm và lưu (`PUT /api/products/:id` → `200 OK`). | Tích chọn checkbox `AppleCare+ (+2.490.000 ₫)` trên PDP nâng tổng giá tức thì từ **`61.990.000 ₫`** lên **`64.480.000 ₫`**. | **PASS (100%)** |
| **Vòng 2** | **Hệ thống 45 Showroom & Hotline SSoT** | Trang `/showrooms` hiển thị đủ **45 cơ sở**, KPI `Tổng Showroom Toàn Quốc: 45`, Hotline `1800 6868` trên 45/45 dòng. | Bộ kiểm tra tồn kho trên PDP hiển thị `Toàn quốc (45)` và trang `/checkout` hiển thị tab `Nhận tại 45 Showroom (sau 2H)`. | **PASS (100%)** |
| **Vòng 2** | **Điều chuyển tồn kho O2O (`48 Tố Hữu`)** | Cập nhật cơ sở `SR-HN-12` (`48 Tố Hữu, Nam Từ Liêm, Hà Nội`) lên `20 máy`, sau đó điều chuyển O2O `2 máy` (`POST /api/showrooms/transfer-stock` → `200 OK`), còn **`18 sp`**. | Cả trang `/product/macbook-pro-14-m3-pro` và tab nhận tại cửa hàng ở `/checkout` đều hiển thị **`48 Tố Hữu: Sẵn hàng (18 máy)`**. | **PASS (100%)** |
| **Vòng 2** | **Cảnh báo Sắp hết hàng (`Low Stock ≤ 5`)** | Điều chuyển về `SR-HCM-01` tổng cộng `3 sp` (`≤ 5`) → Hiển thị banner cảnh báo vàng cam và badge **`Sắp hết hàng`**. | Trang `/checkout` hiển thị chính xác `Showroom Flagship Quận 1 - Lê Lợi: Sẵn hàng (3 máy) • Nhận sau 2H`. | **PASS (100%)** |
| **Vòng 3** | **Đơn hàng `> 20Tr`, VAT & Cọc COD 10%** | Đơn hàng `b1bfeffb-86ef-4354-8be8-5b971c111ade` (`61.990.000₫`) cập nhật trạng thái cọc 10% (`6.199.000₫`) qua `PUT /orders/:id/deposit-status` → `200 OK`. | Khách VIP Diamond `Nguyễn Minh Quân` chọn COD cho đơn `61.990.000₫` thấy ngay hộp cảnh báo **cọc 10% (`6.199.000 ₫`)** và phần còn lại `55.791.000 ₫`. | **PASS (100%)** |
| **Vòng 3** | **Gán Serial/IMEI, e-Warranty 24T & Chặn trùng** | Gán `SN: SV2026-MBP14-718447` / `IMEI: 358999107718447` (`200 OK`), kích hoạt e-Warranty 24T (`Active`). Thử nhập lại cùng Serial bị chặn `400 Bad Request`. | Trang `/account/orders/[orderId]` hiển thị đúng `SN: SV2026-MBP14-718447`, `IMEI: 358999107718447` và badge **`Kích hoạt 24T`**. | **PASS (100%)** |
| **Vòng 3** | **Che số ĐT Shipper & Tải Hóa đơn VAT PDF** | Gán shipper `Nguyễn Văn Hưng (0912345789)` và tải lên file PDF hóa đơn GTGT (`POST /orders/:id/invoice-upload` → `200 OK`, badge `Đã có file PDF`). | Khách hàng thấy số điện thoại shipper đã che **`0912***789`** và nút **Tải hóa đơn VAT (PDF)** kích hoạt tải xuống thành công. | **PASS (100%)** |
| **Vòng 4** | **Đổi trả RMA 5 bước & O2O 15 phút** | Tại `/returns/33333333-4444-5555-6666-777777777777` (`RET-2026-001`), ghi nhận biên bản kỹ thuật viên (`200 OK`), chuyển tiến độ lên **`Bước hiện tại: 4/5`**. | Tại `/account/returns/[returnId]`, thanh tiến độ 5 bước cập nhật Bước 4 Active, hiển thị phương thức **15 phút tại Showroom** và nhật ký KTV đạt chuẩn tương phản **`text-slate-800`**. | **PASS (100%)** |
| **Vòng 4** | **Chiến dịch Flash Sale (`iPhone 16 Pro Max`)** | Tại `/configs/flash-sales`, cập nhật chiến dịch `Flash Sale Độc Quyền 2026` (`Đang diễn ra (1)`) giảm giá `iPhone 16 Pro Max` từ `34.990.000₫` xuống **`29.990.000₫`**. | Trang chủ `/` hiển thị đồng hồ đếm ngược thời gian thực (`Kết thúc sau: 02:59:31`) và giá Flash Sale **`29.990.000 ₫`** (gạch ngang `34.990.000 ₫`). | **PASS (100%)** |

---

## 2. CHI TIẾT KẾT QUẢ KIỂM THỬ 4 VÒNG LẶP E2E

### Vòng lặp 1: AI Spec Generator, Key Specs & Gói Bảo hành AppleCare+
1. **Tại Admin (`http://localhost:3001/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890/edit`):**
   - Bấm nút **"Tự động điền thông số bằng AI"** → Route `/api/ai/generate-specs` gọi model `gemini-3.8-flash` với Structured Outputs (`responseJsonSchema`) trả về HTTP `200 OK` gồm **14 thông số kỹ thuật** và `keySpecs: ["CPU", "RAM"]`.
   - Form tự động đánh dấu 2 thông số `CPU: Apple M3 Pro (11-core CPU, 14-core GPU)` và `RAM: 18GB Unified Memory` (`Đã chọn 2/2 Key Specs`).
   - Khi thử click vào checkbox thứ 3 (`Tốc độ CPU`), nút bị vô hiệu hóa (`disabled: true`, tooltip `"Đã chọn đủ 2 Key Specs. Hãy bỏ chọn bớt để chọn thông số khác."`), ngăn chặn chọn quá 2 chip kỹ thuật.
   - Tích chọn gói mua kèm `AppleCare+ 3 năm chính hãng Apple (+2.490.000₫)` và lưu cập nhật (`PUT /api/products/:id` → `200 OK`).
2. **Đối chiếu tại Storefront (`http://localhost:3000/products` & `/product/macbook-pro-14-m3-pro`):**
   - Trên trang danh sách `/products`, thẻ sản phẩm `MacBook Pro 14 M3 Pro (18GB/512GB) — Space Black` hiển thị đúng 2 chip kỹ thuật: `Apple M3 Pro (11-core CPU, 14-core GPU)` và `18GB Unified Memory`.
   - Trên trang chi tiết `/product/macbook-pro-14-m3-pro`, bảng thông số hiển thị tiêu đề `"Bảng thông số kỹ thuật chi tiết (14 hạng mục)"` với đầy đủ 14 dòng không bị tràn ngang (`hasTextOverflow: false`).
   - Khi click vào checkbox `Mua kèm gói AppleCare+ (+2.490.000 ₫)`, giá bán hiệu lực cập nhật tức thì từ `61.990.000 ₫` lên **`64.480.000 ₫`**.

### Vòng lặp 2: Quản trị 45 Showroom & Điều chuyển Tồn kho O2O
1. **Tại Admin (`http://localhost:3001/showrooms`):**
   - Hiển thị chính xác **45 Showroom** toàn quốc, đồng bộ hotline chuẩn SSoT `1800 6868` và khung giờ mở cửa.
   - Thực hiện cập nhật tồn kho cơ sở `Showroom Nam Từ Liêm - 48 Tố Hữu` (`SR-HN-12`, ID `b704b599-a45b-4860-91be-fde8f8c5a830`) lên `20 máy`, sau đó điều chuyển O2O `2 máy` sang `Showroom Flagship Quận 1 - Lê Lợi` (`SR-HCM-01`) qua `POST /api/showrooms/transfer-stock` (`200 OK`).
   - Kết quả tại Admin: `48 Tố Hữu` còn **`18 sp`**, trong khi `SR-HCM-01` có tổng tồn kho `3 sp` (`≤ 5`) nên kích hoạt thanh cảnh báo vàng cam: *"Cảnh báo tồn kho thấp (Low Stock): Hiện có 1 cơ sở đang có tổng tồn kho O2O ở mức cảnh báo (≤ 5 máy)"* kèm badge **`Sắp hết hàng`**.
2. **Đối chiếu tại Storefront (`http://localhost:3000/product/macbook-pro-14-m3-pro` & `/checkout`):**
   - Khối kiểm tra tồn kho trên trang chi tiết sản phẩm hiển thị `Toàn quốc (45)` và tại khu vực Hà Nội hiển thị: `Showroom Nam Từ Liêm - 48 Tố Hữu — 48 Tố Hữu, Nam Từ Liêm, Hà Nội • Sẵn hàng (18 máy) • Giao 2H`.
   - Trên trang `/checkout` ở tab **"Nhận tại 45 Showroom (sau 2H)"**, thẻ `Showroom Nam Từ Liêm - 48 Tố Hữu` hiển thị chính xác **`Sẵn hàng (18 máy) • Nhận sau 2H`**, khớp 100% với Admin.

### Vòng lặp 3: Đơn hàng, Cọc COD 10%, Serial/IMEI & Hóa đơn VAT PDF
1. **Tại Storefront (`http://localhost:3000/checkout`):**
   - Đăng nhập tài khoản VIP Diamond `Nguyễn Minh Quân` (`quan.nguyen@shopviet.vn`), đặt mua `MacBook Pro 14 M3 Pro` (`61.990.000₫`), tích chọn **Xuất hóa đơn điện tử VAT doanh nghiệp** (`MST: 0109888999`) và chọn phương thức **Thanh toán khi nhận hàng (COD)**.
   - Giao diện hiển thị cảnh báo bắt buộc đặt cọc 10% cho đơn COD `> 20.000.000₫`: đặt cọc trước **`6.199.000 ₫`**, phần còn lại **`55.791.000 ₫`** thanh toán khi nhận máy.
   - Tạo đơn hàng thành công (`Order ID: b1bfeffb-86ef-4354-8be8-5b971c111ade`).
2. **Tại Admin (`http://localhost:3001/orders/b1bfeffb-86ef-4354-8be8-5b971c111ade`):**
   - Cập nhật trạng thái đã thu cọc 10% (`6.199.000₫`) và gán thông tin shipper `Nguyễn Văn Hưng` (`0912345789`).
   - Nhập mã `Serial Number: SV2026-MBP14-718447` và `IMEI: 358999107718447` → Bấm **Thêm Serial** (`200 OK`) và kích hoạt bảo hành điện tử 24 tháng (`Active đến 28/10/2028`).
   - Thử gửi lại mã Serial trùng `SV2026-MBP14-718447` → Backend chặn lại với mã `400 Bad Request`: *"Mã Serial 'SV2026-MBP14-718447' đã được gán cho mục hàng này."*
   - Tải lên file PDF hóa đơn VAT (`VAT-Invoice-ShopViet-2026.pdf`) → Nhận URL lưu trữ và hiển thị badge **`Đã có file PDF`**.
3. **Đối chiếu tại Storefront (`http://localhost:3000/account/orders/b1bfeffb-86ef-4354-8be8-5b971c111ade`):**
   - Hiển thị đầy đủ `SN: SV2026-MBP14-718447`, `IMEI: 358999107718447`, badge **`Kích hoạt 24T`**, thông tin `Shipper phụ trách: Nguyễn Văn Hưng (0912***789)` (đã che 3 số giữa), và nút **Tải hóa đơn VAT (PDF)** hoạt động chính xác.

### Vòng lặp 4: Đổi trả RMA 5 Bước (O2O 15 Phút) & Chiến dịch Flash Sale
1. **Tại Admin (`http://localhost:3001/returns/33333333-4444-5555-6666-777777777777` & `/configs/flash-sales`):**
   - Mở hồ sơ đổi trả `RET-2026-001`, điền form biên bản đo kiểm kỹ thuật (`#log-title`, `#log-actor`, `#log-location`, `#log-serial`, `#log-note`) và bấm **"Ghi nhận nhật ký kiểm định"** (`POST /api/returns/:id/logs` → `200 OK`).
   - Chuyển trạng thái RMA trên thanh tiến độ 5 bước sang Bước 4 (`ExchangeProcessing` → `Bước hiện tại: 4/5`) với phương thức xử lý **Đổi lấy ngay 15 phút tại Showroom**.
   - Vào `/configs/flash-sales`, cập nhật chiến dịch `Flash Sale Độc Quyền 2026` (`347fa54c-97f5-455e-93fb-26d2028dc44e`) với khung giờ đang diễn ra và giảm giá `iPhone 16 Pro Max 256GB` từ `34.990.000₫` xuống **`29.990.000₫`**.
2. **Đối chiếu tại Storefront (`http://localhost:3000/account/returns/33333333-4444-5555-6666-777777777777` & `/`):**
   - Trang chi tiết đổi trả hiển thị thanh tiến độ 5 bước (Bước 4 Active), badge hình thức `15 phút tại Showroom`, và biên bản kỹ thuật viên mới nhất hiển thị với class **`text-slate-800 dark:text-slate-100`** đảm bảo độ tương phản WCAG AA.
   - Trang chủ `/` hiển thị ngay đồng hồ đếm ngược Flash Sale đang chạy (`Kết thúc sau: 02:59:31`) cùng sản phẩm Hero `iPhone 16 Pro Max 256GB` ở mức giá Flash Sale **`29.990.000 ₫`** (giá gốc gạch ngang `34.990.000 ₫`).

---

## 3. DANH MỤC 10 LỖI TÍCH Hợp ĐÃ PHÁT HIỆN & VÁ TRIỆT ĐỂ TRONG ĐỢT QA-2

1. **SDK & Model Gemini trên AI Spec Generator (`route.ts`):**
   - *Vấn đề:* Route `/api/ai/generate-specs` gọi model cũ không khả dụng với API key hiện tại.
   - *Khắc phục:* Chuẩn hóa sang `@google/genai` với model `gemini-3.8-flash` và `responseJsonSchema` nghiêm ngặt 14 thông số + 2 `keySpecs`, kèm cơ chế fallback an toàn tại [`route.ts`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-dashboard/app/api/ai/generate-specs/route.ts).
2. **Phân quyền RBAC `403 Forbidden` khi Admin lưu sản phẩm (`AuthorizationPolicies.cs`):**
   - *Vấn đề:* `ProductsController.UpdateProduct` yêu cầu policy `Staff.EditProduct` nhưng policy này chưa được đăng ký rõ ràng cho role `Admin` trong `AuthorizationPolicies`.
   - *Khắc phục:* Bổ sung `Staff.EditProduct` và `EPermissions.EditProduct` cho phép `Admin` tại [`AuthorizationPolicies.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Policies/AuthorizationPolicies.cs).
3. **Validation `SalePrice == Price` & Xung đột EF Core Tracking khi lưu Specifications (`Product.cs`, `UpdateProductCommandHandler.cs`):**
   - *Vấn đề:* `Product.UpdatePrice` ném ngoại lệ khi `salePrice == price`, đồng thời gọi `_unitOfWork.Products.Update(existingProduct)` sau khi thêm `ProductSpecification` mới làm EF Core đánh dấu `Modified` thay vì `Added`.
   - *Khắc phục:* Cho phép `salePrice == price` (coi như không giảm giá) tại [`Product.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Domain/Entities/Product.cs) và sử dụng `specRepo.DeleteRange` / `specRepo.AddAsync` trên thực thể đang được track tại [`UpdateProductCommandHandler.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Products/Commands/UpdateProduct/UpdateProductCommandHandler.cs).
4. **Thiếu `KeySpecs` trên thẻ sản phẩm tại trang `/products` khi dùng DB Search (`NoOpProductSearchService.cs`, `ProductSearchResultDto.cs`):**
   - *Vấn đề:* `NoOpProductSearchService.SearchProductsAsync` chưa nạp `Specifications` và chưa trích xuất 2 chip `KeySpecs` cho `ProductSearchResultDto`.
   - *Khắc phục:* Bổ sung `.Include(p => p.Specifications)` và gọi `ProductSpecHelper.ExtractKeySpecs` tại [`NoOpProductSearchService.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Elasticsearch/NoOpProductSearchService.cs) và [`ProductSearchResultDto.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Products/Dto/ProductSearchResultDto.cs).
5. **Lỗi Transaction `NpgsqlRetryingExecutionStrategy` khi điều chuyển tồn kho O2O (`TransferShowroomStockCommandHandler.cs`):**
   - *Vấn đề:* `BeginTransactionAsync` gọi trực tiếp mà không bọc trong `ExecuteStrategyAsync` gây lỗi `400 Bad Request` khi PostgreSQL bật `EnableRetryOnFailure`.
   - *Khắc phục:* Bọc toàn bộ giao dịch điều chuyển kho trong `_unitOfWork.ExecuteStrategyAsync(...)` tại [`TransferShowroomStockCommandHandler.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Showrooms/Commands/TransferShowroomStock/TransferShowroomStockCommandHandler.cs).
6. **Đồng bộ tồn kho Showroom thực tế vào tab Pickup tại `/checkout` (`shipping-information.tsx`, `checkout/page.tsx`):**
   - *Vấn đề:* Danh sách 45 Showroom trên trang `/checkout` chưa lấy số lượng tồn kho theo sản phẩm trong giỏ hàng từ `/api/showrooms/stock`.
   - *Khắc phục:* Truyền `primaryProductId` từ giỏ hàng vào `ShippingInformation` và kết nối hook `useProductStock` tại [`shipping-information.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/checkout/shipping-information.tsx) và [`checkout/page.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/(routes)/checkout/page.tsx).
7. **Cảnh báo Low Stock (`≤ 5`) trên trang Quản trị 45 Showroom (`showrooms/page.tsx`, `showroom-inventory-sheet.tsx`):**
   - *Vấn đề:* Thiếu banner tổng hợp và badge cảnh báo trực quan cho các cơ sở có tồn kho thấp (`≤ 5`).
   - *Khắc phục:* Bổ sung Banner cảnh báo Low Stock và badge `Sắp hết hàng` / `Hết hàng` tại [`showrooms/page.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-dashboard/app/(dashboard)/showrooms/page.tsx) và [`showroom-inventory-sheet.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-dashboard/components/showrooms/showroom-inventory-sheet.tsx).
8. **Thiếu `AssignedSerials`, `WarrantyStatus = Active` và `InvoiceFileUrl` khi truy vấn & cập nhật Đơn hàng (`GetOrderByIdQueryHandler.cs`, `ActivateOrderWarrantyCommandHandler.cs`, `UploadOrderInvoicePdfCommandHandler.cs`, `UpdateOrderDepositStatusCommandHandler.cs`):**
   - *Vấn đề:* `GetOrderByIdQueryHandler` thiếu `.ThenInclude(i => i.OrderItemSerials)` và các Command Handler dùng `GetQueryable()` (`AsNoTracking()`) khiến thay đổi trên owned entity `Invoice` và `OrderItemSerials` không lưu xuống DB.
   - *Khắc phục:* Bổ sung `.ThenInclude(i => i.OrderItemSerials)` tại [`GetOrderByIdQueryHandler.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Queries/GetOrderById/GetOrderByIdQueryHandler.cs) và bật `GetQueryable(tracking: true)` tại [`ActivateOrderWarrantyCommandHandler.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/ActivateOrderWarranty/ActivateOrderWarrantyCommandHandler.cs), [`UploadOrderInvoicePdfCommandHandler.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/UploadOrderInvoicePdf/UploadOrderInvoicePdfCommandHandler.cs), [`UpdateOrderDepositStatusCommandHandler.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/UpdateOrderDepositStatus/UpdateOrderDepositStatusCommandHandler.cs).
9. **Che số điện thoại Shipper (`0912***789`) & Nút tải hóa đơn VAT PDF trên Storefront (`order-details.tsx`):**
   - *Vấn đề:* Số điện thoại shipper hiển thị dạng rõ và thiếu nút tải trực tiếp file PDF hóa đơn VAT đã upload từ Admin.
   - *Khắc phục:* Áp dụng regex che số điện thoại `(\d{4})\d{3,4}(\d{3}) -> $1***$2` và gắn sự kiện tải file `order.invoice.invoiceFileUrl` cho nút **Tải hóa đơn VAT (PDF)** tại [`order-details.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/account/order-details.tsx).
10. **Lưu nhật ký kỹ thuật viên RMA & Độ tương phản WCAG AA trên Storefront (`AddReturnRequestLogCommandHandler.cs`, `UpdateReturnStatusCommandHandler.cs`, `ReturnRequestRepository.cs`, `account/returns/[returnId]/page.tsx`):**
    - *Vấn đề:* `AddReturnRequestLogCommandHandler` và `UpdateReturnStatusCommandHandler` thêm bản ghi con vào collection mà chưa gọi `AddAsync` trên `DbSet`, và màu chữ log trên Storefront cần đạt chuẩn tương phản cao `text-slate-800`.
    - *Khắc phục:* Thêm trực tiếp `ReturnRequestLog` và `ReturnStatusHistory` qua `_unitOfWork.BaseRepository<T>().AddAsync(...)` tại [`AddReturnRequestLogCommandHandler.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Returns/Commands/AddReturnRequestLog/AddReturnRequestLogCommandHandler.cs) và [`UpdateReturnStatusCommandHandler.cs`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Returns/Commands/UpdateReturnStatus/UpdateReturnStatusCommandHandler.cs), đồng thời áp dụng `text-slate-800 dark:text-slate-100` tại [`account/returns/[returnId]/page.tsx`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/(routes)/account/returns/[returnId]/page.tsx).

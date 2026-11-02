Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Kế Hoạch Đồng Bộ & Nâng Cấp Admin Dashboard (`ecommerce-dashboard`) — Chuẩn SSoT 2026

> **Phiên bản:** SSoT 2026 — Multi-Agent Execution Blueprint (Calibrated & Verified)  
> **Dự án:** ShopViet E-Commerce Platform  
> **Phạm vi:** Backend .NET 8 REST API (`apps/backend/Ecommerce`) & Admin Dashboard Next.js 15 (`apps/frontend/ecommerce-dashboard` - port 3001)  
> **Tương thích:** Đồng bộ dữ liệu 100% với Khách hàng Next.js 15 (`apps/frontend/ecommerce-client` - port 3000)  
> **Ngày hiệu chỉnh & kiểm định:** 27/10/2026  

---

## 1. Báo Cáo Khảo Sát Hiện Trạng & Phân Tích Khoảng Trống (Gap Analysis)

Qua đối chiếu kiểm định chéo thực tế 1-1 giữa mã nguồn `apps/frontend/ecommerce-dashboard`, `apps/frontend/ecommerce-client` và 26+ Controllers / Entities trong `apps/backend/Ecommerce`, ma trận hiện trạng của 5 phân hệ như sau:

| Phân hệ quản trị | Hiện trạng Backend (.NET 8) | Hiện trạng Admin Dashboard (Port 3001) | Khoảng trống cần bổ sung & Hiệu chỉnh (Gap & Calibration) |
|---|---|---|---|
| **0. Nền tảng Xác thực (Auth), CORS & UI SSoT 2026** | - `Cors:AllowedOrigins` trong `appsettings.json` **đã cấu hình sẵn** `http://localhost:3001`, `WithOrigins`, `AllowCredentials()`, `WithExposedHeaders("Set-Cookie")`.<br>- `AuthorizationPolicies.cs` dùng Reflection tự động đăng ký mọi constant trong `EPermissions` thành Policy và Admin tự bypass.<br>- `ApplicationDbContextSeed.cs` đang kiểm tra `if (!await _context.Permissions.AnyAsync())` nên nếu DB đã có data sẽ bỏ qua permissions mới. | - `next.config.ts` có rewrite `/api/:path*` -> backend url, cookie và CSRF token được gửi tự động qua `lib/axios.ts`.<br>- `middleware.ts` đã bảo vệ `/configs` nhưng **chưa có** `/showrooms` trong `PROTECTED_PATH_PREFIXES` và `config.matcher`.<br>- `app/globals.css` chưa định nghĩa các semantic token `--color-brand`, `--color-tech-blue` và `.price-tag`. | - **Backend:** Bổ sung permissions vào `EPermissions.cs`; sửa `ApplicationDbContextSeed.cs` để thêm quyền mới dạng Upsert (không bỏ qua khi bảng đã có data).<br>- **Dashboard:** Bổ sung `/showrooms` vào `middleware.ts`; bổ sung CSS tokens chuẩn SSoT 2026 vào `app/globals.css`; cập nhật `types/permission.ts` & `components/app-sidebar.tsx`. |
| **1. Hệ thống 45 Showroom & Tồn kho O2O (`Showroom`, `ShowroomInventory`)** | - Đã có Entity `Showroom` (45 cơ sở) & `ShowroomInventory` (`Quantity`, `ReservedQuantity`, `IsAvailableFor2hDelivery`).<br>- `ShowroomsController` mới chỉ có 2 API đọc public: `GET /api/Showrooms` và `GET /api/Showrooms/check-stock`.<br>- **Thiếu:** Toàn bộ Commands/Endpoints CRUD Showroom, quản lý tồn kho SKU theo cơ sở và điều chuyển tồn kho O2O (Stock Transfer). | - **Chưa có** route `/showrooms`, chưa có service, hook hay component quản lý Showroom.<br>- Trang `/inventory` hiện tại chỉ tra cứu và import lô `InventoryItem` (IMEI) theo `SkuId` đơn lẻ. | - **Backend:** Thêm CQRS Commands & Endpoints cho CRUD Showroom, truy vấn/cập nhật tồn kho chi nhánh, và điều chuyển kho giữa 2 Showroom trong một Transaction.<br>- **Dashboard:** Xây dựng route `/showrooms` theo mô hình **Master-Detail + Sheet Drawer** quản lý cơ sở, tồn kho & điều chuyển O2O. |
| **2. Thông số kỹ thuật (`ProductSpecifications`) & Gói bảo hành (`ProductAddOns`)** | - Entity `ProductSpecification` đã có đủ trường: `GroupName`, `IsKeySpec`, `IsHighlight`, `FilterKey`, `DisplayOrder`.<br>- `Product.AddSpecification()` trong Domain đã hỗ trợ đủ 7 tham số.<br>- **Lệch DTO kép & Handlers:**<br>  + `ProductSpecificationDto` (Command Input DTO) **thiếu** `IsHighlight`, `FilterKey` và thiếu `ReverseMap()`.<br>  + `SpecificationDto` (Query Output DTO trong `ProductDto`) **đã có `IsHighlight` nhưng THIẾU `FilterKey`** (khiến UI Edit tải sản phẩm lên bị mất `FilterKey`).<br>  + `CreateProductCommandHandler` và `UpdateProductCommandHandler` chỉ truyền 5 tham số vào `AddSpecification`.<br>- Entity `ProductAddOn` và `ProductAddOnDto` đã có nhưng **hoàn toàn chưa có `ProductAddOnsController`** hay bất kỳ CQRS Commands/Queries nào. | - `specifications.tsx` mới chỉ có 2 trường `name` và `value`.<br>- `product-service.ts` (`createFormDataFromProduct`) **bỏ qua** `groupName`, `isKeySpec`, `filterKey`, `displayOrder`, `isHighlight` khi đóng gói `FormData`.<br>- `types/product.ts` thiếu các thuộc tính mở rộng.<br>- **Thiếu:** Bộ khởi tạo nhanh 14 thông số chuẩn SSoT (ràng buộc tối đa 2 `isKeySpec`), và giao diện quản lý `ProductAddOns`. | - **Backend:** Bổ sung `IsHighlight`, `FilterKey` và mapping 2 chiều vào `ProductSpecificationDto`; bổ sung `FilterKey` vào `SpecificationDto`; sửa 2 handlers tạo/sửa sản phẩm truyền đủ 7 tham số; tạo mới `ProductAddOnsController` (CRUD kho gói dịch vụ chung + gán sản phẩm).<br>- **Dashboard:** Cập nhật `createFormDataFromProduct` trong `product-service.ts`; cập nhật Zod schemas; xây dựng `/configs/product-addons` + nâng cấp form sản phẩm. |
| **3. Đơn hàng mở rộng (Serial/IMEI, e-Warranty, Hóa đơn VAT, Cọc COD 10%)** | - Entity `Order` đã có `OrderInvoice`, `DepositAmount`, `DepositStatus`, `DeliveryMethod`, `ShowroomId`, `CarrierName`, `TrackingNumber`, `DriverName`, `DriverPhone`.<br>- Entity `OrderItem` có khóa chính `Id`, `OrderItemSerials` (`ICollection<OrderItemSerial>`).<br>- **Lệch DTO nghiêm trọng:**<br>  + `OrderItemDto` hiện **thiếu trường `Id` (khóa chính Guid của OrderItem)** và `AssignedSerials` khiến frontend không có `orderItemId` để gán Serial!<br>  + Chưa tồn tại file `OrderItemSerialDto.cs` trong tầng Application.<br>  + `OrderDto` thiếu 4 trường vận đơn (`CarrierName`, `TrackingNumber`, `DriverName`, `DriverPhone`).<br>- **Thiếu:** Endpoints gán/xóa Serial, kích hoạt e-Warranty độc lập, upload PDF hóa đơn VAT, cập nhật cọc COD. | - Form đơn hàng (`order-edit-form.tsx`, `order-info.tsx`, `order-items.tsx`) chỉ hiển thị các trường cơ bản.<br>- `types/order.ts` thiếu `OrderItem.id`, `OrderItemSerial`, `OrderInvoice`, `EDepositStatus`, `EDeliveryType`.<br>- `apps/frontend/ecommerce-client/types/order.ts` thiếu `carrierName`, `trackingNumber`, `driverName`, `driverPhone` dẫn tới lỗi TypeScript compile tại `components/account/order-details.tsx`.<br>- **Thiếu:** Khối thông tin Cọc COD 10%, O2O Showroom Pickup, Quản lý Hóa đơn VAT (upload PDF & xem file), và Quét/nhập Serial/IMEI + nút kích hoạt e-Warranty độc lập. | - **Backend:** Thêm `Id` và `AssignedSerials` vào `OrderItemDto`; tạo mới `OrderItemSerialDto.cs`; thêm `CarrierName`, `TrackingNumber`, `DriverName`, `DriverPhone` vào `OrderDto`; thêm các endpoints chuyên biệt dưới `OrdersController`.<br>- **Client & Dashboard:** Mở rộng `types/order.ts` trên cả Dashboard và Client (vá lỗi TS), mở rộng `services/order-service.ts` và nâng cấp trang chi tiết/chỉnh sửa đơn hàng `/orders/[orderId]`. |
| **4. Đổi trả RMA 5 bước (`ReturnRequestLog`) & Chiến dịch Flash Sale (`FlashSale`)** | - `ReturnsController` dùng cứng `[Authorize(Roles = Admin)]` thay vì dynamic policy.<br>- `ReturnRequestDto` **đã có sẵn** `Logs` (`List<ReturnRequestLogDto>`), `TimelineSteps` (`List<ReturnTimelineStepDto>`), `SerialNumber`, `ShowroomId`, `ShowroomName`, `AssignedTechnicianName`, `ProcessingMethod`.<br>- **Thiếu:** Command và endpoint ghi nhận nhật ký `POST /api/Returns/{id}/logs`.<br>- `PromotionsController` mới chỉ có duy nhất `GET /api/Promotions/flash-sale/current`, hoàn toàn chưa có CRUD cho `FlashSale` & `FlashSaleItem`. | - `types/return-request.ts` trong dashboard **chưa có** kiểu `ReturnRequestLog`, `ReturnTimelineStep` và các trường kỹ thuật viên.<br>- `/returns/[returnId]` đã có duyệt/từ chối nhưng **thiếu** visual Stepper 5 bước RMA và form nhật ký kỹ thuật viên.<br>- **Chưa có** trang quản lý chiến dịch Flash Sale (`/configs/flash-sales`). | - **Backend:** Chuyển `ReturnsController` sang policy `EPermissions.ViewReturns`/`ManageReturns`; thêm API ghi nhật ký kiểm định `POST /api/Returns/{id}/logs`; thêm CRUD API cho `FlashSale` & `FlashSaleItem`.<br>- **Dashboard:** Cập nhật `types/return-request.ts`; nâng cấp `/returns/[returnId]` (Stepper 5 bước + Form nhật ký kỹ thuật viên) và xây dựng mới `/configs/flash-sales`. |

---

## 2. Quyết Định Kiến Trúc Đã Chốt (Architectural Decisions)

Dựa trên kết quả chất vấn kiến trúc (`/grill-me`), toàn bộ hệ thống sẽ tuân thủ 4 quyết định thiết kế bất di bất dịch sau:

1. **Phân quyền Động (Dynamic RBAC via `EPermissions` & Reflection Engine):**
   - Bãi bỏ việc dùng cứng `[Authorize(Roles = EUserRoles.Admin)]` trên `ReturnsController`, `ShowroomsController`, `PromotionsController`, `InventoryController`.
   - Bổ sung các hằng số quyền mới vào `EPermissions.cs` (Backend) và `types/permission.ts` (Dashboard):
     - `ViewShowrooms`, `ManageShowrooms`, `ViewInventory`, `ManageInventory` (gán cho `Admin`, `Manager`, `Staff` kho/chi nhánh).
     - `ViewReturns`, `ManageReturns` (gán cho `Admin`, `Manager`, `Staff` kỹ thuật viên).
     - `ViewPromotions`, `ManagePromotions` (hoặc nhóm `PromotionManagement` cho Flash Sale & Product Add-ons).
   - Cơ chế Reflection trong `AuthorizationPolicies.ConfigurePolicies` sẽ tự động tạo policy cho các quyền này; tài khoản `Admin` tự động được bypass cho mọi policy.
2. **Quản lý 45 Showroom & Tồn kho O2O theo mô hình Master-Detail & Sheet Drawer:**
   - Trang `/showrooms` hiển thị danh sách 45 cơ sở (hỗ trợ lọc theo Vùng `HCM`, `HN`, `DN`, `CT`, `Other`, Tỉnh/Thành, trạng thái Flagship / Instant Pickup 15p).
   - Bấm vào một Showroom sẽ mở **Sheet Drawer / Detail Tabs** hiển thị danh sách tồn kho theo SKU (`Quantity`, `ReservedQuantity`, bật/tắt `IsAvailableFor2hDelivery`) và chức năng **Tạo phiếu điều chuyển kho (Stock Transfer)** giữa các cơ sở trong cùng 1 Transaction an toàn.
3. **Quản lý 14 Thông số kỹ thuật & Gói bảo hành (`ProductAddOns`) theo mô hình Hybrid:**
   - Tạo trang cấu hình dùng chung tại `/configs/product-addons` để quản lý các gói dịch vụ chuẩn (AppleCare+, Samsung Care+, Gia hạn bảo hành 24T/36T, Combo phụ kiện) áp dụng theo Thương hiệu (`BrandId`), Danh mục (`CategoryId`) hoặc Sản phẩm cụ thể (`ProductId`).
   - Ngay trong form Tạo/Sửa sản phẩm (`/products/new`, `/products/[productId]/edit`):
     - Nâng cấp bảng **Thông số kỹ thuật**: có nút **"Khởi tạo nhanh 14 thông số chuẩn SSoT"** (tự động điền 14 dòng thông số theo 6 nhóm `Vi xử lý & Hiệu năng`, `Màn hình`, `Bộ nhớ & Lưu trữ`, `Đồ họa & Âm thanh`, `Kết nối & Cổng`, `Pin, Sạc & Thiết kế`), hỗ trợ chọn `GroupName`, `FilterKey`, và ràng buộc Zod + UI chỉ cho phép tích chọn **tối đa 2 `IsKeySpec`** (hiển thị chip trên ProductCard).
     - Bổ sung phân vùng **Gói bảo hành & Mua kèm (`ProductAddOns`)**: hiển thị các gói kế thừa từ Hãng/Danh mục và cho phép gắn thêm/override gói riêng cho sản phẩm.
4. **Quy trình Đóng gói Đơn hàng (Serial/IMEI, e-Warranty, Hóa đơn VAT) — Thao tác Thủ công Độc lập:**
   - **Không khóa cứng** việc chuyển trạng thái đơn hàng (`Pending` -> `Processing` -> `Shipped` -> `Delivered`) vào việc đã nhập đủ Serial/IMEI hay chưa, đảm bảo tính linh hoạt tối đa cho vận hành thực tế.
   - Nhân viên kho có thể quét barcode hoặc nhập tay mã `SerialNumber` & `Imei` cho từng `OrderItem` bất kỳ lúc nào, và **chủ động bấm nút "Kích hoạt e-Warranty"** để ghi nhận `ActivatedAt` & tính `WarrantyExpiresAt` (`24 tháng` mặc định + số tháng của `ProductAddOn` nếu có).
   - Về **Hóa đơn điện tử VAT (`OrderInvoice`)**: nhân viên kế toán xem thông tin xuất hóa đơn (`TaxCode`, `CompanyName`, `CompanyAddress`, `InvoiceEmail`) và **upload file PDF hóa đơn VAT từ bên ngoài lên** hệ thống (lưu vào `InvoiceFileUrl` qua `IFileStorageService` tại `uploads/invoices/`), kèm nút tải/xem trực tiếp file PDF đã upload.

---

## 3. Thiết Kế Chi Tiết Theo Từng Phân Hệ

### 3.1. Phân Hệ 0: Đồng Bộ Hệ Thống Phân Quyền (`EPermissions` & UI Tokens SSoT 2026)

#### A. Backend (`Ecommerce.Domain`, `Ecommerce.Application`, `Ecommerce.Infrastructure`)
- **File `Ecommerce.Domain/Enums/EPermissions.cs`:**
  - Bổ sung hằng số permissions:
    ```csharp
    public const string ViewShowrooms = "ViewShowrooms";
    public const string ManageShowrooms = "ManageShowrooms";
    public const string ViewInventory = "ViewInventory";
    public const string ManageInventory = "ManageInventory";
    public const string ViewReturns = "ViewReturns";
    public const string ManageReturns = "ManageReturns";
    ```
  - Cập nhật `EPermissions.Groups`:
    - Thêm `ShowroomManagement = [ViewShowrooms, ManageShowrooms];`
    - Thêm `InventoryManagement = [ViewInventory, ManageInventory];`
    - Thêm `ReturnManagement = [ViewReturns, ManageReturns];`
    - Bổ sung các nhóm này vào `AdminPermissions` và `StaffPermissions` để tài khoản seed có đầy đủ quyền thao tác.
- **File `Ecommerce.Infrastructure/Persistence/Seed/ApplicationDbContextSeed.cs`:**
  - Nâng cấp `SeedPermissionsAsync`: Thay vì `if (!await _context.Permissions.AnyAsync())` rồi bỏ qua, hãy duyệt danh sách permissions cần thiết và chỉ thêm những quyền chưa tồn tại trong database (Upsert pattern).
  - Tương tự trong `SeedRolePermissionsAsync`: Bổ sung các quyền mới vào bảng `RolePermissions` cho các Role `Admin` và `Staff`.

#### B. Frontend Dashboard (`apps/frontend/ecommerce-dashboard`)
- **Chuẩn hóa UI/UX SSoT 2026 (`app/globals.css` & Formatting):**
  - Bổ sung các semantic tokens chuẩn SSoT 2026 vào `app/globals.css`:
    ```css
    @theme inline {
      --color-brand: #E11D48;
      --color-tech-blue: #2563EB;
      --color-surface: #F1F5F9;
      --color-line: #E2E8F0;
    }
    .price-tag {
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    ```
  - Đảm bảo 100% các cột hiển thị tiền tệ mới (Giá gói bảo hành, Giá Flash Sale, Tiền cọc COD 10%, Tiền hoàn RMA) sử dụng `font-mono tabular-nums whitespace-nowrap` (hoặc class `.price-tag`) và không dùng hardcoded hex (`[#...]`).
- **Bổ sung Route Protection vào `middleware.ts`:**
  - Thêm `'/showrooms'` vào mảng `PROTECTED_PATH_PREFIXES` (dòng 21-45).
  - Thêm `'/showrooms/:path*'` vào `config.matcher` (dòng 145-171) để đảm bảo quyền truy cập được kiểm soát qua session `ALLOWED_DASHBOARD_ROLES` (`Admin`, `Manager`, `Staff`).
  - Lưu ý: `/configs/product-addons` và `/configs/flash-sales` đã tự động được bảo vệ vì `/configs` và `/configs/:path*` đã có sẵn.
- **Cập nhật `types/permission.ts` & `components/app-sidebar.tsx`:**
  - Đồng bộ danh sách `EPermissions` và `PermissionGroups` trong `types/permission.ts`.
  - Trên `components/app-sidebar.tsx`: Sử dụng các icon từ `@tabler/icons-react` theo chuẩn của Sidebar hiện tại:
    - Thêm **"Hệ thống Showroom (O2O)"** (`/showrooms`) vào nhóm `Catalog` (`navCatalog`) với icon `IconBuildingStore`.
    - Thêm **"Gói bảo hành & Mua kèm"** (`/configs/product-addons`) vào `navSystem` -> `Cấu hình` với icon `IconShieldCheck`.
    - Thêm **"Chiến dịch Flash Sale"** (`/configs/flash-sales`) vào `navSystem` -> `Cấu hình` với icon `IconFlame`.

#### C. Đồng Bộ Hợp Đồng Client & Sửa Lỗi Biên Dịch (`apps/frontend/ecommerce-client`)
- **File `apps/frontend/ecommerce-client/types/order.ts`:**
  - Bổ sung 4 trường vận đơn còn thiếu:
    ```typescript
    carrierName?: string;
    trackingNumber?: string;
    driverName?: string;
    driverPhone?: string;
    ```
  - Khắc phục triệt để lỗi biên dịch `error TS2339: Property 'driverName' does not exist on type 'Order'` và `Property 'driverPhone' does not exist on type 'Order'` tại `components/account/order-details.tsx` (dòng 217), đưa `npm run typecheck` trên client về Exit code 0 hoàn hảo.

---

### 3.2. Phân Hệ 1: Quản Lý 45 Showroom & Tồn Kho Chi Nhánh (O2O Inventory)

#### A. Backend API (`ShowroomsController` & CQRS Handlers)
Mở rộng `ShowroomsController` (`api/Showrooms`) với các CQRS Commands/Queries:
1. `GET /api/Showrooms/admin` (`[Authorize(Policy = EPermissions.ViewShowrooms)]`):
   - Lấy toàn bộ danh sách Showroom (bao gồm cả `IsActive = false`), kèm tổng số SKU đang có hàng và tổng tồn kho tại mỗi cơ sở.
2. `POST /api/Showrooms` (`[Authorize(Policy = EPermissions.ManageShowrooms)]`):
   - Command `CreateShowroomCommand`: Tạo mới Showroom (`Code`, `Name`, `Region`, `City`, `Province`, `District`, `Ward`, `Address`, `Phone` mặc định `1800 6868`, `OpeningHours`, `Latitude`, `Longitude`, `GoogleMapIframeUrl`, `IsFlagship`, `HasInstantPickup`, `IsActive`, `DisplayOrder`).
3. `PUT /api/Showrooms/{id}` & `DELETE /api/Showrooms/{id}` (`[Authorize(Policy = EPermissions.ManageShowrooms)]`):
   - Command `UpdateShowroomCommand` & `DeleteShowroomCommand`: Cập nhật thông tin hoặc xóa mềm Showroom (`IsActive = false`).
4. `GET /api/Showrooms/{id}/inventory` (`[Authorize(Policy = EPermissions.ViewShowrooms)]`):
   - Query `GetShowroomInventoryQuery`: Trả về danh sách tồn kho `ShowroomInventory` tại cơ sở `{id}` (kèm `ProductName`, `ProductImage`, `SkuCode`, `VariantInfo`, `Quantity`, `ReservedQuantity`, `IsAvailableFor2hDelivery`). Hỗ trợ tìm kiếm theo tên hoặc mã SKU.
5. `PUT /api/Showrooms/{id}/inventory` (`[Authorize(Policy = EPermissions.ManageInventory)]`):
   - Command `UpdateShowroomInventoryCommand`: Cập nhật nhanh số lượng `Quantity`, `ReservedQuantity` và cờ `IsAvailableFor2hDelivery` cho một `(ShowroomId, ProductId, ProductVariantSkuId)`.
6. `POST /api/Showrooms/transfer-stock` (`[Authorize(Policy = EPermissions.ManageInventory)]`):
   - Command `TransferShowroomStockCommand`: Điều chuyển `Quantity` của một SKU từ `FromShowroomId` sang `ToShowroomId` trong cùng một EF Core Transaction (kiểm tra `Quantity - ReservedQuantity >= TransferQuantity`, trừ kho nguồn, cộng kho đích).

#### B. Frontend Dashboard (`app/(dashboard)/showrooms`)
- **Files cần tạo mới:**
  - `types/showroom.ts`: Khai báo interface `Showroom`, `ShowroomInventoryItem`, `StockTransferRequest`.
  - `services/showroom-service.ts`: Kế thừa `BaseService`, implement các API calls trên.
  - `hooks/use-showrooms.ts`: Wrapper TanStack Query (`useQuery`, `useMutation`).
  - `schemas/showroom/showroom-schema.ts`: Zod schema validate form thêm/sửa Showroom và điều chuyển kho.
  - `app/(dashboard)/showrooms/page.tsx`:
    - KPI Cards đầu trang: Tổng số Showroom (`45`), Flagship Showroom, Hỗ trợ Pickup 15 phút, Tổng tồn kho O2O toàn quốc.
    - Bộ lọc nhanh theo Vùng (`HCM`, `HN`, `DN`, `CT`, `Other`), từ khóa tìm kiếm, nút **"Thêm Showroom"**.
    - Bảng danh sách Showroom: Mã (`Code`), Tên cơ sở, Tỉnh/Thành, Hotline (`1800 6868`), Trạng thái (`Flagship`, `Pickup 15p`, `Active`), Nút **"Quản lý tồn kho O2O"**, **"Sửa"**.
  - `components/showrooms/showroom-form-dialog.tsx`: Modal Thêm/Sửa Showroom.
  - `components/showrooms/showroom-inventory-sheet.tsx`:
    - **Sheet Drawer** rộng (`sm:max-w-3xl`) mở ra khi bấm vào một cơ sở.
    - Tab 1 — **Tồn kho tại cơ sở**: Tìm kiếm SKU, sửa inline số lượng tồn (`Quantity`), bật/tắt switch `Giao hỏa tốc 2H` (`IsAvailableFor2hDelivery`).
    - Tab 2 — **Điều chuyển kho (Stock Transfer)**: Chọn SKU, chọn Showroom nhận, nhập số lượng và bấm xác nhận điều chuyển.

---

### 3.3. Phân Hệ 2: Quản Lý 14 Thông Số Kỹ Thuật (`ProductSpecifications`) & Gói Bảo Hành (`ProductAddOns`)

#### A. Backend API (`ProductAddOnsController` & `ProductsController`)
1. **Tạo mới `ProductAddOnsController` (`api/ProductAddOns`) & CQRS Handlers:**
   - Tạo mới `Controllers/ProductAddOnsController.cs` kế thừa `ControllerBase`.
   - Tạo thư mục `Ecommerce.Application/Features/Products/Commands/CreateProductAddOn`, `UpdateProductAddOn`, `DeleteProductAddOn` và `Queries/GetProductAddOns`.
   - `GET /api/ProductAddOns`: Lấy danh sách gói (filter theo `productId`, `categoryId`, `brandId`, `addOnType`, `isActive`).
   - `GET /api/ProductAddOns/{id}`: Lấy chi tiết gói.
   - `POST /api/ProductAddOns` (`[Authorize(Policy = EPermissions.CreateProduct)]`): Tạo gói dịch vụ mới (ví dụ: `APPLECARE_MBP14` - "AppleCare+ 3 năm", giá `2.490.000₫`, `DurationMonths = 36`).
   - `PUT /api/ProductAddOns/{id}` & `DELETE /api/ProductAddOns/{id}` (`[Authorize(Policy = EPermissions.EditProduct)]`): Cập nhật / xóa gói.
2. **Hiệu chỉnh DTO & Handlers (`ProductSpecificationDto`, `SpecificationDto`, `CreateProductCommand`, `UpdateProductCommand`):**
   - **Sửa `ProductSpecificationDto.cs` (Input/Command DTO):**
     - Bổ sung `public bool IsHighlight { get; set; } = false;` và `public string? FilterKey { get; set; }`.
     - Cấu hình AutoMapper hai chiều:
       ```csharp
       public void Mapping(Profile profile)
       {
           profile.CreateMap<ProductSpecification, ProductSpecificationDto>().ReverseMap();
       }
       ```
   - **Sửa `SpecificationDto.cs` (Output/Query DTO trong `ProductDto.cs`):**
     - Bổ sung `public string? FilterKey { get; set; }` (hiện đã có `IsHighlight` nhưng thiếu `FilterKey`, khiến form edit tải dữ liệu sản phẩm lên bị mất `filterKey`).
     - Ánh xạ AutoMapper giữ nguyên:
       ```csharp
       profile.CreateMap<ProductSpecification, SpecificationDto>();
       ```
   - **Sửa `CreateProductCommandHandler.cs` & `UpdateProductCommandHandler.cs`:**
     - Sửa dòng gọi `product.AddSpecification()` để truyền đủ 7 tham số:
       ```csharp
       product.AddSpecification(
           spec.Name, 
           spec.Value, 
           spec.GroupName, 
           spec.IsKeySpec, 
           spec.DisplayOrder, 
           spec.FilterKey, 
           spec.IsHighlight
       );
       ```
   - **Cập nhật Command:** Bổ sung `WarrantyMonths`, `OriginBadge`, `AddOnIds` vào `CreateProductCommand` & `UpdateProductCommand`.
   - Thêm FluentValidation trong `CreateProductCommandValidator` / `UpdateProductCommandValidator`: Số lượng thông số có `IsKeySpec == true` trên 1 sản phẩm **không vượt quá 2**.

#### B. Frontend Dashboard (`configs/product-addons` & `components/products`)
- **Trang Quản lý Kho Gói dịch vụ dùng chung (`app/(dashboard)/configs/product-addons/page.tsx`):**
  - Tạo `types/product-addon.ts`, `services/product-addon-service.ts`, `hooks/use-product-addons.ts`.
  - Giao diện bảng danh sách các gói dịch vụ (`ExtendedWarranty`, `AccessoryBundle`, `Installation`), hiển thị giá tiền chuẩn `.price-tag` (`font-mono tabular-nums whitespace-nowrap`), thời hạn bảo hành cộng thêm (`+12 tháng`, `+24 tháng`, `+36 tháng`), phạm vi áp dụng và Modal Thêm/Sửa gói.
- **Hiệu chỉnh `product-service.ts` (`createFormDataFromProduct`):**
  - Bổ sung append: `groupName`, `isKeySpec`, `filterKey`, `displayOrder`, `isHighlight` cũng như `warrantyMonths` và `originBadge` vào `FormData` (dòng 71-79).
- **Cập nhật Zod Schema (`schemas/product/createProductSchema.ts` & `updateProductSchema.ts`):**
  - Mở rộng object trong `specifications`: thêm `groupName`, `isKeySpec`, `isHighlight`, `filterKey`, `displayOrder`.
  - Thêm refine validator: số lượng phần tử có `isKeySpec: true` không được vượt quá 2.
- **Nâng cấp Form Sản phẩm (`components/products/form-sections/specifications.tsx` & `addons.tsx`):**
  - **Trong `specifications.tsx`:**
    - Thêm nút **"Khởi tạo bộ 14 thông số chuẩn SSoT"** (tự động điền 14 dòng thông số tiêu chuẩn phân theo 6 nhóm `GroupName`: *Vi xử lý & Hiệu năng*, *Màn hình*, *Bộ nhớ & Lưu trữ*, *Đồ họa & Âm thanh*, *Kết nối & Cổng*, *Pin, Sạc & Thiết kế* cùng `FilterKey` chuẩn `cpu`, `ram`, `ssd`, `screen_size`, `gpu`, `battery`...).
    - Mỗi dòng thông số hiển thị: Nhóm (`GroupName`), Tên (`Name`), Giá trị (`Value`), Khóa lọc (`FilterKey`), Thứ tự (`DisplayOrder`), và Checkbox **`Key Spec (Tối đa 2)`** (`isKeySpec`).
    - Hiển thị badge bộ đếm `Đã chọn X/2 Key Specs` (màu `bg-tech-blue`); nếu đã đủ 2 key specs, tự động disable các checkbox chưa chọn còn lại.
  - **Tạo mới `components/products/form-sections/product-addons.tsx`:**
    - Nhúng vào `product-form.tsx` và `product-edit-form.tsx`.
    - Cho phép xem các gói bảo hành được kế thừa theo `BrandId`/`CategoryId`, và cho phép gắn gói bảo hành riêng (ví dụ: AppleCare+ `+2.490.000₫`) cho sản phẩm.

---

### 3.4. Phân Hệ 3: Quản Lý Đơn Hàng Mở Rộng (Serial/IMEI, e-Warranty, Hóa Đơn VAT, Cọc COD 10%)

#### A. Backend API (`OrdersController` & Handlers)
Theo quyết định **Thao tác thủ công độc lập**, bổ sung các endpoints chuyên biệt dưới `OrdersController`:
1. **Sửa lỗi DTO cốt lõi trong `OrderDto` & `OrderItemDto`:**
   - **`OrderItemSerialDto.cs` (TẠO MỚI):** Tạo mới file `Ecommerce.Application/Features/Orders/Dto/OrderItemSerialDto.cs` kế thừa `IMapFrom<OrderItemSerial>` với các thuộc tính:
     ```csharp
     public Guid Id { get; set; }
     public string SerialNumber { get; set; } = string.Empty;
     public string? Imei { get; set; }
     public int WarrantyMonths { get; set; } = 24;
     public DateTime? ActivatedAt { get; set; }
     public DateTime? WarrantyExpiresAt { get; set; }
     public string WarrantyStatus { get; set; } = "Inactive";
     ```
   - **`OrderItemDto.cs` (BẮT BUỘC):** Bổ sung `public Guid Id { get; set; }` (khóa chính Guid của `OrderItem`) và `public List<OrderItemSerialDto> AssignedSerials { get; set; } = [];`. Cấu hình AutoMapper map từ `OrderItem.OrderItemSerials -> OrderItemDto.AssignedSerials`.
   - **`OrderDto.cs`:** Bổ sung 4 trường vận đơn đã có sẵn trong Entity `Order`: `CarrierName`, `TrackingNumber`, `DriverName`, `DriverPhone`.
2. **`POST /api/Orders/{orderId}/items/{orderItemId}/serials` (`[Authorize(Policy = EPermissions.EditOrder)]`):**
   - Command `AssignOrderItemSerialsCommand`: Cho phép nhân viên kho quét/nhập mã `SerialNumber` và `Imei` cho từng `OrderItem` (nếu trùng `InventoryItem` có sẵn trong kho thì liên kết và cập nhật trạng thái; nếu nhập ngoài vẫn lưu bản ghi `OrderItemSerial` hợp lệ).
3. **`DELETE /api/Orders/{orderId}/serials/{serialId}` (`[Authorize(Policy = EPermissions.EditOrder)]`):**
   - Command `RemoveOrderItemSerialCommand`: Xóa/gỡ mã Serial/IMEI khỏi `OrderItem`.
4. **`POST /api/Orders/{orderId}/activate-warranty` (`[Authorize(Policy = EPermissions.EditOrder)]`):**
   - Command `ActivateOrderWarrantyCommand`: Khi nhân viên bấm nút **"Kích hoạt e-Warranty"**, cập nhật các bản ghi `OrderItemSerial`:
     - `ActivatedAt = DateTime.UtcNow`
     - `WarrantyExpiresAt = ActivatedAt.Value.AddMonths(serial.WarrantyMonths)` (với `WarrantyMonths = 24` tháng gốc + thời hạn `ProductAddOn.DurationMonths` nếu có)
     - `WarrantyStatus = "Active"`.
5. **`POST /api/Orders/{orderId}/invoice-upload` (`[Authorize(Policy = EPermissions.EditOrder)]`):**
   - Command `UploadOrderInvoicePdfCommand`: Nhận file PDF và thông tin xuất hóa đơn, lưu qua `IFileStorageService` (lưu local tại `uploads/invoices/` hoặc Supabase bucket trong môi trường Cloud, kiểm tra định dạng `.pdf` và dung lượng $\le 10\text{MB}$), cập nhật `Order.Invoice.InvoiceFileUrl` và trả về URL file.
6. **`PUT /api/Orders/{orderId}/deposit-status` (`[Authorize(Policy = EPermissions.EditOrder)]`):**
   - Command `UpdateOrderDepositStatusCommand`: Cho phép xác nhận trạng thái cọc COD 10% (`EDepositStatus`: `None`, `Pending`, `Paid`, `Refunded`) và thông tin vận đơn.

#### B. Frontend Dashboard (`components/orders`)
- **Nâng cấp `types/order.ts`, `services/order-service.ts`, `hooks/use-orders.ts`:**
  - Bổ sung interface `OrderItemSerial`, `OrderInvoice`, enum `EDepositStatus`, `EDeliveryType`.
- **Mở rộng trang Chi tiết & Chỉnh sửa Đơn hàng (`app/(dashboard)/orders/[orderId]/page.tsx` & `edit/page.tsx`):**
  - **Khối 1 — Tài chính & Đặt cọc COD 10% (`components/orders/order-financial-card.tsx`):**
    - Hiển thị chi tiết: Tạm tính (`Subtotal`), Phí vận chuyển (`ShippingCost` — Freeship $\ge 500.000\text{₫}$, dưới 500k tính 30.000₫), Giảm giá (`DiscountAmount`), Tổng cộng (`TotalAmount`), **Cọc COD 10%** (`DepositAmount` / `DepositStatus`) và **Còn phải thu** (`RemainingAmount`). Toàn bộ giá tiền áp dụng `.price-tag` (`font-mono tabular-nums whitespace-nowrap`).
    - Cập nhật trạng thái Cọc COD và phương thức giao hàng (Giao tiêu chuẩn / Hỏa tốc 2H / Nhận tại Showroom O2O).
  - **Khối 2 — Đóng gói Xuất kho: Quét Serial/IMEI & Kích hoạt e-Warranty (`components/orders/order-serial-manager.tsx`):**
    - Trên từng dòng `OrderItem`, hiển thị sản phẩm, gói mua kèm (`AddOnName`, `+AddOnPrice`), thời hạn bảo hành (`WarrantyMonths`), và danh sách các thẻ `SerialNumber / IMEI` đã gán.
    - Ô input hỗ trợ máy quét mã vạch (nhấn `Enter` để thêm nhanh Serial/IMEI).
    - Nút **"Kích hoạt e-Warranty"** độc lập (màu `bg-tech-blue`): bấm để kích hoạt bảo hành điện tử và hiển thị ngày hết hạn `WarrantyExpiresAt` cùng badge `Active`.
  - **Khối 3 — Quản lý Hóa đơn Điện tử VAT (`components/orders/order-invoice-card.tsx`):**
    - Hiển thị thông tin xuất hóa đơn (`TaxCode`, `CompanyName`, `CompanyAddress`, `InvoiceEmail`).
    - Khu vực upload file PDF hóa đơn VAT từ máy tính kế toán lên hệ thống, kèm nút **"Xem / Tải PDF Hóa đơn VAT"** khi đã có `InvoiceFileUrl`.

---

### 3.5. Phân Hệ 4: Quản Lý Đổi Trả (RMA 5 Bước) & Chiến Dịch Flash Sale

#### A. Quản Lý Đổi Trả RMA 5 Bước (`ReturnsController` & `components/returns`)
1. **Backend (`ReturnsController` & Application Commands):**
   - Đổi `[Authorize(Roles = EUserRoles.Admin)]` sang `[Authorize(Policy = EPermissions.ViewReturns)]` / `[Authorize(Policy = EPermissions.ManageReturns)]`.
   - *Ghi nhận thực tế:* `ReturnRequestDto` **đã có sẵn** `SerialNumber`, `ShowroomId`, `ShowroomName`, `AssignedTechnicianName`, `ProcessingMethod`, `Logs` (`List<ReturnRequestLogDto>`), `TimelineSteps` (`List<ReturnTimelineStepDto>`).
   - *Bổ sung:* Tạo Command `AddReturnRequestLogCommand` và endpoint `POST /api/Returns/{id}/logs`:
     - Cho phép kỹ thuật viên ghi nhật ký kiểm định theo 5 bước chuẩn SSoT:
       - Bước 1 (`Step = 1`): Tiếp nhận yêu cầu & Kiểm tra Serial (`RequestReceived`)
       - Bước 2 (`Step = 2`): Nhận máy tại Showroom / Bưu cục (`ReceivedAtShowroom`)
       - Bước 3 (`Step = 3`): Kỹ thuật viên thẩm định phần cứng (`TechnicianInspection`)
       - Bước 4 (`Step = 4`): Xử lý Đổi máy mới 15 phút / Lên lệnh Hoàn tiền (`ResolutionProcessing`)
       - Bước 5 (`Step = 5`): Hoàn tất RMA & Đóng hồ sơ (`Completed`)
     - Cập nhật thông tin: `AssignedTechnicianName`, `ShowroomId`, `ProcessingMethod`, `SerialNumber`.
2. **Frontend Dashboard (`types/return-request.ts` & `components/returns/return-detail.tsx`):**
   - **Đồng bộ `types/return-request.ts`:** Khai báo interface `ReturnRequestLog`, `ReturnTimelineStep` khớp 100% với Backend DTO và `ecommerce-client`.
   - **Visual Stepper 5 bước RMA:** Hiển thị trực quan tiến độ 5 bước từ `returnRequest.timelineSteps` trong `return-detail.tsx`.
   - **Bảng thông tin Thiết bị & Kỹ thuật viên:** Hiển thị `SerialNumber`, Showroom tiếp nhận (`ShowroomName`), Kỹ thuật viên (`AssignedTechnicianName`), Phương thức xử lý (`Đổi lấy ngay 15 phút tại Showroom` / `Thu hồi tận nơi`).
   - **Form Nhật ký Thẩm định Kỹ thuật:** Cho phép kỹ thuật viên chọn Bước (`1..5`), nhập Tiêu đề (`Title`), Tên kỹ thuật viên (`ActorName`), Địa điểm (`Location`), Ghi chú thẩm định (`Note`) và bấm **"Ghi nhận nhật ký kiểm định"**.
   - Giữ luồng Duyệt hoàn tiền (với định dạng tiền tệ `.price-tag`) và Từ chối RMA.

#### B. Quản Lý Chiến Dịch Flash Sale (`PromotionsController` & `app/(dashboard)/configs/flash-sales`)
1. **Backend (`PromotionsController` & Handlers):**
   - Entity `FlashSale`, `FlashSaleItem` và DTO `FlashSaleDto`, `FlashSaleItemDto` đã có sẵn.
   - Bổ sung các endpoints quản trị (`[Authorize(Policy = EPermissions.EditPromotion)]`):
     - `GET /api/Promotions/flash-sales`: Lấy danh sách tất cả khung giờ Flash Sale.
     - `GET /api/Promotions/flash-sales/{id}`: Lấy chi tiết 1 chiến dịch kèm danh sách `Items`.
     - `POST /api/Promotions/flash-sales`: Command `CreateFlashSaleCommand`.
     - `PUT /api/Promotions/flash-sales/{id}`: Command `UpdateFlashSaleCommand`.
     - `DELETE /api/Promotions/flash-sales/{id}`: Command `DeleteFlashSaleCommand`.
2. **Frontend Dashboard (`app/(dashboard)/configs/flash-sales`):**
   - Tạo mới `types/flash-sale.ts`, `services/flash-sale-service.ts`, `hooks/use-flash-sales.ts`, `schemas/flash-sale/flash-sale-schema.ts`.
   - Trang danh sách `/configs/flash-sales/page.tsx`: Hiển thị các khung giờ Flash Sale, trạng thái (`Đang diễn ra`, `Sắp diễn ra`, `Đã kết thúc`), thời gian bắt đầu/kết thúc, thanh tiến độ bán (`SoldCount / TotalQuota`).
   - Trang Tạo/Sửa `/configs/flash-sales/new/page.tsx` & `[id]/edit/page.tsx`:
     - Cấu hình chiến dịch (`Code`, `Title`, `Subtitle`, `StartTime`, `EndTime`, `IsActive`).
     - Bảng chọn sản phẩm: chọn Product/SKU, nhập `OriginalPrice`, `FlashSalePrice` (tự động tính `% giảm`), `TotalQuota`, `SoldCount`, đánh dấu `IsHeroFeatured` (sản phẩm tâm điểm Hero Banner).

---

## 4. Ma Trận Đối Chiếu Chi Tiết Kế Hoạch vs. Thực Tế Hệ Thống (Plan vs. System Reality Matrix)

| Hạng mục kiểm định | Đề xuất trong kế hoạch | Thực tế trong Codebase | Trạng thái | Bằng chứng file & Dòng mã nguồn | Hành động hiệu chỉnh trong Kế hoạch |
|---|---|---|---|---|---|
| **Thư viện UI Dashboard** | Shadcn UI, TanStack Table, Hook Form, Zod, Icons | Đã cài `@tanstack/react-table: 8.21.3`, `react-hook-form: 7.55.0`, `zod: 3.24.2`, `@tabler/icons-react: 3.31.0`, `lucide-react: 0.488.0` | **Verified** (Khớp 100%) | `apps/frontend/ecommerce-dashboard/package.json` (L12-70) | Dùng `@tabler/icons-react` cho Sidebar và `lucide-react` cho UI components nội bộ. |
| **CORS Policy Backend** | Cần cho phép origin `http://localhost:3001` + Credentials | `appsettings.json` đã có sẵn `http://localhost:3001` trong `Cors:AllowedOrigins`; `Program.cs` có `AllowCredentials()` | **Verified** (Khớp 100%) | `Ecommerce.WebAPI/appsettings.json` (L36-42), `Program.cs` (L185-219, L269) | Giữ nguyên cấu hình CORS; khai thác rewrite `/api` của Next.js cho cùng origin. |
| **Bảo vệ Route Showroom** | Middleware cần bảo vệ `/showrooms` | `PROTECTED_PATH_PREFIXES` và `config.matcher` hiện chưa có `/showrooms` | **Gap Detected** | `apps/frontend/ecommerce-dashboard/middleware.ts` (L21-45, L145-171) | Đưa việc bổ sung `/showrooms` vào Phase 0 (Pre-step). |
| **Entity Showroom & O2O** | 45 cơ sở, O2O Inventory, Flagship, Pickup 15p | Đã có Entity `Showroom.cs` (45 Showrooms seed sẵn), `ShowroomInventory.cs` | **Verified** (Khớp 100%) | `Ecommerce.Domain/Entities/{Showroom,ShowroomInventory}.cs`, `ApplicationDbContextSeed.cs` (L82) | Chuẩn hóa thông tin SSoT 2026: hotline `1800 6868`, mở cửa `08:00 - 21:30`. |
| **API Showrooms** | Đã có 2 API đọc; cần thêm CRUD & Inventory/Transfer | `ShowroomsController` mới có `GetAll` và `CheckStock`, thiếu toàn bộ admin endpoints | **Gap Detected** | `Ecommerce.WebAPI/Controllers/ShowroomsController.cs` (L25-45) | Bổ sung 6 endpoints admin và các CQRS handlers tương ứng. |
| **Product Specifications** | Hỗ trợ `GroupName`, `IsKeySpec`, `IsHighlight`, `FilterKey` | Entity `ProductSpecification.cs` và `Product.AddSpecification()` đã có 7 tham số. Nhưng `ProductSpecificationDto` thiếu `IsHighlight`, `FilterKey`, thiếu `ReverseMap()`; `SpecificationDto.cs` (Query Output) đã có `IsHighlight` nhưng thiếu `FilterKey`; Handler chỉ truyền 5 tham số | **Dual Gap Detected** | `ProductSpecification.cs` (L5-13), `ProductSpecificationDto.cs` (L9-21), `SpecificationDto.cs` (L9-18), `CreateProductCommandHandler.cs` (L87) | Cập nhật cả 2 DTOs (`ProductSpecificationDto.cs` và `SpecificationDto.cs`), sửa AutoMapper và truyền đủ 7 tham số trong Handlers. |
| **Product Add-ons API** | CRUD kho gói dịch vụ chung + gán sản phẩm | Entity `ProductAddOn.cs` và DTO đã có, nhưng chưa có `ProductAddOnsController` và CQRS handlers | **Gap Detected** | `Ecommerce.Domain/Entities/ProductAddOn.cs`, `Ecommerce.WebAPI/Controllers/` | Tạo mới `ProductAddOnsController.cs` và bộ CRUD handlers trong `Ecommerce.Application`. |
| **Khóa chính OrderItem & Serial DTO** | Cần `orderItemId` để gán Serial | `OrderItemDto.cs` **thiếu trường `Id`** (Guid) và `AssignedSerials`. Chưa tồn tại file `OrderItemSerialDto.cs` | **Critical Gap** | `Ecommerce.Application/Features/Orders/Dto/OrderItemDto.cs` (L7-30), `OrderItem.cs` (L7, L71-79) | Bổ sung `public Guid Id { get; set; }` và `AssignedSerials` vào `OrderItemDto.cs`; tạo mới `OrderItemSerialDto.cs`. |
| **Thông tin Vận đơn Order** | `CarrierName`, `TrackingNumber`, `DriverName`, `DriverPhone` | Đã có trong `Order.cs` nhưng thiếu trong `OrderDto.cs` | **Gap Detected** | `Ecommerce.Domain/Entities/Order.cs` (L93-96), `OrderDto.cs` (L8-45) | Bổ sung 4 trường vận đơn vào `OrderDto.cs`. |
| **RMA 5 Bước Logs DTO** | Hỗ trợ 5 bước thẩm định & kỹ thuật viên | `ReturnRequestDto.cs` **đã có sẵn** `Logs`, `TimelineSteps`, `SerialNumber`, `AssignedTechnicianName`. Nhưng `ReturnsController` khóa cứng `[Authorize(Roles = Admin)]` và thiếu endpoint `POST /api/Returns/{id}/logs` | **Gap Detected** | `Ecommerce.Application/Features/Returns/Dto/ReturnRequestDtos.cs` (L5-85), `ReturnsController.cs` (L72-129) | Chuyển sang policy `EPermissions`, thêm Command `AddReturnRequestLogCommand` và endpoint `POST /api/Returns/{id}/logs`. |
| **Flash Sale CRUD API** | CRUD chiến dịch Flash Sale & Items | `PromotionsController.cs` chỉ có duy nhất `GET /api/Promotions/flash-sale/current` | **Gap Detected** | `Ecommerce.WebAPI/Controllers/PromotionsController.cs` (L23-28) | Thêm 5 endpoints CRUD chiến dịch Flash Sale vào `PromotionsController.cs`. |
| **Đồng bộ Client SSoT 2026** | Types tương thích với frontend khách hàng | `ecommerce-client` đã có types và UI SSoT 2026, nhưng `types/order.ts` thiếu `carrierName`, `trackingNumber`, `driverName`, `driverPhone` dẫn tới lỗi TS compile tại `order-details.tsx` | **Partially Verified (Fix Needed)** | `apps/frontend/ecommerce-client/types/order.ts` (L45-72), `order-details.tsx` (L217) | Bổ sung 4 trường vận đơn vào `types/order.ts` của client tại Phase 0 để đảm bảo `npm run typecheck` đạt Exit code 0. |

---

## 5. Kế Hoạch Phân Chia Đa Tác Tử (Zero-Conflict Parallel Blueprint)

Nhằm đảm bảo các tác tử khi chạy song song (`/teamwork-preview`) **không bao giờ bị Merge/Edit Conflict**, toàn bộ các file dùng chung được đưa vào **Giai Đoạn 0 (Phase 0: Pre-step)** thực hiện tuần tự trước. Sau đó, **Giai Đoạn 1 (Phase 1: Parallel Execution)** sẽ mở 4 nhánh làm việc trên các tập file hoàn toàn tách biệt:

```
[Phase 0: Pre-step — Chuẩn bị Nền tảng Dùng chung & Vá Hợp đồng (Sequential)]
   │
   ├── 1. Backend Permissions & Seed: EPermissions.cs, ApplicationDbContextSeed.cs
   ├── 2. Backend Shared DTOs: SpecificationDto.cs, ProductSpecificationDto.cs, OrderItemDto.cs, OrderDto.cs, OrderItemSerialDto.cs
   ├── 3. Dashboard Shared: app/globals.css, types/permission.ts, middleware.ts, app-sidebar.tsx
   └── 4. Client Shared: types/order.ts (vá lỗi TS driverName, driverPhone)
   │
   ▼
[Phase 1: Parallel Streams — 4 Tác tử Song song Độc lập (Zero Conflict)]
   │
   ├── Agent 1: Backend Core CQRS & Controllers (.NET 8)
   │     └── Endpoints: Showrooms, ProductAddOns, Orders, Returns, Promotions
   │
   ├── Agent 2: Dashboard — Showroom O2O & Product Specs/Add-ons
   │     └── UI: /showrooms, /configs/product-addons, form thông số 14 specs
   │
   ├── Agent 3: Dashboard — Order Serial/IMEI, e-Warranty, VAT & COD 10%
   │     └── UI: /orders/[orderId], order-serial-manager, order-invoice, order-financial
   │
   └── Agent 4: Dashboard — RMA 5-Step Logs & Flash Sale Campaigns
         └── UI: /returns/[returnId] stepper, /configs/flash-sales
```

### Giai Đoạn 0: Chuẩn Bị Nền Tảng Dùng Chung (Phase 0 — Foundation Pre-step)
*Thực hiện tuần tự một luồng duy nhất trước khi mở các luồng song song:*
1. **Backend Foundation & Shared DTOs:**
   - Cập nhật `Ecommerce.Domain/Enums/EPermissions.cs`: Thêm các hằng số permissions cho Showrooms, Inventory, Returns và cập nhật `EPermissions.Groups` (`AdminPermissions`, `StaffPermissions`).
   - Cập nhật `Ecommerce.Infrastructure/Persistence/Seed/ApplicationDbContextSeed.cs`: Đảm bảo seeder bổ sung quyền mới vào bảng `Permissions` & `RolePermissions` theo cơ chế Upsert mà không bị lệnh skip chặn lại.
   - Sửa `Ecommerce.Application/Features/Products/Dto/SpecificationDto.cs` (thêm `FilterKey`) và `ProductSpecificationDto.cs` (thêm `IsHighlight`, `FilterKey`, AutoMapper `ReverseMap()`).
   - Tạo mới `Ecommerce.Application/Features/Orders/Dto/OrderItemSerialDto.cs` (`Id`, `SerialNumber`, `Imei`, `WarrantyMonths`, `ActivatedAt`, `WarrantyExpiresAt`, `WarrantyStatus`).
   - Sửa `Ecommerce.Application/Features/Orders/Dto/OrderItemDto.cs` (thêm `Id`, `AssignedSerials`).
   - Sửa `Ecommerce.Application/Features/Orders/Dto/OrderDto.cs` (thêm `CarrierName`, `TrackingNumber`, `DriverName`, `DriverPhone`).
2. **Dashboard Foundation:**
   - Cập nhật `app/globals.css`: Khai báo semantic tokens (`--color-brand: #E11D48`, `--color-tech-blue: #2563EB`, `--color-surface: #F1F5F9`, `--color-line: #E2E8F0`) và class `.price-tag`.
   - Cập nhật `types/permission.ts`: Đồng bộ toàn bộ `EPermissions` và `PermissionGroups`.
   - Cập nhật `middleware.ts`: Thêm `'/showrooms'` vào `PROTECTED_PATH_PREFIXES` và `config.matcher`.
   - Cập nhật `components/app-sidebar.tsx`: Bổ sung 3 menu items mới với icon `@tabler/icons-react` (`/showrooms`, `/configs/product-addons`, `/configs/flash-sales`).
3. **Client Foundation (Typecheck Fix):**
   - Cập nhật `apps/frontend/ecommerce-client/types/order.ts`: Bổ sung `carrierName`, `trackingNumber`, `driverName`, `driverPhone` để `npm run typecheck` đạt 100% xanh.

---

### Giai Đoạn 1: Phân Luồng 4 Tác Tử Song Song Độc Lập (Phase 1 — Parallel Execution)

| Tác tử (Agent) | Phạm vi phụ trách | Danh mục File độc lập (100% Zero Collision) |
|---|---|---|
| **Agent 1: Backend Core CQRS & Endpoints** | Hoàn thiện toàn bộ CQRS Commands/Queries, handlers và viết Endpoints cho cả 4 phân hệ. | - `Ecommerce.Application/Features/Showrooms/**`<br>- `Ecommerce.Application/Features/Products/**` (AddOns CRUD, Specs handlers truyền đủ 7 tham số)<br>- `Ecommerce.Application/Features/Orders/**` (Serials, e-Warranty, Invoice PDF, Deposit)<br>- `Ecommerce.Application/Features/Returns/**` (AddReturnRequestLogCommand)<br>- `Ecommerce.Application/Features/Promotions/**` (FlashSale CRUD)<br>- `Ecommerce.WebAPI/Controllers/{Showrooms,ProductAddOns,Orders,Returns,Promotions}Controller.cs` |
| **Agent 2: Dashboard — Showroom O2O & Product Specs/Add-ons** | Xây dựng UI quản lý 45 Showroom (Master-Detail + Sheet Drawer) và nâng cấp Form sản phẩm 14 thông số + Gói dịch vụ. | - `types/showroom.ts`, `services/showroom-service.ts`, `hooks/use-showrooms.ts`, `schemas/showroom/**`<br>- `app/(dashboard)/showrooms/**`, `components/showrooms/**`<br>- `types/product-addon.ts`, `services/product-addon-service.ts`, `hooks/use-product-addons.ts`<br>- `app/(dashboard)/configs/product-addons/**`, `components/product-addons/**`<br>- `types/product.ts`, `services/product-service.ts` (`createFormDataFromProduct`), `schemas/product/**`<br>- `components/products/form-sections/{specifications,product-addons}.tsx`<br>- `components/products/{product-form,product-edit-form}.tsx` |
| **Agent 3: Dashboard — Order Serial/IMEI, e-Warranty, VAT & COD 10%** | Nâng cấp trang Chi tiết/Chỉnh sửa Đơn hàng: quản lý Serial/IMEI, kích hoạt e-Warranty, hóa đơn VAT, đặt cọc COD 10%. | - `types/order.ts`, `services/order-service.ts`, `hooks/use-orders.ts`, `schemas/order/**`<br>- `app/(dashboard)/orders/**`<br>- `components/orders/order-edit-form.tsx`<br>- `components/orders/form-sections/{order-info,order-items,shipping}.tsx`<br>- `components/orders/{order-serial-manager,order-invoice-card,order-financial-card}.tsx` |
| **Agent 4: Dashboard — RMA 5-Step Logs & Flash Sale Campaigns** | Nâng cấp giao diện RMA 5 bước (Stepper + Nhật ký kiểm định) và xây dựng mới phân hệ Flash Sale. | - `types/return-request.ts`, `services/return-service.ts`, `components/returns/return-detail.tsx`<br>- `types/flash-sale.ts`, `services/flash-sale-service.ts`, `hooks/use-flash-sales.ts`, `schemas/flash-sale/**`<br>- `app/(dashboard)/configs/flash-sales/**`, `components/flash-sales/**` |

---

## 6. Tiêu Chí Nghiệm Thu (Definition of Done - DoD)

1. **Backend Build & Test:** `dotnet build` trong `apps/backend/Ecommerce` đạt `0 Error`; toàn bộ API mới có phân quyền `EPermissions` đầy đủ và kiểm thử thành công qua Swagger.
2. **Frontend Dashboard Build & Typecheck:** `npm run build` và `npm run typecheck` trong `apps/frontend/ecommerce-dashboard` đạt `Exit code 0`, không có lỗi TypeScript hay ESLint.
3. **Tuân thủ tuyệt đối chuẩn SSoT 2026:**
   - 100% điểm hiển thị giá tiền sử dụng `font-mono tabular-nums whitespace-nowrap` (hoặc `.price-tag`), không rớt dòng ký hiệu `₫`.
   - 0 hardcoded hex colors (`[#...]`) trong các file `.tsx`/`.ts` mới hoặc chỉnh sửa; sử dụng đúng semantic tokens (`bg-brand`, `bg-tech-blue`, `bg-card`, `text-foreground`).
   - Dữ liệu chuẩn SSoT: Hệ thống 45 Showroom, Hotline bán hàng `1800 6868`, Hotline kỹ thuật `1800 6869`, Freeship đơn từ `500.000₫` (dưới 500k tính 30.000₫), tối đa 2 `keySpecs` hiển thị trên ProductCard.

---

## 7. Ghi Nhận Hoàn Tất Đồng Bộ Dashboard (71 Routes SSoT 2026)

Toàn bộ các hạng mục trong kế hoạch đồng bộ Dashboard đã được triển khai và kiểm chứng 100% trên mã nguồn thực tế:

1. **Hoàn tất 71 Tuyến Route Quản Trị:** Đã triển khai và xác minh đầy đủ 71 tuyến màn hình (1 root redirect + 2 auth + 68 dashboard routes), bao gồm các phân hệ mới: Showrooms (`/showrooms`), Kho IMEI/Serial (`/inventory`), RMA Stepper 5 bước (`/returns`, `/returns/[returnId]`), Khóa tài khoản (`/account-locks`), Marquee (`/configs/marquee`), Product Add-Ons (`/configs/product-addons`), Flash Sales (`/configs/flash-sales`), và Quản lý hàng loạt (`/bulk-management/products`).
2. **Loại bỏ hoàn toàn Mock Data:** 100% kết nối trực tiếp với hệ sinh thái API .NET 8 (36 Controllers) qua Axios service, cookie xác thực `access_token` và Double Submit Cookie `X-CSRF-Token`.
3. **Đồng bộ Design System & Tokens:** Toàn bộ giao diện tuân thủ phân vai màu sắc kép Tech Crimson (`#E11D48`) & Electric Blue (`#2563EB`/`#3B82F6`), phân tầng Dark Mode Deep Obsidian 4 lớp và định dạng tiền tệ `.price-tag`.
4. **Kiểm tra Chất lượng & Build:** `npm run build` và `npm run typecheck` đạt trạng thái 0 lỗi.


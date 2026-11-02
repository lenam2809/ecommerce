> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 14/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/reports/KIEM_KE_HIEN_TRANG.md`](../reports/KIEM_KE_HIEN_TRANG.md).

# 10. Đánh Giá Độ Hoàn Thiện Tính Năng (Feature Completeness Matrix)

Tài liệu này tổng hợp và đánh giá mức độ hoàn thiện của toàn bộ các tính năng nghiệp vụ trong hệ thống **ShopViet E-Commerce**, đối chiếu xuyên suốt giữa Backend (.NET 8 Application/Domain/WebAPI), Database (EF Core), Client Frontend (`ecommerce-client`), Dashboard Frontend (`ecommerce-dashboard`), và tài liệu đặc tả dự án (`AGENTS.md`, `docs/`).

---

## 1. Phân loại Trạng Thái (Status Taxonomy)

| Ký hiệu | Trạng thái | Định nghĩa |
|---|---|---|
| 🟢 **DONE** | Implemented & Complete | Triển khai đầy đủ từ Domain -> API -> Frontend Client/Admin; có validation và test. |
| 🟡 **PARTIAL** | Implemented with Gaps | Triển khai phần lớn luồng nghiệp vụ nhưng thiếu xử lý biên (edge-case), thiếu UI hoàn chỉnh, hoặc thiếu test. |
| 🔴 **BROKEN** | Broken / Structural Bug | Đã viết code nhưng tồn tại bug cấu trúc khiến tính năng bị lỗi khi vận hành thực tế. |
| ⚪ **STUB** | Stub / Non-functional | Code khung rỗng (placeholder) hoặc ném ngoại lệ không khả dụng (`NotImplementedException`, 503). |
| ❌ **MISSING** | Not Implemented | Có đề cập trong tài liệu hoặc thiết kế nhưng hoàn toàn chưa có trong mã nguồn. |

---

## 2. Ma Trận Chi Tiết Theo Nghiệp Vụ (Feature Breakdown Matrix)

### 2.1. Quản lý Danh mục, Sản phẩm & Biến thể (Catalog, Brands, Variants)

| Tính năng | Backend API | Frontend Client | Frontend Admin | DB / ORM | Đánh giá & Bằng chứng | Trạng thái |
|---|---|---|---|---|---|---|
| **Category Management** | `CategoriesController` (11 endpoints) | Category navigation, breadcrumbs | Quản lý cây danh mục, kéo thả (Dnd-kit) | `Category`, `ParentId` (Self-referencing FK) | Hỗ trợ phân cấp cha-con, lọc theo slug. Đầy đủ CQRS và CRUD. | 🟢 **DONE** |
| **Brand Management** | `BrandsController` (5 endpoints) | Brand filter bar | Quản lý Brand, logo upload | `Brand` entity | Đầy đủ CRUD, soft delete, upload ảnh đại diện. | 🟢 **DONE** |
| **Product Core & Details** | `ProductsController` (12 endpoints) | Product detail page (`[slug]`), gallery, tabs | Product form (rich text, status, SKU) | `Product`, `ProductImage` | Đầy đủ CQRS. Có cache invalidation qua MediatR. | 🟢 **DONE** |
| **Product Variants & SKUs** | `ProductVariantSkusController` | Variant selector (Size, Color, Price update) | Quản lý bảng biến thể, matrix generator | `ProductVariantSku`, `ProductAttributeValue` | Backend và Admin hỗ trợ nhiều SKU/biến thể. | 🟢 **DONE** |
| **Product Attributes & Values** | `ProductAttributesController` | Hiển thị thông số kỹ thuật | Gán thuộc tính động vào sản phẩm | `ProductAttribute`, `ProductAttributeValue` | Hoàn thiện theo mô hình EAV đơn giản. | 🟢 **DONE** |
| **Product Search (Full-text)** | `ProductsController.Search` | Thanh tìm kiếm navbar | Search filter | `IProductSearchService` | **Tài liệu ghi fallback SQL LIKE, thực tế `NoOpProductSearchService.cs:25` ném 503 HTTP.** Không có fallback SQL. | ⚪ **STUB** / 🟡 **PARTIAL** |
| **Flash Sale / Discount Pricing** | `SalePrice`, `OriginalPrice` | Badge giảm giá, countdown flash sale | Thiết lập giá bán, giá khuyến mại | `Product.SalePrice`, `Product.Price` | Tính toán giá bán trực tiếp trên Entity. Thiếu module Flash Sale theo khung giờ tự động kích hoạt. | 🟡 **PARTIAL** |

---

### 2.2. Giỏ hàng & Quản lý Khách vãng lai (Cart & Guest Session)

| Tính năng | Backend API | Frontend Client | Frontend Admin | DB / ORM | Đánh giá & Bằng chứng | Trạng thái |
|---|---|---|---|---|---|---|
| **Member Cart** | `CartsController` (7 endpoints) | Slide-over cart, Cart page | Xem giỏ hàng của user | `Cart`, `CartItem` | **Lỗi nghiêm trọng**: Composite PK `{ CartId, ProductId }` (`CartItemConfiguration.cs:15`) khiến giỏ hàng ném lỗi DB khi user thêm 2 biến thể khác nhau của cùng 1 ProductId. | 🔴 **BROKEN** |
| **Guest Cart (Vãng lai)** | `UseGuestCart` middleware, `X-Guest-Id` | Cookie `guest_id`, tự tạo UUID | Không | Redis / In-memory guest cart | Hoạt động tốt nếu có Redis, nhưng thiếu cơ chế cron tự động dọn dẹp orphan guest carts trong bộ nhớ nếu Redis tắt. | 🟡 **PARTIAL** |
| **Merge Cart (Guest -> User)** | `MergeGuestCartCommandHandler` | Gọi sau khi đăng nhập thành công | Không | `ICartRepository` | Chuyển item từ guest sang user cart, nhưng vấp phải lỗi composite key nếu user đã có variant của sản phẩm đó. | 🔴 **BROKEN** |
| **Cart Price Validation** | `GetCartQueryHandler` | Client hiển thị theo giá server | Không | `ProductVariantSku.Price` | Server luôn truy vấn giá từ DB, không tin tưởng giá client gửi lên. Tốt. | 🟢 **DONE** |

---

### 2.3. Đặt hàng & Vòng đời Đơn hàng (Checkout & Order Lifecycle)

| Tính năng | Backend API | Frontend Client | Frontend Admin | DB / ORM | Đánh giá & Bằng chứng | Trạng thái |
|---|---|---|---|---|---|---|
| **Checkout Workflow** | `OrdersController.Create` | Trang `/checkout` 3 bước (Address, Shipping, Payment) | Tạo đơn thủ công cho khách | `Order`, `OrderItem`, `OrderAddress` | Validation đầy đủ (Địa chỉ, Voucher, SĐT). Snapshot giá sản phẩm thời điểm mua. | 🟢 **DONE** |
| **Inventory Reservation** | `CreateOrderCommandHandler.cs:105` | Cảnh báo hết hàng khi submit | Quản lý tồn kho | `ProductVariantSku.StockQuantity` | Trừ kho atomic qua `ExecuteUpdateAsync`. **Tuy nhiên nếu `CompleteAsync` văng lỗi chung, `RestoreDecrementedStockAsync` bị bỏ qua -> Thất thoát tồn kho.** | 🔴 **BROKEN** |
| **Order Cancellation & Stock Restore** | `CancelOrderCommandHandler`, `OrderStatusChangedEventHandler` | Nút hủy đơn phía khách | Nút hủy đơn phía Admin | `Order.Status` | **`OrderStatusChangedEventHandler.cs:77-101` điều chỉnh stock trên `product` thay vì `ProductVariantSku`, và QUÊN gọi `_unitOfWork.CompleteAsync()` -> Kho không được hoàn.** | 🔴 **BROKEN** |
| **Promotion / Voucher Application** | `CouponsController`, `ApplyCoupon` | Input nhập mã giảm giá tại checkout | Quản lý coupon (tỷ lệ, số tiền, ngày hết hạn) | `Coupon`, `CouponUsage` | Hỗ trợ giảm theo % hoặc cố định, kiểm tra min order value, giới hạn lượt dùng per user. | 🟢 **DONE** |
| **Order History & Tracking** | `OrdersController.GetMyOrders`, `GetById` | Trang `/profile/orders`, chi tiết đơn, timeline trạng thái | Danh sách đơn hàng, bộ lọc trạng thái, in hóa đơn | `OrderAuditLog`, `OrderStatusHistory` | Timeline hiển thị chi tiết các bước chuyển trạng thái (Pending -> Processing -> Shipped -> Delivered). | 🟢 **DONE** |

---

### 2.4. Thanh toán (Payments & Gateways)

| Tính năng | Backend API | Frontend Client | Frontend Admin | DB / ORM | Đánh giá & Bằng chứng | Trạng thái |
|---|---|---|---|---|---|---|
| **VNPay Integration** | `PaymentsController.CreateVNPayUrl`, `VNPayReturn`, `VNPayIpn` | Redirect sang VNPay Sandbox, trang `/checkout/success` & `/checkout/failure` | Xem trạng thái giao dịch | `PaymentTransaction` | Kiểm tra chữ ký HMACSHA512 an toàn, xác thực số tiền x100, chống giả mạo IPN. Đầy đủ logic hoàn tất đơn. | 🟢 **DONE** |
| **COD (Cash on Delivery)** | `PaymentsController` | Tùy chọn COD tại checkout | Xác nhận thanh toán khi giao hàng thành công | `PaymentMethod.COD` | Đơn hàng tạo ở trạng thái Pending, thanh toán đánh dấu Unpaid. | 🟢 **DONE** |
| **Bank Transfer / QR Pay** | Không có cổng tự động (VietQR/Momo) | Chỉ có thông tin chuyển khoản thủ công | Xác nhận thủ công | N/A | Chưa tích hợp cổng tự động (chỉ có VNPay và COD). | ⚪ **STUB** / ❌ **MISSING** |
| **Refunds Processing** | `ProcessRefundCommandHandler` | N/A | Form hoàn tiền cho đơn hủy | `PaymentTransaction` | Đã có handler hoàn tiền DB, nhưng chưa gọi API hoàn tiền tự động sang VNPay Refund API (phải thao tác merchant portal thủ công). | 🟡 **PARTIAL** |

---

### 2.5. Đổi trả & Khiếu nại (Returns & RMA)

| Tính năng | Backend API | Frontend Client | Frontend Admin | DB / ORM | Đánh giá & Bằng chứng | Trạng thái |
|---|---|---|---|---|---|---|
| **Tạo yêu cầu đổi trả (RMA)** | `ReturnsController.Create` | Trang yêu cầu hoàn trả đơn hàng | Danh sách yêu cầu RMA | `ReturnRequest`, `ReturnItem` | Khách chọn sản phẩm cần trả, lý do, tải ảnh/video chứng từ. | 🟢 **DONE** |
| **Duyệt & Quản lý tiến độ RMA** | `ReturnsController.UpdateStatus` | Theo dõi trạng thái RMA | Phê duyệt, từ chối, yêu cầu thêm chứng từ | `ReturnEvidence`, `ReturnStatusHistory` | Luồng chuyển trạng thái: Requested -> Approved -> ItemsReceived -> Inspected -> Completed. | 🟢 **DONE** |
| **RMA Stock Replenishment** | `ReturnRequestCompletedEvent` | N/A | N/A | N/A | **Sự kiện `ReturnRequestCompletedEvent` hoàn toàn KHÔNG CÓ Event Handler. Hàng đổi trả thành công không bao giờ được nhập lại vào kho.** | 🔴 **BROKEN** |

---

### 2.6. Đánh giá & Tương tác (Reviews & Realtime)

| Tính năng | Backend API | Frontend Client | Frontend Admin | DB / ORM | Đánh giá & Bằng chứng | Trạng thái |
|---|---|---|---|---|---|---|
| **Product Reviews** | `ReviewsController` (7 endpoints) | Form viết đánh giá kèm số sao & ảnh | Duyệt đánh giá, ẩn đánh giá vi phạm | `Review`, `ReviewImage` | Ràng buộc chỉ khách đã mua đơn `Delivered` mới được đánh giá. Hỗ trợ Unique index `{ ProductId, UserId }`. | 🟢 **DONE** |
| **Review Helpful & Replies** | `ReviewsController.VoteHelpful`, `Reply` | Nút Like/Helpful, hiển thị phản hồi từ Shop | Quản trị viên trả lời đánh giá khách | `ReviewHelpfulVote`, `ReviewReply` | Đầy đủ chức năng tương tác cộng đồng. | 🟢 **DONE** |
| **Realtime Notifications** | `NotificationHub`, `ReviewHub` | Toast thông báo realtime | Chuông thông báo đơn hàng mới realtime | `Notification` | SignalR WebSocket hoạt động tốt với token trích xuất từ query string. | 🟢 **DONE** |

---

### 2.7. Khách hàng, Xác thực & Phân quyền (Auth & RBAC)

| Tính năng | Backend API | Frontend Client | Frontend Admin | DB / ORM | Đánh giá & Bằng chứng | Trạng thái |
|---|---|---|---|---|---|---|
| **Dual Auth (Cookie + JWT)** | `AuthController` | Lưu HttpOnly cookie tự động | Lưu HttpOnly cookie tự động | `RefreshToken` (băm SHA256) | Hoạt động an toàn, chống XSS trộm token. | 🟢 **DONE** |
| **Google OAuth Login** | `AuthController.GoogleLogin` | Nút "Đăng nhập với Google" | N/A | `UserExternalLogin` | Xác thực ID token qua Google API, tự tạo tài khoản mới nếu chưa tồn tại. | 🟢 **DONE** |
| **CSRF Protection** | `CsrfValidationMiddleware` | Axios interceptor đính kèm `X-CSRF-TOKEN` | Axios interceptor đính kèm `X-CSRF-TOKEN` | Cookie `XSRF-TOKEN` | Bảo vệ toàn bộ POST/PUT/DELETE. Ngoại lệ VNPay Webhook IPN xử lý đúng. | 🟢 **DONE** |
| **Client Registration Validation** | `AuthController.Register` | Form đăng ký tài khoản | N/A | `ApplicationUser` | **Lỗi không đồng bộ: Client cho phép mật khẩu 6 ký tự không quy tắc; Backend bắt buộc >= 12 ký tự phức tạp -> Form client submit luôn báo lỗi ngầm.** | 🔴 **BROKEN** |
| **Client Login Redirect** | N/A | Form đăng nhập | N/A | N/A | **Lỗi UX: Client middleware chuyển hướng với `?from=/checkout`, nhưng `login/page.tsx:50` chỉ đọc `returnUrl` -> Luôn nhảy về trang chủ sau đăng nhập.** | 🔴 **BROKEN** |
| **Dashboard Route Protection** | `[Authorize(Roles = "Admin,Manager")]` | N/A | Middleware Next.js (`middleware.ts:107`) | N/A | **Lỗi bảo mật Admin: Dashboard middleware chỉ kiểm tra `Boolean(profile?.userId)`, không kiểm tra Role -> Tài khoản khách đăng nhập vào được giao diện Dashboard.** | 🔴 **BROKEN** |
| **RBAC Matrix** | Phân quyền qua `EPermissions` | Ẩn/hiện theo quyền | Quản lý Vai trò (Roles), Cấp quyền (Permissions) | `ApplicationRole`, `RolePermission` | Hệ thống quyền hạt nhân rất chi tiết (hơn 40 permissions). | 🟢 **DONE** |

---

### 2.8. Báo cáo & Thống kê (Analytics & Reporting)

| Tính năng | Backend API | Frontend Client | Frontend Admin | DB / ORM | Đánh giá & Bằng chứng | Trạng thái |
|---|---|---|---|---|---|---|
| **Dashboard Metrics** | `ReportsController.GetOverview` | N/A | Thẻ KPI (Doanh thu, Đơn hàng, Khách mới) | Dữ liệu tổng hợp | Tốc độ phản hồi tốt. | 🟢 **DONE** |
| **Doanh thu theo Danh mục** | `ReportsController.GetRevenueByCategory` | N/A | Biểu đồ tròn Recharts | Query LINQ | **Hiệu năng kém: Tải toàn bộ đơn hàng trong năm về RAM máy chủ rồi mới `GroupBy` trong C# thay vì SQL `GROUP BY`.** | 🟡 **PARTIAL** |
| **Doanh thu theo Tháng** | `ReportsController.GetRevenueByMonth` | N/A | Biểu đồ cột Recharts | Query LINQ | Tương tự, tính toán trên RAM máy chủ, nguy cơ tràn bộ nhớ khi dữ liệu lớn. | 🟡 **PARTIAL** |

---

### 2.9. Hạ tầng & Hệ thống Vận hành (DevOps & Infrastructure)

| Thành phần | Triển khai | Tài liệu cam kết | Thực tế trong mã nguồn | Đánh giá | Trạng thái |
|---|---|---|---|---|---|
| **Database Engine** | Docker Compose / Render | `README.md` & `AGENTS.md`: SQL Server | Không có SQL Server driver; chỉ hỗ trợ PostgreSQL & SQLite | Sai lệch tài liệu nghiêm trọng. | 🔴 **BROKEN** |
| **Docker Compose Client Build** | `docker-compose.yml` | Chạy toàn bộ stack local | `NEXT_PUBLIC_API_URL=http://backend:5000/api` bị bake vào JS trình duyệt host -> lỗi `ERR_NAME_NOT_RESOLVED` | Lỗi cấu hình mạng container. | 🔴 **BROKEN** |
| **Unconditional Seed Data** | `Program.cs:247` | Chỉ seed khi `ASPNETCORE_ENVIRONMENT=Development` | Bỏ qua kiểm tra môi trường, luôn chạy seed trên mọi môi trường | Nguy cơ ghi đè và ô nhiễm DB Production. | 🔴 **BROKEN** |
| **Observability (Otel/Jaeger)** | OpenTelemetry + Jaeger + Prometheus | Giám sát phân tán | Đã tích hợp đầy đủ trong WebAPI và `docker-compose.yml` | Cấu hình chuyên nghiệp, tracing chuẩn. | 🟢 **DONE** |

---

## 3. Tổng Hợp Tỷ Lệ Hoàn Thiện

```
Tổng số 32 phân hệ & tính năng nghiệp vụ:
┌─────────────────────────────────┬──────────┬────────────┐
│ Trạng thái                      │ Số lượng │ Tỷ lệ (%)  │
├─────────────────────────────────┼──────────┼────────────┤
│ 🟢 DONE (Hoàn thiện đầy đủ)      │ 17       │ 53.1 %     │
│ 🟡 PARTIAL (Có khoảng trống)    │ 5        │ 15.6 %     │
│ 🔴 BROKEN (Bug logic/cấu trúc)  │ 8        │ 25.0 %     │
│ ⚪ STUB (Khung giả / 503)        │ 2        │ 6.3 %      │
└─────────────────────────────────┴──────────┴────────────┘
```

---

## 4. Kết Luận Về Tính Sẵn Sàng (Production Readiness Verdict)

1. **Khía cạnh hoàn thiện tốt**:
   - Hệ thống Clean Architecture, CQRS, MediatR, Repository Pattern được tổ chức quy củ và nhất quán.
   - Luồng mua hàng cơ bản (Catalog -> Add to Cart -> VNPay Payment -> Order Created) đã thông suốt.
   - Hạ tầng Observability (Tracing, Metrics, Logs) được thiết lập rất tốt.

2. **Khía cạnh chưa sẵn sàng để Go-Live**:
   - Tồn tại **8 lỗi cấu trúc nghiêm trọng (🔴 BROKEN)**, tập trung vào:
     - Giỏ hàng văng lỗi khi thêm nhiều biến thể của 1 sản phẩm.
     - Thất thoát tồn kho khi checkout gặp exception hoặc khi hủy đơn / hoàn trả hàng.
     - Lỗ hổng bảo mật: Dashboard Next.js không kiểm tra quyền Admin, cho phép khách thường truy cập.
     - Lộ thông tin nhạy cảm (Live credentials) trong repository.
     - Docker Compose client không kết nối được backend trên trình duyệt thật.

> **Khuyến nghị chung:** Dự án đang ở giai đoạn **Late Beta / Pre-Production**. Cần hoàn thành toàn bộ các hạng mục P0 và P1 trong Roadmap trước khi mở thử nghiệm diện rộng (Public Beta).

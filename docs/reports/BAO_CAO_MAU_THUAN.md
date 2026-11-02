> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 01/11/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/reports/KIEM_KE_HIEN_TRANG.md`](KIEM_KE_HIEN_TRANG.md) và [`docs/reports/KE_HOACH_CAP_NHAT_TAI_LIEU.md`](KE_HOACH_CAP_NHAT_TAI_LIEU.md).

# BÁO CÁO KIỂM CHỨNG & HIỆU CHỈNH MÂU THUẪN TÀI LIỆU VÀ MÃ NGUỒN
## DỰ ÁN SHOPVIET E-COMMERCE PLATFORM (SSoT 2026)

> **Trạng thái:** Hoàn tất kiểm chứng thực tế mã nguồn (Code & Test Verified)  
> **Phiên bản:** 2.1 — Hiệu chỉnh toàn diện & Chuẩn hóa bằng chứng  
> **Ngày báo cáo:** 01/11/2026  
> **Nguyên tắc đối soát:** Mã nguồn thực thi > Migration & DB Snapshot > Cấu hình triển khai > Tài liệu theo commit history.  

---

## 1. ĐỊNH NGHĨA QUY CHUẨN MỨC ĐỘ ƯU TIÊN (P0 - P3)

Để đảm bảo tính khách quan và đánh giá chính xác tác động rủi ro tới vận hành sản phẩm, các phát hiện được phân cấp theo 4 mức độ:

- **P0 (Khẩn cấp / Critical):** Lỗi sai lệch logic luồng nghiệp vụ cốt lõi, rò rỉ thông tin bí mật (credentials/secrets), hoặc mismatch giữa API và Frontend dẫn đến sập tính năng (runtime error) hoặc thất thoát giao dịch. Đòi hỏi phải xử lý ngay lập tức.
- **P1 (Cao / High):** Mâu thuẫn kỹ thuật ảnh hưởng đến tính toàn vẹn dữ liệu, trải nghiệm khách hàng (UX), hoặc cấu hình sai lệch giữa môi trường dev và production (ví dụ: lệch điều kiện biên tính tiền/phí ship, lệch thời gian sống token giữa Cookie và JWT claim, sai lệch Database Provider).
- **P2 (Trung bình / Medium):** Tài liệu đặc tả không khớp với hành vi mã nguồn thực tế nhưng hệ thống vẫn có fallback hoạt động; dữ liệu seed/mockup tài liệu cũ chưa cập nhật theo chuẩn SSoT 2026; thiếu ràng buộc schema ở mức cảnh báo.
- **P3 (Thấp / Low):** Sai khác về thuật ngữ mô tả, các nút chức năng UI đi trước backend chưa gắn API gateway thực tế nhưng không gây lỗi ứng dụng (có placeholder/thông báo người dùng).

---

## 2. THỐNG KÊ TỔNG HỢP CÁC PHÁT HIỆN

Các số liệu thống kê dưới đây khớp chính xác 100% với bảng danh mục chi tiết tại Mục 3:

### 2.1. Phân bố theo Mức độ Ưu tiên
| Mức độ | Số lượng phát hiện | Mã danh mục | Tỷ lệ (%) |
|---|:---:|---|:---:|
| **P0 (Khẩn cấp)** | 2 | G2-01, G3-04 | 18.2% |
| **P1 (Cao)** | 3 | G3-01, G4-01, G5-07 | 27.3% |
| **P2 (Trung bình)** | 5 | G2-02, G3-02, G4-04, G5-01, G6-01 | 45.4% |
| **P3 (Thấp)** | 1 | G3-03 | 9.1% |
| **TỔNG CỘNG** | **11** | | **100%** |

### 2.2. Phân bố theo Loại hình Mâu thuẫn
| Phân loại | Định nghĩa | Số lượng | Danh sách Mã ID |
|---|---|:---:|---|
| **(a) Mâu thuẫn thật** | Code và tài liệu hoặc giữa các tầng hệ thống mâu thuẫn trực tiếp | 5 | G2-01, G3-01, G3-04, G4-01, G5-07 |
| **(b) Tài liệu lỗi thời** | Tài liệu cũ ghi nhận chưa đúng với code hiện tại đã hoàn thiện | 3 | G3-02, G4-04, G5-01 |
| **(c) Khác thuật ngữ** | Hai tài liệu cùng nói một bản chất nhưng dùng góc nhìn/tên gọi khác | 1 | G6-01 |
| **(d) Mơ hồ** | Đặc tả chưa đủ chi tiết hoặc UI đi trước API backend | 2 | G2-02, G3-03 |
| **TỔNG CỘNG** | | **11** | |

### 2.3. Phân bố theo Phân hệ Nghiệp vụ
| Nhóm | Phân hệ | Số lượng | Mã ID chi tiết |
|---|---|:---:|---|
| **G1** | Giỏ hàng, Biến thể & Tồn kho | 0 | *(Các điểm G1-01, G1-03 đã được phân loại vào mục Đã sửa / Tài liệu cũ)* |
| **G2** | Đơn hàng, Trạng thái & Giao dịch | 2 | G2-01, G2-02 |
| **G3** | Chính sách kinh doanh, Vận chuyển & Secret | 4 | G3-01, G3-02, G3-03, G3-04 |
| **G4** | Xác thực, Phiên làm việc & Đánh giá | 2 | G4-01, G4-04 |
| **G5** | Kiến trúc kỹ thuật, EF Core & DevOps | 2 | G5-01, G5-07 |
| **G6** | Thiết kế UI/UX & Design System | 1 | G6-01 |
| **TỔNG CỘNG** | | **11** | |

---

## 3. BẢNG CHI TIẾT CÁC ĐIỂM MÂU THUẪN ĐÃ ĐỐI SOÁT MÃ NGUỒN

| Mã ID | Nhóm | Mức độ | Loại | Bằng chứng (Tập tin & Dòng) | Nội dung mâu thuẫn & Thực tế đối soát mã nguồn | Đánh giá tác động thực tế |
|---|---|:---:|:---:|---|---|---|
| **G2-01** | G2 | **P0** | (a) | • [`Ecommerce.WebAPI/Program.cs:177`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.WebAPI/Program.cs#L177)<br>• [`Ecommerce.Application/Features/Orders/Dto/OrderDto.cs:23-24`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Dto/OrderDto.cs#L23-L24)<br>• [`Ecommerce.Domain/Enums/EOrderStatus.cs:3-14`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Domain/Enums/EOrderStatus.cs#L3-L14)<br>• [`Ecommerce.Domain/Entities/Order.cs:386-398`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Domain/Entities/Order.cs#L386-L398)<br>• [`apps/frontend/ecommerce-client/types/order.ts:150-157`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/types/order.ts#L150-L157)<br>• [`apps/frontend/ecommerce-client/components/account/status-badge.tsx:9-17`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/account/status-badge.tsx#L9-L17)<br>• [`apps/frontend/ecommerce-client/components/account/order-details.tsx:65-71`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/account/order-details.tsx#L65-L71)<br>• [`apps/frontend/ecommerce-dashboard/types/order.ts:103-113`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-dashboard/types/order.ts#L103-L113) | **Lệch pha Enum OrderStatus & Serialize số vs chuỗi:**<br>1. *Serialization:* Backend `Program.cs:177` gọi `AddControllers()` mà không đăng ký `JsonStringEnumConverter`. ASP.NET Core serialize enum `EOrderStatus` thành dạng số nguyên (int). DTO `OrderDto.cs` có thêm trường phụ `StatusString => Status.ToString()`.<br>2. *Mismatch giá trị enum giữa Client và Backend:*<br>- Backend: `Pending=0, Processing=1, Shipped=2, Completed=3, Cancelled=4, Refunded=5, Delivered=6, ReturnRequested=7, Returned=8`.<br>- Client `types/order.ts`: Định nghĩa sai `Pending=0, Processing=1, Shipped=2, Delivered=3, Cancelled=4, Returned=5` (thiếu hẳn Completed và Refunded).<br>- Client UI `status-badge.tsx:11` và `order-details.tsx:70` map case `"3"` thành "Đã giao" (Delivered) và **hoàn toàn không có case "6"**.<br>3. *Luồng Domain State Transition:* `Order.cs:386-398` quy định: `Shipped (2) -> Delivered (6) -> Completed (3)`. Shipped KHÔNG THỂ chuyển thẳng sang Completed. | **Rất cao (Vỡ luồng đơn hàng):**<br>- Khi backend trả về đơn hàng đã giao (`status = 6`), Client rơi vào `default` hiển thị thành "Chờ xử lý" (Pending, Step 1).<br>- Nếu client gửi lệnh cập nhật `status = 3` (tưởng là Delivered), backend hiểu là `Completed (3)` và ném `InvalidStatusTransitionException` do vi phạm quy tắc chuyển trạng thái từ Shipped sang Completed. |
| **G3-04** | G3 | **P0** | (a) | • [`apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.json:42-43`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.json#L42-L43)<br>• [`.gitignore:108`](file:///d:/2026/projects/ecommerce/.gitignore#L108)<br>• Git commits: `695e86f`, `0b346f3` | **Rò rỉ khóa bí mật VNPay HashSecret:**<br>1. *File hiện tại:* Trong tệp cấu hình cục bộ `Ecommerce.WebAPI/appsettings.json:42-43`, trường `VnPay:TmnCode` (`RIJ3VIHF`) và `VnPay:HashSecret` (khóa 32 ký tự) vẫn lưu dưới dạng văn bản thuần (plaintext). File này bị ignore trên ổ đĩa dev qua `.gitignore:108`.<br>2. *Lịch sử Git:* Khóa này được đưa vào kho mã nguồn từ commit `695e86f`. Đến commit `0b346f3`, tác giả đã thêm `appsettings*.json` vào `.gitignore` và xóa tracking file, **nhưng chưa từng dùng BFG hay git filter-repo để viết lại lịch sử**. Bất kỳ ai clone git repo đều xem được secret tại commit `695e86f`. *(Giá trị bí mật không in ra theo quy chuẩn an toàn).* | **Khẩn cấp về bảo mật:** Kẻ tấn công có thể giả mạo chữ ký IPN (Checksum HMAC-SHA512) để làm sai lệch kết quả giao dịch thanh toán trực tuyến của VNPay. |
| **G3-01** | G3 | **P1** | (a) | • [`Ecommerce.Application/Services/ShippingCalculator.cs:11-35`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Services/ShippingCalculator.cs#L11-L35)<br>• [`apps/frontend/ecommerce-client/components/cart/OrderSummary.tsx:51`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/cart/OrderSummary.tsx#L51)<br>• [`apps/frontend/ecommerce-client/components/cart/CartHeader.tsx:16`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/cart/CartHeader.tsx#L16)<br>• [`apps/frontend/ecommerce-client/app/(routes)/checkout/page.tsx:105`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/(routes)/checkout/page.tsx#L105)<br>• [`Ecommerce.Application/Features/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs:160-167`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs#L160-L167)<br>• [`apps/frontend/ecommerce-client/components/checkout/payment-method.tsx:78-83`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/checkout/payment-method.tsx#L78-L83)<br>• [`Ecommerce.Infrastructure/Persistence/Seed/ApplicationDbContextSeed.cs:3150`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Seed/ApplicationDbContextSeed.cs#L3150)<br>• [`apps/frontend/ecommerce-client/components/footer.tsx:150`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/footer.tsx#L150) | **Lệch điều kiện biên Freeship & Làm rõ thời hạn đổi trả:**<br>1. *Điều kiện biên Freeship:*<br>- Backend `ShippingCalculator.cs:34`: `subtotal > 500_000m` (dấu lớn hơn hẳn). Nếu đơn hàng đúng 500.000₫, backend vẫn tính phí 30.000₫.<br>- Frontend `OrderSummary.tsx:51`, `CartHeader.tsx:16`, `checkout/page.tsx:105`: `subtotal >= 500000` (lớn hơn hoặc bằng) là Miễn phí (0₫). Chuẩn SSoT 2026 quy định "từ 500.000₫ trở lên". Backend đang tính sai lệch ở mốc biên 500.000₫.<br>2. *Tiền cọc COD 10%:* Backend `CreateOrderCommandHandler.cs:160-167` và frontend `payment-method.tsx:78-83` **đồng bộ 100%**: đơn COD > 20.000.000₫ yêu cầu cọc 10%.<br>3. *Thời hạn đổi trả:* Chính sách đổi trả toàn hệ thống là **30 ngày** (`Seed:3150`, `footer.tsx:150`). Con số "15 phút" ở tài liệu cũ là **SLA thời gian thao tác đổi máy tại showroom** ("Lấy ngay 15 phút tại 45 Showroom"), không phải thời hạn được phép đổi trả. | **Trung bình - Cao:** Khách hàng mua giỏ hàng đúng 500.000₫ sẽ thấy giỏ hàng báo Freeship 0₫, nhưng khi server tính toán có thể bị chênh lệch 30.000₫. |
| **G4-01** | G4 | **P1** | (a) | • [`Ecommerce.Application/Common/Configs/JwtConfig.cs:8`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Common/Configs/JwtConfig.cs#L8)<br>• [`Ecommerce.Application/Common/Configs/AuthConfig.cs:44`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Common/Configs/AuthConfig.cs#L44)<br>• [`Ecommerce.Infrastructure/Identity/TokenService.cs:54`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Identity/TokenService.cs#L54)<br>• [`Ecommerce.WebAPI/Extensions/CookieAuthExtensions.cs:35-37`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.WebAPI/Extensions/CookieAuthExtensions.cs#L35-L37)<br>• [`Ecommerce.WebAPI/appsettings.Development.json:42`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.Development.json#L42)<br>• [`Ecommerce.WebAPI/appsettings.Production.json:20`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.Production.json#L20)<br>• [`docker-compose/docker-compose.yml:166`](file:///d:/2026/projects/ecommerce/docker-compose/docker-compose.yml#L166)<br>• [`render.yaml:32-33`](file:///d:/2026/projects/ecommerce/render.yaml#L32-L33) | **Lệch pha thời gian sống Token giữa Cookie và JWT:**<br>1. *JWT Claim Exp:* `TokenService.cs:54` tính `Expires = DateTime.UtcNow.AddMinutes(_jwtConfig.AccessTokenExpirationMinutes)`. Cấu hình trong `Development`, `Production`, `docker-compose`, `render.yaml` đều đặt `AccessTokenExpirationMinutes = 60` (60 phút). (Lưu ý: trong `appsettings.json` gốc thiếu hẳn section `"Jwt"` nên giá trị mặc định là 0 nếu không có env override). Tên key khớp 100% với class.<br>2. *Cookie Expiration:* `CookieAuthExtensions.cs:36` cấu hình cookie `access_token` có `Expires = UtcNow.AddMinutes(CookieSettings:AccessTokenMinutes ?? 15)`. Vì không có file cấu hình triển khai nào set `CookieSettings:AccessTokenMinutes`, giá trị luôn fallback về **15 phút**.<br>3. *Tài liệu:* `AGENTS.md:129` ghi 15 phút; `business-analysis.md:125` ghi 1 ngày; hạ tầng Docker/Render truyền 60 phút. | **Cao (Trải nghiệm người dùng):** Trình duyệt hủy cookie sau 15 phút dù JWT bên trong còn hạn tới 60 phút. Người dùng bị buộc refresh token sớm gấp 4 lần so với thời hạn danh định của JWT. |
| **G5-07** | G5 | **P1** | (a) | • [`Ecommerce.Infrastructure/Extensions/AddDatabaseExtensions.cs:22-46`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Extensions/AddDatabaseExtensions.cs#L22-L46)<br>• [`Ecommerce.Infrastructure/Ecommerce.Infrastructure.csproj:29-31`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Ecommerce.Infrastructure.csproj#L29-L31)<br>• [`Ecommerce.Infrastructure/Migrations/ApplicationDbContextModelSnapshot.cs:7, 23`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Migrations/ApplicationDbContextModelSnapshot.cs#L7)<br>• [`AGENTS.md:12`](file:///d:/2026/projects/ecommerce/AGENTS.md#L12) | **Sai lệch thông tin Database Provider:**<br>1. *Tài liệu:* `AGENTS.md:12` và một số báo cáo kiến trúc cũ ghi nhận "Database: SQL Server (local dev) / PostgreSQL (Docker/Render) / SQLite (fallback)".<br>2. *Thực tế mã nguồn:* `Ecommerce.Infrastructure.csproj` **hoàn toàn không có package** `Microsoft.EntityFrameworkCore.SqlServer`. `AddDatabaseExtensions.cs` chỉ có nhánh `UseSqlite` (khi chuỗi kết nối chứa "Data Source") và nhánh `UseNpgsql` (cho tất cả trường hợp còn lại).<br>3. *Snapshot & Migrations:* 100% snapshot và 6 migration designers đều sinh cho PostgreSQL (`NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns`). Hệ thống không thể chạy được với SQL Server nếu không sửa code và thêm package. | **Trung bình:** Lập trình viên mới đọc tài liệu sẽ cố cài đặt SQL Server trên máy cục bộ và gặp lỗi khởi động ứng dụng do thiếu provider. |
| **G6-01** | G6 | **P2** | (c) | • [`apps/frontend/ecommerce-client/app/globals.css:52-65, 145-181`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/globals.css#L52-L65)<br>• [`apps/frontend/ecommerce-client/tailwind.config.js:18-53`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/tailwind.config.js#L18-L53)<br>• [`docs/ui-redesign/03-design-system-spec.md:9-29`](file:///d:/2026/projects/ecommerce/docs/ui-redesign/03-design-system-spec.md#L9-L29)<br>• [`docs/ui-redesign/02-ui-ux-audit-report.md:125-158`](file:///d:/2026/projects/ecommerce/docs/ui-redesign/02-ui-ux-audit-report.md#L125-L158) | **Phân vai màu sắc Tech Crimson `#E11D48` giữa Thế hệ 2 và Thế hệ 3:**<br>1. Cả hai thế hệ đều dùng chung mã hex `#E11D48`. Mâu thuẫn không phải ở giá trị hex mà ở **phạm vi ngữ nghĩa (semantic role) và cấu trúc token:**<br>- *Thế hệ 2 (Redesign cũ):* Dùng `#e11d48` làm màu chủ đạo duy nhất cho toàn bộ nút bấm, badge, icon, viền; kèm các token Material Design 3 tự sinh bị ám hồng nâu (`#906f70`, `#5c3f40`, `#ffdad9`) và hơn 45 vị trí hardcode hex trong JSX.<br>- *Thế hệ 3 (SSoT 2026):* Phân vai kép (**Dual-Accent Tech Hierarchy**): Màu Crimson (`#E11D48` / `bg-brand` / `text-brand` / `bg-cta-crimson`) **chỉ dành riêng cho hành vi mua bán/chuyển đổi** (Mua ngay, Thanh toán, Giá sale, % Giảm giá). Toàn bộ hành vi công nghệ, liên kết, nút Thêm vào giỏ, filter active, badge bảo hành 24T được chuyển sang **Electric Blue (`#2563EB` / `bg-tech-blue` / `--primary`)**.<br>2. Đã xóa sạch mã hex hardcode trong JSX để dùng CSS variables chuẩn hóa. | **Thấp (Đã đồng bộ trên UI):** Cần cập nhật các tài liệu thiết kế cũ để tránh hiểu nhầm rằng hệ thống đã thay đổi mã màu đỏ, trong khi thực chất là thu hẹp phạm vi và bổ sung màu xanh công nghệ. |
| **G4-04** | G4 | **P2** | (b) | • [`Ecommerce.Application/Features/Reviews/Commands/CreateReview/CreateReviewCommandHandler.cs:70-85`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Reviews/Commands/CreateReview/CreateReviewCommandHandler.cs#L70-L85) | **Điều kiện gửi đánh giá sản phẩm (Review):**<br>1. *Khẳng định cũ:* Bản báo cáo kiểm toán trước ghi "chỉ người đã mua hàng mới được gửi review".<br>2. *Thực tế mã nguồn:* Handler `CreateReviewCommandHandler.cs:70-85` cho phép **bất kỳ người dùng đã đăng nhập nào** gửi review (Rating 1..5, nội dung, ảnh). Kiểm tra `HasDeliveredPurchaseAsync` chỉ dùng để gán cờ `review.IsVerified = isVerifiedPurchase` (Huy hiệu "Đã mua hàng"). Code **hoàn toàn không chặn** người chưa mua hàng. | **Thấp:** Cần làm rõ chính sách kinh doanh: cho phép cộng đồng đánh giá mở (có huy hiệu phân biệt) hay bắt buộc phải mua hàng mới được review. |
| **G5-01** | G5 | **P2** | (b) | • Thư mục [`Ecommerce.Infrastructure/Migrations/`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Migrations/)<br>• Git commits: `599554c`, `a2e1770`, `a2568c9` | **Timestamp và số lượng Migrations trong tài liệu:**<br>1. *Tài liệu:* `AGENTS.md:133` ghi "Một migration duy nhất InitialCreate (20260324124536)".<br>2. *Thực tế kho mã nguồn:* Có **6 migrations**, trong đó `InitialCreate` mang timestamp `20260507115052`.<br>3. *Nguyên nhân lịch sử:* Migration `20260324124536` được tạo vào 25/03/2026 (commit `599554c`). Đến 10/05/2026 (commit `a2e1770`), migration này bị xóa và re-scaffold thành `20260507115052`. Tài liệu `AGENTS.md` viết từ tháng 4/2026 (commit `a2568c9`) không được cập nhật lại theo các commit sau đó. | **Thấp:** Gây nhầm lẫn cho kỹ sư mới khi kiểm tra lịch sử migration của cơ sở dữ liệu. |
| **G3-02** | G3 | **P2** | (b) | • [`docs/ui-redesign/05-stitch-review-handover.md:122`](file:///d:/2026/projects/ecommerce/docs/ui-redesign/05-stitch-review-handover.md#L122)<br>• [`Ecommerce.Infrastructure/Persistence/Seed/ApplicationDbContextSeed.SSoT2026.cs:22-120`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Seed/ApplicationDbContextSeed.SSoT2026.cs#L22-L120)<br>• [`apps/frontend/ecommerce-client/app/(routes)/about/page.tsx:35-60`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/(routes)/about/page.tsx#L35-L60)<br>• [`apps/frontend/ecommerce-client/app/(routes)/contact/page.tsx:80-140`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/(routes)/contact/page.tsx#L80-L140) | **Số lượng Showroom & Số điện thoại Hotline:**<br>1. *Tài liệu cũ:* `05-stitch-review-handover.md:122` (checklist review UI MH-10D) ghi 2 showroom: "Hà Nội (48 Tố Hữu) & TP.HCM (157 Khánh Hội)" và Hotline cá nhân `0975 431 485`.<br>2. *Thực tế mã nguồn:* Chuẩn SSoT 2026 đã seed **45 showroom toàn quốc** (`ApplicationDbContextSeed.SSoT2026.cs`), Hotline Bán hàng `1800 6868` & Kỹ thuật `1800 6869` (miễn phí). Frontend `/about` và `/contact` đã kết nối API thật hiển thị 45 showroom và hotline 1800. | **Thấp:** Tài liệu `05-stitch-review-handover.md` chỉ là biên bản bàn giao mẫu giao diện đợt 3, nay đã bị thay thế bởi dữ liệu SSoT 2026. |
| **G2-02** | G2 | **P2** | (d) | • [`Ecommerce.Application/Features/Orders/Commands/UpdateOrderStatus/UpdateOrderStatusCommand.cs:14`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/UpdateOrderStatus/UpdateOrderStatusCommand.cs#L14)<br>• [`apps/frontend/ecommerce-dashboard/services/order-service.ts:22-25`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-dashboard/services/order-service.ts#L22-L25)<br>• [`Ecommerce.WebAPI/Controllers/OrdersController.cs:131-138`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/OrdersController.cs#L131-L138) | **Ràng buộc Concurrency Token (RowVersion) khi cập nhật đơn hàng:**<br>1. Command backend `UpdateOrderStatusCommand` đánh dấu `public required string RowVersion { get; set; }`. Khi controller model validation chạy, nếu thiếu trường này sẽ bị 400 Bad Request.<br>2. Dashboard API service `order-service.ts:23` chỉ gửi `{ status, expectedDeliveryDate }`, không truyền `rowVersion`. Khi controller parse JSON, request có nguy cơ bị từ chối 400 Bad Request. | **Trung bình:** Cần đồng bộ hóa DTO cập nhật trạng thái đơn hàng giữa Admin Dashboard và Backend. |
| **G3-03** | G3 | **P3** | (d) | • [`apps/frontend/ecommerce-client/components/checkout/payment-method.tsx:40-64`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/components/checkout/payment-method.tsx#L40-L64)<br>• Module [`Ecommerce.Infrastructure/Payments/`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Payments/) | **Phương thức thanh toán MoMo, VietQR, ZaloPay:**<br>1. Giao diện Checkout cung cấp các lựa chọn VietQR Pro, MoMo, ZaloPay.<br>2. Backend chỉ có Gateway xử lý thực tế cho **COD** và **VNPay** (`VnPayPaymentGateway.cs`). Các cổng MoMo/VietQR/ZaloPay chưa có handler xử lý tích hợp SDK/IPN ở backend, hiện chỉ lưu tên phương thức vào trường `PaymentMethod` của đơn hàng. | **Thấp:** Khách chọn MoMo/ZaloPay/VietQR chỉ được ghi nhận đơn chứ không được chuyển hướng sang cổng thanh toán tương ứng. |

---

## 4. CÁC NỘI DUNG ĐÃ ĐƯỢC KHẮC PHỤC HOẶC XÁC MINH RÕ RÀNG TRONG MÃ NGUỒN

Dưới đây là các điểm kỹ thuật từng bị coi là lỗi hoặc nghi vấn trong các tài liệu kiểm toán trước, nay đã được kiểm chứng trực tiếp bằng mã nguồn và bộ kiểm thử tự động (Unit / Integration Tests):

### 4.1. Lỗi hoàn kho khi hủy đơn hàng SKU (FLOW-02 / G1-03) — ĐÃ KHẮC PHỤC 100%
- **Bằng chứng Code:**
  - [`Ecommerce.Application/Features/Orders/EventHandlers/OrderStatusChangedEventHandler.cs:98-112`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/EventHandlers/OrderStatusChangedEventHandler.cs#L98-L112):
    ```csharp
    if (item.ProductVariantSkuId.HasValue)
    {
        await _unitOfWork.ProductVariantSkus.RestoreStockAsync(
            item.ProductVariantSkuId.Value,
            item.Quantity,
            cancellationToken);
    }
    else
    {
        await _unitOfWork.Products.RestoreStockAsync(
            item.ProductId,
            item.Quantity,
            cancellationToken);
    }
    ```
  - [`Ecommerce.Infrastructure/Persistence/Repositories/ProductVariantSkuRepository.cs:48-55`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Repositories/ProductVariantSkuRepository.cs#L48-L55): Thực hiện cộng lại tồn kho nguyên tử qua `ExecuteUpdateAsync` trực tiếp xuống DB, không bị phụ thuộc vào Change Tracker.
- **Bằng chứng Kiểm thử (Unit/Integration Test):**
  - Tệp [`Ecommerce.WebAPI.IntegrationTests/RemediationPhase1Tests.cs:60-131`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/RemediationPhase1Tests.cs#L60-L131) với test case:  
    `FLOW02_CancellingPendingOrder_RestoresSkuStockIdempotently`: Khởi tạo SKU có tồn kho ban đầu 5, trừ còn 3, sau đó hủy đơn; kiểm tra SKU stock được hoàn chính xác về 5 và `Product.StockQuantity` không bị cộng sai, đồng thời đảm bảo tính bất biến (idempotent) không cộng thừa khi chạy lại.

### 4.2. Lỗi nuốt lỗi khi Checkout / Mất nguyên tử Transaction (FLOW-01 / G2-06) — ĐÃ KHẮC PHỤC 100%
- **Bằng chứng Code:**
  - [`Ecommerce.Application/Common/Behaviors/TransactionBehavior.cs:42-56`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Common/Behaviors/TransactionBehavior.cs#L42-L56):
    ```csharp
    if (response is IAppResult { IsSuccess: false } appResult)
    {
        await _logger.LogAsync(ELogLevel.Warning,
            $"Command {typeof(TRequest).Name} returned failure result ({appResult.ErrorType}: {appResult.Error}). Rolling back transaction.",
            "TransactionRollback", ...);
        await _unitOfWork.RollbackTransactionAsync(cancellationToken);
        return response;
    }
    ```
  - [`Ecommerce.Application/Features/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs:220-250`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs#L220-L250): Toàn bộ các khối catch lỗi đều chủ động gọi `RestoreDecrementedStockAsync` để hoàn trả tồn kho và `RevertPromoCodeRedemptionAsync` để hoàn lại số lượt mã giảm giá, sau đó gọi `_unitOfWork.ClearTracking()`.
- **Bằng chứng Kiểm thử:**
  - Tệp [`Ecommerce.Application.Tests/Features/Orders/Commands/CreateOrder/AuditCreateOrderUnexpectedFailureTests.cs:24-77`](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Application.Tests/Features/Orders/Commands/CreateOrder/AuditCreateOrderUnexpectedFailureTests.cs#L24-L77):  
    `UnexpectedFailureAfterStockDecrement_RollsBackOrRestoresStock`: Giả lập `CompleteAsync()` ném ngoại lệ bất ngờ; chứng minh hành vi rollback và phục hồi tồn kho thành công 100%.

### 4.3. Xác minh Token không nằm trong Browser Storage (G4-02) — ĐÃ XÁC MINH CHÍNH XÁC
- **Kết quả quét mã nguồn:**
  - Tìm kiếm `sessionStorage` trên toàn bộ `apps/frontend/`: **0 kết quả**.
  - Tìm kiếm `localStorage` trên toàn bộ `apps/frontend/`: Chỉ lưu trữ 5 khóa tiện ích không nhạy cảm:
    1. `"comparedProducts"` & `"comparedProductIds"` (quản lý so sánh sản phẩm tại [`compare/page.tsx:70, 133-145`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/(routes)/compare/page.tsx#L70)).
    2. `"guest_id"` (định danh giỏ hàng vãng lai tại [`lib/api.ts:125`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/lib/api.ts#L125) và [`lib/guest-id.ts:17-46`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/lib/guest-id.ts#L17-L46)).
    3. `'theme'` (lưu tùy chọn dark/light mode tại [`app/layout.tsx:70`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/app/layout.tsx#L70)).
    4. `"rememberMe"` (ghi nhớ trạng thái đăng nhập admin tại [`components/auth/login-form.tsx:65, 68, 88`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-dashboard/components/auth/login-form.tsx#L65)).
    5. `"savedEmail"` (ghi nhớ email admin tại [`components/auth/login-form.tsx:66, 69, 87`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-dashboard/components/auth/login-form.tsx#L66)).
  - Toàn bộ access token và refresh token đều lưu trữ dưới dạng **httpOnly cookies** phía máy chủ quản lý, bảo vệ an toàn trước nguy cơ XSS.

---

## 5. DANH MỤC TÀI LIỆU THIẾU HOẶC LỖI THỜI

Các tài liệu dưới đây được tạo từ giai đoạn ban đầu của dự án, chưa được cập nhật tương ứng với các thay đổi mã nguồn mới nhất:

1. **[`apps/frontend/ecommerce-client/docs/business-analysis.md`](file:///d:/2026/projects/ecommerce/apps/frontend/ecommerce-client/docs/business-analysis.md) (Tạo ngày 07/01/2026):**
   - *Dòng 9, 143:* Tuyên bố "Admin Dashboard và Payment Gateway Integration là out-of-scope (chỉ là UI/Mock)". Thực tế: Dự án có nguyên phân hệ `ecommerce-dashboard` và cổng thanh toán VNPay đã tích hợp end-to-end.
   - *Dòng 16, 123:* Tuyên bố "Auth Token lưu song song Cookie & LocalStorage". Thực tế: Đã bỏ LocalStorage, chỉ dùng Cookie.
   - *Dòng 125:* Ghi "Access Token có hạn 1 ngày". Thực tế: Token sống 60 phút (JWT claim) và 15 phút (Cookie).
   - *Dòng 103-109:* Định nghĩa bảng OrderStatus sơ sài và đánh số `Delivered = 3` (sai lệch với backend).
2. **[`AGENTS.md`](file:///d:/2026/projects/ecommerce/AGENTS.md) (Tạo ngày 08/04/2026, commit `a2568c9`):**
   - *Dòng 12:* Ghi dùng "SQL Server cho local dev", trong khi dự án dùng PostgreSQL và SQLite.
   - *Dòng 133:* Ghi "Một migration duy nhất InitialCreate (20260324124536)", trong khi hiện có 6 migrations và InitialCreate là `20260507115052`.
3. **[`docs/ui-redesign/05-stitch-review-handover.md`](file:///d:/2026/projects/ecommerce/docs/ui-redesign/05-stitch-review-handover.md) (Tạo ngày 19/10/2026):**
   - *Dòng 122:* Checklist ghi 2 showroom đại diện tại Hà Nội & TP.HCM cùng hotline `0975 431 485`, trong khi SSoT 2026 đã chuẩn hóa 45 showroom và hotline `1800 6868 / 1800 6869`.

---

## 6. NGHI VẤN CHƯA XÁC THỰC

1. **Trích dẫn `business-analysis.md:9` cho các phát hiện G1-01, G2-03, G3-03:**
   - *Đánh giá:* Dòng 9 của file này nguyên văn là:  
     `Out-of-scope (trong repo này): Admin Dashboard (...), CMS, Payment Gateway Integration (xử lý thanh toán thực tế, hiện tại chỉ là UI/Mock).`
   - Đoạn văn trên **hoàn toàn không chứa bất kỳ từ khóa hay quy tắc nào liên quan đến Giỏ hàng (Cart) hay SKU của G1-01**. Do đó, việc bản nháp trước dùng `business-analysis.md:9` làm bằng chứng cho G1-01 là sai căn cứ trích dẫn. Mục này đã được loại bỏ khỏi danh sách bằng chứng hợp lệ.
2. **Nghi vấn "Thời hạn đổi trả 15 phút":**
   - *Đánh giá:* Nhận định từ báo cáo trước cho rằng chính sách đổi trả bị rút ngắn xuống "15 phút" là **chưa xác thực và hiểu nhầm ngữ cảnh**. Thực tế chính sách đổi trả toàn diện là 30 ngày; con số 15 phút là cam kết xử lý kỹ thuật tức thì tại showroom.

---

## 7. CÂU HỎI CẦN CHỦ DỰ ÁN TRẢ LỜI & RA QUYẾT ĐỊNH

Để thống nhất mã nguồn và hoàn thiện hệ thống, kính đề nghị Chủ dự án phản hồi và phê duyệt các định hướng sau:

1. **Chuẩn hóa Enum OrderStatus (G2-01):**
   - Có nên bổ sung `JsonStringEnumConverter` vào `Ecommerce.WebAPI/Program.cs` để API trả về dạng chuỗi định danh trực quan (`"Delivered"`, `"Completed"`) thay vì số nguyên int, giúp tránh sai lệch chỉ số giữa các nền tảng?
   - Phê duyệt cập nhật enum `ecommerce-client/types/order.ts` đồng bộ đầy đủ 9 trạng thái như Dashboard và Backend.
2. **Điều kiện biên Freeship 500.000₫ (G3-01):**
   - Xác nhận quy tắc: Đơn hàng đúng 500.000₫ có được Freeship không? (Khuyến nghị: Sửa Backend `ShippingCalculator.cs:34` thành `subtotal >= FREE_SHIPPING_THRESHOLD` để đồng nhất với thông điệp marketing và Frontend).
3. **Đồng bộ thời hạn Access Token (G4-01):**
   - Thống nhất thời hạn sống thực tế của phiên đăng nhập: Chọn **15 phút** (tăng cường bảo mật theo `AGENTS.md`) hay **60 phút** (giảm tần suất gọi refresh token theo cấu hình Render/Docker)? Sau khi chốt, đồng bộ cả JWT claim lẫn Cookie Max-Age.
4. **Hướng xử lý VNPay Secret trong Git History (G3-04):**
   - Vì kho git đã công khai secret tại commit `695e86f`, đề nghị chủ dự án:
     - Tạo cặp khóa Sandbox mới trên cổng VNPAY Merchant.
     - Lập kế hoạch chạy công cụ `git filter-repo` / BFG để làm sạch vĩnh viễn commit history.
5. **Chính sách Đánh giá sản phẩm (G4-04):**
   - Hệ thống có nên tiếp tục cho phép mọi người dùng đăng nhập viết review (với cờ `IsVerified` để lọc), hay chuyển sang chế độ nghiêm ngặt: "Chỉ tài khoản đã mua sản phẩm và đơn hàng ở trạng thái Delivered/Completed mới được gửi review"?

---

## 8. PHẠM VI ĐÃ QUÉT THỰC TẾ (AUDIT COVERAGE)

### 8.1. Danh sách Tập tin đã Kiểm chứng Trực tiếp
1. `apps/backend/Ecommerce/Ecommerce.WebAPI/Program.cs` (Dòng 1-367: DI, AddControllers tại L177, SignalR, RateLimiting, CORS, Observability).
2. `apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.json` (Dòng 1-150: VnPay plaintext secret tại L42-43, Cache, Serilog).
3. `apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.Development.json` (Dòng 1-180: JWT Expiration 60m tại L38-43).
4. `apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.Production.json` (Dòng 1-116: JWT Expiration 60m tại L16-21).
5. `apps/backend/Ecommerce/Ecommerce.WebAPI/Extensions/CookieAuthExtensions.cs` (Dòng 15-60: Cookie options, AccessTokenMinutes 15m fallback tại L35-37).
6. `apps/backend/Ecommerce/Ecommerce.Application/Common/Configs/JwtConfig.cs` (Dòng 1-12: Thuộc tính AccessTokenExpirationMinutes).
7. `apps/backend/Ecommerce/Ecommerce.Application/Common/Configs/AuthConfig.cs` (Dòng 1-58: CookieSettings class tại L44).
8. `apps/backend/Ecommerce/Ecommerce.Infrastructure/Identity/TokenService.cs` (Dòng 15-115: GenerateAccessToken, JWT claim expiration tại L54).
9. `apps/backend/Ecommerce/Ecommerce.Domain/Enums/EOrderStatus.cs` (Dòng 1-18: 9 giá trị enum trạng thái đơn hàng).
10. `apps/backend/Ecommerce/Ecommerce.Domain/Entities/Order.cs` (Dòng 170-403: IsValidStatusTransition switch matrix tại L386-398).
11. `apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Dto/OrderDto.cs` (Dòng 20-35: Status & StatusString tại L23-24).
12. `apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/UpdateOrderStatus/UpdateOrderStatusCommand.cs` (Dòng 1-18: Required RowVersion tại L14).
13. `apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/UpdateOrderStatus/UpdateOrderStatusCommandHandler.cs` (Dòng 30-70: ConcurrencyToken & UpdateStatus).
14. `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/OrdersController.cs` (Dòng 100-140: UpdateStatus endpoint tại L131-138).
15. `apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs` (Dòng 155-255: COD Deposit 10% tại L160-167, rollback tracking).
16. `apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/EventHandlers/OrderStatusChangedEventHandler.cs` (Dòng 80-135: RestoreStockQuantities for SKU tại L98-112).
17. `apps/backend/Ecommerce/Ecommerce.Application/Services/ShippingCalculator.cs` (Dòng 1-38: FREE_SHIPPING_THRESHOLD 500k, fixed fee 30k, subtotal > threshold tại L34).
18. `apps/backend/Ecommerce/Ecommerce.Application/Features/Reviews/Commands/CreateReview/CreateReviewCommandHandler.cs` (Dòng 60-115: HasDeliveredPurchaseAsync, IsVerified flag tại L70-85).
19. `apps/backend/Ecommerce/Ecommerce.Infrastructure/Persistence/Repositories/ProductVariantSkuRepository.cs` (Dòng 40-58: ExecuteUpdateAsync stock restore tại L48-55).
20. `apps/backend/Ecommerce/Ecommerce.Infrastructure/Extensions/AddDatabaseExtensions.cs` (Dòng 15-50: Sqlite & Npgsql providers only tại L22-46).
21. `apps/backend/Ecommerce/Ecommerce.Infrastructure/Ecommerce.Infrastructure.csproj` (Dòng 15-45: Package references audit, Sqlite & Npgsql).
22. `apps/backend/Ecommerce/Ecommerce.Infrastructure/Migrations/ApplicationDbContextModelSnapshot.cs` (Dòng 1-30: Npgsql metadata tại L7, L23).
23. `apps/backend/Ecommerce/Ecommerce.Infrastructure/Migrations/20260507115052_InitialCreate.Designer.cs` (Dòng 1-30: PostgreSQL InitialCreate).
24. `apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/RemediationPhase1Tests.cs` (Dòng 60-135: FLOW-02 test evidence).
25. `apps/backend/Ecommerce/Ecommerce.Application.Tests/Features/Orders/Commands/CreateOrder/AuditCreateOrderUnexpectedFailureTests.cs` (Dòng 24-77: FLOW-01 test evidence).
26. `apps/frontend/ecommerce-client/types/order.ts` (Dòng 145-158: Mismatched OrderStatus enum).
27. `apps/frontend/ecommerce-client/components/account/status-badge.tsx` (Dòng 1-59: Status mapping, missing case 6).
28. `apps/frontend/ecommerce-client/components/account/order-details.tsx` (Dòng 60-85: Stepper logic, missing case 6).
29. `apps/frontend/ecommerce-client/services/order-service.ts` (Dòng 25-41: updateOrderStatus).
30. `apps/frontend/ecommerce-client/components/cart/CartHeader.tsx` (Dòng 10-30: Freeship threshold >= 500k).
31. `apps/frontend/ecommerce-client/components/cart/OrderSummary.tsx` (Dòng 45-60: Freeship calculation >= 500k).
32. `apps/frontend/ecommerce-client/app/(routes)/checkout/page.tsx` (Dòng 95-120: Freeship calculation).
33. `apps/frontend/ecommerce-client/components/checkout/payment-method.tsx` (Dòng 70-90: COD 10% deposit > 20M).
34. `apps/frontend/ecommerce-client/app/globals.css` (Dòng 50-185: Dual-accent tokens, Tech Blue, Brand Crimson).
35. `apps/frontend/ecommerce-client/tailwind.config.js` (Dòng 1-60: Color extensions).
36. `apps/frontend/ecommerce-dashboard/types/order.ts` (Dòng 100-125: EOrderStatus matching backend).
37. `apps/frontend/ecommerce-dashboard/services/order-service.ts` (Dòng 15-35: updateOrderStatus missing RowVersion).
38. `apps/frontend/ecommerce-dashboard/components/auth/login-form.tsx` (Dòng 65-88: localStorage rememberMe, savedEmail).
39. `apps/frontend/ecommerce-client/app/(routes)/compare/page.tsx` (Dòng 70-148: localStorage comparedProducts).
40. `apps/frontend/ecommerce-client/lib/guest-id.ts` (Dòng 15-48: localStorage guest_id).
41. `apps/frontend/ecommerce-client/docs/business-analysis.md` (Dòng 1-151: Toàn bộ nội dung tài liệu).
42. `docs/ui-redesign/05-stitch-review-handover.md` (Dòng 115-135: Checklist MH-10D).
43. `docs/ui-redesign/03-design-system-spec.md` (Dòng 1-100: Triết lý thiết kế Dual-Accent).
44. `docs/ui-redesign/02-ui-ux-audit-report.md` (Dòng 125-160: Bảng kiểm kê mã màu Hex).
45. `docker-compose/docker-compose.yml` (Dòng 145-180: JWT Expiration, Cache).
46. `docker-compose/.env.example` (Dòng 50-75: JWT_EXPIRATION 60).
47. `render.yaml` (Dòng 1-58: Jwt__AccessTokenExpirationMinutes 60).
48. `.gitignore` (Dòng 100-137: Rules ignore appsettings L108, docs L124).
49. `Ecommerce.Infrastructure/Persistence/Seed/ApplicationDbContextSeed.cs` (Dòng 3145-3160: Chính sách đổi trả 30 ngày).
50. `Ecommerce.Infrastructure/Persistence/Seed/ApplicationDbContextSeed.SSoT2026.cs` (Dòng 10-60: Seed 45 Showrooms SSoT 2026).
51. `apps/frontend/ecommerce-client/app/(routes)/about/page.tsx` (Dòng 1-60: Hiển thị 45 showroom từ API).
52. `apps/frontend/ecommerce-client/app/(routes)/contact/page.tsx` (Dòng 60-140: Hotline 1800 6868/6869, 45 showroom).
53. `apps/frontend/ecommerce-client/components/footer.tsx` (Dòng 140-160: Link đổi trả 30 ngày).

### 8.2. Danh sách Tập tin Bỏ qua & Lý do
- Thư mục `apps/frontend/*/node_modules/`: Tệp thư viện phụ thuộc bên thứ ba (bỏ qua quét rà soát logic nội bộ).
- Thư mục `apps/backend/Ecommerce/*/bin/` & `obj/`: Tệp nhị phân biên dịch (bỏ qua, chỉ đọc source code và tests).
- Thư mục `docs/ui-redesign/screenshots/`: Hình ảnh minh họa giao diện PNG (không chứa mã logic).
- Thư mục `docs/design/stitch/*/index.html`: Các tệp HTML tĩnh xuất từ công cụ thiết kế Stitch (chỉ là tham chiếu visual, code React trong `apps/frontend/` mới là nguồn sự thật).

---

## 9. KẾ HOẠCH HÀNH ĐỘNG KHẮC PHỤC (ACTION PLAN)
*(Trạng thái hiện tại: **CHƯA THỰC HIỆN** — Cần phê duyệt từ Chủ dự án trước khi triển khai)*

1. **Khắc phục P0 — G2-01 (Đồng bộ OrderStatus Enum & Serialization):**
   - Đăng ký `options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());` trong `Ecommerce.WebAPI/Program.cs`.
   - Cập nhật `apps/frontend/ecommerce-client/types/order.ts` để đồng bộ đúng 9 trạng thái enum và mapping chuẩn tại `status-badge.tsx` và `order-details.tsx`.
2. **Khắc phục P0 — G3-04 (Thu hồi và cô lập VNPay Secret):**
   - Tạo bộ thông tin VNPay Merchant Sandbox mới.
   - Xóa bỏ hoàn toàn giá trị secret khỏi `appsettings.json` cục bộ, chỉ giữ trong biến môi trường không commit.
   - Đưa việc lọc git history vào kế hoạch bảo trì kho mã nguồn.
3. **Khắc phục P1 — G3-01 (Sửa điều kiện biên Freeship Backend):**
   - Chỉnh sửa `ShippingCalculator.cs:34` thành `return subtotal >= FREE_SHIPPING_THRESHOLD;` để mốc 500.000₫ được miễn phí ship hoàn toàn đồng bộ với Frontend.
4. **Khắc phục P1 — G4-01 (Đồng bộ thời hạn Token & Cookie):**
   - Thiết lập rõ ràng biến cấu hình `CookieSettings:AccessTokenMinutes` trong cấu hình máy chủ khớp với `Jwt:AccessTokenExpirationMinutes`.
5. **Khắc phục P1 — G5-07 & P2 — G5-01 (Cập nhật AGENTS.md):**
   - Cập nhật tài liệu `AGENTS.md` loại bỏ thông tin SQL Server, sửa thành PostgreSQL/SQLite; cập nhật danh sách 6 migrations và migration khởi tạo `20260507115052`.

---

## 10. TÓM TẮT THAY ĐỔI SO VỚI BẢN BÁO CÁO TRƯỚC (MAX 10 DÒNG)

1. **Chuẩn hóa số liệu:** Khớp 100% giữa bảng tổng hợp và bảng chi tiết (11 phát hiện: 2 P0, 3 P1, 5 P2, 1 P3).
2. **Phân loại chặt chẽ:** Bổ sung cột Loại: 5 mâu thuẫn thật, 3 tài liệu lỗi thời, 1 khác thuật ngữ, 2 mơ hồ.
3. **Kiểm chứng G2-01:** Xác định rõ backend thiếu JsonStringEnumConverter; chỉ ra client thiếu case 6 (Delivered) và luồng domain Shipped->Delivered->Completed.
4. **Kiểm chứng G4-01 & G5-05:** Phát hiện lệch pha nội bộ giữa thời hạn Cookie (15m mặc định) và JWT claim (60m trong cấu hình).
5. **Kiểm chứng G4-02:** Xác nhận 100% token KHÔNG nằm trong localStorage/sessionStorage; đính chính đủ 5 khóa lưu trữ UI hợp lệ.
6. **Kiểm chứng G4-04:** Chứng minh code cho phép mọi user đăng nhập review, HasDeliveredPurchaseAsync chỉ cấp badge IsVerified.
7. **Kiểm chứng G3-01:** Phát hiện lệch biên Freeship (> vs >= ở 500k); xác nhận COD 10% đồng bộ; đính chính đổi trả 30 ngày (15 phút chỉ là SLA showroom).
8. **Kiểm chứng G1-03 & G2-06:** Cung cấp đầy đủ code và integration tests chứng minh lỗi hoàn kho SKU và lỗi nuốt lỗi checkout ĐÃ ĐƯỢC KHẮC PHỤC.
9. **Kiểm chứng G5-07, G6-01, G3-04, G5-01:** Xác nhận repo chỉ dùng Npgsql (không có SQL Server); giải mã bí mật VNPay trong commit 695e86f; giải thích lịch sử migration tháng 5/2026; sửa citation .gitignore:108.
10. **Làm sạch bằng chứng:** Bỏ trích dẫn sai `business-analysis.md:9` cho Giỏ hàng và gắn nhãn "CHƯA THỰC HIỆN" cho Action Plan.
